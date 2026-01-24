<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>My Properties</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openAddPropertyModal">
            <ion-icon :icon="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="propertyStore.loading" class="flex justify-center mt-8">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="propertyStore.properties.length === 0" class="text-center mt-8 text-gray-500">
        <p>No properties found.</p>
        <ion-button class="mt-4" @click="openAddPropertyModal">Add Your First Property</ion-button>
      </div>

      <ion-list v-else>
        <ion-item-sliding v-for="property in propertyStore.properties" :key="property.id">
          <ion-item>
            <ion-thumbnail slot="start">
              <img :src="property.image_urls?.[0] || 'https://via.placeholder.com/150'" alt="Property Image" class="object-cover rounded" />
            </ion-thumbnail>
            <ion-label>
              <h2>{{ property.title }}</h2>
              <p>{{ property.address }}</p>
              <p class="text-green-600 font-semibold">${{ property.price }}/mo</p>
            </ion-label>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="danger" @click="confirmDelete(property.id)">
              <ion-icon slot="icon-only" :icon="trash"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, 
  IonList, IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonLabel, IonThumbnail, IonSpinner,
  modalController, alertController 
} from '@ionic/vue';
import { add, trash } from 'ionicons/icons';
import { usePropertyStore } from '@/stores/propertyStore';
import PropertyModal from '@/views/landlord/PropertyModal.vue';

const propertyStore = usePropertyStore();

onMounted(() => {
  propertyStore.fetchMyProperties();
});

const openAddPropertyModal = async () => {
  const modal = await modalController.create({
    component: PropertyModal
  });

  modal.onDidDismiss().then((data) => {
    if (data.data === true) {
      propertyStore.fetchMyProperties();
    }
  });

  await modal.present();
};

const confirmDelete = async (id: string) => {
  const alert = await alertController.create({
    header: 'Confirm Delete',
    message: 'Are you sure you want to delete this property?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          await propertyStore.deleteProperty(id);
        }
      }
    ]
  });

  await alert.present();
};
</script>
