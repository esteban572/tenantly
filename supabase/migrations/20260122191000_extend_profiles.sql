-- Migration: Extend profiles table for enhanced user profiles
-- Description: Adds fields for landlord types, LinkedIn-style profiles, and profile metadata

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS landlord_type TEXT CHECK (landlord_type IN ('individual', 'company', 'property_management'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employer TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster profile searches
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_landlord_type ON profiles(landlord_type);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON profiles(rating);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate profile completeness
CREATE OR REPLACE FUNCTION calculate_profile_completeness(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completeness INTEGER := 0;
    profile_record RECORD;
BEGIN
    SELECT * INTO profile_record FROM profiles WHERE id = profile_id;
    
    -- Base fields (20 points each)
    IF profile_record.full_name IS NOT NULL AND profile_record.full_name != '' THEN
        completeness := completeness + 20;
    END IF;
    
    IF profile_record.avatar_url IS NOT NULL AND profile_record.avatar_url != '' THEN
        completeness := completeness + 20;
    END IF;
    
    IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN
        completeness := completeness + 20;
    END IF;
    
    IF profile_record.phone_number IS NOT NULL AND profile_record.phone_number != '' THEN
        completeness := completeness + 20;
    END IF;
    
    -- Role-specific fields (20 points)
    IF profile_record.role = 'landlord' THEN
        IF profile_record.landlord_type IS NOT NULL THEN
            completeness := completeness + 10;
        END IF;
        IF profile_record.years_of_experience IS NOT NULL THEN
            completeness := completeness + 10;
        END IF;
    ELSIF profile_record.role = 'tenant' THEN
        IF profile_record.occupation IS NOT NULL AND profile_record.occupation != '' THEN
            completeness := completeness + 10;
        END IF;
        IF profile_record.employer IS NOT NULL AND profile_record.employer != '' THEN
            completeness := completeness + 10;
        END IF;
    END IF;
    
    RETURN completeness;
END;
$$ LANGUAGE plpgsql;

-- Create view for landlord statistics
CREATE OR REPLACE VIEW landlord_stats AS
SELECT 
    p.id,
    p.full_name,
    p.company_name,
    p.landlord_type,
    p.rating,
    p.verified,
    COUNT(DISTINCT pr.id) as total_properties,
    COUNT(DISTINCT a.id) as total_applications,
    0 as avg_response_time_hours  -- Simplified: response time tracking to be added later
FROM profiles p
LEFT JOIN properties pr ON pr.landlord_id = p.id
LEFT JOIN applications a ON a.property_id = pr.id
WHERE p.role = 'landlord'
GROUP BY p.id, p.full_name, p.company_name, p.landlord_type, p.rating, p.verified;

-- Add comment to table
COMMENT ON TABLE profiles IS 'Extended user profiles with landlord types and LinkedIn-style fields';
