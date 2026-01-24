<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

onMounted(() => {
  authStore.loadUser();
});
</script>
