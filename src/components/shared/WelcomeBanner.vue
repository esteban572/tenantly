<template>
  <div class="welcome-banner bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-6 text-white shadow-lg">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold mb-1">{{ greeting }}, {{ userName }}! 👋</h1>
        <p class="text-blue-100 text-sm">{{ subtitle }}</p>
      </div>
      <div v-if="stats" class="hidden md:flex gap-4">
        <div v-for="(stat, index) in stats" :key="index" class="text-center bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
          <div class="text-2xl font-bold">{{ stat.value }}</div>
          <div class="text-xs text-blue-100">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Stat {
  value: string | number;
  label: string;
}

defineProps<{
  userName: string;
  subtitle: string;
  stats?: Stat[];
}>();

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
});
</script>

<style scoped>
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
