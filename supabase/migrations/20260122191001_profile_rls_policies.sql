-- Migration: RLS Policies for Profile Visibility
-- Description: Secure profile access with row-level security policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view all profiles (for discovery)
CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (handled by trigger, but adding for completeness)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy: Users cannot delete profiles (only admins via service role)
-- No DELETE policy = no one can delete except service role

-- Add RLS to landlord_stats view (read-only)
-- Note: Views inherit RLS from underlying tables, but we can add explicit policies

-- Create policy for properties to show landlord info
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
CREATE POLICY "Properties are viewable by everyone"
ON properties FOR SELECT
TO authenticated
USING (true);

-- Add comment
COMMENT ON POLICY "Profiles are viewable by authenticated users" ON profiles IS 'Allow all authenticated users to view profiles for discovery and transparency';
