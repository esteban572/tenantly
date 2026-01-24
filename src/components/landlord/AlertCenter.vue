<template>
  <div class="alert-center bg-white rounded-xl shadow-md p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
        <ion-icon :icon="notificationsOutline" class="text-blue-500"></ion-icon>
        Alerts
      </h3>
      <ion-badge v-if="totalAlerts > 0" color="danger">{{ totalAlerts }}</ion-badge>
    </div>

    <div v-if="loading" class="flex justify-center py-4">
      <ion-spinner name="crescent"></ion-spinner>
    </div>

    <div v-else-if="totalAlerts === 0" class="text-center py-6 text-gray-500">
      <ion-icon :icon="checkmarkCircleOutline" class="text-4xl text-green-500 mb-2"></ion-icon>
      <p>All caught up!</p>
    </div>

    <div v-else class="space-y-3 max-h-80 overflow-y-auto">
      <!-- Expiring Leases -->
      <div
        v-for="lease in expiringLeases"
        :key="`lease-${lease.id}`"
        class="alert-item bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg cursor-pointer hover:bg-orange-100 transition-colors"
        @click="handleLeaseClick(lease)"
      >
        <div class="flex items-start gap-3">
          <ion-icon :icon="calendarOutline" class="text-orange-500 text-xl mt-0.5"></ion-icon>
          <div class="flex-1">
            <p class="font-medium text-gray-800 text-sm">Lease Ending Soon</p>
            <p class="text-gray-600 text-xs">{{ lease.property?.title }}</p>
            <p class="text-orange-600 text-xs font-medium mt-1">
              {{ formatDaysUntil(lease.end_date) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Pending Applications -->
      <div
        v-for="app in pendingApplications"
        :key="`app-${app.id}`"
        class="alert-item bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg cursor-pointer hover:bg-blue-100 transition-colors"
        @click="handleApplicationClick(app)"
      >
        <div class="flex items-start gap-3">
          <ion-icon :icon="documentTextOutline" class="text-blue-500 text-xl mt-0.5"></ion-icon>
          <div class="flex-1">
            <p class="font-medium text-gray-800 text-sm">New Application</p>
            <p class="text-gray-600 text-xs">{{ app.full_name }} for {{ app.property?.title }}</p>
            <p class="text-blue-600 text-xs font-medium mt-1">
              {{ formatTimeAgo(app.created_at) }}
            </p>
          </div>
        </div>
      </div>

      <!-- New Maintenance Requests -->
      <div
        v-for="request in newMaintenanceRequests"
        :key="`maint-${request.id}`"
        class="alert-item p-3 rounded-r-lg cursor-pointer transition-colors"
        :class="getMaintenanceBgClass(request.priority)"
        @click="handleMaintenanceClick(request)"
      >
        <div class="flex items-start gap-3">
          <ion-icon :icon="constructOutline" class="text-xl mt-0.5" :class="getMaintenanceIconClass(request.priority)"></ion-icon>
          <div class="flex-1">
            <p class="font-medium text-gray-800 text-sm">{{ request.title }}</p>
            <p class="text-gray-600 text-xs">{{ request.property?.title }}</p>
            <div class="flex items-center gap-2 mt-1">
              <ion-badge :color="getPriorityColor(request.priority)" class="text-xs">
                {{ request.priority }}
              </ion-badge>
              <span class="text-gray-500 text-xs">{{ formatTimeAgo(request.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonIcon, IonBadge, IonSpinner } from '@ionic/vue';
import {
  notificationsOutline,
  checkmarkCircleOutline,
  calendarOutline,
  documentTextOutline,
  constructOutline
} from 'ionicons/icons';
import type { Tenancy } from '@/services/tenancyService';

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

const props = defineProps<{
  expiringLeases: Tenancy[];
  pendingApplications: Application[];
  newMaintenanceRequests: MaintenanceRequest[];
  loading?: boolean;
}>();

const router = useRouter();

const totalAlerts = computed(() => {
  return props.expiringLeases.length +
         props.pendingApplications.length +
         props.newMaintenanceRequests.length;
});

const formatDaysUntil = (dateString?: string): string => {
  if (!dateString) return 'No end date';
  const endDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Ends today';
  if (diffDays === 1) return 'Ends tomorrow';
  if (diffDays < 0) return 'Lease ended';
  return `Ends in ${diffDays} days`;
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const getPriorityColor = (priority: string): string => {
  switch (priority?.toLowerCase()) {
    case 'urgent':
    case 'emergency':
      return 'danger';
    case 'high':
      return 'warning';
    case 'medium':
      return 'primary';
    default:
      return 'medium';
  }
};

const getMaintenanceBgClass = (priority: string): string => {
  switch (priority?.toLowerCase()) {
    case 'urgent':
    case 'emergency':
      return 'bg-red-50 border-l-4 border-red-400 hover:bg-red-100';
    case 'high':
      return 'bg-yellow-50 border-l-4 border-yellow-400 hover:bg-yellow-100';
    default:
      return 'bg-gray-50 border-l-4 border-gray-400 hover:bg-gray-100';
  }
};

const getMaintenanceIconClass = (priority: string): string => {
  switch (priority?.toLowerCase()) {
    case 'urgent':
    case 'emergency':
      return 'text-red-500';
    case 'high':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
};

const handleLeaseClick = (lease: Tenancy) => {
  if (lease.property_id) {
    router.push(`/landlord/properties/${lease.property_id}`);
  }
};

const handleApplicationClick = (app: Application) => {
  router.push('/landlord/applications');
};

const handleMaintenanceClick = (request: MaintenanceRequest) => {
  router.push(`/landlord/maintenance/${request.id}`);
};
</script>

<style scoped>
.alert-center {
  max-height: 400px;
}

.alert-item {
  transition: all 0.2s ease;
}
</style>
