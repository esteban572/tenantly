<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/messages"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ otherUserName }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" ref="content">
       <div class="flex flex-col space-y-4 pb-20">
         <div 
           v-for="msg in messages" 
           :key="msg.id" 
           :class="['flex', msg.sender_id === currentUserId ? 'justify-end' : 'justify-start']"
         >
           <div 
             :class="['max-w-xs px-4 py-2 rounded-lg', msg.sender_id === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800']"
           >
             {{ msg.content }}
           </div>
         </div>
       </div>
    </ion-content>
    
    <ion-footer>
      <ion-toolbar>
        <div class="flex items-center px-2">
          <ion-input 
            v-model="newMessage" 
            placeholder="Type a message..." 
            class="flex-1 border rounded-lg mr-2 px-2"
            @keyup.enter="sendMessage"
          ></ion-input>
          <ion-button @click="sendMessage" :disabled="!newMessage.trim()">
            Send
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonFooter, IonInput, IonButton } from '@ionic/vue';
import { supabase } from '@/services/supabaseClient';
import { conversationService } from '@/services/conversationService';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const authStore = useAuthStore();
const conversationId = route.params.id as string;
const currentUserId = ref('');
const otherUserId = ref('');
const otherUserName = ref('Chat');
const messages = ref<any[]>([]);
const newMessage = ref('');
const content = ref();

let messageChannel: any = null;

const scrollToBottom = () => {
   // Simple scroll implementation, IonContent has its own methods but this often works for v-for
   // Better to use content.value.$el.scrollToBottom(300);
   content.value?.$el.scrollToBottom(300);
};

const fetchMessages = async () => {
  if (!authStore.user) return;
  currentUserId.value = authStore.user.id;

  try {
    // Get conversation details to find the other participant
    const conversation = await conversationService.getConversation(conversationId);
    
    if (!conversation) {
      console.error('Conversation not found');
      return;
    }

    // Determine the other participant
    const otherParticipant = conversationService.getOtherParticipant(conversation, authStore.user.id);
    if (otherParticipant) {
      otherUserId.value = otherParticipant.id;
      otherUserName.value = otherParticipant.full_name || 'User';
    }

    // Fetch conversation messages
    const msgs = await conversationService.getConversationMessages(conversationId);
    messages.value = msgs;
    
    // Mark messages as read
    await conversationService.markConversationAsRead(conversationId, authStore.user.id);
    
    setTimeout(scrollToBottom, 500);
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

const subscribeToMessages = () => {
  // Subscribe to new messages in this conversation
  messageChannel = conversationService.subscribeToConversation(
    conversationId,
    (message) => {
      messages.value.push(message);
      scrollToBottom();
      
      // Mark as read if we're the receiver
      if (authStore.user && message.receiver_id === authStore.user.id) {
        conversationService.markMessageAsRead(message.id);
      }
    }
  );
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !authStore.user || !otherUserId.value) return;

  const msgContent = newMessage.value;
  newMessage.value = ''; // Optimistic clear

  try {
    await conversationService.sendMessage(
      conversationId,
      authStore.user.id,
      otherUserId.value,
      msgContent
    );

    
    // Message will appear via real-time subscription
  } catch (error) {
    console.error('Send failed', error);
    alert('Failed to send message');
    newMessage.value = msgContent; // Restore message on error
  }
};

onMounted(() => {
  fetchMessages();
  subscribeToMessages();
});

onUnmounted(() => {
  if (messageChannel) {
    conversationService.unsubscribe(messageChannel);
  }
});
</script>
