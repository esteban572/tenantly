<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button router-link="/tenant/dashboard">
            <BrandLogo />
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
           <ion-button router-link="/tenant/dashboard">
             <ion-icon slot="icon-only" :icon="homeOutline"></ion-icon>
           </ion-button>
           <ion-button :router-link="`/profile/${authStore.user?.id}`">
             <ion-icon slot="icon-only" :icon="personCircleOutline"></ion-icon>
           </ion-button>
           <ion-button router-link="/messages" class="relative">
             <ion-icon slot="icon-only" :icon="chatbubbleOutline"></ion-icon>
             <ion-badge v-if="unreadCount > 0" color="danger" class="absolute top-1 right-1 text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
               {{ unreadCount > 99 ? '99+' : unreadCount }}
             </ion-badge>
           </ion-button>
           <ion-button @click="logout">
             <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
           </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <WelcomeBanner 
        v-if="userProfile"
        :user-name="userProfile.full_name || 'Tenant'"
        subtitle="Discover your perfect home today"
        :stats="dashboardStats"
      />

      <!-- Search Bar -->
      <div class="my-4">
        <ion-searchbar 
            v-model="searchQuery" 
            placeholder="Search properties or landlords..."
            @ionChange="handleSearch"
            class="custom-searchbar"
        ></ion-searchbar>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-4 gap-3 my-4">
        <div class="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center active:bg-gray-50 text-center cursor-pointer" @click="router.push('/explore')">
          <ion-icon :icon="searchOutline" class="text-2xl text-purple-500 mb-1"></ion-icon>
          <span class="text-xs font-semibold text-gray-700 leading-tight">Explore<br>Properties</span>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center active:bg-gray-50 text-center cursor-pointer" @click="router.push('/tenant/applications')">
          <ion-icon :icon="documentTextOutline" class="text-2xl text-blue-500 mb-1"></ion-icon>
          <span class="text-xs font-semibold text-gray-700 leading-tight">My<br>Applications</span>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center active:bg-gray-50 text-center cursor-pointer" @click="router.push('/tenant/maintenance')">
          <ion-icon :icon="constructOutline" class="text-2xl text-orange-500 mb-1"></ion-icon>
          <span class="text-xs font-semibold text-gray-700 leading-tight">Maintenance<br>Requests</span>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center active:bg-gray-50 text-center cursor-pointer">
           <ion-icon :icon="cardOutline" class="text-2xl text-green-500 mb-1"></ion-icon>
           <span class="text-xs font-semibold text-gray-700 leading-tight">Pay<br>Rent</span>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center h-full">
        <ion-spinner></ion-spinner>
      </div>
      
      <!-- Discovery CTA -->
      <div class="mt-8 mb-20">
        <div class="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden" @click="router.push('/explore')">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-6 -mb-6"></div>
          
          <div class="relative z-10">
            <ion-icon :icon="searchOutline" class="text-4xl mb-2"></ion-icon>
            <h2 class="text-2xl font-bold mb-2">Find Your Perfect Home</h2>
            <p class="text-white/90 mb-6">Swipe through thousands of properties tailored to your preferences.</p>
            
            <ion-button color="light" expand="block" shape="round" class="font-bold">
              Start Swiping
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonButton, IonButtons, IonIcon, IonSearchbar, IonBadge } from '@ionic/vue';
import { chatbubbleOutline, constructOutline, cardOutline, listOutline, addCircleOutline, peopleOutline, searchOutline, documentTextOutline, homeOutline, logOutOutline, personCircleOutline } from 'ionicons/icons';
import { conversationService } from '@/services/conversationService';

import WelcomeBanner from '@/components/shared/WelcomeBanner.vue';
import BrandLogo from '@/components/shared/BrandLogo.vue';
import { supabase } from '@/services/supabaseClient';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const properties = ref<any[]>([]);
const loading = ref(true);
const router = useRouter();
const authStore = useAuthStore();
const userProfile = ref<any>(null);
const myApplications = ref<any[]>([]);
const searchQuery = ref('');
const unreadCount = ref(0);

const dashboardStats = computed(() => [
  { value: properties.value.length, label: 'Available' },
  { value: myApplications.value.length, label: 'My Applications' }
]);

const fetchProperties = async () => {
  loading.value = true;
  let query = supabase
    .from('properties')
    .select('*, profiles!inner(full_name)') // Join profiles to search landlord name if needed
    .order('created_at', { ascending: false });

  if (searchQuery.value) {
    // Filter by title, address, or landlord name (if joined)
    // Note: Supabase 'or' syntax is a bit specific
    query = query.or(`title.ilike.%${searchQuery.value}%,address.ilike.%${searchQuery.value}%`);
  }

  const { data, error } = await query;
    
  if (error) {
    console.error('Error fetching properties', error);
  } else {
    properties.value = data || [];
  }
  loading.value = false;
};

const handleSearch = () => {
    fetchProperties(); // Re-fetch with query
};

const fetchUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    userProfile.value = data;
  }
};

const fetchMyApplications = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('tenant_id', user.id);
    myApplications.value = data || [];
  }
};

const loadUnreadCount = async () => {
  if (authStore.user) {
    try {
      unreadCount.value = await conversationService.getUnreadCount(authStore.user.id);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }
};

const logout = async () => {
  const authStore = useAuthStore();
  await authStore.signOut();
  router.replace('/');
};

onMounted(async () => {
  fetchUserProfile();
  fetchProperties();
  fetchMyApplications();
  await loadUnreadCount();
  
  // Refresh unread count every 30 seconds
  setInterval(loadUnreadCount, 30000);
});
</script>

<style scoped>
ion-content {
  --background: #f4f5f8;
}

.card-deck-container {
  height: 65vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.property-deck {
  width: 100%;
  max-width: 350px;
  height: 100%;
  max-height: 500px;
  margin: 0 auto;
}

.property-slide {
  border-radius: 18px;
  height: auto !important;
  max-height: 100%;
}

/* Remove Swiper card shadow overlay */
.property-deck :deep(.swiper-slide-shadow),
.property-deck :deep(.swiper-slide-shadow-left),
.property-deck :deep(.swiper-slide-shadow-right),
.property-deck :deep(.swiper-slide-shadow-cards-left),
.property-deck :deep(.swiper-slide-shadow-cards-right) {
  display: none !important;
  background: none !important;
}

.action-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  font-size: 32px;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:active {
  transform: scale(0.9);
}

.action-btn.pass {
  background: white;
  color: #ef4444;
}

.action-btn.like {
  background: white;
  color: #10b981; /* Green heart */
}

.custom-searchbar {
  --background: white;
  --border-radius: 12px;
  --box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 0;
}
</style>
