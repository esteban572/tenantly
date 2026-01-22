<template>
  <div class="signup-form-container">
    <div class="form-header">
      <h2 class="form-title">Create Your Account</h2>
      <p class="form-subtitle">Join thousands finding their perfect home</p>
    </div>

    <div v-if="errorMsg" class="error-alert">
      <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
      <span>{{ errorMsg }}</span>
    </div>

    <form @submit.prevent="handleSubmit" class="signup-form">
      <!-- Full Name -->
      <div class="form-group">
        <label class="form-label">Full Name</label>
        <div class="input-wrapper">
          <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
          <input
            v-model="formData.fullName"
            type="text"
            class="form-input"
            placeholder="John Doe"
            required
          />
        </div>
      </div>

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
          />
        </div>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label class="form-label">Password</label>
        <div class="input-wrapper">
          <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
          <input
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="••••••••"
            required
            @input="checkPasswordStrength"
          />
          <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
          >
            <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline"></ion-icon>
          </button>
        </div>
        <!-- Password Strength Indicator -->
        <div v-if="formData.password" class="password-strength">
          <div class="strength-bar">
            <div 
              class="strength-fill"
              :class="passwordStrength.class"
              :style="{ width: passwordStrength.width }"
            ></div>
          </div>
          <span class="strength-text" :class="passwordStrength.class">
            {{ passwordStrength.text }}
          </span>
        </div>
      </div>

      <!-- Confirm Password -->
      <div class="form-group">
        <label class="form-label">Confirm Password</label>
        <div class="input-wrapper">
          <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
          <input
            v-model="formData.confirmPassword"
            type="password"
            class="form-input"
            placeholder="••••••••"
            required
          />
          <div v-if="formData.confirmPassword && passwordsMatch" class="input-check">
            <ion-icon :icon="checkmarkCircle"></ion-icon>
          </div>
        </div>
        <p v-if="formData.confirmPassword && !passwordsMatch" class="error-text">
          Passwords do not match
        </p>
      </div>

      <!-- Role Selector -->
      <RoleSelector v-model="formData.role" />

      <!-- Terms & Conditions -->
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="formData.agreeToTerms"
            type="checkbox"
            class="checkbox-input"
            required
          />
          <span class="checkbox-text">
            I agree to the <a href="/terms" class="link">Terms of Service</a> and 
            <a href="/privacy" class="link">Privacy Policy</a>
          </span>
        </label>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="submit-button"
        :disabled="!isFormValid || loading"
      >
        <span v-if="!loading">Create Account</span>
        <span v-else class="loading-content">
          <ion-spinner name="crescent" class="button-spinner"></ion-spinner>
          Creating Account...
        </span>
      </button>

      <!-- Login Link -->
      <p class="form-footer">
        Already have an account? 
        <a href="/login" class="link">Sign in</a>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonIcon, IonSpinner } from '@ionic/vue';
import { 
  personOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline,
  checkmarkCircle, alertCircleOutline
} from 'ionicons/icons';
import RoleSelector from './RoleSelector.vue';

const props = defineProps<{
  loading: boolean;
  errorMsg: string;
}>();

const emit = defineEmits<{
  (e: 'submit', data: any): void;
}>();

const formData = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'tenant',
  agreeToTerms: false
});

const showPassword = ref(false);
const passwordStrength = ref({
  score: 0,
  text: '',
  class: '',
  width: '0%'
});

const passwordsMatch = computed(() => {
  return formData.value.password === formData.value.confirmPassword;
});

const isFormValid = computed(() => {
  return (
    formData.value.fullName.length > 0 &&
    formData.value.email.length > 0 &&
    formData.value.password.length >= 8 &&
    passwordsMatch.value &&
    formData.value.agreeToTerms
  );
});

const checkPasswordStrength = () => {
  const password = formData.value.password;
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  if (score <= 2) {
    passwordStrength.value = {
      score,
      text: 'Weak',
      class: 'weak',
      width: '33%'
    };
  } else if (score <= 3) {
    passwordStrength.value = {
      score,
      text: 'Medium',
      class: 'medium',
      width: '66%'
    };
  } else {
    passwordStrength.value = {
      score,
      text: 'Strong',
      class: 'strong',
      width: '100%'
    };
  }
};

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', formData.value);
  }
};
</script>

<style scoped>
.signup-form-container {
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
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
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

.input-check {
  position: absolute;
  right: 1rem;
  color: #10B981;
  font-size: 20px;
}

/* Password Strength */
.password-strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-fill.weak {
  background: #EF4444;
}

.strength-fill.medium {
  background: #F59E0B;
}

.strength-fill.strong {
  background: #10B981;
}

.strength-text {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.strength-text.weak {
  color: #EF4444;
}

.strength-text.medium {
  color: #F59E0B;
}

.strength-text.strong {
  color: #10B981;
}

.error-text {
  font-size: 0.875rem;
  color: #EF4444;
  margin: 0;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #6B7280;
}

.checkbox-input {
  margin-top: 0.125rem;
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
  .signup-form-container {
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
