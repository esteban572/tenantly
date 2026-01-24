<template>
  <div class="role-selection">
    <div class="step-header">
      <h2 class="step-title">Choose Your Role</h2>
      <p class="step-subtitle">Select how you'll be using Tenantly</p>
    </div>

    <div class="role-cards">
      <div 
        class="role-card"
        :class="{ selected: modelValue === 'tenant' }"
        @click="selectRole('tenant')"
      >
        <div class="role-icon tenant-icon">
          <ion-icon :icon="homeOutline" class="icon"></ion-icon>
        </div>
        <h3 class="role-title">I'm a Tenant</h3>
        <p class="role-description">
          Looking for a place to rent. Browse properties, connect with landlords, and manage your tenancy.
        </p>
        <div class="role-features">
          <div class="feature">
            <ion-icon :icon="checkmarkCircle" class="check-icon"></ion-icon>
            <span>Browse properties</span>
          </div>
          <div class="feature">
            <ion-icon :icon="checkmarkCircle" class="check-icon"></ion-icon>
            <span>Submit applications</span>
          </div>
          <div class="feature">
            <ion-icon :icon="checkmarkCircle" class="check-icon"></ion-icon>
            <span>Request maintenance</span>
          </div>
        </div>
      </div>

      <div 
        class="role-card"
        :class="{ selected: modelValue === 'landlord' }"
        @click="selectRole('landlord')"
      >
        <div class="role-icon landlord-icon">
          <ion-icon :icon="businessOutline" class="icon"></ion-icon>
        </div>
        <h3 class="role-title">I'm a Landlord</h3>
        <p class="role-description">
          Managing rental properties. List properties, review applications, and communicate with tenants.
        </p>
        <div class="role-features">
          <div class="feature">
            <ion-icon :icon="checkmarkCircle" class="check-icon"></ion-icon>
            <span>List properties</span>
          </div>
          <div class="feature">
            <ion-icon :icon="checkmarkCircle" class="check-icon"></ion-icon>
            <span>Manage applications</span>
          </div>
          <div class="feature">
            <ion-icon :icon="checkmarkCircle" class="check-icon"></ion-icon>
            <span>Track maintenance</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { homeOutline, businessOutline, checkmarkCircle } from 'ionicons/icons';

const props = defineProps<{
  modelValue: 'tenant' | 'landlord' | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'tenant' | 'landlord'): void;
}>();

const selectRole = (role: 'tenant' | 'landlord') => {
  emit('update:modelValue', role);
};
</script>

<style scoped>
.role-selection {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.step-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.5rem 0;
}

.step-subtitle {
  font-size: 1.125rem;
  color: #6B7280;
  margin: 0;
}

.role-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.role-card {
  background: white;
  border: 3px solid #E5E7EB;
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.role-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.15);
}

.role-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.role-card.selected::before {
  content: '✓';
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.role-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.tenant-icon {
  background: linear-gradient(135deg, #3B82F6 0%, #667eea 100%);
}

.landlord-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.icon {
  font-size: 40px;
  color: white;
}

.role-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.75rem 0;
  text-align: center;
}

.role-description {
  font-size: 0.9375rem;
  color: #6B7280;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.role-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #374151;
}

.check-icon {
  font-size: 20px;
  color: #10B981;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .role-cards {
    grid-template-columns: 1fr;
  }

  .step-title {
    font-size: 1.75rem;
  }
}
</style>
