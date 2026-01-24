<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tenant/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>My Applications</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Status Filter Tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          v-for="status in statuses"
          :key="status.value"
          @click="selectedStatus = status.value"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
            selectedStatus === status.value
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          ]"
        >
          {{ status.label }}
          <span class="ml-1 px-2 py-0.5 rounded-full text-xs" :class="selectedStatus === status.value ? 'bg-white/20' : 'bg-gray-200'">
            {{ getCountByStatus(status.value) }}
          </span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <ion-spinner></ion-spinner>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredApplications.length === 0" class="text-center py-20">
        <div class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <ion-icon :icon="documentTextOutline" class="text-4xl text-gray-400"></ion-icon>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">No applications yet</h3>
        <p class="text-gray-500 mb-4">Start exploring properties and apply to your favorites!</p>
        <ion-button router-link="/explore" fill="solid">
          <ion-icon :icon="searchOutline" slot="start"></ion-icon>
          Explore Properties
        </ion-button>
      </div>

      <!-- Applications List -->
      <div v-else class="space-y-4">
        <div
          v-for="app in filteredApplications"
          :key="app.id"
          class="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          @click="viewProperty(app.property)"
        >
          <div class="flex">
            <!-- Property Image -->
            <div class="w-32 h-32 flex-shrink-0">
              <img
                :src="app.property?.image_urls?.[0] || 'https://via.placeholder.com/128'"
                :alt="app.property?.title"
                class="w-full h-full object-cover"
              />
            </div>
            
            <!-- Application Info -->
            <div class="flex-1 p-4">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold text-gray-800 line-clamp-1">{{ app.property?.title }}</h3>
                  <p class="text-sm text-gray-500 line-clamp-1">{{ app.property?.address }}</p>
                </div>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    getStatusClass(app.status)
                  ]"
                >
                  {{ formatStatus(app.status) }}
                </span>
              </div>
              
              <div class="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span class="font-bold text-green-600">${{ app.property?.price }}/mo</span>
                <span v-if="app.property?.bedrooms">{{ app.property?.bedrooms }} bed</span>
                <span v-if="app.property?.bathrooms">{{ app.property?.bathrooms }} bath</span>
              </div>
              
              <div class="mt-2 flex items-center text-xs text-gray-400">
                <ion-icon :icon="calendarOutline" class="mr-1"></ion-icon>
                Applied {{ formatDate(app.created_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonSpinner
} from '@ionic/vue';
import { documentTextOutline, searchOutline, calendarOutline } from 'ionicons/icons';
import { supabase } from '@/services/supabaseClient';

const router = useRouter();
const applications = ref<any[]>([]);
const loading = ref(true);
const selectedStatus = ref('all');

const statuses = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

const filteredApplications = computed(() => {
  if (selectedStatus.value === 'all') {
    return applications.value;
  }
  return applications.value.filter(app => app.status === selectedStatus.value);
});

const getCountByStatus = (status: string) => {
  if (status === 'all') return applications.value.length;
  return applications.value.filter(app => app.status === status).length;
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    reviewing: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

const viewProperty = (property: any) => {
  if (property?.id) {
    router.push(`/property/${property.id}`);
  }
};

const fetchApplications = async () => {
  loading.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    loading.value = false;
    return;
  }

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      property:properties(*)
    `)
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
  } else {
    applications.value = data || [];
  }
  
  loading.value = false;
};

onMounted(() => {
  fetchApplications();
});
</script>

<style scoped>
ion-content {
  --background: #f4f5f8;
}
</style>
