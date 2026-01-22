<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Find Your Home</ion-title>
        <ion-buttons slot="end">
           <ion-button router-link="/messages">
             <ion-icon slot="icon-only" :icon="chatbubbleOutline"></ion-icon>
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

      <div v-if="loading" class="flex items-center justify-center h-full">
        <ion-spinner></ion-spinner>
      </div>
      
      <div v-else-if="properties.length === 0" class="flex flex-col items-center justify-center h-full text-center">
        <h2 class="text-xl font-bold text-gray-700">No properties found.</h2>
        <p class="text-gray-500">Check back later for new listings!</p>
        <ion-button class="mt-4" @click="fetchProperties">Refresh</ion-button>
      </div>

      <swiper
        v-else
        :modules="modules"
        :slides-per-view="1"
        :space-between="20"
        class="h-full pb-10"
      >
        <swiper-slide v-for="prop in properties" :key="prop.id">
          <PropertyCard 
            :property="prop" 
            @inquire="handleInquire"
            @apply="handleApply"
            @dismiss="handleDismiss"
          />
        </swiper-slide>
      </swiper>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonButton, IonButtons, IonIcon } from '@ionic/vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import { chatbubbleOutline } from 'ionicons/icons';
import 'swiper/css';
import 'swiper/css/pagination';

import PropertyCard from '@/components/tenant/PropertyCard.vue';
import WelcomeBanner from '@/components/shared/WelcomeBanner.vue';
import { supabase } from '@/services/supabaseClient';
import { useRouter } from 'vue-router';

const modules = [Pagination];
const properties = ref<any[]>([]);
const loading = ref(true);
const router = useRouter();
const userProfile = ref<any>(null);
const myApplications = ref<any[]>([]);

const dashboardStats = computed(() => [
  { value: properties.value.length, label: 'Available' },
  { value: myApplications.value.length, label: 'My Applications' }
]);

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

const fetchProperties = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching properties', error);
  } else {
    properties.value = data || [];
  }
  loading.value = false;
};

const handleInquire = async (property: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  if (user.id === property.landlord_id) {
    alert("You cannot inquire about your own property.");
    return;
  }

  // Auto-send interest message
  const { error } = await supabase
    .from('messages')
    .insert([
      {
        sender_id: user.id,
        receiver_id: property.landlord_id,
        content: `Hi, I am interested in your property: ${property.title}`
      }
    ]);
    
  if (!error) {
     router.push(`/messages/${property.landlord_id}`);
  } else {
     console.error('Inquiry failed', error);
  }
};

const handleApply = (property: any) => {
  router.push(`/property/${property.id}/apply`);
};

const handleDismiss = () => {
  // Logic to slide to next or remove card
  // For basic swiper, user manually swipes. This button could programmatically slide next.
  console.log('Dismissed');
};

onMounted(() => {
  fetchUserProfile();
  fetchProperties();
  fetchMyApplications();
});
</script>

<style scoped>
ion-content {
  --background: #f4f5f8;
}
</style>
