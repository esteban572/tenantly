<template>
  <ion-page>
    <ion-content class="ion-padding flex items-center justify-center">
      <div class="w-full max-w-md mx-auto mt-10">
        <h1 class="text-3xl font-bold text-center mb-8">Tenantly</h1>
        
        <div v-if="errorMsg" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
           <span class="block sm:inline">{{ errorMsg }}</span>
        </div>

        <div class="space-y-4">
          <ion-item>
            <ion-label position="stacked">Email</ion-label>
            <ion-input v-model="email" type="email" placeholder="email@example.com"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Password</ion-label>
            <ion-input v-model="password" type="password" placeholder="********"></ion-input>
          </ion-item>
          <ion-button expand="block" class="mt-8" @click="handleLogin" :disabled="loading">
             {{ loading ? 'Logging In...' : 'Login' }}
          </ion-button>
          <p class="text-center mt-4">
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/vue';
import { supabase } from '@/services/supabaseClient';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');
const router = useRouter();

const handleLogin = async () => {
  try {
    loading.value = true;
    errorMsg.value = '';

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) throw error;

    if (data.user) {
      // Fetch user profile to get role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
         console.error('Error fetching profile:', profileError);
         // Fallback or specific error handling
         throw new Error('Failed to fetch user profile.');
      }

      if (profile?.role === 'landlord') {
        router.push('/landlord/dashboard');
      } else {
        router.push('/tenant/dashboard');
      }
    }
  } catch (error: any) {
    errorMsg.value = error.message;
  } finally {
    loading.value = false;
  }
};
</script>
