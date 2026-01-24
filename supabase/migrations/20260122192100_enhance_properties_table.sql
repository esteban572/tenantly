-- Enhanced properties table for Zillow-style property profiles
-- Adds bedrooms, bathrooms, sqft, property type, amenities, etc.

-- Core property details
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathrooms DECIMAL(3,1);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS sqft INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type TEXT CHECK (property_type IN ('apartment', 'house', 'condo', 'townhouse', 'studio'));

-- Availability
ALTER TABLE properties ADD COLUMN IF NOT EXISTS available_date DATE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;

-- Policies and amenities
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pet_policy TEXT CHECK (pet_policy IN ('allowed', 'cats_only', 'dogs_only', 'no_pets', 'negotiable'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking TEXT CHECK (parking IN ('garage', 'street', 'lot', 'none'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS laundry TEXT CHECK (laundry IN ('in_unit', 'in_building', 'none'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities TEXT[];

-- Lease terms
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lease_length INTEGER; -- months
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC;

-- Location details
ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Tracking and featuring
ALTER TABLE properties ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Create indexes for common filter queries
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_is_available ON properties(is_available);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
