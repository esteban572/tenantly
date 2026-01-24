<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/profile/${authStore.user?.id}`"></ion-back-button>
        </ion-buttons>
        <ion-title>Edit Profile</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="saveProfile" :disabled="saving">
            <ion-spinner v-if="saving" name="crescent"></ion-spinner>
            <span v-else>Save</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else class="edit-container">
        <!-- Avatar Section -->
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="changeAvatar">
            <img 
              v-if="formData.avatar_url" 
              :src="formData.avatar_url" 
              alt="Profile Avatar"
              class="avatar"
            />
            <div v-else class="avatar-placeholder">
              <ion-icon :icon="personOutline" class="placeholder-icon"></ion-icon>
            </div>
            <div class="avatar-overlay">
              <ion-icon :icon="cameraOutline" class="camera-icon"></ion-icon>
              <span class="change-text">Change Photo</span>
            </div>
          </div>
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/*" 
            @change="handleFileSelect" 
            style="display: none;"
          />
        </div>

        <!-- Basic Information -->
        <div class="form-section">
          <h2 class="section-title">Basic Information</h2>
          
          <ion-item>
            <ion-label position="stacked">Full Name *</ion-label>
            <ion-input 
              v-model="formData.full_name" 
              placeholder="Enter your full name"
              counter
              :maxlength="100"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Phone Number</ion-label>
            <ion-input 
              v-model="formData.phone_number" 
              type="tel"
              placeholder="(555) 123-4567"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Bio</ion-label>
            <ion-textarea 
              v-model="formData.bio" 
              placeholder="Tell us about yourself..."
              auto-grow
              counter
              :maxlength="500"
              :rows="4"
            ></ion-textarea>
          </ion-item>
        </div>

        <!-- Role-Specific Information -->
        <div v-if="authStore.profile?.role === 'landlord'" class="form-section">
          <h2 class="section-title">Landlord Information</h2>
          
          <ion-item>
            <ion-label position="stacked">Landlord Type *</ion-label>
            <ion-select 
              v-model="formData.landlord_type" 
              placeholder="Select type"
            >
              <ion-select-option value="individual">Individual Landlord</ion-select-option>
              <ion-select-option value="company">Company</ion-select-option>
              <ion-select-option value="property_management">Property Management</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item v-if="formData.landlord_type === 'company' || formData.landlord_type === 'property_management'">
            <ion-label position="stacked">Company Name</ion-label>
            <ion-input 
              v-model="formData.company_name" 
              placeholder="Enter company name"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Years of Experience</ion-label>
            <ion-input 
              v-model="formData.years_of_experience" 
              type="number"
              placeholder="0"
              :min="0"
              :max="99"
            ></ion-input>
          </ion-item>
        </div>

        <div v-if="authStore.profile?.role === 'tenant'" class="form-section">
          <h2 class="section-title">Professional Information</h2>
          
          <ion-item>
            <ion-label position="stacked">Occupation</ion-label>
            <ion-input 
              v-model="formData.occupation" 
              placeholder="e.g., Software Engineer"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Employer</ion-label>
            <ion-input 
              v-model="formData.employer" 
              placeholder="e.g., Tech Company Inc."
            ></ion-input>
          </ion-item>
        </div>

        <!-- Social Links -->
        <div class="form-section">
          <h2 class="section-title">Social Links</h2>
          
          <ion-item>
            <ion-label position="stacked">LinkedIn URL</ion-label>
            <ion-input 
              v-model="formData.linkedin_url" 
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
            ></ion-input>
          </ion-item>

          <ion-item v-if="authStore.profile?.role === 'landlord'">
            <ion-label position="stacked">Website URL</ion-label>
            <ion-input 
              v-model="formData.website_url" 
              type="url"
              placeholder="https://yourwebsite.com"
            ></ion-input>
          </ion-item>
        </div>

        <!-- Action Buttons -->
        <div class="action-section">
          <ion-button 
            expand="block" 
            @click="saveProfile" 
            :disabled="saving || !isFormValid"
            class="save-button"
          >
            <ion-spinner v-if="saving" name="crescent" slot="start"></ion-spinner>
            <span v-else>Save Changes</span>
          </ion-button>
          
          <ion-button 
            expand="block" 
            fill="outline" 
            @click="cancelEdit"
            :disabled="saving"
            class="cancel-button"
          >
            Cancel
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonBackButton, IonButton, IonIcon, IonSpinner, IonItem, IonLabel,
  IonInput, IonTextarea, IonSelect, IonSelectOption, toastController
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { personOutline, cameraOutline } from 'ionicons/icons';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const saving = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const formData = ref<{
  full_name: string;
  phone_number: string;
  bio: string;
  avatar_url: string;
  landlord_type: string;
  company_name: string;
  years_of_experience: number | string;
  occupation: string;
  employer: string;
  linkedin_url: string;
  website_url: string;
}>({
  full_name: '',
  phone_number: '',
  bio: '',
  avatar_url: '',
  landlord_type: '',
  company_name: '',
  years_of_experience: 0,
  occupation: '',
  employer: '',
  linkedin_url: '',
  website_url: ''
});

const isFormValid = computed(() => {
  if (!formData.value.full_name || formData.value.full_name.length < 3) {
    return false;
  }
  
  if (authStore.profile?.role === 'landlord' && !formData.value.landlord_type) {
    return false;
  }
  
  return true;
});

const loadProfileData = () => {
  if (authStore.profile) {
    formData.value = {
      full_name: authStore.profile.full_name || '',
      phone_number: authStore.profile.phone_number || '',
      bio: authStore.profile.bio || '',
      avatar_url: authStore.profile.avatar_url || '',
      landlord_type: authStore.profile.landlord_type || '',
      company_name: authStore.profile.company_name || '',
      years_of_experience: authStore.profile.years_of_experience || 0,
      occupation: authStore.profile.occupation || '',
      employer: authStore.profile.employer || '',
      linkedin_url: authStore.profile.linkedin_url || '',
      website_url: authStore.profile.website_url || ''
    };
  }
  loading.value = false;
};

const changeAvatar = () => {
  fileInput.value?.click();
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    await showToast('Please select an image file', 'danger');
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    await showToast('Image size must be less than 5MB', 'danger');
    return;
  }
  
  try {
    saving.value = true;
    const avatarUrl = await authStore.uploadAvatar(file);
    formData.value.avatar_url = avatarUrl;
    await showToast('Avatar updated successfully', 'success');
  } catch (error) {
    console.error('Error uploading avatar:', error);
    await showToast('Failed to upload avatar', 'danger');
  } finally {
    saving.value = false;
  }
};

const saveProfile = async () => {
  if (!isFormValid.value) {
    await showToast('Please fill in all required fields', 'warning');
    return;
  }
  
  try {
    saving.value = true;
    
    // Prepare update data
    const updates: any = {
      full_name: formData.value.full_name,
      phone_number: formData.value.phone_number || null,
      bio: formData.value.bio || null,
      linkedin_url: formData.value.linkedin_url || null
    };
    
    // Add role-specific fields
    if (authStore.profile?.role === 'landlord') {
      updates.landlord_type = formData.value.landlord_type;
      updates.company_name = formData.value.company_name || null;
      updates.years_of_experience = typeof formData.value.years_of_experience === 'string' 
        ? parseInt(formData.value.years_of_experience) || 0 
        : formData.value.years_of_experience || 0;
      updates.website_url = formData.value.website_url || null;
    } else if (authStore.profile?.role === 'tenant') {
      updates.occupation = formData.value.occupation || null;
      updates.employer = formData.value.employer || null;
    }
    
    await authStore.updateProfile(updates);
    await showToast('Profile updated successfully', 'success');
    
    // Navigate back to profile view
    router.push(`/profile/${authStore.user?.id}`);
  } catch (error) {
    console.error('Error updating profile:', error);
    await showToast('Failed to update profile', 'danger');
  } finally {
    saving.value = false;
  }
};

const cancelEdit = () => {
  router.back();
};

const showToast = async (message: string, color: string = 'primary') => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: 'top'
  });
  await toast.present();
};

onMounted(() => {
  loadProfileData();
});
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.edit-container {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

.avatar-section {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  width: 120px;
  height: 120px;
}

.avatar,
.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
}

.avatar-placeholder {
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 60px;
  color: white;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  font-size: 32px;
  color: white;
  margin-bottom: 0.25rem;
}

.change-text {
  font-size: 0.75rem;
  color: white;
  font-weight: 600;
}

.form-section {
  background: white;
  margin-bottom: 1rem;
  padding: 1rem 0;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
  padding: 0 1rem 1rem;
}

ion-item {
  --padding-start: 1rem;
  --padding-end: 1rem;
  --inner-padding-end: 0;
}

ion-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

ion-input,
ion-textarea,
ion-select {
  --padding-start: 0;
  --padding-end: 0;
}

.action-section {
  padding: 1.5rem;
}

.save-button {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --border-radius: 12px;
  font-weight: 600;
  margin-bottom: 1rem;
}

.cancel-button {
  --border-radius: 12px;
  font-weight: 600;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .edit-container {
    padding-bottom: 1rem;
  }
  
  .avatar-section {
    padding: 1.5rem 0;
  }
}
</style>
