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

const route = useRoute();
const otherUserId = route.params.id as string;
const currentUserId = ref('');
const otherUserName = ref('Chat');
const messages = ref<any[]>([]);
const newMessage = ref('');
const content = ref();

let subscription: any = null;

const scrollToBottom = () => {
   // Simple scroll implementation, IonContent has its own methods but this often works for v-for
   // Better to use content.value.$el.scrollToBottom(300);
   content.value?.$el.scrollToBottom(300);
};

const fetchMessages = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  currentUserId.value = user.id;

  // Fetch Name
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', otherUserId).single();
  if (profile) otherUserName.value = profile.full_name;

  // Fetch History
  const { data } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });
    
  messages.value = data || [];
  setTimeout(scrollToBottom, 500);
};

const subscribeToMessages = () => {
  subscription = supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
       const newMsg = payload.new;
       if (
         (newMsg.sender_id === currentUserId.value && newMsg.receiver_id === otherUserId) ||
         (newMsg.sender_id === otherUserId && newMsg.receiver_id === currentUserId.value)
       ) {
         messages.value.push(newMsg);
         scrollToBottom();
       }
    })
    .subscribe();
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  const msgContent = newMessage.value;
  newMessage.value = ''; // Optimistic clear

  const { error } = await supabase
    .from('messages')
    .insert([
      {
        sender_id: currentUserId.value,
        receiver_id: otherUserId,
        content: msgContent
      }
    ]);

  if (error) {
    console.error('Send failed', error);
    alert('Failed to send message');
  }
  // The subscription will append it to the view, or we can push manually if latency is high, 
  // but RLS "My Insert" policy means I see it immediately usually.
  // Actually, subscription listens to DB changes. If I insert, I get notified.
};

onMounted(() => {
  fetchMessages();
  subscribeToMessages();
});

onUnmounted(() => {
  if (subscription) supabase.removeChannel(subscription);
});
</script>
