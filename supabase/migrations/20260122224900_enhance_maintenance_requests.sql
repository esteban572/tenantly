-- Enhanced maintenance_requests table for comprehensive ticket management
-- Adds worker assignment, viewed tracking, priority, and scheduling

-- Worker assignment fields
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS assigned_worker_name TEXT;
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS assigned_worker_phone TEXT;
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Viewed tracking
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS viewed_by UUID REFERENCES auth.users(id);

-- Scheduling and priority
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS scheduled_date DATE;
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('emergency', 'high', 'medium', 'low'));
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS category TEXT;

-- Notes and completion
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_property ON maintenance_requests(property_id);
