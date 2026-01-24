<template>
  <div class="profile-card" @click="handleClick">
    <div class="profile-header">
      <div class="avatar-container">
        <img 
          v-if="profile.avatar_url" 
          :src="profile.avatar_url" 
          :alt="profile.full_name"
          class="avatar"
        />
        <div v-else class="avatar-placeholder">
          <ion-icon :icon="personOutline" class="placeholder-icon"></ion-icon>
        </div>
        <div v-if="profile.verified" class="verified-badge">
          <ion-icon :icon="checkmarkCircle" class="verified-icon"></ion-icon>
        </div>
      </div>

      <div class="profile-info">
        <h3 class="profile-name">{{ profile.full_name }}</h3>
        <p v-if="profile.company_name" class="company-name">{{ profile.company_name }}</p>
        <p v-else-if="profile.occupation" class="occupation">{{ profile.occupation }}</p>
        
        <div class="profile-meta">
          <div v-if="profile.rating > 0" class="rating">
            <ion-icon :icon="star" class="star-icon"></ion-icon>
            <span>{{ profile.rating.toFixed(1) }}</span>
          </div>
          <div v-if="profile.landlord_type" class="landlord-type">
            <ion-icon :icon="getLandlordTypeIcon(profile.landlord_type)" class="type-icon"></ion-icon>
            <span>{{ formatLandlordType(profile.landlord_type) }}</span>
          </div>
        </div>
      </div>
    </div>

    <p v-if="profile.bio" class="profile-bio">{{ truncateBio(profile.bio) }}</p>

    <div v-if="showStats && stats" class="profile-stats">
      <div class="stat">
        <span class="stat-value">{{ stats.total_properties }}</span>
        <span class="stat-label">Properties</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ stats.total_applications }}</span>
        <span class="stat-label">Applications</span>
      </div>
      <div v-if="stats.avg_response_time_hours > 0" class="stat">
        <span class="stat-value">{{ Math.round(stats.avg_response_time_hours) }}h</span>
        <span class="stat-label">Response Time</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { personOutline, checkmarkCircle, star, businessOutline, personCircleOutline, briefcaseOutline } from 'ionicons/icons';
import type { Profile, LandlordStats } from '@/services/profileService';

const props = defineProps<{
  profile: Profile;
  stats?: LandlordStats | null;
  showStats?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click', profile: Profile): void;
}>();

const handleClick = () => {
  emit('click', props.profile);
};

const truncateBio = (bio: string) => {
  return bio.length > 120 ? bio.substring(0, 120) + '...' : bio;
};

const formatLandlordType = (type: string) => {
  const types: Record<string, string> = {
    individual: 'Individual',
    company: 'Company',
    property_management: 'Property Management'
  };
  return types[type] || type;
};

const getLandlordTypeIcon = (type: string) => {
  const icons: Record<string, any> = {
    individual: personCircleOutline,
    company: businessOutline,
    property_management: briefcaseOutline
  };
  return icons[type] || businessOutline;
};
</script>

<style scoped>
.profile-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.profile-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.avatar,
.avatar-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 32px;
  color: white;
}

.verified-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verified-icon {
  font-size: 24px;
  color: #3B82F6;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.company-name,
.occupation {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.rating,
.landlord-type {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #374151;
}

.star-icon {
  font-size: 16px;
  color: #F59E0B;
}

.type-icon {
  font-size: 16px;
  color: #667eea;
}

.profile-bio {
  font-size: 0.875rem;
  color: #6B7280;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.profile-stats {
  display: flex;
  gap: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
}

.stat-label {
  font-size: 0.75rem;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
