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
        <p class="text-gray-500">No messages yet.</p>
      </div>

      <ion-list v-else>
        <ion-item v-for="conv in conversations" :key="conv.otherUserId" :router-link="`/messages/${conv.otherUserId}`" detail>
          <ion-avatar slot="start">
             <img :src="conv.avatarUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg'" />
          </ion-avatar>
          <ion-label>
            <h2>{{ conv.name }}</h2>
            <p>{{ conv.role }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonAvatar, IonSpinner } from '@ionic/vue';
import { supabase } from '@/services/supabaseClient';

interface Conversation {
  otherUserId: string;
  name: string;
  role: string;
  avatarUrl?: string; // Optional
}

const conversations = ref<Conversation[]>([]);
const loading = ref(true);

const fetchConversations = async () => {
  loading.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Supabase doesn't support "Select distinct on specific column" via simple JS SDK easily with complex joins for 'latest message'.
  // But we just want list of UNIQUE people we talked to.
  // We can fetch all messages where sender or receiver is me.
  
  const { data: sent } = await supabase.from('messages').select('receiver_id').eq('sender_id', user.id);
  const { data: received } = await supabase.from('messages').select('sender_id').eq('receiver_id', user.id);

  const ids = new Set<string>();
  sent?.forEach((m: any) => ids.add(m.receiver_id));
  received?.forEach((m: any) => ids.add(m.sender_id));

  // Now fetch profiles for these IDs
  if (ids.size > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .in('id', Array.from(ids));
      
    conversations.value = profiles?.map((p: any) => ({
      otherUserId: p.id,
      name: p.full_name,
      role: p.role,
      avatarUrl: p.avatar_url
    })) || [];
  }

  loading.value = false;
};

onMounted(() => {
  fetchConversations();
});
</script>
