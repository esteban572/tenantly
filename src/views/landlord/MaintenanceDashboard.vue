<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Maintenance Portfolio</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Stats Bar -->
      <div class="grid grid-cols-4 gap-3 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm text-center">
          <p class="text-3xl font-bold text-gray-800">{{ stats.total }}</p>
          <p class="text-xs text-gray-500">Total</p>
        </div>
        <div class="bg-red-50 rounded-xl p-4 shadow-sm text-center border border-red-100">
          <p class="text-3xl font-bold text-red-600">{{ stats.urgent }}</p>
          <p class="text-xs text-red-500">Urgent</p>
        </div>
        <div class="bg-amber-50 rounded-xl p-4 shadow-sm text-center border border-amber-100">
          <p class="text-3xl font-bold text-amber-600">{{ stats.open }}</p>
          <p class="text-xs text-amber-500">Open</p>
        </div>
        <div class="bg-green-50 rounded-xl p-4 shadow-sm text-center border border-green-100">
          <p class="text-3xl font-bold text-green-600">{{ stats.completed }}</p>
          <p class="text-xs text-green-500">Done</p>
        </div>
      </div>

      <!-- Priority Filter Tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          v-for="tab in priorityTabs"
          :key="tab.value"
          @click="selectedPriority = tab.value"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
            selectedPriority === tab.value
              ? tab.activeClass
              : 'bg-white text-gray-600 hover:bg-gray-100'
          ]"
        >
          {{ tab.label }}
          <span v-if="getCountByPriority(tab.value) > 0" class="ml-1 px-2 py-0.5 rounded-full text-xs" :class="selectedPriority === tab.value ? 'bg-white/20' : 'bg-gray-200'">
            {{ getCountByPriority(tab.value) }}
          </span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <ion-spinner></ion-spinner>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredRequests.length === 0" class="text-center py-20">
        <ion-icon :icon="checkmarkCircleOutline" class="text-6xl text-green-300"></ion-icon>
        <h3 class="text-lg font-semibold text-gray-700 mt-4">All caught up!</h3>
        <p class="text-gray-500">No {{ selectedPriority === 'all' ? '' : selectedPriority }} maintenance requests.</p>
      </div>

      <!-- Ticket List -->
      <div v-else class="space-y-4">
        <div
          v-for="ticket in filteredRequests"
          :key="ticket.id"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all"
          @click="viewTicket(ticket)"
        >
          <div class="flex">
            <!-- Priority Indicator -->
            <div :class="['w-2', getPriorityBarColor(ticket.priority || ticket.ai_priority)]"></div>
            
            <div class="flex-1 p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-bold text-gray-800">{{ ticket.title }}</h3>
                    <span v-if="!ticket.viewed_at" class="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">NEW</span>
                  </div>
                  <p class="text-sm text-gray-500">{{ ticket.properties?.address }}</p>
                  <p class="text-xs text-gray-400 mt-1">
                    Reported by {{ ticket.profiles?.full_name || 'Tenant' }} • {{ formatTimeAgo(ticket.created_at) }}
                  </p>
                </div>
                
                <div class="flex flex-col items-end gap-2">
                  <ion-badge :color="getStatusColor(ticket.status)">
                    {{ formatStatus(ticket.status) }}
                  </ion-badge>
                  <ion-badge :color="getPriorityColor(ticket.priority || ticket.ai_priority)" class="text-xs">
                    {{ (ticket.priority || ticket.ai_priority || 'unset').toUpperCase() }}
                  </ion-badge>
                </div>
              </div>

              <!-- AI Triage Preview -->
              <div v-if="ticket.ai_summary" class="mt-3 p-2 bg-blue-50 rounded-lg">
                <div class="flex items-center gap-1 text-xs text-blue-600 mb-1">
                  <ion-icon :icon="sparklesOutline"></ion-icon>
                  <span class="font-semibold">AI Summary</span>
                </div>
                <p class="text-sm text-blue-800 line-clamp-2">{{ ticket.ai_summary }}</p>
              </div>

              <!-- Assignment Info -->
              <div v-if="ticket.assigned_worker_name" class="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <ion-icon :icon="personOutline" class="text-gray-400"></ion-icon>
                <span>Assigned to: <strong>{{ ticket.assigned_worker_name }}</strong></span>
                <span v-if="ticket.scheduled_date" class="text-gray-400">
                  • Scheduled: {{ formatDate(ticket.scheduled_date) }}
                </span>
              </div>
            </div>

            <!-- Photo Thumbnail -->
            <div v-if="ticket.photo_url" class="w-24 h-full flex-shrink-0">
              <img :src="ticket.photo_url" :alt="ticket.title" class="w-full h-full object-cover" />
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
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonIcon, IonBadge
} from '@ionic/vue';
import { checkmarkCircleOutline, sparklesOutline, personOutline } from 'ionicons/icons';
import { supabase } from '@/services/supabaseClient';

const router = useRouter();
const requests = ref<any[]>([]);
const loading = ref(true);
const selectedPriority = ref('all');

const priorityTabs = [
  { value: 'all', label: 'All', activeClass: 'bg-gray-800 text-white' },
  { value: 'emergency', label: '🚨 Emergency', activeClass: 'bg-red-600 text-white' },
  { value: 'high', label: 'High', activeClass: 'bg-orange-500 text-white' },
  { value: 'medium', label: 'Medium', activeClass: 'bg-blue-500 text-white' },
  { value: 'low', label: 'Low', activeClass: 'bg-green-500 text-white' }
];

const stats = computed(() => {
  const all = requests.value;
  return {
    total: all.length,
    urgent: all.filter(r => (r.priority || r.ai_priority) === 'emergency' || (r.priority || r.ai_priority) === 'high').length,
    open: all.filter(r => r.status === 'pending' || r.status === 'in_progress').length,
    completed: all.filter(r => r.status === 'completed').length
  };
});

const filteredRequests = computed(() => {
  let result = requests.value;
  
  if (selectedPriority.value !== 'all') {
    result = result.filter(r => (r.priority || r.ai_priority) === selectedPriority.value);
  }
  
  // Sort by priority (emergency first) then by date
  return result.sort((a, b) => {
    const priorityOrder: Record<string, number> = { emergency: 0, high: 1, medium: 2, low: 3 };
    const aPriority = priorityOrder[a.priority || a.ai_priority || 'low'] ?? 4;
    const bPriority = priorityOrder[b.priority || b.ai_priority || 'low'] ?? 4;
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
});

const getCountByPriority = (priority: string) => {
  if (priority === 'all') return requests.value.length;
  return requests.value.filter(r => (r.priority || r.ai_priority) === priority).length;
};

const formatStatus = (status: string) => {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'medium'
  };
  return colors[status] || 'medium';
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
  if (!priority) return 'bg-gray-300';
  const colors: Record<string, string> = {
    emergency: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-blue-500',
    low: 'bg-green-500'
  };
  return colors[priority.toLowerCase()] || 'bg-gray-300';
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const viewTicket = (ticket: any) => {
  router.push(`/landlord/maintenance/${ticket.id}`);
};

const fetchRequests = async () => {
  loading.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    loading.value = false;
    return;
  }

  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      properties!inner(id, address, landlord_id),
      profiles!maintenance_requests_tenant_id_fkey(full_name)
    `)
    .eq('properties.landlord_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching maintenance requests:', error);
  } else {
    requests.value = data || [];
  }
  
  loading.value = false;
};

onMounted(() => {
  fetchRequests();
});
</script>

<style scoped>
ion-content {
  --background: #f4f5f8;
}
</style>
