-- Add missing RLS policies for maintenance_requests table
-- Enables landlords to update/delete tickets and tenants to update their own requests

-- Allow landlords to update maintenance requests for their properties
CREATE POLICY "Landlords can update maintenance requests for their properties"
  ON maintenance_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = maintenance_requests.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

-- Allow landlords to delete maintenance requests for their properties
CREATE POLICY "Landlords can delete maintenance requests for their properties"
  ON maintenance_requests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = maintenance_requests.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

-- Allow tenants to update their own maintenance requests (e.g., cancel, edit before reviewed)
CREATE POLICY "Tenants can update their own maintenance requests"
  ON maintenance_requests FOR UPDATE
  USING (auth.uid() = tenant_id);
