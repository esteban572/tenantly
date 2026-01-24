import { defineStore } from 'pinia';
import { supabase } from '@/services/supabaseClient';
import { ref } from 'vue';

export interface MaintenanceRequest {
    id: string;
    tenant_id: string;
    property_id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    photo_url: string | null;
    created_at: string;
    // Worker assignment
    assigned_worker_name?: string | null;
    assigned_worker_phone?: string | null;
    assigned_at?: string | null;
    // Viewed tracking
    viewed_at?: string | null;
    viewed_by?: string | null;
    // Scheduling and priority
    scheduled_date?: string | null;
    priority?: 'emergency' | 'high' | 'medium' | 'low' | null;
    category?: string | null;
    notes?: string | null;
    completed_at?: string | null;
    // Relationships (optional, depending on query)
    properties?: {
        id?: string;
        title?: string;
        address: string;
        landlord_id?: string;
    };
    profiles?: {
        full_name: string;
    };
    // AI Triage Data
    ai_classification?: string;
    ai_priority?: string;
    ai_summary?: string;
    ai_suggested_action?: string;
    ai_suggested_category?: string;
}

export const useMaintenanceStore = defineStore('maintenance', () => {
    const requests = ref<MaintenanceRequest[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch requests based on user role
    // For Tenant: fetch only their requests
    // For Landlord: fetch requests for their properties
    const fetchRequests = async () => {
        loading.value = true;
        error.value = null;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Determine role to decide what to fetch? 
            // Actually, RLS handles visibility, so a simple select should return what is allowed.
            // However, we might want to join tables for nicer display (e.g. property name).

            const { data, error: err } = await supabase
                .from('maintenance_requests')
                .select(`
                    *,
                    properties (title, address),
                    profiles (full_name)
                `)
                .order('created_at', { ascending: false });

            if (err) throw err;
            requests.value = data || [];
        } catch (e: any) {
            console.error('Error fetching maintenance requests:', e);
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    };

    const createRequest = async (requestData: {
        property_id: string;
        title: string;
        description: string;
        photo_url?: string;
    }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error: err } = await supabase
                .from('maintenance_requests')
                .insert([{
                    tenant_id: user.id,
                    ...requestData,
                    status: 'pending' // Default
                }])
                .select()
                .single();

            if (err) throw err;

            // Add to local state
            requests.value.unshift(data);
            return data;
        } catch (e: any) {
            console.error('Error creating maintenance request:', e);
            throw e;
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            const { data, error: err } = await supabase
                .from('maintenance_requests')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (err) throw err;

            // Update local state
            const index = requests.value.findIndex(r => r.id === id);
            if (index !== -1) {
                // Preserve the joined data if possible, or just update the fields returned
                requests.value[index] = { ...requests.value[index], ...data };
            }
        } catch (e: any) {
            console.error('Error updating status:', e);
            throw e;
        }
    };

    return {
        requests,
        loading,
        error,
        fetchRequests,
        createRequest,
        updateStatus
    };
});
