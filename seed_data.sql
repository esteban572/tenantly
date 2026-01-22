-- Seed Data

-- Create a Landlord Profile (You might need to adjust the ID if you already created a user, or just create a user in Auth first)
-- NOTE: For these to work, a user with this specific UUID must exist in auth.users. 
-- Since we can't easily insert into auth.users via SQL editor usually without admin secrets or direct insert (which triggers triggers often):
-- A better approach for testing:
-- 1. Sign up a user 'landlord@test.com' via the App.
-- 2. Then run this script to update their role and insert properties linked to them.

-- However, to make it easier to "Just See Data", we can insert properties linked to a placeholder UUID, 
-- but our RLS 'Landlords can insert...' might block it if we tried to do it via API, but via SQL Editor we are admin.
-- BUT: foreign key constraint on `landlord_id` references `profiles(id)` which references `auth.users(id)`.
-- So we MUST have a real user ID.

-- INSTRUCTION TO USER:
-- 1. Sign up a new user in the app with email 'landlord@test.com' and select 'Landlord'.
-- 2. Copy their User ID (UUID) from the Supabase Dashboard -> Authentication.
-- 3. Replace 'PLACEHOLDER_USER_ID' in the insert statements below with that UUID.

INSERT INTO properties (landlord_id, title, description, price, address, image_urls)
VALUES 
  ('PLACEHOLDER_USER_ID', 'Modern Downtown Apartment', 'A beautiful 2-bedroom apartment in the heart of the city.', 2500, '123 Main St, Cityville', ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=60']),
  ('PLACEHOLDER_USER_ID', 'Cozy Suburban Home', '3-bedroom house with a large backyard, perfect for families.', 1800, '456 Oak Ave, Suburbia', ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=60']),
  ('PLACEHOLDER_USER_ID', 'Luxury Waterfront Condo', '1-bedroom condo with stunning ocean views.', 3200, '789 Ocean Dr, Seaside', ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=60']);
