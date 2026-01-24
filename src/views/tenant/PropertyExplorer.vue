<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tenant/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Explore Properties</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showFilters = true">
            <ion-icon slot="icon-only" :icon="optionsOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      
      <!-- Search Bar -->
      <ion-toolbar>
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search by city, address..."
          @ionChange="handleSearch"
          class="custom-searchbar"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Active Filters Bar -->
      <div v-if="hasActiveFilters" class="bg-white px-4 py-2 flex gap-2 overflow-x-auto border-b">
        <span
          v-for="(filter, key) in activeFilterTags"
          :key="key"
          class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap"
        >
          {{ filter }}
          <ion-icon :icon="closeCircle" class="cursor-pointer" @click="removeFilter(key as string)"></ion-icon>
        </span>
        <button @click="clearFilters" class="text-xs text-gray-500 underline whitespace-nowrap">Clear all</button>
      </div>

      <!-- View Toggle -->
      <div class="px-4 mb-2">
        <ion-segment v-model="viewMode">
          <ion-segment-button value="list">
            <ion-label>
              <ion-icon :icon="gridOutline" class="align-text-bottom mr-1"></ion-icon>
              List
            </ion-label>
          </ion-segment-button>
          <ion-segment-button value="swipe">
            <ion-label>
              <ion-icon :icon="albumsOutline" class="align-text-bottom mr-1"></ion-icon>
              Swipe
            </ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <ion-spinner></ion-spinner>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredProperties.length === 0" class="text-center py-20 px-4">
        <div class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <ion-icon :icon="homeOutline" class="text-4xl text-gray-400"></ion-icon>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">No properties found</h3>
        <p class="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
        <ion-button fill="outline" @click="clearFilters">Clear Filters</ion-button>
      </div>

      <!-- Swipe View -->
      <div v-else-if="viewMode === 'swipe'" class="card-deck-container p-4">
        <swiper
          :effect="'cards'"
          :grabCursor="true"
          :modules="swiperModules"
          class="property-deck"
          @slideChange="onSlideChange"
        >
          <swiper-slide v-for="prop in sortedProperties" :key="prop.id" class="property-slide">
            <PropertyCard 
              :property="prop" 
              @inquire="handleInquire"
              @apply="handleApply"
              @dismiss="passProperty"
            />
          </swiper-slide>
        </swiper>

        <!-- Swipe Actions -->
        <div class="deck-actions flex justify-center gap-6 mt-6">
          <button class="action-btn pass shadow-lg" @click="passProperty">
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
          <button class="action-btn like shadow-lg" @click="likeProperty">
            <ion-icon :icon="heartOutline"></ion-icon>
          </button>
        </div>
      </div>

      <!-- Properties Grid -->
      <div v-else class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="property in sortedProperties"
            :key="property.id"
            class="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
            @click="viewProperty(property)"
          >
            <!-- Property Image -->
            <div class="relative h-48">
              <img
                :src="property.image_urls?.[0] || 'https://via.placeholder.com/400x300'"
                :alt="property.title"
                class="w-full h-full object-cover"
              />
              <div class="absolute top-3 left-3">
                <span v-if="property.featured" class="px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded">
                  Featured
                </span>
              </div>
              <div class="absolute top-3 right-3">
                <button
                  @click.stop="toggleFavorite(property)"
                  class="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
                >
                  <ion-icon
                    :icon="isFavorite(property.id) ? heart : heartOutline"
                    :class="isFavorite(property.id) ? 'text-red-500' : 'text-gray-600'"
                  ></ion-icon>
                </button>
              </div>
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p class="text-white text-2xl font-bold">${{ property.price?.toLocaleString() }}<span class="text-sm font-normal">/mo</span></p>
              </div>
            </div>
            
            <!-- Property Info -->
            <div class="p-4">
              <h3 class="font-semibold text-gray-800 line-clamp-1">{{ property.title }}</h3>
              <p class="text-sm text-gray-500 line-clamp-1 flex items-center mt-1">
                <ion-icon :icon="locationOutline" class="mr-1 text-gray-400"></ion-icon>
                {{ property.address }}
              </p>
              
              <!-- Property Details -->
              <div class="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <span v-if="property.bedrooms" class="flex items-center gap-1">
                  <ion-icon :icon="bedOutline" class="text-gray-400"></ion-icon>
                  {{ property.bedrooms }} bed
                </span>
                <span v-if="property.bathrooms" class="flex items-center gap-1">
                  <ion-icon :icon="waterOutline" class="text-gray-400"></ion-icon>
                  {{ property.bathrooms }} bath
                </span>
                <span v-if="property.sqft" class="flex items-center gap-1">
                  <ion-icon :icon="expandOutline" class="text-gray-400"></ion-icon>
                  {{ property.sqft?.toLocaleString() }} sqft
                </span>
              </div>

              <!-- Property Type & Pet Policy -->
              <div class="flex items-center gap-2 mt-3">
                <span v-if="property.property_type" class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                  {{ property.property_type }}
                </span>
                <span v-if="property.pet_policy === 'allowed'" class="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                  Pets OK
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Filter Modal -->
    <ion-modal :is-open="showFilters" @didDismiss="showFilters = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Filters</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showFilters = false">Done</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <!-- Price Range -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-800 mb-3">Price Range</h4>
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="text-xs text-gray-500">Min</label>
              <ion-input
                v-model.number="filters.minPrice"
                type="number"
                placeholder="$0"
                class="bg-gray-100 rounded-lg"
              ></ion-input>
            </div>
            <div class="flex-1">
              <label class="text-xs text-gray-500">Max</label>
              <ion-input
                v-model.number="filters.maxPrice"
                type="number"
                placeholder="No max"
                class="bg-gray-100 rounded-lg"
              ></ion-input>
            </div>
          </div>
        </div>

        <!-- Bedrooms -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-800 mb-3">Bedrooms</h4>
          <div class="flex gap-2">
            <button
              v-for="n in [0, 1, 2, 3, 4]"
              :key="n"
              @click="filters.bedrooms = n === filters.bedrooms ? null : n"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                filters.bedrooms === n
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ n === 0 ? 'Studio' : n + '+' }}
            </button>
          </div>
        </div>

        <!-- Bathrooms -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-800 mb-3">Bathrooms</h4>
          <div class="flex gap-2">
            <button
              v-for="n in [1, 2, 3]"
              :key="n"
              @click="filters.bathrooms = n === filters.bathrooms ? null : n"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                filters.bathrooms === n
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ n }}+
            </button>
          </div>
        </div>

        <!-- Property Type -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-800 mb-3">Property Type</h4>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="type in propertyTypes"
              :key="type.value"
              @click="togglePropertyType(type.value)"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-all capitalize',
                filters.propertyTypes.includes(type.value)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ type.label }}
            </button>
          </div>
        </div>

        <!-- Pet Policy -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-800 mb-3">Pets</h4>
          <div class="flex gap-2">
            <button
              v-for="policy in petPolicies"
              :key="policy.value"
              @click="filters.petPolicy = policy.value === filters.petPolicy ? null : policy.value"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                filters.petPolicy === policy.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ policy.label }}
            </button>
          </div>
        </div>

        <!-- Clear Filters -->
        <ion-button expand="block" fill="outline" @click="clearFilters" class="mt-6">
          Clear All Filters
        </ion-button>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonSpinner, IonSearchbar, IonModal, IonInput, IonSegment, IonSegmentButton, IonLabel,
  toastController
} from '@ionic/vue';
import {
  optionsOutline, closeCircle, homeOutline, locationOutline, heart, heartOutline,
  bedOutline, waterOutline, expandOutline, gridOutline, albumsOutline, closeOutline
} from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { supabase } from '@/services/supabaseClient';
import PropertyCard from '@/components/tenant/PropertyCard.vue';

const router = useRouter();
const properties = ref<any[]>([]);
const loading = ref(true);
const showFilters = ref(false);
const searchQuery = ref('');
const sortBy = ref('newest');
const favorites = ref<Set<string>>(new Set());
const viewMode = ref<'list' | 'swipe'>('list');
const swiperModules = [EffectCards];

const filters = reactive({
  minPrice: null as number | null,
  maxPrice: null as number | null,
  bedrooms: null as number | null,
  bathrooms: null as number | null,
  propertyTypes: [] as string[],
  petPolicy: null as string | null
});

const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'studio', label: 'Studio' }
];

const petPolicies = [
  { value: 'allowed', label: 'Pets Allowed' },
  { value: 'no_pets', label: 'No Pets' },
  { value: 'cats_only', label: 'Cats Only' },
  { value: 'dogs_only', label: 'Dogs Only' }
];

const filteredProperties = computed(() => {
  let result = properties.value;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p =>
      p.title?.toLowerCase().includes(query) ||
      p.address?.toLowerCase().includes(query) ||
      p.city?.toLowerCase().includes(query)
    );
  }

  // Price filter
  if (filters.minPrice) {
    result = result.filter(p => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice) {
    result = result.filter(p => p.price <= filters.maxPrice!);
  }

  // Bedrooms filter
  if (filters.bedrooms !== null) {
    result = result.filter(p => (p.bedrooms || 0) >= filters.bedrooms!);
  }

  // Bathrooms filter
  if (filters.bathrooms !== null) {
    result = result.filter(p => (p.bathrooms || 0) >= filters.bathrooms!);
  }

  // Property type filter
  if (filters.propertyTypes.length > 0) {
    result = result.filter(p => filters.propertyTypes.includes(p.property_type));
  }

  // Pet policy filter
  if (filters.petPolicy) {
    result = result.filter(p => p.pet_policy === filters.petPolicy);
  }

  return result;
});

const sortedProperties = computed(() => {
  const props = [...filteredProperties.value];
  
  switch (sortBy.value) {
    case 'price_low':
      return props.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price_high':
      return props.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'featured':
      return props.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    case 'newest':
    default:
      return props.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
});

const hasActiveFilters = computed(() => {
  return filters.minPrice || filters.maxPrice || filters.bedrooms !== null ||
    filters.bathrooms !== null || filters.propertyTypes.length > 0 || filters.petPolicy;
});

const activeFilterTags = computed(() => {
  const tags: Record<string, string> = {};
  
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? `$${filters.minPrice}` : '$0';
    const max = filters.maxPrice ? `$${filters.maxPrice}` : 'No max';
    tags.price = `${min} - ${max}`;
  }
  if (filters.bedrooms !== null) {
    tags.bedrooms = `${filters.bedrooms === 0 ? 'Studio' : filters.bedrooms + '+ beds'}`;
  }
  if (filters.bathrooms !== null) {
    tags.bathrooms = `${filters.bathrooms}+ baths`;
  }
  if (filters.propertyTypes.length > 0) {
    tags.propertyTypes = filters.propertyTypes.join(', ');
  }
  if (filters.petPolicy) {
    tags.petPolicy = petPolicies.find(p => p.value === filters.petPolicy)?.label || '';
  }
  
  return tags;
});

const removeFilter = (key: string) => {
  switch (key) {
    case 'price':
      filters.minPrice = null;
      filters.maxPrice = null;
      break;
    case 'bedrooms':
      filters.bedrooms = null;
      break;
    case 'bathrooms':
      filters.bathrooms = null;
      break;
    case 'propertyTypes':
      filters.propertyTypes = [];
      break;
    case 'petPolicy':
      filters.petPolicy = null;
      break;
  }
};

const clearFilters = () => {
  filters.minPrice = null;
  filters.maxPrice = null;
  filters.bedrooms = null;
  filters.bathrooms = null;
  filters.propertyTypes = [];
  filters.petPolicy = null;
  showFilters.value = false;
};

const togglePropertyType = (type: string) => {
  const index = filters.propertyTypes.indexOf(type);
  if (index === -1) {
    filters.propertyTypes.push(type);
  } else {
    filters.propertyTypes.splice(index, 1);
  }
};

const handleSearch = () => {
  // Search is reactive via computed
};

const viewProperty = (property: any) => {
  router.push(`/property/${property.id}`);
};

const isFavorite = (id: string) => favorites.value.has(id);

const toggleFavorite = (property: any) => {
  if (favorites.value.has(property.id)) {
    favorites.value.delete(property.id);
  } else {
    favorites.value.add(property.id);
  }
};

const fetchProperties = async () => {
  loading.value = true;

  const { data, error } = await supabase
    .from('properties')
    .select('*, profiles!inner(full_name, company_name, verified, rating)')
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching properties:', error);
  } else {
    properties.value = data || [];
  }
  
  loading.value = false;
};

// Swiper logic
const onSlideChange = () => {
  // console.log('Slide changed');
};

const passProperty = () => {
  const swiperEl = document.querySelector('.property-deck') as any;
  if (swiperEl && swiperEl.swiper) {
    swiperEl.swiper.slideNext();
  }
};

const likeProperty = async () => {
  const swiperEl = document.querySelector('.property-deck') as any;
  if (swiperEl && swiperEl.swiper) {
    const activeIndex = swiperEl.swiper.activeIndex;
    const property = sortedProperties.value[activeIndex];
    
    if (property) {
      // Toggle favorite
      toggleFavorite(property);
      
      const toast = await toastController.create({
        message: 'Saved to favorites!',
        duration: 1500,
        color: 'success',
        icon: heart,
        position: 'top'
      });
      await toast.present();
    }
    
    swiperEl.swiper.slideNext();
  }
};

const handleInquire = async (property: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  if (user.id === property.landlord_id) {
    const toast = await toastController.create({
      message: 'You cannot inquire about your own property.',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
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

onMounted(() => {
  fetchProperties();
});
</script>

<style scoped>
ion-content {
  --background: #f4f5f8;
}

.custom-searchbar {
  --background: white;
  --border-radius: 12px;
}

ion-modal ion-content {
  --background: white;
}

/* Swiper Styles */
.card-deck-container {
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.property-deck {
  width: 100%;
  max-width: 350px;
  height: 100%;
  max-height: 550px;
  margin: 0 auto;
}

.property-slide {
  border-radius: 18px;
  height: auto !important;
  max-height: 100%;
}

.property-deck :deep(.swiper-slide-shadow),
.property-deck :deep(.swiper-slide-shadow-left),
.property-deck :deep(.swiper-slide-shadow-right),
.property-deck :deep(.swiper-slide-shadow-cards-left),
.property-deck :deep(.swiper-slide-shadow-cards-right) {
  display: none !important;
  background: none !important;
}

.deck-actions {
  padding-bottom: 20px;
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
  color: #10b981;
}
</style>
