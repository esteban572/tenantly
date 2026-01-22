-- Additional schema updates for Tenantly app
-- Run this after the initial supabase_schema.sql

-- Create Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Personal Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  current_address TEXT,
  
  -- Employment Information
  employer_name TEXT,
  job_title TEXT,
  employment_duration TEXT,
  monthly_income NUMERIC,
  
  -- References
  reference_name TEXT,
  reference_phone TEXT,
  reference_relationship TEXT,
  
  -- Additional Info
  move_in_date DATE,
  number_of_occupants INTEGER,
  has_pets BOOLEAN DEFAULT false,
  pet_details TEXT,
  additional_notes TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')) DEFAULT 'pending',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Tenants can view their own applications
CREATE POLICY "Tenants can view their own applications"
  ON applications FOR SELECT
  USING (auth.uid() = tenant_id);

-- Tenants can insert their own applications
CREATE POLICY "Tenants can insert applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

-- Tenants can update their own pending applications
CREATE POLICY "Tenants can update their own pending applications"
  ON applications FOR UPDATE
  USING (auth.uid() = tenant_id AND status = 'pending');

-- Landlords can view applications for their properties
CREATE POLICY "Landlords can view applications for their properties"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = applications.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

-- Landlords can update application status for their properties
CREATE POLICY "Landlords can update applications for their properties"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = applications.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

-- Create Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  uploader_id UUID REFERENCES profiles(id) NOT NULL,
  related_to_id UUID, -- Can be property_id, application_id, or tenancy_id
  related_to_type TEXT CHECK (related_to_type IN ('property', 'application', 'tenancy')),
  
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_type TEXT NOT NULL, -- MIME type
  file_size INTEGER, -- in bytes
  
  category TEXT CHECK (category IN ('lease', 'id', 'financial', 'reference', 'other')) DEFAULT 'other',
  description TEXT,
  
  -- Access control
  is_public BOOLEAN DEFAULT false,
  shared_with UUID[], -- Array of user IDs who can access
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Users can view documents they uploaded
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = uploader_id);

-- Users can view documents shared with them
CREATE POLICY "Users can view documents shared with them"
  ON documents FOR SELECT
  USING (auth.uid() = ANY(shared_with));

-- Users can view public documents
CREATE POLICY "Anyone can view public documents"
  ON documents FOR SELECT
  USING (is_public = true);

-- Users can insert their own documents
CREATE POLICY "Users can insert documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = uploader_id);

-- Users can update their own documents
CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = uploader_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = uploader_id);

-- Create Signatures table
CREATE TABLE IF NOT EXISTS signatures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  signer_id UUID REFERENCES profiles(id) NOT NULL,
  
  signature_data TEXT NOT NULL, -- Base64 encoded signature image
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  ip_address TEXT,
  user_agent TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verification_code TEXT
);

ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Users can view their own signatures
CREATE POLICY "Users can view their own signatures"
  ON signatures FOR SELECT
  USING (auth.uid() = signer_id);

-- Document owners can view signatures on their documents
CREATE POLICY "Document owners can view signatures"
  ON signatures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = signatures.document_id
      AND documents.uploader_id = auth.uid()
    )
  );

-- Users can insert their own signatures
CREATE POLICY "Users can insert signatures"
  ON signatures FOR INSERT
  WITH CHECK (auth.uid() = signer_id);

-- Create storage buckets (run these in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies for property-images bucket
-- CREATE POLICY "Anyone can view property images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'property-images');

-- CREATE POLICY "Authenticated users can upload property images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- CREATE POLICY "Users can update their own property images"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own property images"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for documents bucket
-- CREATE POLICY "Users can view their own documents"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Authenticated users can upload documents"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- CREATE POLICY "Users can update their own documents"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own documents"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for applications table
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
