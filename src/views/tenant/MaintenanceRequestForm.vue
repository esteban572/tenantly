<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tenant/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>New Maintenance Request</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="loading" class="flex justify-center mt-10">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else class="space-y-4 max-w-md mx-auto">
        
        <!-- Property Selector (if tenant has multiple tenancies, or just one) -->
        <!-- For MVP, let's assume we fetch tenancies or allow them to select if needed. -->
        <!-- Or, if we haven't implemented tenancies fully yet, maybe just show a list of all properties? 
             But strictly, they should only request for where they live. 
             If 'tenancies' table exists (it does), we should fetch active tenancies. -->
        
        <ion-item>
            <ion-label position="stacked">Property</ion-label>
            <ion-select v-model="formData.propertyId" placeholder="Select Property">
                <ion-select-option v-for="t in activeTenancies" :key="t.property_id" :value="t.property_id">
                    {{ t.properties.title }} - {{ t.properties.address }}
                </ion-select-option>
            </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Issue Title</ion-label>
          <ion-input v-model="formData.title" placeholder="e.g. Leaky Faucet"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Description</ion-label>
          <ion-textarea v-model="formData.description" :rows="4" placeholder="Describe the issue in detail..."></ion-textarea>
        </ion-item>

        <div class="my-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Photo (Optional)</label>
          <ImageUploader 
            ref="imageUploader"
            :max-images="1"
            @update:images="handleImageUpdate"
          />
        </div>

        <ion-button expand="block" class="mt-8" @click="submit" :disabled="submitting || !isValid">
          {{ submitting ? 'Submitting...' : 'Submit Request' }}
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonSpinner, toastController } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/services/supabaseClient';
import { useMaintenanceStore } from '@/stores/maintenanceStore';
import ImageUploader from '@/components/shared/ImageUploader.vue';

const router = useRouter();
const maintenanceStore = useMaintenanceStore();

const loading = ref(true);
const submitting = ref(false);
const activeTenancies = ref<any[]>([]);
const imageUploader = ref<InstanceType<typeof ImageUploader> | null>(null);

const formData = ref({
    propertyId: '',
    title: '',
    description: '',
    photos: [] as string[]
});

const isValid = computed(() => {
    return formData.value.propertyId && formData.value.title && formData.value.description;
});

const handleImageUpdate = (urls: string[]) => {
    formData.value.photos = urls;
};

// Fetch tenancies so we know which property they are renting
const fetchTenancies = async () => {
    loading.value = true;
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Join with properties to get details
            const { data, error } = await supabase
                .from('tenancies')
                .select(`
                    property_id,
                    properties (title, address)
                `)
                .eq('tenant_id', user.id)
                //.eq('status', 'active') // Uncomment if we only want active ones, but for dev maybe pending is ok?
                // Let's assume 'active' or 'pending' is fine for now, or just all.
                ;
            
            if (error) throw error;
            activeTenancies.value = data || [];
            
            // Auto-select if only one
            if (activeTenancies.value.length === 1) {
                formData.value.propertyId = activeTenancies.value[0].property_id;
            }
        }
    } catch (error) {
        console.error('Error fetching tenancies:', error);
    } finally {
        loading.value = false;
    }
};

const submit = async () => {
    try {
        submitting.value = true;
        
        let photoUrl = undefined;
        // Upload image if present
        if (imageUploader.value) {
            const uploadedUrls = await imageUploader.value.uploadImages();
            if (uploadedUrls.length > 0) {
                photoUrl = uploadedUrls[0];
            }
        }

        await maintenanceStore.createRequest({
            property_id: formData.value.propertyId,
            title: formData.value.title,
            description: formData.value.description,
            photo_url: photoUrl
        });

        const toast = await toastController.create({
            message: 'Request submitted successfully',
            duration: 2000,
            color: 'success',
            position: 'top'
        });
        await toast.present();
        
        router.back();

    } catch (error: any) {
        const toast = await toastController.create({
            message: error.message || 'Failed to submit request',
            duration: 3000,
            color: 'danger',
            position: 'top'
        });
        await toast.present();
    } finally {
        submitting.value = false;
    }
};

onMounted(() => {
    fetchTenancies();
});
</script>
