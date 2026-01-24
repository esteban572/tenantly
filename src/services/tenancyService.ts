import { supabase } from './supabaseClient';

export interface Tenancy {
  id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date?: string;
  monthly_rent?: number;
  deposit_amount?: number;
  payment_due_day?: number;
  notes?: string;
  status: 'active' | 'ended' | 'pending';
  created_at: string;
  updated_at: string;
  // Joined fields
  tenant?: {
    id: string;
    full_name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
  };
  property?: {
    id: string;
    title: string;
    address: string;
  };
}

export const tenancyService = {
  /**
   * Get all active tenancies for a landlord's properties
   */
  async getActiveTenancies(landlordId: string): Promise<Tenancy[]> {
    try {
      const { data, error } = await supabase
        .from('tenancies')
        .select(`
          *,
          tenant:profiles!tenant_id(id, full_name, email, phone, avatar_url),
          property:properties!property_id(id, title, address)
        `)
        .eq('status', 'active')
        .eq('property.landlord_id', landlordId);

      if (error) throw error;
      return data as Tenancy[];
    } catch (error) {
      console.error('Error fetching active tenancies:', error);
      return [];
    }
  },

  /**
   * Get all tenancies for a landlord's properties (including historical)
   */
  async getAllTenancies(landlordId: string): Promise<Tenancy[]> {
    try {
      // First get all property IDs owned by landlord
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id')
        .eq('landlord_id', landlordId);

      if (propError) throw propError;
      if (!properties || properties.length === 0) return [];

      const propertyIds = properties.map(p => p.id);

      const { data, error } = await supabase
        .from('tenancies')
        .select(`
          *,
          tenant:profiles!tenant_id(id, full_name, email, phone, avatar_url),
          property:properties!property_id(id, title, address)
        `)
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Tenancy[];
    } catch (error) {
      console.error('Error fetching all tenancies:', error);
      return [];
    }
  },

  /**
   * Check if a property has an active tenancy
   */
  async hasActiveTenancy(propertyId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('tenancies')
        .select('id')
        .eq('property_id', propertyId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking active tenancy:', error);
      return false;
    }
  },

  /**
   * Get the active tenancy for a property
   */
  async getActiveTenancy(propertyId: string): Promise<Tenancy | null> {
    try {
      const { data, error } = await supabase
        .from('tenancies')
        .select(`
          *,
          tenant:profiles!tenant_id(id, full_name, email, phone, avatar_url)
        `)
        .eq('property_id', propertyId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data as Tenancy | null;
    } catch (error) {
      console.error('Error fetching active tenancy:', error);
      return null;
    }
  },

  /**
   * Get tenancies with leases ending within specified days
   */
  async getLeaseEndingSoon(landlordId: string, days: number = 30): Promise<Tenancy[]> {
    try {
      // First get all property IDs owned by landlord
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id')
        .eq('landlord_id', landlordId);

      if (propError) throw propError;
      if (!properties || properties.length === 0) return [];

      const propertyIds = properties.map(p => p.id);

      // Calculate date range
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      const { data, error } = await supabase
        .from('tenancies')
        .select(`
          *,
          tenant:profiles!tenant_id(id, full_name, email, phone, avatar_url),
          property:properties!property_id(id, title, address)
        `)
        .in('property_id', propertyIds)
        .eq('status', 'active')
        .not('end_date', 'is', null)
        .gte('end_date', today.toISOString().split('T')[0])
        .lte('end_date', futureDate.toISOString().split('T')[0])
        .order('end_date', { ascending: true });

      if (error) throw error;
      return data as Tenancy[];
    } catch (error) {
      console.error('Error fetching lease ending soon:', error);
      return [];
    }
  },

  /**
   * Create a new tenancy
   */
  async createTenancy(tenancy: Omit<Tenancy, 'id' | 'created_at' | 'updated_at'>): Promise<Tenancy> {
    try {
      const { data, error } = await supabase
        .from('tenancies')
        .insert(tenancy)
        .select()
        .single();

      if (error) throw error;
      return data as Tenancy;
    } catch (error) {
      console.error('Error creating tenancy:', error);
      throw error;
    }
  },

  /**
   * Update a tenancy
   */
  async updateTenancy(id: string, updates: Partial<Tenancy>): Promise<Tenancy> {
    try {
      const { data, error } = await supabase
        .from('tenancies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Tenancy;
    } catch (error) {
      console.error('Error updating tenancy:', error);
      throw error;
    }
  },

  /**
   * End a tenancy (set status to 'ended')
   */
  async endTenancy(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenancies')
        .update({ status: 'ended' })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error ending tenancy:', error);
      throw error;
    }
  },

  /**
   * Get tenancy map for a list of property IDs
   * Returns a map of propertyId -> Tenancy for quick lookup
   */
  async getTenancyMap(propertyIds: string[]): Promise<Map<string, Tenancy>> {
    try {
      if (propertyIds.length === 0) return new Map();

      const { data, error } = await supabase
        .from('tenancies')
        .select(`
          *,
          tenant:profiles!tenant_id(id, full_name, email, phone, avatar_url)
        `)
        .in('property_id', propertyIds)
        .eq('status', 'active');

      if (error) throw error;

      const map = new Map<string, Tenancy>();
      data?.forEach(tenancy => {
        map.set(tenancy.property_id, tenancy as Tenancy);
      });

      return map;
    } catch (error) {
      console.error('Error fetching tenancy map:', error);
      return new Map();
    }
  }
};
