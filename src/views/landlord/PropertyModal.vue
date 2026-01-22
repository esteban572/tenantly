<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Add Property</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="dismiss">Close</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <div class="space-y-4">
      <ion-item>
        <ion-label position="stacked">Title</ion-label>
        <ion-input v-model="property.title" placeholder="e.g. Modern Apartment"></ion-input>
      </ion-item>
      
      <ion-item>
        <ion-label position="stacked">Price ($/mo)</ion-label>
        <ion-input v-model="property.price" type="number" placeholder="2000"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Address</ion-label>
        <ion-input v-model="property.address" placeholder="123 Main St"></ion-input>
      </ion-item>

      <div class="my-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Property Images</label>
        <ImageUploader 
          ref="imageUploader"
          :max-images="10"
          @update:images="handleImagesUpdate"
        />
      </div>

      <ion-item>
        <ion-label position="stacked">Description</ion-label>
        <ion-textarea v-model="property.description" :rows="4"></ion-textarea>
      </ion-item>

      <ion-button expand="block" class="mt-8" @click="save" :disabled="saving">
        {{ saving ? 'Saving...' : 'Save Property' }}
      </ion-button>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonItem, IonLabel, IonInput, IonTextarea, modalController } from '@ionic/vue';
import { supabase } from '@/services/supabaseClient';
import ImageUploader from '@/components/shared/ImageUploader.vue';

const property = ref({
  title: '',
  price: null,
  address: '',
  description: '',
  imageUrls: [] as string[]
});

const saving = ref(false);
const imageUploader = ref<InstanceType<typeof ImageUploader> | null>(null);

const handleImagesUpdate = (urls: string[]) => {
  property.value.imageUrls = urls;
};

const dismiss = () => {
  modalController.dismiss();
};

const save = async () => {
  try {
    saving.value = true;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    // Upload images first
    let imageUrls: string[] = [];
    if (imageUploader.value) {
      imageUrls = await imageUploader.value.uploadImages();
    }

    const { error } = await supabase.from('properties').insert([{
      landlord_id: user.id,
      title: property.value.title,
      price: property.value.price,
      address: property.value.address,
      description: property.value.description,
      image_urls: imageUrls
    }]);

    if (error) throw error;

    modalController.dismiss(true); // Dismiss with 'true' to indicate success
  } catch (e) {
    console.error(e);
    alert('Failed to save property');
  } finally {
    saving.value = false;
  }
};
</script>
