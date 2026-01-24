<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Messages</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="loading" class="flex justify-center mt-10">
        <ion-spinner></ion-spinner>
      </div>
      
      <div v-else-if="conversations.length === 0" class="text-center mt-20">
        <p class="text-gray-500">No conversations yet.</p>
        <p class="text-gray-400 text-sm mt-2">Start a conversation by messaging someone from their profile!</p>
      </div>

      <ion-list v-else>
        <ion-item 
          v-for="conv in conversations" 
          :key="conv.id" 
          :router-link="`/messages/${conv.id}`" 
          detail
          button
        >
          <ion-avatar slot="start">
             <img :src="conv.otherUser?.avatar_url || 'https://ionicframework.com/docs/img/demos/avatar.svg'" />
          </ion-avatar>
          <ion-label>
            <h2 class="font-semibold">{{ conv.otherUser?.full_name || 'User' }}</h2>
            <p class="text-sm text-gray-600">{{ conv.last_message || 'No messages yet' }}</p>
          </ion-label>
          <ion-note slot="end" v-if="conv.last_message_at" class="text-xs">
            {{ formatTime(conv.last_message_at) }}
          </ion-note>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonAvatar, IonSpinner, IonNote } from '@ionic/vue';
import { conversationService, type Conversation } from '@/services/conversationService';
import { useAuthStore } from '@/stores/authStore';

interface ConversationWithOtherUser extends Conversation {
  otherUser?: any;
}

const authStore = useAuthStore();
const conversations = ref<ConversationWithOtherUser[]>([]);
const loading = ref(true);

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const fetchConversations = async () => {
  if (!authStore.user) return;
  
  loading.value = true;
  
  try {
    const convs = await conversationService.getUserConversations(authStore.user.id);
    
    // Add the other user info to each conversation
    conversations.value = convs.map(conv => {
      const otherUser = conversationService.getOtherParticipant(conv, authStore.user!.id);
      return {
        ...conv,
        otherUser
      };
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchConversations();
});
</script>
