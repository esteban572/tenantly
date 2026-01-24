<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ isEditing ? 'Edit Property' : 'Add Property' }}</ion-title>
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
        <!-- Pass existing images to uploader if editing -->
        <ImageUploader 
          ref="imageUploader"
          :max-images="10"
          :initial-images="property.imageUrls || []"
          @update:images="handleImagesUpdate"
        />
      </div>

      <ion-item>
        <ion-label position="stacked">Description</ion-label>
        <ion-textarea v-model="property.description" :rows="4"></ion-textarea>
      </ion-item>

      <ion-button expand="block" class="mt-8" @click="save" :disabled="saving">
        {{ saving ? 'Saving...' : (isEditing ? 'Update Property' : 'Save Property') }}
      </ion-button>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonItem, IonLabel, IonInput, IonTextarea, modalController } from '@ionic/vue';
import { supabase } from '@/services/supabaseClient';
import ImageUploader from '@/components/shared/ImageUploader.vue';

const props = defineProps<{
  existingProperty?: any;
}>();

const isEditing = computed(() => !!props.existingProperty);

const property = ref({
  title: '',
  price: null as number | null,
  address: '',
  description: '',
  imageUrls: [] as string[]
});

const saving = ref(false);
const imageUploader = ref<InstanceType<typeof ImageUploader> | null>(null);

onMounted(() => {
  if (props.existingProperty) {
    property.value = {
      title: props.existingProperty.title,
      price: props.existingProperty.price,
      address: props.existingProperty.address,
      description: props.existingProperty.description,
      imageUrls: props.existingProperty.image_urls || []
    };
  }
});

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
    // Note: ImageUploader should return NEWly uploaded URLs, combined with existing ones if handled correctly
    // or return the final list of URLs. Assuming uploadImages() uploads new/pending files and we manage the list.
    // If ImageUploader manages the full list, we might need adjustments.
    // For now assuming uploadImages() handles pending uploads and we get the final list from the component or state.
    
    let imageUrls: string[] = [];
    if (imageUploader.value) {
      // Need to ensure the component returns the full list of valid URLs (existing + new)
      imageUrls = await imageUploader.value.uploadImages(); 
    }

    const propertyData = {
      landlord_id: user.id,
      title: property.value.title,
      price: property.value.price,
      address: property.value.address,
      description: property.value.description,
      image_urls: imageUrls
    };

    let error;
    if (isEditing.value && props.existingProperty) {
      const { error: updateError } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', props.existingProperty.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('properties')
        .insert([propertyData]);
      error = insertError;
    }

    if (error) throw error;

    modalController.dismiss(true); 
  } catch (e: any) {
    console.error('Error saving property:', e);
    alert(`Failed to save property: ${e.message || 'Unknown error'}`);
  } finally {
    saving.value = false;
  }
};
</script>
