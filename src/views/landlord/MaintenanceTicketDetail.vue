<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/landlord/maintenance"></ion-back-button>
        </ion-buttons>
        <ion-title>Ticket #{{ id?.slice(0, 8) }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="confirmDelete" color="danger">
            <ion-icon :icon="trashOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <ion-spinner></ion-spinner>
      </div>

      <template v-else-if="ticket">
        <!-- Header Card -->
        <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div class="flex items-start justify-between mb-3">
            <div>
              <ion-badge :color="getPriorityColor(ticket.priority || ticket.ai_priority)" class="mb-2">
                {{ (ticket.priority || ticket.ai_priority || 'UNSET').toUpperCase() }} PRIORITY
              </ion-badge>
              <h1 class="text-xl font-bold text-gray-800">{{ ticket.title }}</h1>
              <p class="text-sm text-gray-500">{{ ticket.properties?.address }}</p>
            </div>
            <ion-badge :color="getStatusColor(ticket.status)" class="text-sm">
              {{ formatStatus(ticket.status) }}
            </ion-badge>
          </div>

          <!-- Tenant Info -->
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <ion-icon :icon="personOutline" class="text-indigo-600"></ion-icon>
            </div>
            <div>
              <p class="font-semibold text-gray-800">{{ ticket.profiles?.full_name || 'Tenant' }}</p>
              <p class="text-xs text-gray-500">Submitted {{ formatDate(ticket.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Photo -->
        <div v-if="ticket.photo_url" class="mb-4">
          <img :src="ticket.photo_url" :alt="ticket.title" class="w-full h-48 object-cover rounded-xl shadow-sm" />
        </div>

        <!-- Description -->
        <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 class="font-semibold text-gray-700 mb-2">Description</h3>
          <p class="text-gray-600">{{ ticket.description }}</p>
        </div>

        <!-- AI Triage -->
        <div v-if="ticket.ai_summary || ticket.ai_suggested_category" class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
          <div class="flex items-center gap-2 mb-2">
            <ion-icon :icon="sparklesOutline" class="text-blue-600"></ion-icon>
            <h3 class="font-semibold text-blue-800">AI Triage Analysis</h3>
          </div>
          <p v-if="ticket.ai_summary" class="text-blue-700 mb-2">{{ ticket.ai_summary }}</p>
          <div class="flex gap-2">
            <ion-badge v-if="ticket.ai_suggested_category" color="light">{{ ticket.ai_suggested_category }}</ion-badge>
            <ion-badge v-if="ticket.ai_priority" :color="getPriorityColor(ticket.ai_priority)">AI: {{ ticket.ai_priority }}</ion-badge>
          </div>
        </div>

        <!-- Status Actions -->
        <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 class="font-semibold text-gray-700 mb-3">Update Status</h3>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="status in statusOptions"
              :key="status.value"
              @click="updateStatus(status.value)"
              :class="[
                'p-3 rounded-xl text-sm font-medium transition-all',
                ticket.status === status.value
                  ? status.activeClass
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
              :disabled="saving"
            >
              {{ status.label }}
            </button>
          </div>
        </div>

        <!-- Priority Override -->
        <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 class="font-semibold text-gray-700 mb-3">Set Priority</h3>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="priority in priorityOptions"
              :key="priority.value"
              @click="updatePriority(priority.value)"
              :class="[
                'p-2 rounded-lg text-xs font-bold transition-all',
                ticket.priority === priority.value
                  ? priority.activeClass
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
              :disabled="saving"
            >
              {{ priority.label }}
            </button>
          </div>
        </div>

        <!-- Worker Assignment -->
        <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 class="font-semibold text-gray-700 mb-3">
            <ion-icon :icon="buildOutline" class="mr-1"></ion-icon>
            Assign Worker
          </h3>
          
          <div class="space-y-3">
            <div>
              <label class="text-xs text-gray-500 mb-1 block">Worker Name</label>
              <ion-input
                v-model="workerForm.name"
                placeholder="e.g. John's Plumbing"
                class="border rounded-lg"
              ></ion-input>
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">Phone Number</label>
              <ion-input
                v-model="workerForm.phone"
                type="tel"
                placeholder="(555) 123-4567"
                class="border rounded-lg"
              ></ion-input>
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">Scheduled Date</label>
              <ion-input
                v-model="workerForm.date"
                type="date"
                class="border rounded-lg"
              ></ion-input>
            </div>
            <ion-button expand="block" @click="saveWorkerAssignment" :disabled="saving || !workerForm.name">
              <ion-icon :icon="saveOutline" slot="start"></ion-icon>
              {{ ticket.assigned_worker_name ? 'Update Assignment' : 'Assign Worker' }}
            </ion-button>
          </div>
        </div>

        <!-- Notes -->
        <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 class="font-semibold text-gray-700 mb-3">
            <ion-icon :icon="documentTextOutline" class="mr-1"></ion-icon>
            Internal Notes
          </h3>
          <ion-textarea
            v-model="notes"
            placeholder="Add private notes about this ticket..."
            :rows="3"
            class="border rounded-lg"
          ></ion-textarea>
          <ion-button expand="block" fill="outline" class="mt-2" @click="saveNotes" :disabled="saving">
            Save Notes
          </ion-button>
        </div>

        <!-- Timeline -->
        <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 class="font-semibold text-gray-700 mb-3">Timeline</h3>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <p class="text-sm font-medium text-gray-700">Ticket Created</p>
                <p class="text-xs text-gray-500">{{ formatDateTime(ticket.created_at) }}</p>
              </div>
            </div>
            <div v-if="ticket.viewed_at" class="flex items-start gap-3">
              <div class="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <p class="text-sm font-medium text-gray-700">Viewed by Landlord</p>
                <p class="text-xs text-gray-500">{{ formatDateTime(ticket.viewed_at) }}</p>
              </div>
            </div>
            <div v-if="ticket.assigned_at" class="flex items-start gap-3">
              <div class="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <div>
                <p class="text-sm font-medium text-gray-700">Worker Assigned: {{ ticket.assigned_worker_name }}</p>
                <p class="text-xs text-gray-500">{{ formatDateTime(ticket.assigned_at) }}</p>
              </div>
            </div>
            <div v-if="ticket.scheduled_date" class="flex items-start gap-3">
              <div class="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
              <div>
                <p class="text-sm font-medium text-gray-700">Scheduled for {{ formatDate(ticket.scheduled_date) }}</p>
              </div>
            </div>
            <div v-if="ticket.completed_at" class="flex items-start gap-3">
              <div class="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
              <div>
                <p class="text-sm font-medium text-gray-700">Completed</p>
                <p class="text-xs text-gray-500">{{ formatDateTime(ticket.completed_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonSpinner, IonIcon, IonBadge, IonInput, IonTextarea, alertController
} from '@ionic/vue';
import { 
  trashOutline, personOutline, sparklesOutline, buildOutline, 
  saveOutline, documentTextOutline 
} from 'ionicons/icons';
import { supabase } from '@/services/supabaseClient';

const route = useRoute();
const router = useRouter();
const id = ref(route.params.id as string);
const ticket = ref<any>(null);
const loading = ref(true);
const saving = ref(false);
const notes = ref('');

const workerForm = reactive({
  name: '',
  phone: '',
  date: ''
});

const statusOptions = [
  { value: 'pending', label: 'Pending', activeClass: 'bg-yellow-500 text-white' },
  { value: 'in_progress', label: 'In Progress', activeClass: 'bg-blue-500 text-white' },
  { value: 'completed', label: 'Completed', activeClass: 'bg-green-500 text-white' },
  { value: 'cancelled', label: 'Cancelled', activeClass: 'bg-gray-500 text-white' }
];

const priorityOptions = [
  { value: 'emergency', label: '🚨 Emergency', activeClass: 'bg-red-600 text-white' },
  { value: 'high', label: 'High', activeClass: 'bg-orange-500 text-white' },
  { value: 'medium', label: 'Medium', activeClass: 'bg-blue-500 text-white' },
  { value: 'low', label: 'Low', activeClass: 'bg-green-500 text-white' }
];

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric' 
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
};

const fetchTicket = async () => {
  loading.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    router.push('/login');
    return;
  }

  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      properties!inner(id, address, landlord_id),
      profiles!maintenance_requests_tenant_id_fkey(full_name)
    `)
    .eq('id', id.value)
    .single();

  if (error) {
    console.error('Error fetching ticket:', error);
    loading.value = false;
    return;
  }

  ticket.value = data;
  notes.value = data.notes || '';
  workerForm.name = data.assigned_worker_name || '';
  workerForm.phone = data.assigned_worker_phone || '';
  workerForm.date = data.scheduled_date || '';

  // Mark as viewed if not already
  if (!data.viewed_at) {
    await supabase
      .from('maintenance_requests')
      .update({ viewed_at: new Date().toISOString(), viewed_by: user.id })
      .eq('id', id.value);
    
    ticket.value.viewed_at = new Date().toISOString();
  }

  loading.value = false;
};

const updateStatus = async (status: string) => {
  saving.value = true;
  const updates: any = { status };
  
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('maintenance_requests')
    .update(updates)
    .eq('id', id.value);

  if (!error) {
    ticket.value.status = status;
    if (status === 'completed') {
      ticket.value.completed_at = updates.completed_at;
    }
  }
  saving.value = false;
};

const updatePriority = async (priority: string) => {
  saving.value = true;
  const { error } = await supabase
    .from('maintenance_requests')
    .update({ priority })
    .eq('id', id.value);

  if (!error) {
    ticket.value.priority = priority;
  }
  saving.value = false;
};

const saveWorkerAssignment = async () => {
  saving.value = true;
  const { error } = await supabase
    .from('maintenance_requests')
    .update({
      assigned_worker_name: workerForm.name,
      assigned_worker_phone: workerForm.phone,
      scheduled_date: workerForm.date || null,
      assigned_at: new Date().toISOString()
    })
    .eq('id', id.value);

  if (!error) {
    ticket.value.assigned_worker_name = workerForm.name;
    ticket.value.assigned_worker_phone = workerForm.phone;
    ticket.value.scheduled_date = workerForm.date;
    ticket.value.assigned_at = new Date().toISOString();
  }
  saving.value = false;
};

const saveNotes = async () => {
  saving.value = true;
  const { error } = await supabase
    .from('maintenance_requests')
    .update({ notes: notes.value })
    .eq('id', id.value);

  if (!error) {
    ticket.value.notes = notes.value;
  }
  saving.value = false;
};

const confirmDelete = async () => {
  const alert = await alertController.create({
    header: 'Delete Ticket',
    message: 'Are you sure you want to delete this maintenance ticket? This cannot be undone.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          await supabase.from('maintenance_requests').delete().eq('id', id.value);
          router.push('/landlord/maintenance');
        }
      }
    ]
  });
  await alert.present();
};

onMounted(() => {
  fetchTicket();
});
</script>

<style scoped>
ion-content {
  --background: #f4f5f8;
}
</style>
