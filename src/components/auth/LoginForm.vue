<template>
  <div class="login-form-container">
    <div class="form-header">
      <h2 class="form-title">Welcome Back</h2>
      <p class="form-subtitle">Sign in to continue to Tenantly</p>
    </div>

    <div v-if="errorMsg" class="error-alert">
      <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
      <span>{{ errorMsg }}</span>
    </div>

    <form @submit.prevent="handleSubmit" class="login-form">
      <!-- Email -->
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <div class="input-wrapper">
          <ion-icon :icon="mailOutline" class="input-icon"></ion-icon>
          <input
            v-model="formData.email"
            type="email"
            class="form-input"
            placeholder="john@example.com"
            required
            autofocus
          />
        </div>
      </div>

      <!-- Password -->
      <div class="form-group">
        <div class="label-row">
          <label class="form-label">Password</label>
          <a href="#" class="forgot-link">Forgot password?</a>
        </div>
        <div class="input-wrapper">
          <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
          <input
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
          >
            <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline"></ion-icon>
          </button>
        </div>
      </div>

      <!-- Remember Me -->
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="formData.rememberMe"
            type="checkbox"
            class="checkbox-input"
          />
          <span class="checkbox-text">Remember me for 30 days</span>
        </label>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="submit-button"
        :disabled="!isFormValid || loading"
      >
        <span v-if="!loading">Sign In</span>
        <span v-else class="loading-content">
          <ion-spinner name="crescent" class="button-spinner"></ion-spinner>
          Signing In...
        </span>
      </button>

      <!-- Divider -->
      <div class="divider">
        <span class="divider-text">or</span>
      </div>

      <!-- Sign Up Link -->
      <p class="form-footer">
        Don't have an account? 
        <a href="/signup" class="link">Create one now</a>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonIcon, IonSpinner } from '@ionic/vue';
import { 
  mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline,
  alertCircleOutline
} from 'ionicons/icons';

const props = defineProps<{
  loading: boolean;
  errorMsg: string;
}>();

const emit = defineEmits<{
  (e: 'submit', data: any): void;
}>();

const formData = ref({
  email: '',
  password: '',
  rememberMe: false
});

const showPassword = ref(false);

const isFormValid = computed(() => {
  return formData.value.email.length > 0 && formData.value.password.length > 0;
});

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', formData.value);
  }
};
</script>

<style scoped>
.login-form-container {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* Header */
.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.5rem 0;
}

.form-subtitle {
  font-size: 1rem;
  color: #6B7280;
  margin: 0;
}

/* Error Alert */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  border-radius: 12px;
  color: #991B1B;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.error-icon {
  font-size: 20px;
  flex-shrink: 0;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.forgot-link {
  font-size: 0.875rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  font-size: 20px;
  color: #9CA3AF;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  font-size: 1rem;
  color: #1F2937;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #9CA3AF;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #9CA3AF;
  font-size: 20px;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #667eea;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #6B7280;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

.checkbox-text {
  line-height: 1.5;
}

/* Submit Button */
.submit-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button-spinner {
  width: 20px;
  height: 20px;
}

/* Divider */
.divider {
  position: relative;
  text-align: center;
  margin: 0.5rem 0;
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
  background: rgba(255, 255, 255, 0.95);
  color: #9CA3AF;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Footer */
.form-footer {
  text-align: center;
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Mobile */
@media (max-width: 640px) {
  .login-form-container {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .form-subtitle {
    font-size: 0.875rem;
  }
}
</style>
