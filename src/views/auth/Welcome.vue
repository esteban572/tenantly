<template>
  <ion-page>
    <ion-content class="welcome-page" :fullscreen="true">
      <div class="flex flex-col h-full justify-center items-center p-6 relative z-10">
        
        <!-- Logo / Branding -->
        <div class="mb-8 text-center text-white">
          <h1 class="text-4xl font-bold tracking-tight">Tenantly</h1>
          <p class="text-white/80 mt-2">Find your next home or manage your properties.</p>
        </div>

        <!-- Auth Card -->
        <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden backdrop-blur-lg bg-white/95">
          
          <!-- Toggle Switch -->
          <div class="flex p-2 bg-gray-100/50 m-2 rounded-2xl">
            <button 
              class="flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300"
              :class="mode === 'login' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-500 hover:text-gray-700'"
              @click="mode = 'login'"
            >
              Log In
            </button>
            <button 
              class="flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300"
              :class="mode === 'signup' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-500 hover:text-gray-700'"
              @click="mode = 'signup'"
            >
              Sign Up
            </button>
          </div>

          <!-- Forms -->
          <div class="p-6">
            <!-- Google Sign-In -->
            <GoogleSignInButton @error="handleGoogleError" />
            
            <!-- Divider -->
            <div class="divider">
              <span class="divider-text">or continue with email</span>
            </div>

            <transition name="fade" mode="out-in">
              <div v-if="mode === 'login'" key="login">
                 <LoginForm 
                    :loading="loading"
                    :error-msg="errorMsg"
                    @submit="handleLogin"
                 />
              </div>
              <div v-else key="signup">
                 <SignupForm 
                    :loading="loading"
                    :error-msg="errorMsg"
                    @submit="handleSignup"
                 />
              </div>
            </transition>
          </div>

        </div>

      </div>

      <!-- Background Elements -->
      <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#667eea] to-[#764ba2] z-0"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import LoginForm from '@/components/auth/LoginForm.vue';
import SignupForm from '@/components/auth/SignupForm.vue';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton.vue';

const mode = ref<'login' | 'signup'>('login');
const loading = ref(false);
const errorMsg = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async (formData: any) => {
  try {
    loading.value = true;
    errorMsg.value = '';
    await authStore.signIn(formData.email, formData.password);
    if (authStore.user) {
      redirectUser();
    }
  } catch (error: any) {
    errorMsg.value = error.message;
  } finally {
    loading.value = false;
  }
};

const handleSignup = async (formData: any) => {
  try {
    loading.value = true;
    errorMsg.value = '';
    await authStore.signUp(formData.email, formData.password, formData.fullName);
    if (authStore.user) {
      // Redirect to onboarding for new users
      router.replace('/onboarding');
    }
  } catch (error: any) {
    errorMsg.value = error.message;
  } finally {
    loading.value = false;
  }
};

const handleGoogleError = (message: string) => {
  errorMsg.value = message;
};

const redirectUser = () => {
    const profile = authStore.profile;
    
    // If onboarding not completed, redirect to onboarding
    if (!profile?.onboarding_completed) {
      router.replace('/onboarding');
      return;
    }
    
    // Otherwise redirect based on role
    const role = profile?.role;
    if (role === 'landlord') {
      router.replace('/landlord/dashboard');
    } else {
      router.replace('/tenant/dashboard');
    }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #E5E7EB;
}

.divider-text {
  position: relative;
  display: inline-block;
  padding: 0 1rem;
  background: white;
  color: #9CA3AF;
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
