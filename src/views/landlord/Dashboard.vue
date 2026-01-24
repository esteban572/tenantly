<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button router-link="/landlord/dashboard">
            <BrandLogo />
          </ion-button>
        </ion-buttons>
        <ion-title>Portfolio</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/landlord/dashboard">
            <ion-icon slot="icon-only" :icon="homeOutline"></ion-icon>
          </ion-button>
          <ion-button :router-link="`/profile/${authStore.user?.id}`">
            <ion-icon slot="icon-only" :icon="personCircleOutline"></ion-icon>
          </ion-button>
          <ion-button router-link="/messages" class="relative">
            <ion-icon slot="icon-only" :icon="chatbubblesOutline"></ion-icon>
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

    <ion-content class="ion-padding">
      <!-- Welcome Banner with Enhanced Stats -->
      <div class="welcome-banner bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-6 text-white shadow-lg">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold mb-1">{{ greeting }}, {{ userProfile?.full_name || 'Landlord' }}!</h1>
            <p class="text-blue-100 text-sm">Here's your portfolio overview</p>
          </div>
          <div class="grid grid-cols-4 gap-3">
            <div class="text-center bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
              <div class="text-2xl font-bold">{{ properties.length }}</div>
              <div class="text-xs text-blue-100">Total</div>
            </div>
            <div class="text-center bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
              <div class="text-2xl font-bold">{{ occupiedProperties.length }}</div>
              <div class="text-xs text-blue-100">Occupied</div>
            </div>
            <div class="text-center bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
              <div class="text-2xl font-bold">{{ vacantProperties.length }}</div>
              <div class="text-xs text-blue-100">Vacant</div>
            </div>
            <div class="text-center bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
              <div class="text-2xl font-bold">{{ leaseEndingProperties.length }}</div>
              <div class="text-xs text-blue-100">Ending</div>
            </div>
          </div>
        </div>
        <!-- Occupancy Rate Bar -->
        <div class="mt-4">
          <div class="flex justify-between text-xs text-blue-100 mb-1">
            <span>Occupancy Rate</span>
            <span>{{ occupancyRate }}%</span>
          </div>
          <div class="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              class="h-full bg-white rounded-full transition-all duration-500"
              :style="{ width: `${occupancyRate}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Properties -->
        <div class="lg:col-span-2">
          <!-- Filter Tabs -->
          <div class="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            <ion-chip
              v-for="filter in filters"
              :key="filter.value"
              :color="activeFilter === filter.value ? 'primary' : 'medium'"
              :outline="activeFilter !== filter.value"
              @click="activeFilter = filter.value"
              class="cursor-pointer"
            >
              <ion-label>{{ filter.label }}</ion-label>
              <ion-badge v-if="filter.count > 0" :color="activeFilter === filter.value ? 'light' : 'primary'" class="ml-1">
                {{ filter.count }}
              </ion-badge>
            </ion-chip>
          </div>

          <!-- Properties Grid -->
          <div v-if="loading" class="flex justify-center py-10">
            <ion-spinner name="crescent"></ion-spinner>
          </div>

          <div v-else-if="filteredProperties.length === 0" class="text-center py-10 bg-gray-50 rounded-xl">
            <ion-icon :icon="homeOutline" class="text-5xl text-gray-300 mb-3"></ion-icon>
            <h3 class="text-lg font-semibold text-gray-600">No properties found</h3>
            <p class="text-gray-500 text-sm mt-1">
              {{ activeFilter === 'all' ? 'Add your first property to get started.' : 'No properties match this filter.' }}
            </p>
            <ion-button v-if="activeFilter === 'all'" class="mt-4" router-link="/landlord/properties/new">
              <ion-icon slot="start" :icon="addOutline"></ion-icon>
              Add Property
            </ion-button>
          </div>

          <div v-else class="grid gap-4 sm:grid-cols-2">
            <div
              v-for="property in filteredProperties"
              :key="property.id"
              class="property-card bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all"
              @click="viewProperty(property)"
            >
              <!-- Property Image -->
              <div class="relative">
                <img
                  :src="property.image_urls?.[0] || 'https://via.placeholder.com/300x200'"
                  class="w-full h-36 object-cover"
                  :alt="property.title"
                />
                <!-- Occupancy Badge -->
                <div class="absolute top-2 right-2">
                  <ion-badge
                    :color="getOccupancyBadge(property.id).color"
                    class="text-xs px-2 py-1"
                  >
                    {{ getOccupancyBadge(property.id).label }}
                  </ion-badge>
                </div>
              </div>

              <!-- Property Info -->
              <div class="p-4">
                <h3 class="font-bold text-gray-800 truncate">{{ property.title }}</h3>
                <p class="text-gray-500 text-sm truncate">{{ property.address }}</p>

                <!-- Property Stats -->
                <div class="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span v-if="property.bedrooms" class="flex items-center gap-1">
                    <ion-icon :icon="bedOutline"></ion-icon>
                    {{ property.bedrooms }}
                  </span>
                  <span v-if="property.bathrooms" class="flex items-center gap-1">
                    <ion-icon :icon="waterOutline"></ion-icon>
                    {{ property.bathrooms }}
                  </span>
                  <span v-if="property.sqft">
                    {{ property.sqft.toLocaleString() }} sqft
                  </span>
                </div>

                <!-- Tenant Preview (if occupied) -->
                <div v-if="tenancyMap.get(property.id)" class="mt-3 pt-3 border-t border-gray-100">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img
                        v-if="tenancyMap.get(property.id)?.tenant?.avatar_url"
                        :src="tenancyMap.get(property.id)?.tenant?.avatar_url"
                        class="w-full h-full object-cover"
                      />
                      <ion-icon v-else :icon="personOutline" class="text-gray-400"></ion-icon>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-gray-700 truncate">
                        {{ tenancyMap.get(property.id)?.tenant?.full_name || 'Tenant' }}
                      </p>
                      <p v-if="tenancyMap.get(property.id)?.end_date" class="text-xs text-gray-500">
                        Lease ends {{ formatDate(tenancyMap.get(property.id)?.end_date) }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Price -->
                <div class="mt-3 flex items-center justify-between">
                  <span class="font-bold text-green-600">${{ property.price?.toLocaleString() }}/mo</span>
                  <ion-button fill="clear" size="small" @click.stop="editProperty(property)">
                    <ion-icon slot="icon-only" :icon="createOutline" class="text-gray-400"></ion-icon>
                  </ion-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="mt-6">
            <h3 class="text-lg font-bold text-gray-800 mb-3">Quick Actions</h3>
            <div class="grid grid-cols-3 gap-3">
              <ion-button expand="block" fill="outline" router-link="/landlord/properties/new" class="h-20">
                <div class="flex flex-col items-center gap-1">
                  <ion-icon :icon="addOutline" size="large"></ion-icon>
                  <span class="text-xs">Add Property</span>
                </div>
              </ion-button>
              <ion-button expand="block" fill="outline" router-link="/landlord/applications" class="h-20">
                <div class="flex flex-col items-center gap-1">
                  <ion-icon :icon="documentTextOutline" size="large"></ion-icon>
                  <span class="text-xs">Applications</span>
                </div>
              </ion-button>
              <ion-button expand="block" fill="outline" router-link="/landlord/maintenance" class="h-20">
                <div class="flex flex-col items-center gap-1">
                  <ion-icon :icon="constructOutline" size="large"></ion-icon>
                  <span class="text-xs">Maintenance</span>
                </div>
              </ion-button>
            </div>
          </div>
        </div>

        <!-- Right Column: Alert Center -->
        <div class="lg:col-span-1">
          <AlertCenter
            :expiring-leases="expiringLeases"
            :pending-applications="pendingApplications"
            :new-maintenance-requests="newMaintenanceRequests"
            :loading="alertsLoading"
          />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, IonSpinner, IonBadge,
  IonChip, IonLabel
} from '@ionic/vue';
import {
  homeOutline, personCircleOutline, chatbubblesOutline, logOutOutline,
  addOutline, documentTextOutline, constructOutline, bedOutline,
  waterOutline, createOutline, personOutline
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { supabase } from '@/services/supabaseClient';
import { tenancyService, type Tenancy } from '@/services/tenancyService';
import { conversationService } from '@/services/conversationService';
import { useAuthStore } from '@/stores/authStore';
import BrandLogo from '@/components/shared/BrandLogo.vue';
import AlertCenter from '@/components/landlord/AlertCenter.vue';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  image_urls?: string[];
}

interface Application {
  id: string;
  full_name: string;
  status: string;
  created_at: string;
  property?: {
    id: string;
    title: string;
  };
}

interface MaintenanceRequest {
  id: string;
  title: string;
  priority: string;
  status: string;
  created_at: string;
  property?: {
    id: string;
    title: string;
  };
}

const router = useRouter();
const authStore = useAuthStore();

// State
const loading = ref(true);
const alertsLoading = ref(true);
const userProfile = ref<any>(null);
const properties = ref<Property[]>([]);
const tenancyMap = ref<Map<string, Tenancy>>(new Map());
const expiringLeases = ref<Tenancy[]>([]);
const pendingApplications = ref<Application[]>([]);
const newMaintenanceRequests = ref<MaintenanceRequest[]>([]);
const unreadCount = ref(0);
const activeFilter = ref<'all' | 'vacant' | 'lease_ending' | 'occupied'>('all');

let refreshInterval: ReturnType<typeof setInterval> | null = null;

// Computed
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
});

const occupiedProperties = computed(() =>
  properties.value.filter(p => tenancyMap.value.has(p.id))
);

const vacantProperties = computed(() =>
  properties.value.filter(p => !tenancyMap.value.has(p.id))
);

const leaseEndingProperties = computed(() => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  return properties.value.filter(p => {
    const tenancy = tenancyMap.value.get(p.id);
    if (!tenancy?.end_date) return false;
    const endDate = new Date(tenancy.end_date);
    const today = new Date();
    return endDate >= today && endDate <= thirtyDaysFromNow;
  });
});

const occupancyRate = computed(() => {
  if (properties.value.length === 0) return 0;
  return Math.round((occupiedProperties.value.length / properties.value.length) * 100);
});

const filters = computed(() => [
  { value: 'all' as const, label: 'All', count: properties.value.length },
  { value: 'vacant' as const, label: 'Vacant', count: vacantProperties.value.length },
  { value: 'lease_ending' as const, label: 'Lease Ending', count: leaseEndingProperties.value.length },
  { value: 'occupied' as const, label: 'Occupied', count: occupiedProperties.value.length }
]);

const filteredProperties = computed(() => {
  switch (activeFilter.value) {
    case 'vacant':
      return vacantProperties.value;
    case 'lease_ending':
      return leaseEndingProperties.value;
    case 'occupied':
      return occupiedProperties.value;
    default:
      return properties.value;
  }
});

// Methods
const fetchData = async () => {
  loading.value = true;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    loading.value = false;
    return;
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  userProfile.value = profile;

  // Fetch properties
  const { data: props } = await supabase
    .from('properties')
    .select('id, title, address, price, bedrooms, bathrooms, sqft, image_urls')
    .eq('landlord_id', user.id)
    .order('created_at', { ascending: false });
  properties.value = props || [];

  // Fetch tenancy map
  if (properties.value.length > 0) {
    const propertyIds = properties.value.map(p => p.id);
    tenancyMap.value = await tenancyService.getTenancyMap(propertyIds);
  }

  loading.value = false;
};

const fetchAlerts = async () => {
  alertsLoading.value = true;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alertsLoading.value = false;
    return;
  }

  // Fetch expiring leases (next 30 days)
  expiringLeases.value = await tenancyService.getLeaseEndingSoon(user.id, 30);

  // Fetch pending applications
  const { data: apps } = await supabase
    .from('applications')
    .select(`
      id, full_name, status, created_at,
      property:properties!inner(id, title, landlord_id)
    `)
    .eq('status', 'pending')
    .eq('property.landlord_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);
  pendingApplications.value = (apps || []) as Application[];

  // Fetch new maintenance requests (pending status)
  const { data: reqs } = await supabase
    .from('maintenance_requests')
    .select(`
      id, title, priority, status, created_at,
      property:properties!inner(id, title, landlord_id)
    `)
    .eq('status', 'pending')
    .eq('property.landlord_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);
  newMaintenanceRequests.value = (reqs || []) as MaintenanceRequest[];

  alertsLoading.value = false;
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

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const viewProperty = (property: Property) => {
  router.push(`/landlord/properties/${property.id}`);
};

const editProperty = (property: Property) => {
  router.push(`/landlord/properties/${property.id}/edit`);
};

const logout = async () => {
  await authStore.signOut();
  router.replace('/');
};

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchData(), fetchAlerts(), loadUnreadCount()]);

  // Refresh data every 30 seconds
  refreshInterval = setInterval(() => {
    loadUnreadCount();
    fetchAlerts();
  }, 30000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.property-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.property-card:hover {
  transform: translateY(-2px);
}
</style>
