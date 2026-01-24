<template>
  <button
    type="button"
    class="google-signin-button"
    @click="handleGoogleSignIn"
    :disabled="loading"
  >
    <div class="button-content">
      <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      <span v-if="!loading">Continue with Google</span>
      <span v-else class="loading-content">
        <ion-spinner name="crescent" class="button-spinner"></ion-spinner>
        Connecting...
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonSpinner } from '@ionic/vue';
import { useAuthStore } from '@/stores/authStore';

const emit = defineEmits<{
  (e: 'error', message: string): void;
}>();

const authStore = useAuthStore();
const loading = ref(false);

const handleGoogleSignIn = async () => {
  try {
    loading.value = true;
    await authStore.signInWithGoogle();
    // Redirect is handled by Supabase OAuth flow
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    emit('error', error.message || 'Failed to sign in with Google');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.google-signin-button {
  width: 100%;
  padding: 0.875rem 1rem;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
}

.google-signin-button:hover:not(:disabled) {
  border-color: #D1D5DB;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.google-signin-button:active:not(:disabled) {
  transform: translateY(0);
}

.google-signin-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.button-spinner {
  width: 18px;
  height: 18px;
}
</style>
