<template>
  <div class="health-check">
    <h1>Health Check</h1>
    <div v-if="loading">Checking...</div>
    <div v-else>
      <p>Status: <span :class="health.status">{{ health.status }}</span></p>
      <p>Version: {{ health.version }}</p>
      <p>Timestamp: {{ health.timestamp }}</p>
      <h2>Services:</h2>
      <ul>
        <li v-for="(status, service) in health.services" :key="service">
          {{ service }}: <span :class="status">{{ status }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '@/services/supabaseClient';

const loading = ref(true);
const health = ref({
  status: 'unknown',
  version: '0.0.1',
  timestamp: new Date().toISOString(),
  services: {
    app: 'unknown',
    supabase: 'unknown',
    database: 'unknown'
  }
});

const checkHealth = async () => {
  loading.value = true;
  
  try {
    // Check app
    health.value.services.app = 'ok';
    
    // Check Supabase connection
    const { error: supabaseError } = await supabase.from('profiles').select('id').limit(1);
    health.value.services.supabase = supabaseError ? 'error' : 'ok';
    
    // Check database
    const { error: dbError } = await supabase.from('conversations').select('id').limit(1);
    health.value.services.database = dbError ? 'error' : 'ok';
    
    // Overall status
    const allOk = Object.values(health.value.services).every(s => s === 'ok');
    health.value.status = allOk ? 'healthy' : 'degraded';
    health.value.timestamp = new Date().toISOString();
    
  } catch (error) {
    console.error('Health check failed:', error);
    health.value.status = 'unhealthy';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  checkHealth();
});
</script>

<style scoped>
.health-check {
  padding: 2rem;
  font-family: monospace;
}

.healthy, .ok {
  color: green;
  font-weight: bold;
}

.degraded {
  color: orange;
  font-weight: bold;
}

.unhealthy, .error {
  color: red;
  font-weight: bold;
}
</style>
