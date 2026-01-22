<template>
  <ion-page>
    <ion-content class="ion-padding flex items-center justify-center">
      <div class="w-full max-w-md mx-auto mt-10">
        <h1 class="text-3xl font-bold text-center mb-8">Sign Up</h1>
        
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

          <ion-item>
             <ion-label>I am a:</ion-label>
             <ion-select v-model="role" interface="popover">
               <ion-select-option value="tenant">Tenant</ion-select-option>
               <ion-select-option value="landlord">Landlord</ion-select-option>
             </ion-select>
          </ion-item>
          
          <ion-button expand="block" class="mt-8" @click="handleSignup" :disabled="loading">
            {{ loading ? 'Signing Up...' : 'Sign Up' }}
          </ion-button>
          
          <p class="text-center mt-4">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption } from '@ionic/vue';
import { supabase } from '@/services/supabaseClient';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const role = ref('tenant');
const loading = ref(false);
const errorMsg = ref('');
const router = useRouter();

const handleSignup = async () => {
  try {
    loading.value = true;
    errorMsg.value = '';
    
    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });

    if (authError) throw authError;

    if (authData.user) {
      // 2. Create Profile Entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user.id,
            full_name: email.value.split('@')[0], // Default name from email
            role: role.value 
          }
        ]);

      if (profileError) {
         // Cleanup if profile creation fails? For now just show error
         console.error('Profile creation failed:', profileError);
         throw new Error('Failed to create user profile.');
      }

      // 3. Redirect
      if (role.value === 'landlord') {
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
