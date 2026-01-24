<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-page">
      <div class="login-wrapper">
        <div class="login-container">
          <!-- Hero Section (Left Side - Desktop) -->
          <div class="hero-section">
            <SignupHero />
          </div>

          <!-- Form Section (Right Side) -->
          <div class="form-section">
            <LoginForm 
              :loading="loading"
              :error-msg="errorMsg"
              @submit="handleLogin"
            />
          </div>
        </div>
        
        <!-- Footer -->
        <Footer />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import SignupHero from '@/components/auth/SignupHero.vue';
import LoginForm from '@/components/auth/LoginForm.vue';
import Footer from '@/components/shared/Footer.vue';
import '@/theme/auth.css';

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
      const role = authStore.profile?.role;
      if (role === 'landlord') {
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
.login-page {
  --background: #F9FAFB;
}

.login-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1;
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
  .login-container {
    grid-template-columns: 40% 60%;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .login-container {
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
