<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/explore"></ion-back-button>
        </ion-buttons>
        <ion-title>Property Details</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="shareProperty">
            <ion-icon slot="icon-only" :icon="shareOutline"></ion-icon>
          </ion-button>
          <ion-button @click="toggleFavorite">
            <ion-icon slot="icon-only" :icon="isFavorite ? heart : heartOutline" :class="isFavorite ? 'text-red-500' : ''"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="property">
        <!-- Image Gallery -->
        <div class="relative h-72 bg-gray-200">
          <swiper
            :modules="modules"
            :pagination="{ clickable: true }"
            :navigation="true"
            class="h-full"
          >
            <swiper-slide v-for="(image, index) in property.image_urls" :key="index">
              <img :src="image" :alt="`${property.title} - Image ${Number(index) + 1}`" class="w-full h-full object-cover" />
            </swiper-slide>
            <swiper-slide v-if="!property.image_urls?.length">
              <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                <ion-icon :icon="imageOutline" class="text-6xl text-gray-400"></ion-icon>
              </div>
            </swiper-slide>
          </swiper>
          
          <!-- Image Counter -->
          <div class="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-10">
            {{ property.image_urls?.length || 0 }} photos
          </div>
        </div>

        <!-- Price & Key Info -->
        <div class="bg-white p-6 border-b">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-3xl font-bold text-gray-800">${{ property.price?.toLocaleString() }}<span class="text-lg font-normal text-gray-500">/mo</span></p>
              <h1 class="text-xl font-semibold text-gray-800 mt-1">{{ property.title }}</h1>
              <p class="text-gray-500 flex items-center mt-1">
                <ion-icon :icon="locationOutline" class="mr-1"></ion-icon>
                {{ property.address }}
                <span v-if="property.city">, {{ property.city }}</span>
                <span v-if="property.state">, {{ property.state }}</span>
                <span v-if="property.zip_code"> {{ property.zip_code }}</span>
              </p>
            </div>
            <span v-if="property.featured" class="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
              Featured
            </span>
          </div>

          <!-- Property Stats -->
          <div class="flex items-center gap-6 mt-4 py-4 border-t border-b">
            <div v-if="property.bedrooms !== null" class="text-center">
              <p class="text-2xl font-bold text-gray-800">{{ property.bedrooms }}</p>
              <p class="text-sm text-gray-500">{{ property.bedrooms === 0 ? 'Studio' : 'Beds' }}</p>
            </div>
            <div v-if="property.bathrooms" class="text-center">
              <p class="text-2xl font-bold text-gray-800">{{ property.bathrooms }}</p>
              <p class="text-sm text-gray-500">Baths</p>
            </div>
            <div v-if="property.sqft" class="text-center">
              <p class="text-2xl font-bold text-gray-800">{{ property.sqft?.toLocaleString() }}</p>
              <p class="text-sm text-gray-500">Sq Ft</p>
            </div>
            <div v-if="property.property_type" class="text-center">
              <p class="text-2xl font-bold text-gray-800 capitalize">{{ property.property_type }}</p>
              <p class="text-sm text-gray-500">Type</p>
            </div>
          </div>
        </div>

        <!-- Quick Info Cards -->
        <div class="grid grid-cols-2 gap-3 p-4 bg-gray-50">
          <div v-if="property.available_date" class="bg-white p-4 rounded-xl shadow-sm">
            <div class="flex items-center gap-2 text-green-600 mb-1">
              <ion-icon :icon="calendarOutline"></ion-icon>
              <span class="text-sm font-medium">Available</span>
            </div>
            <p class="font-semibold text-gray-800">{{ formatDate(property.available_date) }}</p>
          </div>
          <div v-if="property.lease_length" class="bg-white p-4 rounded-xl shadow-sm">
            <div class="flex items-center gap-2 text-blue-600 mb-1">
              <ion-icon :icon="documentTextOutline"></ion-icon>
              <span class="text-sm font-medium">Lease</span>
            </div>
            <p class="font-semibold text-gray-800">{{ property.lease_length }} months</p>
          </div>
          <div v-if="property.deposit_amount" class="bg-white p-4 rounded-xl shadow-sm">
            <div class="flex items-center gap-2 text-purple-600 mb-1">
              <ion-icon :icon="walletOutline"></ion-icon>
              <span class="text-sm font-medium">Deposit</span>
            </div>
            <p class="font-semibold text-gray-800">${{ property.deposit_amount?.toLocaleString() }}</p>
          </div>
          <div v-if="property.views_count" class="bg-white p-4 rounded-xl shadow-sm">
            <div class="flex items-center gap-2 text-orange-600 mb-1">
              <ion-icon :icon="eyeOutline"></ion-icon>
              <span class="text-sm font-medium">Views</span>
            </div>
            <p class="font-semibold text-gray-800">{{ property.views_count }}</p>
          </div>
        </div>

        <!-- Description -->
        <div class="bg-white p-6 border-b">
          <h2 class="text-lg font-bold text-gray-800 mb-3">About this property</h2>
          <p class="text-gray-600 leading-relaxed">{{ property.description }}</p>
        </div>

        <!-- Policies -->
        <div class="bg-white p-6 border-b">
          <h2 class="text-lg font-bold text-gray-800 mb-4">Policies & Features</h2>
          <div class="grid grid-cols-2 gap-4">
            <div v-if="property.pet_policy" class="flex items-center gap-3">
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center', getPetPolicyClass(property.pet_policy)]">
                <ion-icon :icon="pawOutline"></ion-icon>
              </div>
              <div>
                <p class="font-medium text-gray-800">Pets</p>
                <p class="text-sm text-gray-500 capitalize">{{ formatPetPolicy(property.pet_policy) }}</p>
              </div>
            </div>
            <div v-if="property.parking" class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <ion-icon :icon="carOutline"></ion-icon>
              </div>
              <div>
                <p class="font-medium text-gray-800">Parking</p>
                <p class="text-sm text-gray-500 capitalize">{{ property.parking }}</p>
              </div>
            </div>
            <div v-if="property.laundry" class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <ion-icon :icon="shirtOutline"></ion-icon>
              </div>
              <div>
                <p class="font-medium text-gray-800">Laundry</p>
                <p class="text-sm text-gray-500 capitalize">{{ formatLaundry(property.laundry) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Amenities -->
        <div v-if="property.amenities?.length" class="bg-white p-6 border-b">
          <h2 class="text-lg font-bold text-gray-800 mb-4">Amenities</h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="amenity in property.amenities"
              :key="amenity"
              class="px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
            >
              <ion-icon :icon="checkmarkCircle" class="text-green-500"></ion-icon>
              {{ amenity }}
            </span>
          </div>
        </div>

        <!-- Landlord Info -->
        <div v-if="property.profiles" class="bg-white p-6 border-b">
          <h2 class="text-lg font-bold text-gray-800 mb-4">Listed by</h2>
          <div class="flex items-center gap-4 cursor-pointer" @click="viewLandlordProfile">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {{ getInitials(property.profiles.full_name || property.profiles.company_name) }}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <p class="font-semibold text-gray-800">
                  {{ property.profiles.company_name || property.profiles.full_name }}
                </p>
                <ion-icon v-if="property.profiles.verified" :icon="checkmarkCircle" class="text-blue-500"></ion-icon>
              </div>
              <div v-if="property.profiles.rating" class="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <ion-icon :icon="star" class="text-yellow-500"></ion-icon>
                {{ property.profiles.rating.toFixed(1) }} rating
              </div>
            </div>
            <ion-icon :icon="chevronForward" class="text-gray-400 text-xl"></ion-icon>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="p-4 bg-white border-t shadow-lg sticky bottom-0">
          <div class="flex gap-3">
            <ion-button fill="outline" class="flex-1" @click="contactLandlord">
              <ion-icon :icon="chatbubbleOutline" slot="start"></ion-icon>
              Message
            </ion-button>
            <ion-button class="flex-1" @click="applyForProperty">
              <ion-icon :icon="documentTextOutline" slot="start"></ion-icon>
              Apply Now
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonSpinner
} from '@ionic/vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import {
  shareOutline, heart, heartOutline, locationOutline, calendarOutline, documentTextOutline,
  walletOutline, eyeOutline, pawOutline, carOutline, shirtOutline, checkmarkCircle,
  star, chevronForward, chatbubbleOutline, imageOutline
} from 'ionicons/icons';
import { supabase } from '@/services/supabaseClient';

const route = useRoute();
const router = useRouter();
const modules = [Pagination, Navigation];

const property = ref<any>(null);
const loading = ref(true);
const isFavorite = ref(false);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatPetPolicy = (policy: string) => {
  const policies: Record<string, string> = {
    allowed: 'Pets Allowed',
    cats_only: 'Cats Only',
    dogs_only: 'Dogs Only',
    no_pets: 'No Pets',
    negotiable: 'Negotiable'
  };
  return policies[policy] || policy;
};

const formatLaundry = (laundry: string) => {
  const options: Record<string, string> = {
    in_unit: 'In Unit',
    in_building: 'In Building',
    none: 'None'
  };
  return options[laundry] || laundry;
};

const getPetPolicyClass = (policy: string) => {
  if (policy === 'allowed' || policy === 'negotiable') {
    return 'bg-green-100 text-green-600';
  }
  if (policy === 'no_pets') {
    return 'bg-red-100 text-red-600';
  }
  return 'bg-yellow-100 text-yellow-600';
};

const getInitials = (name: string) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
};

const shareProperty = async () => {
  if (navigator.share && property.value) {
    await navigator.share({
      title: property.value.title,
      text: `Check out this property: ${property.value.title}`,
      url: window.location.href
    });
  }
};

const viewLandlordProfile = () => {
  if (property.value?.landlord_id) {
    router.push(`/profile/${property.value.landlord_id}`);
  }
};

const contactLandlord = () => {
  if (property.value?.landlord_id) {
    router.push(`/messages/${property.value.landlord_id}`);
  }
};

const applyForProperty = () => {
  router.push(`/property/${property.value.id}/apply`);
};

const fetchProperty = async () => {
  loading.value = true;
  const propertyId = route.params.id as string;

  const { data, error } = await supabase
    .from('properties')
    .select('*, profiles!inner(full_name, company_name, verified, rating, avatar_url)')
    .eq('id', propertyId)
    .single();

  if (error) {
    console.error('Error fetching property:', error);
  } else {
    property.value = data;
    
    // Increment views count
    await supabase
      .from('properties')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', propertyId);
  }
  
  loading.value = false;
};

onMounted(() => {
  fetchProperty();
});
</script>

<style scoped>
ion-content {
  --background: #f4f5f8;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: white;
  background: rgba(0, 0, 0, 0.3);
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 16px;
}

:deep(.swiper-pagination-bullet-active) {
  background: white;
}
</style>
