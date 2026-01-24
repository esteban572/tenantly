<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Find a Home</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding bg-gray-50">
      <div v-if="propertyStore.loading" class="flex justify-center mt-8">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="propertyStore.properties.length === 0" class="text-center mt-8 text-gray-500">
        <p>No properties available at the moment.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ion-card v-for="property in propertyStore.properties" :key="property.id" class="m-0 shadow-lg rounded-xl overflow-hidden flex flex-col h-full">
           <div class="h-48 w-full bg-gray-200 relative">
              <img 
                :src="property.image_urls?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'" 
                alt="Property Image" 
                class="w-full h-full object-cover"
              />
              <div class="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-bold">
                 ${{ property.price }}/mo
              </div>
           </div>
           
           <ion-card-header>
             <ion-card-subtitle>{{ property.address }}</ion-card-subtitle>
             <ion-card-title class="text-xl">{{ property.title }}</ion-card-title>
           </ion-card-header>

           <ion-card-content class="flex-grow">
             <p class="line-clamp-3">{{ property.description }}</p>
           </ion-card-content>

           <div class="p-4 border-t pt-2">
             <ion-button expand="block" :router-link="`/property/${property.id}/apply`">
               View Details & Apply
             </ion-button>
           </div>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
  IonButton, IonSpinner 
} from '@ionic/vue';
import { usePropertyStore } from '@/stores/propertyStore';

const propertyStore = usePropertyStore();

onMounted(() => {
  propertyStore.fetchAllProperties();
});
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
