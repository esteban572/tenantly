<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Sign Document</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="dismiss">Close</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <div class="max-w-2xl mx-auto">
      <!-- Document Preview -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 class="font-bold text-lg mb-2">{{ document?.file_name }}</h3>
        <p class="text-sm text-gray-600">{{ document?.description || 'No description' }}</p>
        <p class="text-xs text-gray-500 mt-2">Category: {{ document?.category }}</p>
      </div>

      <!-- Agreement Text -->
      <div class="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h4 class="font-semibold mb-3">Agreement</h4>
        <p class="text-sm text-gray-700 mb-4">
          By signing below, I acknowledge that I have read and agree to the terms outlined in this document.
          I understand that this electronic signature is legally binding and has the same effect as a handwritten signature.
        </p>
        
        <div class="flex items-start gap-2 mb-4">
          <ion-checkbox v-model="agreedToTerms"></ion-checkbox>
          <label class="text-sm text-gray-700">
            I agree to the terms and conditions and authorize the use of my electronic signature
          </label>
        </div>
      </div>

      <!-- Signature Pad -->
      <div class="mb-6">
        <h4 class="font-semibold mb-3">Your Signature</h4>
        <SignatureCanvas ref="signatureCanvas" />
      </div>

      <!-- Signer Information -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 class="font-semibold mb-3">Signer Information</h4>
        <div class="space-y-2 text-sm">
          <p><span class="text-gray-600">Name:</span> <span class="font-medium">{{ signerName }}</span></p>
          <p><span class="text-gray-600">Date:</span> <span class="font-medium">{{ currentDate }}</span></p>
          <p><span class="text-gray-600">IP Address:</span> <span class="font-medium">{{ ipAddress || 'Detecting...' }}</span></p>
        </div>
      </div>

      <!-- Submit Button -->
      <ion-button 
        expand="block" 
        size="large"
        @click="submitSignature"
        :disabled="!canSubmit || submitting"
      >
        {{ submitting ? 'Submitting...' : 'Sign Document' }}
      </ion-button>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonCheckbox, modalController, toastController
} from '@ionic/vue';
import { supabase } from '@/services/supabaseClient';
import SignatureCanvas from './SignatureCanvas.vue';

const props = defineProps<{
  document: any;
  signerName: string;
}>();

const signatureCanvas = ref<InstanceType<typeof SignatureCanvas> | null>(null);
const agreedToTerms = ref(false);
const submitting = ref(false);
const ipAddress = ref('');

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const canSubmit = computed(() => {
  return agreedToTerms.value && signatureCanvas.value && !signatureCanvas.value.isEmpty();
});

const fetchIpAddress = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    ipAddress.value = data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    ipAddress.value = 'Unknown';
  }
};

const submitSignature = async () => {
  if (!signatureCanvas.value || signatureCanvas.value.isEmpty()) {
    const toast = await toastController.create({
      message: 'Please provide your signature',
      duration: 2000,
      color: 'warning',
      position: 'bottom'
    });
    await toast.present();
    return;
  }

  if (!agreedToTerms.value) {
    const toast = await toastController.create({
      message: 'Please agree to the terms',
      duration: 2000,
      color: 'warning',
      position: 'bottom'
    });
    await toast.present();
    return;
  }

  try {
    submitting.value = true;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const signatureData = signatureCanvas.value.getSignatureData();
    
    const { error } = await supabase.from('signatures').insert([{
      document_id: props.document.id,
      signer_id: user.id,
      signature_data: signatureData,
      ip_address: ipAddress.value,
      user_agent: navigator.userAgent
    }]);

    if (error) throw error;

    const toast = await toastController.create({
      message: 'Document signed successfully!',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    modalController.dismiss({ signed: true });
  } catch (error) {
    console.error('Error signing document:', error);
    const toast = await toastController.create({
      message: 'Failed to sign document. Please try again.',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  } finally {
    submitting.value = false;
  }
};

const dismiss = () => {
  modalController.dismiss();
};

onMounted(() => {
  fetchIpAddress();
});
</script>
