<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col relative">
    <div class="h-2/3 relative">
      <img 
        :src="property.image_urls?.[0] || 'https://via.placeholder.com/400x300'" 
        alt="Property Image" 
        class="w-full h-full object-cover"
      />
      <div class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-4">
        <h2 class="text-white text-2xl font-bold">{{ property.price }} / mo</h2>
      </div>
    </div>
    <div class="p-4 flex-1 flex flex-col justify-between">
      <div>
        <h3 class="text-xl font-bold text-gray-800">{{ property.title }}</h3>
        <p class="text-gray-500 flex items-center mt-1">
          <ion-icon :icon="locationOutline" class="mr-1"></ion-icon>
          {{ property.address }}
        </p>
        <p class="text-gray-600 mt-2 line-clamp-3 text-sm">
          {{ property.description }}
        </p>
      </div>
      
      <div class="mt-4 flex gap-2">
         <ion-button expand="block" color="light" class="flex-1" @click="$emit('dismiss')">
            Pass
         </ion-button>
         <ion-button expand="block" color="secondary" class="flex-1" @click="$emit('inquire', property)">
            Message
         </ion-button>
         <ion-button expand="block" class="flex-1" @click="$emit('apply', property)">
            Apply
         </ion-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from '@ionic/vue';
import { locationOutline } from 'ionicons/icons';

defineProps<{
  property: any; // Using any for now to avoid extensive type defs in this file, but normally Property interface
}>();

defineEmits(['inquire', 'apply', 'dismiss']);
</script>
