<template>
  <div class="role-selector">
    <h3 class="role-selector-title">I am a...</h3>
    <div class="role-cards">
      <div 
        class="role-card"
        :class="{ 'active': modelValue === 'tenant' }"
        @click="selectRole('tenant')"
      >
        <div class="role-card-icon">
          <ion-icon :icon="personOutline"></ion-icon>
        </div>
        <div class="role-card-content">
          <h4 class="role-card-title">Tenant</h4>
          <p class="role-card-description">Looking for a place to rent</p>
        </div>
        <div class="role-card-check">
          <ion-icon :icon="checkmarkCircle"></ion-icon>
        </div>
      </div>

      <div 
        class="role-card"
        :class="{ 'active': modelValue === 'landlord' }"
        @click="selectRole('landlord')"
      >
        <div class="role-card-icon">
          <ion-icon :icon="businessOutline"></ion-icon>
        </div>
        <div class="role-card-content">
          <h4 class="role-card-title">Landlord</h4>
          <p class="role-card-description">Managing rental properties</p>
        </div>
        <div class="role-card-check">
          <ion-icon :icon="checkmarkCircle"></ion-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { personOutline, businessOutline, checkmarkCircle } from 'ionicons/icons';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const selectRole = (role: string) => {
  emit('update:modelValue', role);
};
</script>

<style scoped>
.role-selector {
  margin-bottom: 2rem;
}

.role-selector-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6B7280;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.role-card {
  position: relative;
  padding: 1.5rem;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.role-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.role-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.role-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.role-card.active::before {
  opacity: 0.03;
}

.role-card-icon {
  position: relative;
  z-index: 1;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  margin-bottom: 1rem;
  font-size: 24px;
  color: white;
  transition: all 0.3s ease;
}

.role-card:hover .role-card-icon {
  transform: scale(1.1) rotate(5deg);
}

.role-card.active .role-card-icon {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.role-card-content {
  position: relative;
  z-index: 1;
}

.role-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.role-card-description {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
  line-height: 1.4;
}

.role-card-check {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 24px;
  color: #667eea;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.role-card.active .role-card-check {
  opacity: 1;
  transform: scale(1);
}

/* Mobile */
@media (max-width: 640px) {
  .role-cards {
    grid-template-columns: 1fr;
  }

  .role-card {
    padding: 1.25rem;
  }

  .role-card-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
</style>
