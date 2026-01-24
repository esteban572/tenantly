import { supabase } from './supabaseClient';

export interface Profile {
    id: string;
    full_name: string;
    email?: string;
    role: 'tenant' | 'landlord';
    landlord_type?: 'individual' | 'company' | 'property_management';
    company_name?: string;
    bio?: string;
    avatar_url?: string;
    phone_number?: string;
    linkedin_url?: string;
    website_url?: string;
    years_of_experience?: number;
    occupation?: string;
    employer?: string;
    verified: boolean;
    rating: number;
    profile_completed: boolean;
    onboarding_completed: boolean;
    created_at: string;
    updated_at?: string;
}

export interface LandlordStats {
    id: string;
    full_name: string;
    company_name?: string;
    landlord_type?: string;
    rating: number;
    verified: boolean;
    total_properties: number;
    total_applications: number;
    avg_response_time_hours: number;
}

export const profileService = {
    /**
     * Get a profile by ID
     */
    async getProfile(userId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return data as Profile;
    },

    /**
     * Search profiles by name or company
     */
    async searchProfiles(query: string, role?: 'tenant' | 'landlord'): Promise<Profile[]> {
        let queryBuilder = supabase
            .from('profiles')
            .select('*')
            .or(`full_name.ilike.%${query}%,company_name.ilike.%${query}%`);

        if (role) {
            queryBuilder = queryBuilder.eq('role', role);
        }

        const { data, error } = await queryBuilder;

        if (error) {
            console.error('Error searching profiles:', error);
            return [];
        }

        return data as Profile[];
    },

    /**
     * Get all landlord profiles with optional filters
     */
    async getLandlords(filters?: {
        landlord_type?: string;
        verified?: boolean;
        min_rating?: number;
    }): Promise<Profile[]> {
        let query = supabase
            .from('profiles')
            .select('*')
            .eq('role', 'landlord')
            .order('rating', { ascending: false });

        if (filters?.landlord_type) {
            query = query.eq('landlord_type', filters.landlord_type);
        }

        if (filters?.verified !== undefined) {
            query = query.eq('verified', filters.verified);
        }

        if (filters?.min_rating) {
            query = query.gte('rating', filters.min_rating);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching landlords:', error);
            return [];
        }

        return data as Profile[];
    },

    /**
     * Get landlord statistics
     */
    async getLandlordStats(landlordId: string): Promise<LandlordStats | null> {
        const { data, error } = await supabase
            .from('landlord_stats')
            .select('*')
            .eq('id', landlordId)
            .single();

        if (error) {
            console.error('Error fetching landlord stats:', error);
            return null;
        }

        return data as LandlordStats;
    },

    /**
     * Get properties by landlord
     */
    async getPropertiesByLandlord(landlordId: string) {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('landlord_id', landlordId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching landlord properties:', error);
            return [];
        }

        return data;
    },

    /**
     * Calculate profile completeness percentage
     */
    async getProfileCompleteness(userId: string): Promise<number> {
        const { data, error } = await supabase
            .rpc('calculate_profile_completeness', { profile_id: userId });

        if (error) {
            console.error('Error calculating profile completeness:', error);
            return 0;
        }

        return data || 0;
    },

    /**
     * Update profile rating (called after review)
     */
    async updateRating(userId: string, newRating: number) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ rating: newRating })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating rating:', error);
            throw error;
        }

        return data;
    }
};
