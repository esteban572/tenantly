import { defineStore } from 'pinia';
import { supabase } from '@/services/supabaseClient';
import { ref } from 'vue';

export interface Property {
    id: string;
    landlord_id: string;
    title: string;
    description: string;
    price: number;
    address: string;
    image_urls: string[];
    created_at: string;
}

export const usePropertyStore = defineStore('property', () => {
    const properties = ref<Property[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch properties for the current landlord
    const fetchMyProperties = async () => {
        loading.value = true;
        error.value = null;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error: err } = await supabase
                .from('properties')
                .select('*')
                .eq('landlord_id', user.id)
                .order('created_at', { ascending: false });

            if (err) throw err;
            properties.value = data || [];
        } catch (e: any) {
            console.error('Error fetching properties:', e);
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    };

    // Fetch all properties (for tenants)
    const fetchAllProperties = async () => {
        loading.value = true;
        error.value = null;
        try {
            const { data, error: err } = await supabase
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (err) throw err;
            properties.value = data || [];
        } catch (e: any) {
            console.error('Error fetching all properties:', e);
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    };

    const addProperty = async (property: Omit<Property, 'id' | 'created_at' | 'landlord_id'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error: err } = await supabase
                .from('properties')
                .insert([{ ...property, landlord_id: user.id }])
                .select()
                .single();

            if (err) throw err;
            properties.value.unshift(data);
            return data;
        } catch (e: any) {
            console.error('Error adding property:', e);
            throw e;
        }
    };

    const updateProperty = async (id: string, updates: Partial<Property>) => {
        try {
            const { data, error: err } = await supabase
                .from('properties')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (err) throw err;

            // Update local state
            const index = properties.value.findIndex(p => p.id === id);
            if (index !== -1) {
                properties.value[index] = data;
            }
            return data;
        } catch (e: any) {
            console.error('Error updating property:', e);
            throw e;
        }
    };

    const deleteProperty = async (id: string) => {
        try {
            const { error: err } = await supabase
                .from('properties')
                .delete()
                .eq('id', id);

            if (err) throw err;

            // Remove from local state
            properties.value = properties.value.filter(p => p.id !== id);
        } catch (e: any) {
            console.error('Error deleting property:', e);
            throw e;
        }
    };

    return {
        properties,
        loading,
        error,
        fetchMyProperties,
        fetchAllProperties,
        addProperty,
        updateProperty,
        deleteProperty
    };
});
