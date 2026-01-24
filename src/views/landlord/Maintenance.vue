<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Maintenance Requests</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center mt-10">
            <ion-spinner></ion-spinner>
        </div>

        <!-- Empty State -->
        <div v-else-if="requests.length === 0" class="text-center mt-20">
            <ion-icon :icon="constructOutline" class="text-6xl text-gray-300"></ion-icon>
            <h3 class="text-lg font-semibold text-gray-700 mt-4">No requests found</h3>
            <p class="text-gray-500">Maintenance requests from your tenants will appear here.</p>
        </div>

        <!-- List -->
        <div v-else class="space-y-4">
            <div v-for="req in requests" :key="req.id" class="bg-white p-4 rounded-lg shadow">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-bold text-lg">{{ req.title }}</h3>
                        <p class="text-sm text-gray-500">
                            {{ req.properties?.address || 'Unknown Address' }}
                        </p>
                        <p class="text-xs text-gray-400">
                            Reported by: {{ req.profiles?.full_name || 'Unknown Tenant' }}
                        </p>
                    </div>
                    <ion-badge :color="getStatusColor(req.status)">
                        {{ formatStatus(req.status) }}
                    </ion-badge>
                </div>

                <p class="text-gray-700 my-2">{{ req.description }}</p>

                <!-- Photo if available -->
                <div v-if="req.photo_url" class="mt-2 mb-4">
                    <img :src="req.photo_url" class="rounded-md h-40 object-cover w-full" />
                </div>
                <div v-if="req.ai_classification" class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div class="flex items-center gap-2 mb-2">
                        <ion-icon :icon="sparklesOutline" class="text-blue-500"></ion-icon>
                        <span class="text-xs font-bold uppercase tracking-wider text-blue-700">AI Triage Insights</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <div>
                            <span class="text-[10px] text-blue-400 uppercase block">Classification</span>
                            <span class="text-sm font-semibold text-blue-900">{{ req.ai_classification }}</span>
                        </div>
                        <div>
                            <span class="text-[10px] text-blue-400 uppercase block">Priority</span>
                            <ion-badge :color="getPriorityColor(req.ai_priority)" class="text-[10px]">
                                {{ req.ai_priority }}
                            </ion-badge>
                        </div>
                    </div>
                    <p class="text-sm text-blue-800 italic mb-2 leading-tight">"{{ req.ai_summary }}"</p>
                    <div v-if="req.ai_suggested_action" class="text-[11px] bg-white/50 p-2 rounded border border-blue-100/50">
                        <span class="font-bold text-blue-700">Suggested Action:</span>
                        <span class="text-blue-900 ml-1">{{ req.ai_suggested_action }}</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="mt-4 pt-3 border-t flex justify-end items-center gap-2">
                    <span class="text-sm text-gray-600 mr-2">Update Status:</span>
                    <ion-select 
                        interface="popover" 
                        :value="req.status" 
                        @ionChange="updateStatus(req.id, $event.detail.value)"
                        class="status-select"
                    >
                        <ion-select-option value="pending">Pending</ion-select-option>
                        <ion-select-option value="in_progress">In Progress</ion-select-option>
                        <ion-select-option value="completed">Completed</ion-select-option>
                        <ion-select-option value="cancelled">Cancelled</ion-select-option>
                    </ion-select>
                </div>
            </div>
        </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonIcon, IonBadge, IonSelect, IonSelectOption } from '@ionic/vue';
import { constructOutline, sparklesOutline } from 'ionicons/icons';
import { useMaintenanceStore } from '@/stores/maintenanceStore';

const maintenanceStore = useMaintenanceStore();

const loading = computed(() => maintenanceStore.loading);
const requests = computed(() => maintenanceStore.requests);

const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'warning';
        case 'in_progress': return 'primary';
        case 'completed': return 'success';
        case 'cancelled': return 'medium';
        default: return 'medium';
    }
};

const updateStatus = async (id: string, newStatus: string) => {
    await maintenanceStore.updateStatus(id, newStatus);
};

const getPriorityColor = (priority: string | undefined) => {
    if (!priority) return 'medium';
    switch (priority.toLowerCase()) {
        case 'emergency': return 'danger';
        case 'high': return 'warning';
        case 'medium': return 'primary';
        case 'low': return 'success';
        default: return 'medium';
    }
};

onMounted(() => {
    maintenanceStore.fetchRequests();
});
</script>

<style scoped>
.status-select {
    --padding-top: 5px;
    --padding-bottom: 5px;
    background: #f3f4f6;
    border-radius: 8px;
    min-width: 140px;
}
</style>
