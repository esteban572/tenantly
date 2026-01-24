<template>
  <div class="landlord-type-selection">
    <div class="step-header">
      <h2 class="step-title">What type of landlord are you?</h2>
      <p class="step-subtitle">This helps tenants understand who they're renting from</p>
    </div>

    <div class="type-cards">
      <div 
        class="type-card"
        :class="{ selected: modelValue === 'individual' }"
        @click="selectType('individual')"
      >
        <div class="type-icon individual-icon">
          <ion-icon :icon="personOutline" class="icon"></ion-icon>
        </div>
        <h3 class="type-title">Individual</h3>
        <p class="type-description">
          I own and manage my own rental properties personally.
        </p>
      </div>

      <div 
        class="type-card"
        :class="{ selected: modelValue === 'company' }"
        @click="selectType('company')"
      >
        <div class="type-icon company-icon">
          <ion-icon :icon="businessOutline" class="icon"></ion-icon>
        </div>
        <h3 class="type-title">Company</h3>
        <p class="type-description">
          I represent a company that owns rental properties.
        </p>
      </div>

      <div 
        class="type-card"
        :class="{ selected: modelValue === 'property_management' }"
        @click="selectType('property_management')"
      >
        <div class="type-icon management-icon">
          <ion-icon :icon="briefcaseOutline" class="icon"></ion-icon>
        </div>
        <h3 class="type-title">Property Management</h3>
        <p class="type-description">
          I manage properties on behalf of property owners.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { personOutline, businessOutline, briefcaseOutline } from 'ionicons/icons';

const props = defineProps<{
  modelValue?: 'individual' | 'company' | 'property_management';
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'individual' | 'company' | 'property_management'): void;
}>();

const selectType = (type: 'individual' | 'company' | 'property_management') => {
  emit('update:modelValue', type);
};
</script>

<style scoped>
.landlord-type-selection {
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

.type-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.type-card {
  background: white;
  border: 3px solid #E5E7EB;
  border-radius: 20px;
  padding: 2rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  text-align: center;
}

.type-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.15);
}

.type-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.type-card.selected::before {
  content: '✓';
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.type-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}

.individual-icon {
  background: linear-gradient(135deg, #3B82F6 0%, #667eea 100%);
}

.company-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.management-icon {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.icon {
  font-size: 36px;
  color: white;
}

.type-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.75rem 0;
}

.type-description {
  font-size: 0.9375rem;
  color: #6B7280;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .type-cards {
    grid-template-columns: 1fr;
  }

  .step-title {
    font-size: 1.75rem;
  }
}
</style>
