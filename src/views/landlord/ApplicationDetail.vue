<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/landlord/applications"></ion-back-button>
        </ion-buttons>
        <ion-title>Application Details</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openMessageModal">
            <ion-icon slot="icon-only" :icon="chatbubbleOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="loading" class="flex justify-center mt-10">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="application" class="max-w-4xl mx-auto">
        <!-- Status and Actions -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h2 class="text-2xl font-bold">{{ application.full_name }}</h2>
              <p class="text-gray-600">Applied {{ formatDate(application.created_at) }}</p>
            </div>
            <ion-badge :color="getStatusColor(application.status)" class="text-lg px-4 py-2">
              {{ application.status }}
            </ion-badge>
          </div>

          <div class="flex gap-3 mt-4">
            <ion-button 
              expand="block" 
              color="success" 
              class="flex-1"
              @click="updateStatus('approved')"
              :disabled="application.status === 'approved'"
            >
              Approve
            </ion-button>
            <ion-button 
              expand="block" 
              color="primary" 
              class="flex-1"
              @click="updateStatus('reviewing')"
              :disabled="application.status === 'reviewing'"
            >
              Review
            </ion-button>
            <ion-button 
              expand="block" 
              color="danger" 
              class="flex-1"
              @click="updateStatus('rejected')"
              :disabled="application.status === 'rejected'"
            >
              Reject
            </ion-button>
          </div>
        </div>

        <!-- Property Info -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h3 class="text-xl font-bold mb-4">Property</h3>
          <div class="flex gap-4">
            <img 
              :src="application.property?.image_urls?.[0] || 'https://via.placeholder.com/150'" 
              class="w-24 h-24 object-cover rounded-lg"
            />
            <div>
              <h4 class="font-bold">{{ application.property?.title }}</h4>
              <p class="text-gray-600 text-sm">{{ application.property?.address }}</p>
              <p class="text-green-600 font-bold mt-1">${{ application.property?.price }}/mo</p>
            </div>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h3 class="text-xl font-bold mb-4">Personal Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Email</p>
              <p class="font-medium">{{ application.email }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Phone</p>
              <p class="font-medium">{{ application.phone }}</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-sm text-gray-500">Current Address</p>
              <p class="font-medium">{{ application.current_address || 'Not provided' }}</p>
            </div>
          </div>
        </div>

        <!-- Employment Information -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h3 class="text-xl font-bold mb-4">Employment Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Employer</p>
              <p class="font-medium">{{ application.employer_name || 'Not provided' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Job Title</p>
              <p class="font-medium">{{ application.job_title || 'Not provided' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Employment Duration</p>
              <p class="font-medium">{{ application.employment_duration || 'Not provided' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Monthly Income</p>
              <p class="font-medium">${{ application.monthly_income || 'Not provided' }}</p>
            </div>
          </div>
        </div>

        <!-- Reference -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h3 class="text-xl font-bold mb-4">Reference</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Name</p>
              <p class="font-medium">{{ application.reference_name || 'Not provided' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Phone</p>
              <p class="font-medium">{{ application.reference_phone || 'Not provided' }}</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-sm text-gray-500">Relationship</p>
              <p class="font-medium">{{ application.reference_relationship || 'Not provided' }}</p>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h3 class="text-xl font-bold mb-4">Additional Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Desired Move-in Date</p>
              <p class="font-medium">{{ formatDate(application.move_in_date) || 'Not provided' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Number of Occupants</p>
              <p class="font-medium">{{ application.number_of_occupants || 'Not provided' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Pets</p>
              <p class="font-medium">{{ application.has_pets ? 'Yes' : 'No' }}</p>
            </div>
            <div v-if="application.has_pets">
              <p class="text-sm text-gray-500">Pet Details</p>
              <p class="font-medium">{{ application.pet_details || 'Not provided' }}</p>
            </div>
            <div class="md:col-span-2" v-if="application.additional_notes">
              <p class="text-sm text-gray-500">Additional Notes</p>
              <p class="font-medium">{{ application.additional_notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonSpinner, IonBadge, toastController
} from '@ionic/vue';
import { chatbubbleOutline } from 'ionicons/icons';
import { supabase } from '@/services/supabaseClient';

const route = useRoute();
const router = useRouter();
const application = ref<any>(null);
const loading = ref(true);

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

const fetchApplication = async () => {
  loading.value = true;
  const applicationId = route.params.id as string;
  
  const { data } = await supabase
    .from('applications')
    .select(`
      *,
      property:properties(*)
    `)
    .eq('id', applicationId)
    .single();
  
  application.value = data;
  loading.value = false;
};

const updateStatus = async (newStatus: string) => {
  const { error } = await supabase
    .from('applications')
    .update({ status: newStatus })
    .eq('id', application.value.id);
  
  if (!error) {
    application.value.status = newStatus;
    const toast = await toastController.create({
      message: `Application ${newStatus}`,
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }
};

const openMessageModal = () => {
  router.push(`/messages/${application.value.tenant_id}`);
};

onMounted(() => {
  fetchApplication();
});
</script>
