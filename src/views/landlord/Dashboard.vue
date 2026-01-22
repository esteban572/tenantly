<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>My Properties</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/messages">
             <ion-icon slot="icon-only" :icon="chatbubbleOutline"></ion-icon>
          </ion-button>
          <ion-button @click="logout">Logout</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <WelcomeBanner 
        v-if="userProfile"
        :user-name="userProfile.full_name || 'Landlord'"
        subtitle="Manage your properties and connect with tenants"
        :stats="dashboardStats"
      />

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <ion-button expand="block" router-link="/landlord/applications" fill="outline">
          <ion-icon slot="start" :icon="documentTextOutline"></ion-icon>
          View Applications
        </ion-button>
        <ion-button expand="block" @click="openAddModal" fill="outline">
          <ion-icon slot="start" :icon="add"></ion-icon>
          Add Property
        </ion-button>
      </div>

      <div v-if="loading" class="flex justify-center mt-10">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="properties.length === 0" class="text-center mt-20">
        <h3 class="text-lg font-semibold text-gray-700">No properties yet</h3>
        <p class="text-gray-500">Tap the + button to add your first property.</p>
      </div>

      <div v-else class="grid gap-4">
        <div v-for="prop in properties" :key="prop.id" class="bg-white p-4 rounded-lg shadow flex flex-col">
          <img 
            :src="prop.image_urls?.[0] || 'https://via.placeholder.com/150'" 
            class="w-full h-40 object-cover rounded-md mb-3"
          />
          <h3 class="font-bold text-lg">{{ prop.title }}</h3>
          <p class="text-gray-600">{{ prop.address }}</p>
          <div class="mt-auto pt-3 flex justify-between items-center">
            <span class="font-bold text-green-600">${{ prop.price }}/mo</span>
            <div class="flex gap-2">
              <ion-button fill="clear" color="primary" @click="shareProperty(prop)">
                <ion-icon :icon="shareOutline"></ion-icon>
              </ion-button>
              <ion-button fill="clear" color="danger" @click="deleteProperty(prop.id)">
                <ion-icon :icon="trashOutline"></ion-icon>
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="mb-4 mr-4">
        <ion-fab-button @click="openAddModal">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonFab, IonFabButton, IonIcon, IonSpinner, modalController, toastController } from '@ionic/vue';
import { add, trashOutline, chatbubbleOutline, shareOutline, documentTextOutline } from 'ionicons/icons';
import { supabase } from '@/services/supabaseClient';
import { useRouter } from 'vue-router';
import PropertyModal from './PropertyModal.vue';
import WelcomeBanner from '@/components/shared/WelcomeBanner.vue';

const properties = ref<any[]>([]);
const loading = ref(true);
const router = useRouter();
const userProfile = ref<any>(null);
const applications = ref<any[]>([]);

const dashboardStats = computed(() => [
  { value: properties.value.length, label: 'Properties' },
  { value: applications.value.filter(a => a.status === 'pending').length, label: 'New Applications' }
]);

const fetchUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    userProfile.value = data;
  }
};

const fetchApplications = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data } = await supabase
      .from('applications')
      .select('*, property:properties!inner(*)')
      .eq('property.landlord_id', user.id);
    applications.value = data || [];
  }
};

const fetchProperties = async () => {
  loading.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('landlord_id', user.id)
      .order('created_at', { ascending: false });
    properties.value = data || [];
  }
  loading.value = false;
};

const openAddModal = async () => {
  const modal = await modalController.create({
    component: PropertyModal
  });
  
  modal.onDidDismiss().then((result) => {
    if (result.data) {
      fetchProperties();
    }
  });

  return modal.present();
};

const shareProperty = async (property: any) => {
  const shareUrl = `${window.location.origin}/property/${property.id}/public`;
  
  try {
    if (navigator.share) {
      await navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      const toast = await toastController.create({
        message: 'Property link copied to clipboard!',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    }
  } catch (error) {
    console.error('Error sharing:', error);
  }
};

const deleteProperty = async (id: string) => {
  if (!confirm('Are you sure you want to delete this property?')) return;
  
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);
    
  if (!error) {
    properties.value = properties.value.filter(p => p.id !== id);
  }
};

const logout = async () => {
  await supabase.auth.signOut();
  router.replace('/login');
};

onMounted(() => {
  fetchUserProfile();
  fetchProperties();
  fetchApplications();
});
</script>
