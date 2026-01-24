<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/landlord/properties"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEditing ? 'Edit Property' : 'Add Property' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div class="max-w-4xl mx-auto">
        <!-- Progress Steps -->
        <div class="flex items-center justify-center mb-8">
          <div v-for="(step, i) in steps" :key="step.id" class="flex items-center">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
                currentStep >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              ]"
            >
              {{ i + 1 }}
            </div>
            <div v-if="i < steps.length - 1" :class="['w-12 h-1 mx-1', currentStep > i ? 'bg-blue-600' : 'bg-gray-200']"></div>
          </div>
        </div>

        <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ steps[currentStep].title }}</h2>
        <p class="text-gray-500 mb-6">{{ steps[currentStep].description }}</p>

        <!-- Step 1: Basic Info -->
        <div v-if="currentStep === 0" class="space-y-6">
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-4">Property Address</h3>
            <ion-item class="mb-4">
              <ion-label position="stacked">Street Address *</ion-label>
              <ion-input v-model="property.address" placeholder="1419 Mission Bend Dr"></ion-input>
            </ion-item>
            <div class="grid grid-cols-2 gap-4">
              <ion-item>
                <ion-label position="stacked">City *</ion-label>
                <ion-input v-model="property.city" placeholder="Brownsville"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label position="stacked">State *</ion-label>
                <ion-input v-model="property.state" placeholder="TX"></ion-input>
              </ion-item>
            </div>
            <ion-item class="mt-4">
              <ion-label position="stacked">ZIP Code *</ion-label>
              <ion-input v-model="property.zip_code" placeholder="78526"></ion-input>
            </ion-item>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-4">Property Details</h3>
            <ion-item class="mb-4">
              <ion-label position="stacked">Property Title *</ion-label>
              <ion-input v-model="property.title" placeholder="Modern 3BR Family Home"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Property Type *</ion-label>
              <ion-select v-model="property.property_type" placeholder="Select type">
                <ion-select-option value="house">House</ion-select-option>
                <ion-select-option value="apartment">Apartment</ion-select-option>
                <ion-select-option value="condo">Condo</ion-select-option>
                <ion-select-option value="townhouse">Townhouse</ion-select-option>
                <ion-select-option value="studio">Studio</ion-select-option>
              </ion-select>
            </ion-item>
          </div>
        </div>

        <!-- Step 2: Property Specs -->
        <div v-if="currentStep === 1" class="space-y-6">
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-4">Room Details</h3>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <ion-icon :icon="bedOutline" class="text-3xl text-blue-600 mb-2"></ion-icon>
                <p class="text-sm text-gray-500 mb-2">Bedrooms</p>
                <div class="flex items-center justify-center gap-2">
                  <button @click="property.bedrooms = Math.max(0, (property.bedrooms || 0) - 1)" class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">-</button>
                  <span class="text-xl font-bold w-8 text-center">{{ property.bedrooms || 0 }}</span>
                  <button @click="property.bedrooms = (property.bedrooms || 0) + 1" class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">+</button>
                </div>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <ion-icon :icon="waterOutline" class="text-3xl text-blue-600 mb-2"></ion-icon>
                <p class="text-sm text-gray-500 mb-2">Bathrooms</p>
                <div class="flex items-center justify-center gap-2">
                  <button @click="property.bathrooms = Math.max(0, (property.bathrooms || 0) - 0.5)" class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">-</button>
                  <span class="text-xl font-bold w-8 text-center">{{ property.bathrooms || 0 }}</span>
                  <button @click="property.bathrooms = (property.bathrooms || 0) + 0.5" class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">+</button>
                </div>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <ion-icon :icon="expandOutline" class="text-3xl text-blue-600 mb-2"></ion-icon>
                <p class="text-sm text-gray-500 mb-2">Sq Ft</p>
                <ion-input v-model.number="property.sqft" type="number" placeholder="1,788" class="text-center font-bold"></ion-input>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-4">Additional Details</h3>
            <div class="grid grid-cols-2 gap-4">
              <ion-item>
                <ion-label position="stacked">Year Built</ion-label>
                <ion-input v-model.number="property.year_built" type="number" placeholder="1996"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Lot Size (sqft)</ion-label>
                <ion-input v-model.number="property.lot_size" type="number" placeholder="6,500"></ion-input>
              </ion-item>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-4">Parking & Laundry</h3>
            <div class="grid grid-cols-2 gap-4">
              <ion-item>
                <ion-label position="stacked">Parking</ion-label>
                <ion-select v-model="property.parking" placeholder="Select">
                  <ion-select-option value="garage">Garage</ion-select-option>
                  <ion-select-option value="street">Street</ion-select-option>
                  <ion-select-option value="lot">Parking Lot</ion-select-option>
                  <ion-select-option value="none">None</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Laundry</ion-label>
                <ion-select v-model="property.laundry" placeholder="Select">
                  <ion-select-option value="in_unit">In Unit</ion-select-option>
                  <ion-select-option value="in_building">In Building</ion-select-option>
                  <ion-select-option value="none">None</ion-select-option>
                </ion-select>
              </ion-item>
            </div>
          </div>
        </div>

        <!-- Step 3: Pricing & Policies -->
        <div v-if="currentStep === 2" class="space-y-6">
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-4">Pricing</h3>
            <div class="grid grid-cols-2 gap-4">
              <ion-item>
                <ion-label position="stacked">Monthly Rent *</ion-label>
                <ion-input v-model.number="property.price" type="number" placeholder="2,000">
                  <span slot="start" class="text-gray-500">$</span>
                </ion-input>
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Security Deposit</ion-label>
                <ion-input v-model.number="property.deposit_amount" type="number" placeholder="2,000">
                  <span slot="start" class="text-gray-500">$</span>
                </ion-input>
              </ion-item>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-4">Lease Terms</h3>
            <div class="grid grid-cols-2 gap-4">
              <ion-item>
                <ion-label position="stacked">Lease Length (months)</ion-label>
                <ion-select v-model="property.lease_length" placeholder="Select">
                  <ion-select-option :value="6">6 months</ion-select-option>
                  <ion-select-option :value="12">12 months</ion-select-option>
                  <ion-select-option :value="18">18 months</ion-select-option>
                  <ion-select-option :value="24">24 months</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Available Date</ion-label>
                <ion-input v-model="property.available_date" type="date"></ion-input>
              </ion-item>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-4">Pet Policy</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                v-for="policy in petPolicies"
                :key="policy.value"
                @click="property.pet_policy = policy.value"
                :class="[
                  'p-4 rounded-xl border-2 text-center transition-all',
                  property.pet_policy === policy.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <ion-icon :icon="policy.icon" class="text-2xl mb-1"></ion-icon>
                <p class="text-sm font-medium">{{ policy.label }}</p>
              </button>
            </div>
          </div>
        </div>

        <!-- Step 4: Photos & Description -->
        <div v-if="currentStep === 3" class="space-y-6">
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-2">Property Photos</h3>
            <p class="text-sm text-gray-500 mb-4">Add up to 10 photos. The first one will be the main image.</p>
            <ImageUploader 
              ref="imageUploader"
              :max-images="10"
              :initial-images="property.image_urls || []"
              @update:images="handleImagesUpdate"
            />
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-4">Description</h3>
            <ion-textarea
              v-model="property.description"
              :rows="6"
              placeholder="Describe your property in detail. Mention key features, recent upgrades, neighborhood highlights..."
              class="bg-gray-50 rounded-lg p-3"
            ></ion-textarea>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-4">Amenities</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                v-for="amenity in allAmenities"
                :key="amenity"
                @click="toggleAmenity(amenity)"
                :class="[
                  'p-3 rounded-lg border text-left text-sm transition-all flex items-center gap-2',
                  property.amenities?.includes(amenity)
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <ion-icon :icon="property.amenities?.includes(amenity) ? checkmarkCircle : ellipseOutline" class="text-lg"></ion-icon>
                {{ amenity }}
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex gap-4 mt-8 pb-8">
          <ion-button v-if="currentStep > 0" fill="outline" class="flex-1" @click="currentStep--">
            Back
          </ion-button>
          <ion-button v-if="currentStep < steps.length - 1" class="flex-1" @click="nextStep">
            Continue
          </ion-button>
          <ion-button v-if="currentStep === steps.length - 1" class="flex-1" @click="save" :disabled="saving">
            <ion-spinner v-if="saving" name="crescent" class="mr-2"></ion-spinner>
            {{ saving ? 'Publishing...' : 'Publish Property' }}
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonTextarea, IonSpinner, toastController
} from '@ionic/vue';
import {
  bedOutline, waterOutline, expandOutline, pawOutline, checkmarkCircle, ellipseOutline,
  happyOutline, closeCircleOutline, helpCircleOutline
} from 'ionicons/icons';
import { supabase } from '@/services/supabaseClient';
import ImageUploader from '@/components/shared/ImageUploader.vue';

const route = useRoute();
const router = useRouter();

const currentStep = ref(0);
const saving = ref(false);
const imageUploader = ref<InstanceType<typeof ImageUploader> | null>(null);

const steps = [
  { id: 'address', title: 'Property Location', description: 'Enter the property address and basic details' },
  { id: 'specs', title: 'Property Specs', description: 'Tell us about the rooms and features' },
  { id: 'pricing', title: 'Pricing & Terms', description: 'Set your rental price and policies' },
  { id: 'photos', title: 'Photos & Description', description: 'Add photos and describe your property' }
];

const petPolicies = [
  { value: 'allowed', label: 'Pets Allowed', icon: pawOutline },
  { value: 'cats_only', label: 'Cats Only', icon: happyOutline },
  { value: 'dogs_only', label: 'Dogs Only', icon: pawOutline },
  { value: 'no_pets', label: 'No Pets', icon: closeCircleOutline },
  { value: 'negotiable', label: 'Negotiable', icon: helpCircleOutline }
];

const allAmenities = [
  'Central AC', 'Heating', 'Dishwasher', 'Refrigerator', 'Washer', 'Dryer',
  'Pool', 'Gym', 'Balcony', 'Patio', 'Fireplace', 'Hardwood Floors',
  'Storage', 'EV Charging', 'Security System', 'Gated Community',
  'Pet Friendly', 'Wheelchair Accessible'
];

const property = ref({
  title: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  property_type: null as string | null,
  bedrooms: 0,
  bathrooms: 1,
  sqft: null as number | null,
  year_built: null as number | null,
  lot_size: null as number | null,
  parking: null as string | null,
  laundry: null as string | null,
  price: null as number | null,
  deposit_amount: null as number | null,
  lease_length: 12,
  available_date: '',
  pet_policy: null as string | null,
  description: '',
  image_urls: [] as string[],
  amenities: [] as string[]
});

const isEditing = computed(() => !!route.params.id);

const handleImagesUpdate = (urls: string[]) => {
  property.value.image_urls = urls;
};

const toggleAmenity = (amenity: string) => {
  if (!property.value.amenities) {
    property.value.amenities = [];
  }
  const index = property.value.amenities.indexOf(amenity);
  if (index === -1) {
    property.value.amenities.push(amenity);
  } else {
    property.value.amenities.splice(index, 1);
  }
};

const nextStep = () => {
  // Basic validation per step
  if (currentStep.value === 0) {
    if (!property.value.address || !property.value.city || !property.value.title) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }
  }
  currentStep.value++;
};

const showToast = async (message: string, color: string = 'primary') => {
  const toast = await toastController.create({
    message,
    duration: 3000,
    color,
    position: 'bottom'
  });
  await toast.present();
};

const save = async () => {
  try {
    saving.value = true;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    // Upload images
    let imageUrls: string[] = [];
    if (imageUploader.value) {
      imageUrls = await imageUploader.value.uploadImages();
    }

    const propertyData = {
      landlord_id: user.id,
      title: property.value.title,
      address: property.value.address,
      city: property.value.city,
      state: property.value.state,
      zip_code: property.value.zip_code,
      property_type: property.value.property_type,
      bedrooms: property.value.bedrooms,
      bathrooms: property.value.bathrooms,
      sqft: property.value.sqft,
      parking: property.value.parking,
      laundry: property.value.laundry,
      price: property.value.price,
      deposit_amount: property.value.deposit_amount,
      lease_length: property.value.lease_length,
      available_date: property.value.available_date || null,
      pet_policy: property.value.pet_policy,
      description: property.value.description,
      image_urls: imageUrls,
      amenities: property.value.amenities,
      is_available: true
    };

    let error;
    if (isEditing.value && route.params.id) {
      const { error: updateError } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', route.params.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('properties')
        .insert([propertyData]);
      error = insertError;
    }

    if (error) throw error;

    await showToast('Property published successfully!', 'success');
    router.push('/landlord/properties');
  } catch (e: any) {
    console.error('Error saving property:', e);
    await showToast(`Failed to save: ${e.message}`, 'danger');
  } finally {
    saving.value = false;
  }
};

const loadExistingProperty = async () => {
  if (route.params.id) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', route.params.id)
      .single();
    
    if (data) {
      property.value = {
        ...property.value,
        ...data,
        image_urls: data.image_urls || [],
        amenities: data.amenities || []
      };
    }
  }
};

onMounted(() => {
  loadExistingProperty();
});
</script>

<style scoped>
ion-content {
  --background: #f4f5f8;
}

ion-item {
  --background: transparent;
  --border-color: #e5e7eb;
}

ion-select {
  width: 100%;
}
</style>
