-- Create applications table for tenant rental applications
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
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
    
    -- Reference Information
    reference_name TEXT,
    reference_phone TEXT,
    reference_relationship TEXT,
    
    -- Additional Information
    move_in_date DATE,
    number_of_occupants INTEGER,
    has_pets BOOLEAN DEFAULT FALSE,
    pet_details TEXT,
    additional_notes TEXT,
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_property_id ON public.applications(property_id);
CREATE INDEX IF NOT EXISTS idx_applications_tenant_id ON public.applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- Enable Row Level Security
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Policy: Tenants can view their own applications
CREATE POLICY "Tenants can view own applications"
    ON public.applications
    FOR SELECT
    USING (auth.uid() = tenant_id);

-- Policy: Tenants can create applications
CREATE POLICY "Tenants can create applications"
    ON public.applications
    FOR INSERT
    WITH CHECK (auth.uid() = tenant_id);

-- Policy: Landlords can view applications for their properties
CREATE POLICY "Landlords can view applications for their properties"
    ON public.applications
    FOR SELECT
    USING (
        property_id IN (
            SELECT id FROM public.properties WHERE landlord_id = auth.uid()
        )
    );

-- Policy: Landlords can update applications for their properties (approve/reject)
CREATE POLICY "Landlords can update applications for their properties"
    ON public.applications
    FOR UPDATE
    USING (
        property_id IN (
            SELECT id FROM public.properties WHERE landlord_id = auth.uid()
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
