<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button router-link="/landlord/properties">
            <BrandLogo />
          </ion-button>
        </ion-buttons>
        <ion-title>My Properties</ion-title>
        <ion-buttons slot="end">
           <ion-button router-link="/landlord/dashboard">
             <ion-icon slot="icon-only" :icon="homeOutline"></ion-icon>
           </ion-button>
           <ion-button router-link="/messages">
             <ion-icon slot="icon-only" :icon="chatbubbleOutline"></ion-icon>
           </ion-button>
           <ion-button @click="logout">
             <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
           </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">

      <div v-if="loading" class="flex justify-center mt-10">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="properties.length === 0" class="text-center mt-20">
        <h3 class="text-lg font-semibold text-gray-700">No properties yet</h3>
        <p class="text-gray-500">Tap the + button to add your first property.</p>
        <ion-button class="mt-4" router-link="/landlord/properties/new">
          <ion-icon slot="start" :icon="add"></ion-icon>
          Add Property
        </ion-button>
      </div>

      <div v-else class="grid gap-4">
        <div
          v-for="prop in properties"
          :key="prop.id"
          class="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          @click="viewProperty(prop)"
        >
          <!-- Property Image with Occupancy Badge -->
          <div class="relative">
            <img
              :src="prop.image_urls?.[0] || 'https://via.placeholder.com/150'"
              class="w-full h-40 object-cover"
            />
            <!-- Occupancy Badge -->
            <div class="absolute top-2 right-2">
              <ion-badge
                :color="getOccupancyBadge(prop.id).color"
                class="text-xs px-2 py-1"
              >
                {{ getOccupancyBadge(prop.id).label }}
              </ion-badge>
            </div>
          </div>

          <div class="p-4">
            <h3 class="font-bold text-lg">{{ prop.title }}</h3>
            <p class="text-gray-600 text-sm">{{ prop.address }}<span v-if="prop.city">, {{ prop.city }}</span></p>

            <!-- Property Stats -->
            <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span v-if="prop.bedrooms" class="flex items-center gap-1">
                <ion-icon :icon="bedOutline"></ion-icon>
                {{ prop.bedrooms }} bed
              </span>
              <span v-if="prop.bathrooms" class="flex items-center gap-1">
                <ion-icon :icon="waterOutline"></ion-icon>
                {{ prop.bathrooms }} bath
              </span>
              <span v-if="prop.sqft" class="flex items-center gap-1">
                {{ prop.sqft?.toLocaleString() }} sqft
              </span>
            </div>

            <!-- Tenant Preview (if occupied) -->
            <div v-if="tenancyMap.get(prop.id)" class="mt-3 pt-3 border-t border-gray-100">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="tenancyMap.get(prop.id)?.tenant?.avatar_url"
                    :src="tenancyMap.get(prop.id)?.tenant?.avatar_url"
                    class="w-full h-full object-cover"
                  />
                  <ion-icon v-else :icon="personOutline" class="text-gray-400"></ion-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-700 truncate">
                    {{ tenancyMap.get(prop.id)?.tenant?.full_name || 'Tenant' }}
                  </p>
                  <p v-if="tenancyMap.get(prop.id)?.end_date" class="text-xs text-gray-500">
                    Lease ends {{ formatDate(tenancyMap.get(prop.id)?.end_date) }}
                  </p>
                </div>
                <ion-badge
                  v-if="isLeaseEndingSoon(prop.id)"
                  color="warning"
                  class="text-xs"
                >
                  Ending Soon
                </ion-badge>
              </div>
            </div>

            <div class="mt-auto pt-3 flex justify-between items-center border-t mt-3">
              <span class="font-bold text-green-600 text-lg">${{ prop.price?.toLocaleString() }}/mo</span>
              <div class="flex gap-2">
                <ion-button fill="clear" color="primary" @click.stop="shareProperty(prop)">
                  <ion-icon :icon="shareOutline"></ion-icon>
                </ion-button>
                <ion-button fill="clear" color="secondary" @click.stop="editProperty(prop)">
                  <ion-icon :icon="createOutline"></ion-icon>
                </ion-button>
                <ion-button fill="clear" color="danger" @click.stop="deleteProperty(prop.id)">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </ion-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="mb-4 mr-4">
        <ion-fab-button router-link="/landlord/properties/new">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonFab, IonFabButton, IonIcon, IonSpinner, toastController, IonButtons, IonBadge } from '@ionic/vue';
import { add, trashOutline, shareOutline, createOutline, bedOutline, waterOutline, homeOutline, chatbubbleOutline, logOutOutline, personOutline } from 'ionicons/icons';
import { supabase } from '@/services/supabaseClient';
import { tenancyService, type Tenancy } from '@/services/tenancyService';
import BrandLogo from '@/components/shared/BrandLogo.vue';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const properties = ref<any[]>([]);
const tenancyMap = ref<Map<string, Tenancy>>(new Map());
const loading = ref(true);

const logout = async () => {
  const authStore = useAuthStore();
  await authStore.signOut();
  router.replace('/');
};

const viewProperty = (property: any) => {
  router.push(`/landlord/properties/${property.id}`);
};

const editProperty = (property: any) => {
  router.push(`/landlord/properties/${property.id}/edit`);
};

const fetchProperties = async () => {
  loading.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('landlord_id', user.id)
      .order('created_at', { ascending: false });
    properties.value = data || [];

    // Fetch tenancy map for all properties
    if (properties.value.length > 0) {
      const propertyIds = properties.value.map(p => p.id);
      tenancyMap.value = await tenancyService.getTenancyMap(propertyIds);
    }
  }
  loading.value = false;
};

const getOccupancyBadge = (propertyId: string) => {
  const tenancy = tenancyMap.value.get(propertyId);
  if (!tenancy) {
    return { label: 'Vacant', color: 'warning' };
  }

  if (tenancy.end_date) {
    const endDate = new Date(tenancy.end_date);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (endDate >= today && endDate <= thirtyDaysFromNow) {
      return { label: 'Lease Ending', color: 'danger' };
    }
  }

  return { label: 'Occupied', color: 'success' };
};

const isLeaseEndingSoon = (propertyId: string): boolean => {
  const tenancy = tenancyMap.value.get(propertyId);
  if (!tenancy?.end_date) return false;

  const endDate = new Date(tenancy.end_date);
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  return endDate >= today && endDate <= thirtyDaysFromNow;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const shareProperty = async (property: any) => {
  const shareUrl = `${window.location.origin}/property/${property.id}/public`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      const toast = await toastController.create({
        message: 'Property link copied to clipboard!',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    }
  } catch (error) {
    console.error('Error sharing:', error);
  }
};

const deleteProperty = async (id: string) => {
  if (!confirm('Are you sure you want to delete this property?')) return;

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (!error) {
    properties.value = properties.value.filter(p => p.id !== id);
    tenancyMap.value.delete(id);
  }
};

onMounted(() => {
  fetchProperties();
});
</script>
