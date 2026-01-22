<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Property Details</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="loading" class="flex justify-center items-center h-full">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="property" class="max-w-4xl mx-auto">
        <!-- Image Gallery -->
        <div class="mb-6">
          <swiper
            :modules="modules"
            :pagination="{ clickable: true }"
            :navigation="true"
            class="property-swiper"
          >
            <swiper-slide v-for="(image, index) in property.image_urls" :key="index">
              <img 
                :src="image" 
                :alt="`Property image ${index + 1}`"
                class="w-full h-96 object-cover rounded-lg"
              />
            </swiper-slide>
          </swiper>
        </div>

        <!-- Property Info -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ property.title }}</h1>
              <p class="text-gray-600 flex items-center">
                <ion-icon :icon="locationOutline" class="mr-2"></ion-icon>
                {{ property.address }}
              </p>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-green-600">${{ property.price }}</div>
              <div class="text-sm text-gray-500">per month</div>
            </div>
          </div>

          <div class="border-t pt-4 mt-4">
            <h3 class="font-semibold text-lg mb-2">Description</h3>
            <p class="text-gray-700 whitespace-pre-line">{{ property.description }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 mb-6">
          <ion-button expand="block" class="flex-1" @click="handleApply">
            <ion-icon slot="start" :icon="documentTextOutline"></ion-icon>
            Apply Now
          </ion-button>
          <ion-button expand="block" color="secondary" class="flex-1" @click="handleContact">
            <ion-icon slot="start" :icon="chatbubbleOutline"></ion-icon>
            Contact Landlord
          </ion-button>
        </div>

        <!-- Landlord Info -->
        <div v-if="landlord" class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-semibold mb-2">Listed by</h3>
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
              {{ landlord.full_name?.charAt(0).toUpperCase() || 'L' }}
            </div>
            <div>
              <p class="font-medium">{{ landlord.full_name || 'Landlord' }}</p>
              <p class="text-sm text-gray-500">Property Owner</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center mt-20">
        <h2 class="text-2xl font-bold text-gray-700">Property not found</h2>
        <p class="text-gray-500 mt-2">This property may have been removed or the link is invalid.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonSpinner } from '@ionic/vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Navigation } from 'swiper/modules';
import { locationOutline, documentTextOutline, chatbubbleOutline } from 'ionicons/icons';
import { supabase } from '@/services/supabaseClient';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const route = useRoute();
const router = useRouter();
const modules = [Pagination, Navigation];

const property = ref<any>(null);
const landlord = ref<any>(null);
const loading = ref(true);

const fetchProperty = async () => {
  const propertyId = route.params.id as string;
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();
  
  if (error) {
    console.error('Error fetching property:', error);
  } else {
    property.value = data;
    
    // Fetch landlord info
    if (data.landlord_id) {
      const { data: landlordData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.landlord_id)
        .single();
      landlord.value = landlordData;
    }
  }
  
  loading.value = false;
};

const handleApply = () => {
  router.push(`/property/${property.value.id}/apply`);
};

const handleContact = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Redirect to login
    router.push('/login');
    return;
  }
  
  // Send initial message
  await supabase.from('messages').insert([{
    sender_id: user.id,
    receiver_id: property.value.landlord_id,
    content: `Hi, I'm interested in your property: ${property.value.title}`
  }]);
  
  router.push(`/messages/${property.value.landlord_id}`);
};

onMounted(() => {
  fetchProperty();
});
</script>

<style scoped>
.property-swiper {
  width: 100%;
  height: 400px;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 20px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

:deep(.swiper-pagination-bullet-active) {
  background: #3880ff;
}
</style>
