<template>
  <ion-page>
    <ion-content class="onboarding-page" :fullscreen="true">
      <div class="onboarding-container">
        <!-- Progress Bar -->
        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div class="progress-steps">
            <div 
              v-for="step in totalSteps" 
              :key="step"
              class="progress-step"
              :class="{ 
                active: currentStep === step, 
                completed: currentStep > step 
              }"
            >
              <div class="step-circle">
                <ion-icon v-if="currentStep > step" :icon="checkmarkOutline" class="check-icon"></ion-icon>
                <span v-else>{{ step }}</span>
              </div>
              <span class="step-label">{{ getStepLabel(step) }}</span>
            </div>
          </div>
        </div>

        <!-- Step Content -->
        <div class="step-content">
          <!-- Step 1: Role Selection -->
          <div v-if="currentStep === 1" class="step-container">
            <RoleSelectionStep v-model="onboardingData.role" />
          </div>

          <!-- Step 2: Landlord Type (only for landlords) -->
          <div v-if="currentStep === 2 && onboardingData.role === 'landlord'" class="step-container">
            <LandlordTypeSelector v-model="onboardingData.landlord_type" />
          </div>

          <!-- Step 3: Profile Setup -->
          <div v-if="currentStep === (onboardingData.role === 'landlord' ? 3 : 2)" class="step-container">
            <ProfileSetupForm 
              :role="onboardingData.role!"
              :landlord-type="onboardingData.landlord_type"
              :loading="loading"
              @submit="handleProfileSubmit"
            />
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="navigation-buttons">
          <button
            v-if="currentStep > 1"
            class="nav-button secondary"
            @click="previousStep"
            :disabled="loading"
          >
            <ion-icon :icon="arrowBackOutline" class="button-icon"></ion-icon>
            Back
          </button>
          <button
            v-if="!isLastStep"
            class="nav-button primary"
            @click="nextStep"
            :disabled="!canProceed || loading"
          >
            Continue
            <ion-icon :icon="arrowForwardOutline" class="button-icon"></ion-icon>
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="errorMsg" class="error-alert">
          <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
          <span>{{ errorMsg }}</span>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { 
  checkmarkOutline, arrowBackOutline, arrowForwardOutline, 
  alertCircleOutline 
} from 'ionicons/icons';

import RoleSelectionStep from '@/components/onboarding/RoleSelectionStep.vue';
import LandlordTypeSelector from '@/components/onboarding/LandlordTypeSelector.vue';
import ProfileSetupForm from '@/components/onboarding/ProfileSetupForm.vue';

const router = useRouter();
const authStore = useAuthStore();

const currentStep = ref(1);
const loading = ref(false);
const errorMsg = ref('');

const onboardingData = ref<{
  role: 'tenant' | 'landlord' | null;
  landlord_type?: 'individual' | 'company' | 'property_management';
}>({
  role: null,
  landlord_type: undefined
});

const totalSteps = computed(() => {
  return onboardingData.value.role === 'landlord' ? 3 : 2;
});

const progressPercentage = computed(() => {
  return (currentStep.value / totalSteps.value) * 100;
});

const isLastStep = computed(() => {
  return currentStep.value === totalSteps.value;
});

const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return onboardingData.value.role !== null;
  }
  if (currentStep.value === 2 && onboardingData.value.role === 'landlord') {
    return onboardingData.value.landlord_type !== null;
  }
  return false;
});

const getStepLabel = (step: number) => {
  if (step === 1) return 'Role';
  if (step === 2) {
    return onboardingData.value.role === 'landlord' ? 'Type' : 'Profile';
  }
  if (step === 3) return 'Profile';
  return '';
};

const nextStep = () => {
  if (canProceed.value && currentStep.value < totalSteps.value) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
    errorMsg.value = '';
  }
};

const handleProfileSubmit = async (profileData: any) => {
  try {
    loading.value = true;
    errorMsg.value = '';

    // Upload avatar if provided
    if (profileData.avatarFile) {
      await authStore.uploadAvatar(profileData.avatarFile);
      delete profileData.avatarFile;
    }

    // Complete onboarding with all data
    await authStore.completeOnboarding({
      role: onboardingData.value.role!,
      landlord_type: onboardingData.value.landlord_type || undefined,
      ...profileData
    });

    // Redirect based on role
    if (onboardingData.value.role === 'landlord') {
      router.replace('/landlord/dashboard');
    } else {
      router.replace('/tenant/dashboard');
    }
  } catch (error: any) {
    console.error('Onboarding error:', error);
    errorMsg.value = error.message || 'Failed to complete onboarding';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.onboarding-page {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.onboarding-container {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.progress-section {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 4px;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.progress-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #E5E7EB;
  color: #9CA3AF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.progress-step.active .step-circle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.progress-step.completed .step-circle {
  background: #10B981;
  color: white;
}

.check-icon {
  font-size: 24px;
}

.step-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6B7280;
  text-align: center;
}

.progress-step.active .step-label {
  color: #667eea;
}

.progress-step.completed .step-label {
  color: #10B981;
}

.step-content {
  flex: 1;
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.step-container {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.navigation-buttons {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.nav-button {
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.nav-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.nav-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.nav-button.secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.nav-button.secondary:hover:not(:disabled) {
  background: #F9FAFB;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-icon {
  font-size: 20px;
}

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
}

.error-icon {
  font-size: 20px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .onboarding-container {
    padding: 1rem;
  }

  .step-content {
    padding: 1.5rem;
  }

  .progress-steps {
    gap: 0.5rem;
  }

  .step-label {
    font-size: 0.75rem;
  }

  .step-circle {
    width: 36px;
    height: 36px;
    font-size: 0.875rem;
  }
}
</style>
