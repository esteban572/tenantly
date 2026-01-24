<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="bg-slate-900">
        <ion-buttons slot="start">
          <ion-back-button default-href="/landlord/properties" color="light"></ion-back-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button color="light" @click="analyzeProperty">
            <ion-icon :icon="analyticsOutline" slot="start"></ion-icon>
            Analyze
          </ion-button>
          <ion-button color="light" @click="shareProperty">
            <ion-icon :icon="shareOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="bg-slate-900">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <ion-spinner color="light"></ion-spinner>
      </div>

      <div v-else-if="property" class="text-white">
        <!-- Header with Address -->
        <div class="px-6 py-4 border-b border-slate-700">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ion-icon :icon="locationOutline" class="text-xl"></ion-icon>
              </div>
              <div>
                <h1 class="text-xl font-bold">{{ property.address }}</h1>
                <p class="text-slate-400">{{ property.city }}, {{ property.state }} {{ property.zip_code }}</p>
              </div>
            </div>
            <div v-if="property.available_date" class="bg-slate-800 rounded-lg px-3 py-2 text-right">
              <p class="text-xs text-slate-400">Available</p>
              <p class="font-semibold">{{ formatDate(property.available_date) }}</p>
            </div>
          </div>

          <!-- Key Stats Bar -->
          <div class="flex items-center gap-8 mt-6">
            <div class="flex items-center gap-2">
              <ion-icon :icon="bedOutline" class="text-slate-400"></ion-icon>
              <div>
                <p class="text-xs text-slate-400">Beds</p>
                <p class="font-bold">{{ property.bedrooms || '-' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <ion-icon :icon="waterOutline" class="text-slate-400"></ion-icon>
              <div>
                <p class="text-xs text-slate-400">Baths</p>
                <p class="font-bold">{{ property.bathrooms || '-' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <ion-icon :icon="expandOutline" class="text-slate-400"></ion-icon>
              <div>
                <p class="text-xs text-slate-400">Living Area</p>
                <p class="font-bold">{{ property.sqft?.toLocaleString() || '-' }} <span class="text-xs text-slate-400">sqft</span></p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <ion-icon :icon="calendarOutline" class="text-slate-400"></ion-icon>
              <div>
                <p class="text-xs text-slate-400">Year Built</p>
                <p class="font-bold">{{ property.year_built || '-' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Image Gallery + Map -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <!-- Main Image Carousel -->
          <div class="relative rounded-xl overflow-hidden h-72">
            <swiper
              :modules="modules"
              :pagination="{ clickable: true }"
              :navigation="true"
              class="h-full"
            >
              <swiper-slide v-for="(image, index) in property.image_urls" :key="index">
                <img :src="image" :alt="`Property image ${Number(index) + 1}`" class="w-full h-full object-cover" />
              </swiper-slide>
              <swiper-slide v-if="!property.image_urls?.length">
                <div class="w-full h-full bg-slate-800 flex items-center justify-center">
                  <ion-icon :icon="imageOutline" class="text-6xl text-slate-600"></ion-icon>
                </div>
              </swiper-slide>
            </swiper>
            <div class="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full text-sm z-10">
              {{ property.image_urls?.length || 0 }} Photos
            </div>
          </div>

          <!-- Map Placeholder -->
          <div class="rounded-xl overflow-hidden h-72 bg-slate-800 flex items-center justify-center relative">
            <div class="text-center">
              <ion-icon :icon="mapOutline" class="text-5xl text-slate-600 mb-2"></ion-icon>
              <p class="text-slate-400">Map View</p>
              <p class="text-xs text-slate-500 mt-1">{{ property.address }}</p>
            </div>
            <!-- Map controls placeholder -->
            <div class="absolute top-4 right-4 flex flex-col gap-1">
              <button class="w-8 h-8 bg-slate-700 rounded flex items-center justify-center text-lg">+</button>
              <button class="w-8 h-8 bg-slate-700 rounded flex items-center justify-center text-lg">-</button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-3 gap-3 px-6 mb-6">
          <button class="bg-slate-800 hover:bg-slate-700 rounded-xl py-4 text-center transition-all flex flex-col items-center gap-2">
            <ion-icon :icon="carOutline" class="text-xl"></ion-icon>
            <span class="text-sm">Virtual Drive</span>
          </button>
          <button class="bg-slate-800 hover:bg-slate-700 rounded-xl py-4 text-center transition-all flex flex-col items-center gap-2">
            <ion-icon :icon="imageOutline" class="text-xl"></ion-icon>
            <span class="text-sm">Street View</span>
          </button>
          <button class="bg-slate-800 hover:bg-slate-700 rounded-xl py-4 text-center transition-all flex flex-col items-center gap-2" @click="viewOnZillow">
            <ion-icon :icon="openOutline" class="text-xl"></ion-icon>
            <span class="text-sm">View on Zillow</span>
          </button>
        </div>

        <!-- Key Details Section -->
        <div class="bg-slate-800 mx-6 rounded-xl p-6 mb-4">
          <div class="flex items-center justify-between cursor-pointer" @click="toggleSection('keyDetails')">
            <div>
              <h3 class="font-bold text-lg">Key Details</h3>
              <p class="text-sm text-slate-400">Essential property information and indicators</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-slate-400">Rental Price:</p>
              <p class="text-2xl font-bold text-green-400">${{ property.price?.toLocaleString() }}<span class="text-sm text-slate-400">/mo</span></p>
            </div>
          </div>
          
          <div v-if="expandedSections.keyDetails" class="mt-4 pt-4 border-t border-slate-700">
            <!-- Tags -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-if="property.pet_policy === 'allowed'" class="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">Pet Friendly</span>
              <span v-if="property.parking === 'garage'" class="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">Garage Parking</span>
              <span v-if="property.laundry === 'in_unit'" class="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">In-Unit Laundry</span>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-slate-400">Property Type</p>
                <p class="font-semibold capitalize">{{ property.property_type || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-400">Security Deposit</p>
                <p class="font-semibold">${{ property.deposit_amount?.toLocaleString() || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-400">Lease Length</p>
                <p class="font-semibold">{{ property.lease_length || '-' }} months</p>
              </div>
              <div>
                <p class="text-sm text-slate-400">Pet Policy</p>
                <p class="font-semibold capitalize">{{ formatPetPolicy(property.pet_policy) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Building Details Section -->
        <div class="bg-slate-800 mx-6 rounded-xl p-6 mb-4">
          <div class="flex items-center justify-between cursor-pointer" @click="toggleSection('buildingDetails')">
            <div>
              <h3 class="font-bold text-lg">Building Details</h3>
              <p class="text-sm text-slate-400">Property specifications and features</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-slate-400">Size:</p>
              <p class="text-xl font-bold">{{ property.sqft?.toLocaleString() || '-' }} <span class="text-sm text-slate-400">sqft</span></p>
            </div>
          </div>
          
          <div v-if="expandedSections.buildingDetails" class="mt-4 pt-4 border-t border-slate-700">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-slate-400">Bedrooms</p>
                <p class="font-semibold">{{ property.bedrooms || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-400">Bathrooms</p>
                <p class="font-semibold">{{ property.bathrooms || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-400">Lot Size</p>
                <p class="font-semibold">{{ property.lot_size?.toLocaleString() || '-' }} sqft</p>
              </div>
              <div>
                <p class="text-sm text-slate-400">Year Built</p>
                <p class="font-semibold">{{ property.year_built || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-400">Parking</p>
                <p class="font-semibold capitalize">{{ property.parking || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-400">Laundry</p>
                <p class="font-semibold capitalize">{{ formatLaundry(property.laundry) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Description Section -->
        <div class="bg-slate-800 mx-6 rounded-xl p-6 mb-4">
          <div class="flex items-center justify-between cursor-pointer" @click="toggleSection('description')">
            <h3 class="font-bold text-lg">Description</h3>
            <ion-icon :icon="expandedSections.description ? chevronUp : chevronDown" class="text-xl text-slate-400"></ion-icon>
          </div>
          <div v-if="expandedSections.description" class="mt-4 pt-4 border-t border-slate-700">
            <p class="text-slate-300 leading-relaxed">{{ property.description || 'No description provided.' }}</p>
          </div>
        </div>

        <!-- Amenities Section -->
        <div v-if="property.amenities?.length" class="bg-slate-800 mx-6 rounded-xl p-6 mb-4">
          <div class="flex items-center justify-between cursor-pointer" @click="toggleSection('amenities')">
            <h3 class="font-bold text-lg">Amenities</h3>
            <ion-icon :icon="expandedSections.amenities ? chevronUp : chevronDown" class="text-xl text-slate-400"></ion-icon>
          </div>
          <div v-if="expandedSections.amenities" class="mt-4 pt-4 border-t border-slate-700">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div v-for="amenity in property.amenities" :key="amenity" class="flex items-center gap-2">
                <ion-icon :icon="checkmarkCircle" class="text-green-400"></ion-icon>
                <span class="text-slate-300">{{ amenity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Nearby Schools Section (Placeholder) -->
        <div class="bg-slate-800 mx-6 rounded-xl p-6 mb-4">
          <div class="flex items-center justify-between cursor-pointer" @click="toggleSection('schools')">
            <div>
              <h3 class="font-bold text-lg">Nearby Schools</h3>
              <p class="text-sm text-slate-400">Educational institutions in the vicinity</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-slate-400">Average Rating:</p>
              <p class="text-xl font-bold">-- <span class="text-sm text-slate-400">/10</span></p>
            </div>
          </div>
          <div v-if="expandedSections.schools" class="mt-4 pt-4 border-t border-slate-700">
            <div class="flex gap-2 mb-4">
              <button class="px-4 py-1 bg-blue-600 rounded-full text-sm">All Schools</button>
              <button class="px-4 py-1 bg-slate-700 rounded-full text-sm">Elementary</button>
              <button class="px-4 py-1 bg-slate-700 rounded-full text-sm">Middle</button>
              <button class="px-4 py-1 bg-slate-700 rounded-full text-sm">High</button>
            </div>
            <p class="text-slate-400 text-center py-8">School data will be loaded from API</p>
          </div>
        </div>

        <!-- Climate Risk Section (Placeholder) -->
        <div class="bg-slate-800 mx-6 rounded-xl p-6 mb-8">
          <div class="flex items-center justify-between cursor-pointer" @click="toggleSection('climate')">
            <div>
              <h3 class="font-bold text-lg">Climate Risk Assessment</h3>
              <p class="text-sm text-slate-400">Environmental hazards and insurance recommendations</p>
            </div>
            <ion-icon :icon="expandedSections.climate ? chevronUp : chevronDown" class="text-xl text-slate-400"></ion-icon>
          </div>
          <div v-if="expandedSections.climate" class="mt-4 pt-4 border-t border-slate-700">
            <p class="text-slate-400 text-center py-8">Climate risk data will be loaded from API</p>
          </div>
        </div>

        <!-- Bottom Action Bar -->
        <div class="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4">
          <div class="flex gap-3 max-w-4xl mx-auto">
            <ion-button fill="outline" color="light" class="flex-1" @click="editProperty">
              <ion-icon :icon="createOutline" slot="start"></ion-icon>
              Edit
            </ion-button>
            <ion-button class="flex-1" @click="viewApplications">
              <ion-icon :icon="documentsOutline" slot="start"></ion-icon>
              View Applications ({{ applicationCount }})
            </ion-button>
          </div>
        </div>

        <!-- Spacer for bottom bar -->
        <div class="h-24"></div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonSpinner
} from '@ionic/vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import {
  analyticsOutline, shareOutline, locationOutline, bedOutline, waterOutline,
  expandOutline, calendarOutline, imageOutline, mapOutline, carOutline,
  openOutline, checkmarkCircle, chevronUp, chevronDown, createOutline, documentsOutline
} from 'ionicons/icons';
import { supabase } from '@/services/supabaseClient';

const route = useRoute();
const router = useRouter();
const modules = [Pagination, Navigation];

const property = ref<any>(null);
const loading = ref(true);
const applicationCount = ref(0);

const expandedSections = reactive({
  keyDetails: true,
  buildingDetails: true,
  description: false,
  amenities: true,
  schools: false,
  climate: false
});

const toggleSection = (section: keyof typeof expandedSections) => {
  expandedSections[section] = !expandedSections[section];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatPetPolicy = (policy: string | null) => {
  const policies: Record<string, string> = {
    allowed: 'Pets Allowed',
    cats_only: 'Cats Only',
    dogs_only: 'Dogs Only',
    no_pets: 'No Pets',
    negotiable: 'Negotiable'
  };
  return policies[policy || ''] || '-';
};

const formatLaundry = (laundry: string | null) => {
  const options: Record<string, string> = {
    in_unit: 'In Unit',
    in_building: 'In Building',
    none: 'None'
  };
  return options[laundry || ''] || '-';
};

const shareProperty = async () => {
  const shareUrl = `${window.location.origin}/property/${property.value.id}/public`;
  if (navigator.share) {
    await navigator.share({
      title: property.value.title,
      text: `Check out this property: ${property.value.title}`,
      url: shareUrl
    });
  } else {
    await navigator.clipboard.writeText(shareUrl);
  }
};

const analyzeProperty = () => {
  // Placeholder for property analysis feature
  console.log('Analyze property');
};

const viewOnZillow = () => {
  const address = encodeURIComponent(`${property.value.address} ${property.value.city} ${property.value.state}`);
  window.open(`https://www.zillow.com/homes/${address}`, '_blank');
};

const editProperty = () => {
  router.push(`/landlord/properties/${property.value.id}/edit`);
};

const viewApplications = () => {
  router.push('/landlord/applications');
};

const fetchProperty = async () => {
  loading.value = true;
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
  }

  // Get application count
  const { count } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('property_id', propertyId);
  
  applicationCount.value = count || 0;
  
  loading.value = false;
};

onMounted(() => {
  fetchProperty();
});
</script>

<style scoped>
ion-toolbar {
  --background: #0f172a;
  --color: white;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: white;
  background: rgba(0, 0, 0, 0.5);
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 16px;
}

:deep(.swiper-pagination-bullet) {
  background: white;
  opacity: 0.5;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
}
</style>
