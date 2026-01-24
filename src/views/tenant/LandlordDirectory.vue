<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tenant/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Browse Landlords</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Search Bar -->
      <div class="search-section">
        <ion-searchbar 
          v-model="searchQuery" 
          placeholder="Search landlords or companies..."
          @ionChange="handleSearch"
          class="custom-searchbar"
        ></ion-searchbar>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-chips">
          <div 
            class="filter-chip"
            :class="{ active: selectedType === null }"
            @click="selectedType = null"
          >
            All
          </div>
          <div 
            class="filter-chip"
            :class="{ active: selectedType === 'individual' }"
            @click="selectedType = 'individual'"
          >
            <ion-icon :icon="personCircleOutline" class="chip-icon"></ion-icon>
            Individual
          </div>
          <div 
            class="filter-chip"
            :class="{ active: selectedType === 'company' }"
            @click="selectedType = 'company'"
          >
            <ion-icon :icon="businessOutline" class="chip-icon"></ion-icon>
            Company
          </div>
          <div 
            class="filter-chip"
            :class="{ active: selectedType === 'property_management' }"
            @click="selectedType = 'property_management'"
          >
            <ion-icon :icon="briefcaseOutline" class="chip-icon"></ion-icon>
            Management
          </div>
        </div>

        <div class="filter-toggles">
          <label class="toggle-label">
            <input 
              type="checkbox" 
              v-model="verifiedOnly"
              class="toggle-input"
            />
            <span>Verified Only</span>
            <ion-icon :icon="checkmarkCircle" class="verified-icon"></ion-icon>
          </label>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
        <p>Loading landlords...</p>
      </div>

      <!-- Landlords Grid -->
      <div v-else-if="filteredLandlords.length > 0" class="landlords-grid">
        <ProfileCard 
          v-for="landlord in filteredLandlords" 
          :key="landlord.id"
          :profile="landlord"
          :show-stats="true"
          @click="viewProfile(landlord.id)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <ion-icon :icon="searchOutline" class="empty-icon"></ion-icon>
        <h3>No landlords found</h3>
        <p>Try adjusting your filters or search query</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonBackButton, IonSearchbar, IonIcon, IonSpinner 
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { profileService, type Profile } from '@/services/profileService';
import ProfileCard from '@/components/profile/ProfileCard.vue';
import { 
  personCircleOutline, businessOutline, briefcaseOutline, 
  checkmarkCircle, searchOutline 
} from 'ionicons/icons';

const router = useRouter();

const landlords = ref<Profile[]>([]);
const searchQuery = ref('');
const selectedType = ref<string | null>(null);
const verifiedOnly = ref(false);
const loading = ref(true);

const filteredLandlords = computed(() => {
  let filtered = landlords.value;

  // Filter by type
  if (selectedType.value) {
    filtered = filtered.filter(l => l.landlord_type === selectedType.value);
  }

  // Filter by verified
  if (verifiedOnly.value) {
    filtered = filtered.filter(l => l.verified);
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(l => 
      l.full_name.toLowerCase().includes(query) ||
      l.company_name?.toLowerCase().includes(query)
    );
  }

  // Sort by rating
  return filtered.sort((a, b) => b.rating - a.rating);
});

const fetchLandlords = async () => {
  try {
    loading.value = true;
    landlords.value = await profileService.getLandlords();
  } catch (error) {
    console.error('Error fetching landlords:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  // Search is reactive via computed property
};

const viewProfile = (landlordId: string) => {
  router.push(`/profile/${landlordId}`);
};

// Watch for filter changes
watch([selectedType, verifiedOnly], () => {
  // Filters are reactive via computed property
});

onMounted(() => {
  fetchLandlords();
});
</script>

<style scoped>
ion-content {
  --background: #f4f5f8;
}

.search-section {
  margin-bottom: 1rem;
}

.custom-searchbar {
  --background: white;
  --border-radius: 12px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-chips {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #F3F4F6;
  border: 2px solid transparent;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-chip:hover {
  background: #E5E7EB;
}

.filter-chip.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: #667eea;
  color: #667eea;
}

.chip-icon {
  font-size: 18px;
}

.filter-toggles {
  display: flex;
  gap: 1rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
}

.toggle-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

.verified-icon {
  font-size: 18px;
  color: #3B82F6;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: #6B7280;
}

.landlords-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: #D1D5DB;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  font-size: 1rem;
  color: #6B7280;
  margin: 0;
}

@media (max-width: 768px) {
  .landlords-grid {
    grid-template-columns: 1fr;
  }
}
</style>
