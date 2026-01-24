<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tenant/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>My Maintenance Requests</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center mt-10">
        <ion-spinner></ion-spinner>
      </div>

      <!-- Empty State -->
      <div v-else-if="requests.length === 0" class="text-center mt-20">
        <ion-icon :icon="constructOutline" class="text-6xl text-gray-300"></ion-icon>
        <h3 class="text-lg font-semibold text-gray-700 mt-4">No requests found</h3>
        <p class="text-gray-500">When you report an issue, it will appear here.</p>
        <ion-button router-link="/tenant/maintenance/new" class="mt-4">
          Report New Issue
        </ion-button>
      </div>

      <!-- List -->
      <div v-else class="space-y-4">
        <div v-for="req in requests" :key="req.id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- Priority Bar -->
          <div :class="['h-1', getPriorityBarColor(req.priority || req.ai_priority)]"></div>
          
          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-bold text-lg text-gray-800">{{ req.title }}</h3>
                  <ion-badge v-if="req.priority || req.ai_priority" :color="getPriorityColor(req.priority || req.ai_priority)" class="text-xs">
                    {{ (req.priority || req.ai_priority)?.toUpperCase() }}
                  </ion-badge>
                </div>
                <p class="text-sm text-gray-500">{{ req.properties?.address }}</p>
              </div>
              <ion-badge :color="getStatusColor(req.status)" class="rounded-full px-3 py-1">
                {{ formatStatus(req.status) }}
              </ion-badge>
            </div>

            <p class="text-gray-600 my-2 text-sm line-clamp-2">{{ req.description }}</p>

            <div v-if="req.photo_url" class="mt-3">
              <img :src="req.photo_url" class="rounded-lg h-32 object-cover w-full shadow-inner" />
            </div>

            <!-- Enhanced Timeline -->
            <div class="mt-4 pt-4 border-t border-gray-100">
              <div class="space-y-2">
                <!-- Submitted -->
                <div class="flex items-center gap-2 text-xs">
                  <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span class="text-gray-500">Submitted {{ formatDate(req.created_at) }}</span>
                </div>
                
                <!-- Viewed by Landlord -->
                <div v-if="req.viewed_at" class="flex items-center gap-2 text-xs">
                  <div class="w-2 h-2 rounded-full bg-green-500"></div>
                  <span class="text-green-600 font-medium">
                    <ion-icon :icon="eyeOutline" class="inline mr-1"></ion-icon>
                    Viewed by landlord {{ formatTimeAgo(req.viewed_at) }}
                  </span>
                </div>
                <div v-else-if="req.status === 'pending'" class="flex items-center gap-2 text-xs">
                  <div class="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span class="text-amber-500">Waiting for landlord to review</span>
                </div>

                <!-- Worker Assigned -->
                <div v-if="req.assigned_worker_name" class="flex items-center gap-2 text-xs">
                  <div class="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span class="text-purple-600 font-medium">
                    <ion-icon :icon="buildOutline" class="inline mr-1"></ion-icon>
                    Worker assigned: {{ req.assigned_worker_name }}
                  </span>
                </div>

                <!-- Scheduled Date -->
                <div v-if="req.scheduled_date" class="flex items-center gap-2 text-xs">
                  <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span class="text-indigo-600 font-medium">
                    <ion-icon :icon="calendarOutline" class="inline mr-1"></ion-icon>
                    Scheduled for {{ formatDate(req.scheduled_date) }}
                  </span>
                </div>

                <!-- Completed -->
                <div v-if="req.completed_at" class="flex items-center gap-2 text-xs">
                  <div class="w-2 h-2 rounded-full bg-green-600"></div>
                  <span class="text-green-700 font-medium">
                    <ion-icon :icon="checkmarkCircleOutline" class="inline mr-1"></ion-icon>
                    Completed {{ formatDate(req.completed_at) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Worker Contact Card -->
            <div v-if="req.assigned_worker_name && req.assigned_worker_phone" class="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <p class="text-xs text-purple-600 font-semibold mb-1">Worker Contact</p>
              <p class="text-sm font-medium text-gray-800">{{ req.assigned_worker_name }}</p>
              <a :href="`tel:${req.assigned_worker_phone}`" class="text-sm text-purple-600 underline">
                {{ req.assigned_worker_phone }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- FAB for new request -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button router-link="/tenant/maintenance/new" color="primary">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonBackButton, IonSpinner, IonIcon, IonBadge, IonButton, 
  IonRefresher, IonRefresherContent, IonFab, IonFabButton 
} from '@ionic/vue';
import { constructOutline, add, eyeOutline, buildOutline, calendarOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useMaintenanceStore } from '@/stores/maintenanceStore';

const maintenanceStore = useMaintenanceStore();

const loading = computed(() => maintenanceStore.loading);
const requests = computed(() => maintenanceStore.requests);

const formatStatus = (status: string) => {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'in_progress': return 'primary';
    case 'completed': return 'success';
    case 'cancelled': return 'medium';
    default: return 'medium';
  }
};

const getPriorityColor = (priority: string | undefined) => {
  if (!priority) return 'medium';
  const colors: Record<string, string> = {
    emergency: 'danger',
    high: 'warning',
    medium: 'primary',
    low: 'success'
  };
  return colors[priority.toLowerCase()] || 'medium';
};

const getPriorityBarColor = (priority: string | undefined) => {
  if (!priority) return 'bg-gray-200';
  const colors: Record<string, string> = {
    emergency: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-blue-500',
    low: 'bg-green-500'
  };
  return colors[priority.toLowerCase()] || 'bg-gray-200';
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const doRefresh = async (event: any) => {
  await maintenanceStore.fetchRequests();
  event.target.complete();
};

onMounted(() => {
  maintenanceStore.fetchRequests();
});
</script>

<style scoped>
ion-content {
  --background: #f8f9fa;
}
</style>
