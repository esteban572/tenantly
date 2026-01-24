-- Migration: Create tenancies table with RLS policies
-- This table tracks tenant-property relationships with lease information

-- 1. Create tenancies table
CREATE TABLE IF NOT EXISTS public.tenancies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Lease dates
    start_date DATE NOT NULL,
    end_date DATE,

    -- Financial information
    monthly_rent NUMERIC,
    deposit_amount NUMERIC,
    payment_due_day INTEGER DEFAULT 1 CHECK (payment_due_day >= 1 AND payment_due_day <= 31),

    -- Additional info
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'pending')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tenancies_property_id ON public.tenancies(property_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_tenant_id ON public.tenancies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_end_date ON public.tenancies(end_date);
CREATE INDEX IF NOT EXISTS idx_tenancies_status ON public.tenancies(status);

-- 3. Enable Row Level Security
ALTER TABLE public.tenancies ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Tenants can view their own tenancies
CREATE POLICY "Tenants can view own tenancies"
    ON public.tenancies
    FOR SELECT
    USING (auth.uid() = tenant_id);

-- Landlords can view tenancies for their properties
CREATE POLICY "Landlords can view tenancies for their properties"
    ON public.tenancies
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.properties
            WHERE id = property_id AND landlord_id = auth.uid()
        )
    );

-- Landlords can create tenancies for their properties
CREATE POLICY "Landlords can create tenancies"
    ON public.tenancies
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.properties
            WHERE id = property_id AND landlord_id = auth.uid()
        )
    );

-- Landlords can update tenancies for their properties
CREATE POLICY "Landlords can update tenancies"
    ON public.tenancies
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.properties
            WHERE id = property_id AND landlord_id = auth.uid()
        )
    );

-- Landlords can delete tenancies for their properties
CREATE POLICY "Landlords can delete tenancies"
    ON public.tenancies
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.properties
            WHERE id = property_id AND landlord_id = auth.uid()
        )
    );

-- 5. Add emergency contact columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- 6. Create updated_at trigger for tenancies
CREATE TRIGGER set_tenancies_updated_at
    BEFORE UPDATE ON public.tenancies
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
