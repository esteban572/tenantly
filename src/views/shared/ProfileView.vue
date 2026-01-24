<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Profile</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="isOwnProfile" router-link="/profile/edit">
            <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="profile" class="profile-container">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="header-background"></div>
          <div class="header-content">
            <div class="avatar-section">
              <div class="avatar-wrapper">
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
            </div>

            <div class="profile-title">
              <h1 class="profile-name">{{ profile.full_name }}</h1>
              <p v-if="profile.company_name" class="company-name">{{ profile.company_name }}</p>
              <p v-else-if="profile.occupation" class="occupation">
                {{ profile.occupation }}
                <span v-if="profile.employer"> at {{ profile.employer }}</span>
              </p>

              <div class="profile-badges">
                <div v-if="profile.rating > 0" class="badge rating-badge">
                  <ion-icon :icon="star" class="badge-icon"></ion-icon>
                  <span>{{ profile.rating.toFixed(1) }} Rating</span>
                </div>
                <div v-if="profile.landlord_type" class="badge type-badge">
                  <ion-icon :icon="getLandlordTypeIcon(profile.landlord_type)" class="badge-icon"></ion-icon>
                  <span>{{ formatLandlordType(profile.landlord_type) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats (for landlords) -->
        <div v-if="profile.role === 'landlord' && stats" class="stats-section">
          <div class="stat-card">
            <ion-icon :icon="homeOutline" class="stat-icon"></ion-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats.total_properties }}</span>
              <span class="stat-label">Properties</span>
            </div>
          </div>
          <div class="stat-card">
            <ion-icon :icon="documentTextOutline" class="stat-icon"></ion-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats.total_applications }}</span>
              <span class="stat-label">Applications</span>
            </div>
          </div>
          <div v-if="stats.avg_response_time_hours > 0" class="stat-card">
            <ion-icon :icon="timeOutline" class="stat-icon"></ion-icon>
            <div class="stat-info">
              <span class="stat-value">{{ Math.round(stats.avg_response_time_hours) }}h</span>
              <span class="stat-label">Avg Response</span>
            </div>
          </div>
        </div>

        <!-- About Section -->
        <div v-if="profile.bio" class="section">
          <h2 class="section-title">About</h2>
          <p class="bio-text">{{ profile.bio }}</p>
        </div>

        <!-- Contact Information -->
        <div class="section">
          <h2 class="section-title">Contact Information</h2>
          <div class="contact-list">
            <!-- Email (only visible on own profile) -->
            <div v-if="isOwnProfile && userEmail" class="contact-item">
              <ion-icon :icon="mailOutline" class="contact-icon"></ion-icon>
              <span class="contact-text">{{ userEmail }}</span>
            </div>
            <div v-if="profile.phone_number" class="contact-item">
              <ion-icon :icon="callOutline" class="contact-icon"></ion-icon>
              <a :href="`tel:${profile.phone_number}`" class="contact-link">{{ profile.phone_number }}</a>
            </div>
            <div v-if="profile.website_url" class="contact-item">
              <ion-icon :icon="globeOutline" class="contact-icon"></ion-icon>
              <a :href="profile.website_url" target="_blank" class="contact-link">Website</a>
            </div>
            <div v-if="profile.linkedin_url" class="contact-item">
              <ion-icon :icon="logoLinkedin" class="contact-icon"></ion-icon>
              <a :href="profile.linkedin_url" target="_blank" class="contact-link">LinkedIn</a>
            </div>
          </div>
        </div>

        <!-- Properties (for landlords) -->
        <div v-if="profile.role === 'landlord' && properties.length > 0" class="section">
          <h2 class="section-title">Available Properties ({{ properties.length }})</h2>
          <div class="properties-grid">
            <div 
              v-for="property in properties" 
              :key="property.id"
              class="property-card"
              @click="viewProperty(property.id)"
            >
              <img 
                :src="property.image_urls?.[0] || 'https://via.placeholder.com/400x300'" 
                :alt="property.title"
                class="property-image"
              />
              <div class="property-info">
                <h3 class="property-title">{{ property.title }}</h3>
                <p class="property-price">${{ property.price }}/mo</p>
                <p class="property-address">{{ property.address }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Button (if not own profile) -->
        <div v-if="!isOwnProfile" class="action-section">
          <ion-button expand="block" class="message-button" @click="sendMessage">
            <ion-icon slot="start" :icon="chatbubbleOutline"></ion-icon>
            Send Message
          </ion-button>
        </div>
      </div>

      <div v-else class="error-container">
        <p>Profile not found</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonBackButton, IonButton, IonIcon, IonSpinner 
} from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { profileService, type Profile, type LandlordStats } from '@/services/profileService';
import { conversationService } from '@/services/conversationService';
import { toastController } from '@ionic/vue';
import {
  personOutline, checkmarkCircle, star, createOutline, callOutline,
  globeOutline, logoLinkedin, homeOutline, documentTextOutline,
  timeOutline, chatbubbleOutline, businessOutline, personCircleOutline,
  briefcaseOutline, mailOutline
} from 'ionicons/icons';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const profile = ref<Profile | null>(null);
const stats = ref<LandlordStats | null>(null);
const properties = ref<any[]>([]);
const loading = ref(true);

const isOwnProfile = computed(() => {
  return authStore.user?.id === profile.value?.id;
});

const userEmail = computed(() => {
  return authStore.user?.email;
});

const formatLandlordType = (type: string) => {
  const types: Record<string, string> = {
    individual: 'Individual Landlord',
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

const viewProperty = (propertyId: string) => {
  router.push(`/property/${propertyId}/public`);
};

const sendMessage = async () => {
  if (!profile.value || !authStore.user) return;
  
  try {
    // Get or create conversation between current user and profile user
    const conversationId = await conversationService.getOrCreateConversation(
      authStore.user.id,
      profile.value.id
    );
    
    // Navigate to the conversation
    router.push(`/messages/${conversationId}`);
  } catch (error) {
    console.error('Error creating conversation:', error);
    const toast = await toastController.create({
      message: 'Failed to start conversation. Please try again.',
      duration: 2000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};

onMounted(async () => {
  const profileId = route.params.id as string;
  
  try {
    loading.value = true;
    
    // Fetch profile
    profile.value = await profileService.getProfile(profileId);
    
    // If landlord, fetch stats and properties
    if (profile.value?.role === 'landlord') {
      stats.value = await profileService.getLandlordStats(profileId);
      properties.value = await profileService.getPropertiesByLandlord(profileId);
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.loading-container,
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6B7280;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  position: relative;
  margin-bottom: 2rem;
}

.header-background {
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-content {
  padding: 0 1.5rem;
  margin-top: -60px;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.avatar-wrapper {
  position: relative;
}

.avatar,
.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
}

.avatar-placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 60px;
  color: white;
}

.verified-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.verified-icon {
  font-size: 36px;
  color: #3B82F6;
}

.profile-title {
  text-align: center;
}

.profile-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.company-name,
.occupation {
  font-size: 1rem;
  color: #6B7280;
  margin: 0 0 1rem 0;
}

.profile-badges {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.rating-badge {
  background: #FEF3C7;
  color: #92400E;
}

.type-badge {
  background: #EDE9FE;
  color: #5B21B6;
}

.badge-icon {
  font-size: 18px;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 0 1.5rem 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  font-size: 32px;
  color: #667eea;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
}

.stat-label {
  font-size: 0.875rem;
  color: #6B7280;
}

.section {
  padding: 1.5rem;
  background: white;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 1rem 0;
}

.bio-text {
  font-size: 1rem;
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.contact-icon {
  font-size: 24px;
  color: #667eea;
}

.contact-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.contact-link:hover {
  text-decoration: underline;
}

.contact-text {
  color: #374151;
  font-weight: 500;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.property-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.property-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.property-info {
  padding: 1rem;
}

.property-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.5rem 0;
}

.property-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #667eea;
  margin: 0 0 0.5rem 0;
}

.property-address {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.action-section {
  padding: 1.5rem;
}

.message-button {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --border-radius: 12px;
  font-weight: 600;
}
</style>
