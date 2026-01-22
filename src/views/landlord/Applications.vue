<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/landlord/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Applications</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="loading" class="flex justify-center mt-10">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="applications.length === 0" class="text-center mt-20">
        <h3 class="text-lg font-semibold text-gray-700">No applications yet</h3>
        <p class="text-gray-500">Applications will appear here when tenants apply to your properties.</p>
      </div>

      <div v-else class="max-w-4xl mx-auto">
        <!-- Filter Tabs -->
        <div class="flex gap-2 mb-6 overflow-x-auto">
          <ion-chip 
            v-for="status in statuses" 
            :key="status.value"
            :color="selectedStatus === status.value ? 'primary' : 'medium'"
            @click="selectedStatus = status.value"
            class="cursor-pointer"
          >
            {{ status.label }} ({{ getCountByStatus(status.value) }})
          </ion-chip>
        </div>

        <!-- Applications List -->
        <div class="space-y-4">
          <div 
            v-for="app in filteredApplications" 
            :key="app.id"
            class="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition"
            @click="viewApplication(app.id)"
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="font-bold text-lg">{{ app.full_name }}</h3>
                <p class="text-sm text-gray-600">{{ app.email }}</p>
                <p class="text-sm text-gray-600">{{ app.phone }}</p>
              </div>
              <ion-badge :color="getStatusColor(app.status)">
                {{ app.status }}
              </ion-badge>
            </div>

            <div class="border-t pt-3">
              <p class="text-sm font-medium text-gray-700 mb-1">
                Property: {{ app.property?.title }}
              </p>
              <p class="text-sm text-gray-600">{{ app.property?.address }}</p>
              
              <div class="flex gap-4 mt-2 text-xs text-gray-500">
                <span v-if="app.monthly_income">Income: ${{ app.monthly_income }}/mo</span>
                <span v-if="app.move_in_date">Move-in: {{ formatDate(app.move_in_date) }}</span>
                <span>Applied: {{ formatDate(app.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonSpinner, IonChip, IonBadge
} from '@ionic/vue';
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

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    reviewing: 'primary',
    approved: 'success',
    rejected: 'danger'
  };
  return colors[status] || 'medium';
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

const fetchApplications = async () => {
  loading.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data } = await supabase
      .from('applications')
      .select(`
        *,
        property:properties!inner(*)
      `)
      .eq('property.landlord_id', user.id)
      .order('created_at', { ascending: false });
    
    applications.value = data || [];
  }
  
  loading.value = false;
};

const viewApplication = (id: string) => {
  router.push(`/landlord/applications/${id}`);
};

onMounted(() => {
  fetchApplications();
});
</script>
