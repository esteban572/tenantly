import { defineStore } from 'pinia';
import { supabase } from '../services/supabaseClient';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any>(null);
    const profile = ref<any>(null);
    const loading = ref(true);

    const loadUser = async () => {
        loading.value = true;
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
            user.value = session.user;
            await fetchProfile(session.user.id);
        } else {
            user.value = null;
            profile.value = null;
        }
        loading.value = false;
    };

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data) {
            profile.value = data;
        }
        return { data, error };
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        if (data.user) {
            user.value = data.user;
            await fetchProfile(data.user.id);
        }
        return data;
    };

    const signUp = async (email: string, password: string, fullName: string) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });
        if (authError) throw authError;

        if (authData.user) {
            // Profile is created by trigger 'on_auth_user_created'
            // We just need to load the user/profile into state
            user.value = authData.user;
            await fetchProfile(authData.user.id);
        }
        return authData;
    };

    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/onboarding`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            }
        });
        if (error) throw error;
        return data;
    };

    const updateProfile = async (updates: any) => {
        if (!user.value) throw new Error('No user logged in');

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.value.id)
            .select()
            .single();

        if (error) throw error;

        if (data) {
            profile.value = data;
        }
        return { data, error };
    };

    const completeOnboarding = async (onboardingData: {
        role: 'tenant' | 'landlord';
        landlord_type?: 'individual' | 'company' | 'property_management';
        company_name?: string;
        bio?: string;
        phone_number?: string;
        occupation?: string;
        employer?: string;
        years_of_experience?: number;
    }) => {
        if (!user.value) throw new Error('No user logged in');

        const updates = {
            id: user.value.id,
            ...onboardingData,
            onboarding_completed: true,
            profile_completed: true
        };

        // Use upsert to handle both insert and update cases
        const { data, error } = await supabase
            .from('profiles')
            .upsert(updates, { onConflict: 'id' })
            .select()
            .single();

        if (error) throw error;

        if (data) {
            profile.value = data;
        }
        return { data, error };
    };

    const uploadAvatar = async (file: File) => {
        if (!user.value) throw new Error('No user logged in');

        const fileExt = file.name.split('.').pop();
        const fileName = `avatar-${Date.now()}.${fileExt}`;
        const filePath = `${user.value.id}/${fileName}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Update profile with avatar URL
        await updateProfile({ avatar_url: publicUrl });

        return publicUrl;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        user.value = null;
        profile.value = null;
    };

    return {
        user,
        profile,
        loading,
        loadUser,
        fetchProfile,
        signIn,
        signUp,
        signInWithGoogle,
        updateProfile,
        completeOnboarding,
        uploadAvatar,
        signOut
    };
});
