<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tenant/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Apply for Property</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="max-w-3xl mx-auto">
        <!-- Property Summary -->
        <div v-if="property" class="bg-white rounded-lg shadow p-4 mb-6">
          <div class="flex gap-4">
            <img 
              :src="property.image_urls?.[0] || 'https://via.placeholder.com/150'" 
              class="w-24 h-24 object-cover rounded-lg"
            />
            <div>
              <h2 class="font-bold text-lg">{{ property.title }}</h2>
              <p class="text-gray-600 text-sm">{{ property.address }}</p>
              <p class="text-green-600 font-bold mt-1">${{ property.price }}/mo</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="submitApplication">
          <!-- Personal Information -->
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h3 class="text-xl font-bold mb-4">Personal Information</h3>
            
            <ion-item class="mb-4">
              <ion-label position="stacked">Full Name *</ion-label>
              <ion-input v-model="application.full_name" required placeholder="John Doe"></ion-input>
            </ion-item>

            <ion-item class="mb-4">
              <ion-label position="stacked">Email *</ion-label>
              <ion-input v-model="application.email" type="email" required placeholder="john@example.com"></ion-input>
            </ion-item>

            <ion-item class="mb-4">
              <ion-label position="stacked">Phone *</ion-label>
              <ion-input v-model="application.phone" type="tel" required placeholder="(555) 123-4567"></ion-input>
            </ion-item>

            <ion-item class="mb-4">
              <ion-label position="stacked">Current Address</ion-label>
              <ion-textarea v-model="application.current_address" :rows="2" placeholder="123 Current St, City, State"></ion-textarea>
            </ion-item>
          </div>

          <!-- Employment Information -->
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h3 class="text-xl font-bold mb-4">Employment Information</h3>
            
            <ion-item class="mb-4">
              <ion-label position="stacked">Employer Name</ion-label>
              <ion-input v-model="application.employer_name" placeholder="ABC Company"></ion-input>
            </ion-item>

            <ion-item class="mb-4">
              <ion-label position="stacked">Job Title</ion-label>
              <ion-input v-model="application.job_title" placeholder="Software Engineer"></ion-input>
            </ion-item>

            <ion-item class="mb-4">
              <ion-label position="stacked">Employment Duration</ion-label>
              <ion-input v-model="application.employment_duration" placeholder="2 years"></ion-input>
            </ion-item>

            <ion-item class="mb-4">
              <ion-label position="stacked">Monthly Income ($)</ion-label>
              <ion-input v-model="application.monthly_income" type="number" placeholder="5000"></ion-input>
            </ion-item>
          </div>

          <!-- References -->
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h3 class="text-xl font-bold mb-4">Reference</h3>
            
            <ion-item class="mb-4">
              <ion-label position="stacked">Reference Name</ion-label>
              <ion-input v-model="application.reference_name" placeholder="Jane Smith"></ion-input>
            </ion-item>

            <ion-item class="mb-4">
              <ion-label position="stacked">Reference Phone</ion-label>
              <ion-input v-model="application.reference_phone" type="tel" placeholder="(555) 987-6543"></ion-input>
            </ion-item>

            <ion-item class="mb-4">
              <ion-label position="stacked">Relationship</ion-label>
              <ion-input v-model="application.reference_relationship" placeholder="Former Landlord"></ion-input>
            </ion-item>
          </div>

          <!-- Additional Information -->
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h3 class="text-xl font-bold mb-4">Additional Information</h3>
            
            <ion-item class="mb-4">
              <ion-label position="stacked">Desired Move-in Date</ion-label>
              <ion-input v-model="application.move_in_date" type="date"></ion-input>
            </ion-item>

            <ion-item class="mb-4">
              <ion-label position="stacked">Number of Occupants</ion-label>
              <ion-input v-model="application.number_of_occupants" type="number" placeholder="2"></ion-input>
            </ion-item>

            <ion-item class="mb-4">
              <ion-label>Do you have pets?</ion-label>
              <ion-checkbox slot="start" v-model="application.has_pets"></ion-checkbox>
            </ion-item>

            <ion-item v-if="application.has_pets" class="mb-4">
              <ion-label position="stacked">Pet Details</ion-label>
              <ion-textarea v-model="application.pet_details" :rows="2" placeholder="1 dog, medium size, house trained"></ion-textarea>
            </ion-item>

            <ion-item class="mb-4">
              <ion-label position="stacked">Additional Notes</ion-label>
              <ion-textarea v-model="application.additional_notes" :rows="3" placeholder="Any additional information you'd like to share..."></ion-textarea>
            </ion-item>
          </div>

          <!-- Document Upload -->
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h3 class="text-xl font-bold mb-4">Supporting Documents</h3>
            <p class="text-sm text-gray-600 mb-4">Upload relevant documents (ID, pay stubs, references, etc.)</p>
            <DocumentUploader 
              ref="documentUploader"
              :max-files="5"
              @update:documents="handleDocumentsUpdate"
            />
          </div>

          <!-- Submit Button -->
          <ion-button 
            expand="block" 
            type="submit" 
            size="large"
            :disabled="submitting"
            class="mb-8"
          >
            {{ submitting ? 'Submitting...' : 'Submit Application' }}
          </ion-button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonItem, IonLabel, IonInput, IonTextarea, IonCheckbox, IonButton, toastController
} from '@ionic/vue';
import { supabase } from '@/services/supabaseClient';
import DocumentUploader from '@/components/shared/DocumentUploader.vue';

const route = useRoute();
const router = useRouter();

const property = ref<any>(null);
const application = ref({
  full_name: '',
  email: '',
  phone: '',
  current_address: '',
  employer_name: '',
  job_title: '',
  employment_duration: '',
  monthly_income: null as number | null,
  reference_name: '',
  reference_phone: '',
  reference_relationship: '',
  move_in_date: '',
  number_of_occupants: null as number | null,
  has_pets: false,
  pet_details: '',
  additional_notes: ''
});

const submitting = ref(false);
const documentUploader = ref<InstanceType<typeof DocumentUploader> | null>(null);
const uploadedDocuments = ref<string[]>([]);

const handleDocumentsUpdate = (docs: string[]) => {
  uploadedDocuments.value = docs;
};

const fetchProperty = async () => {
  const propertyId = route.params.id as string;
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();
  property.value = data;
};

const submitApplication = async () => {
  try {
    submitting.value = true;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Upload documents if any
    if (documentUploader.value) {
      await documentUploader.value.uploadDocuments();
    }

    const { error } = await supabase.from('applications').insert([{
      property_id: route.params.id,
      tenant_id: user.id,
      ...application.value
    }]);

    if (error) throw error;

    const toast = await toastController.create({
      message: 'Application submitted successfully!',
      duration: 3000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    router.push('/tenant/dashboard');
  } catch (error) {
    console.error('Error submitting application:', error);
    const toast = await toastController.create({
      message: 'Failed to submit application. Please try again.',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  await fetchProperty();
  
  // Pre-fill user info if available
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      application.value.full_name = profile.full_name || '';
      application.value.email = user.email || '';
    }
  }
});
</script>
