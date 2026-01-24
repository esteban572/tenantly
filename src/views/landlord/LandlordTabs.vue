<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" href="/landlord/dashboard">
          <ion-icon :icon="gridOutline" />
          <ion-label>Dashboard</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="properties" href="/landlord/properties">
          <ion-icon :icon="homeOutline" />
          <ion-label>Properties</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="maintenance" href="/landlord/maintenance">
          <ion-icon :icon="hammerOutline" />
          <ion-label>Requests</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="chat" href="/messages">
          <ion-icon :icon="chatbubblesOutline" />
          <ion-label>Chat</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonPage, IonRouterOutlet } from '@ionic/vue';
import { gridOutline, homeOutline, hammerOutline, chatbubblesOutline } from 'ionicons/icons';
</script>

<style scoped>
ion-tab-bar {
  padding-bottom: 15px;
  height: 65px;
}
</style>
