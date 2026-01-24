<template>
  <div class="flex items-center gap-2 select-none">
    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
      <ion-icon :icon="home" class="text-xl"></ion-icon>
    </div>
    <span class="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
      Tenantly
    </span>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { home } from 'ionicons/icons';
</script>
