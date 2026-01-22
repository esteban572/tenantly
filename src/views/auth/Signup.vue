<template>
  <ion-page>
    <ion-content :fullscreen="true" class="signup-page">
      <div class="signup-container">
        <!-- Hero Section (Left Side - Desktop) -->
        <div class="hero-section">
          <SignupHero />
        </div>

        <!-- Form Section (Right Side) -->
        <div class="form-section">
          <SignupForm 
            :loading="loading"
            :error-msg="errorMsg"
            @submit="handleSignup"
          />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { supabase } from '@/services/supabaseClient';
import { useRouter } from 'vue-router';
import SignupHero from '@/components/auth/SignupHero.vue';
import SignupForm from '@/components/auth/SignupForm.vue';
import '@/theme/auth.css';

const loading = ref(false);
const errorMsg = ref('');
const router = useRouter();

const handleSignup = async (formData: any) => {
  try {
    loading.value = true;
    errorMsg.value = '';
    
    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // 2. Create Profile Entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user.id,
            full_name: formData.fullName,
            role: formData.role 
          }
        ]);

      if (profileError) {
         console.error('Profile creation failed:', profileError);
         throw new Error('Failed to create user profile.');
      }

      // 3. Redirect
      if (formData.role === 'landlord') {
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

<style scoped>
.signup-page {
  --background: #F9FAFB;
}

.signup-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  width: 100%;
}

.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.form-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #F9FAFB;
}

/* Tablet */
@media (max-width: 1024px) {
  .signup-container {
    grid-template-columns: 40% 60%;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .signup-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .hero-section {
    min-height: auto;
  }

  .form-section {
    padding: 1.5rem;
  }
}
</style>
