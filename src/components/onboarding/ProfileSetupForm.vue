<template>
  <div class="profile-setup">
    <div class="step-header">
      <h2 class="step-title">Complete Your Profile</h2>
      <p class="step-subtitle">Help others get to know you better</p>
    </div>

    <form @submit.prevent="handleSubmit" class="profile-form">
      <!-- Avatar Upload -->
      <div class="form-section">
        <div class="avatar-upload">
          <div class="avatar-preview" @click="triggerFileInput">
            <img 
              v-if="formData.avatar_url || avatarPreview" 
              :src="avatarPreview || formData.avatar_url" 
              alt="Avatar"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              <ion-icon :icon="cameraOutline" class="camera-icon"></ion-icon>
              <span class="upload-text">Add Photo</span>
            </div>
          </div>
          <input 
            ref="fileInput"
            type="file" 
            accept="image/*" 
            @change="handleFileSelect"
            class="file-input"
          />
        </div>
      </div>

      <!-- Bio -->
      <div class="form-group">
        <label class="form-label">
          About You
          <span class="optional">(Optional)</span>
        </label>
        <textarea
          v-model="formData.bio"
          class="form-textarea"
          placeholder="Tell us a bit about yourself..."
          rows="4"
          maxlength="500"
        ></textarea>
        <div class="char-count">{{ formData.bio?.length || 0 }}/500</div>
      </div>

      <!-- Phone Number -->
      <div class="form-group">
        <label class="form-label">Phone Number</label>
        <div class="input-wrapper">
          <ion-icon :icon="callOutline" class="input-icon"></ion-icon>
          <input
            v-model="formData.phone_number"
            type="tel"
            class="form-input"
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>
      </div>

      <!-- Landlord-specific fields -->
      <template v-if="role === 'landlord'">
        <!-- Company Name (if company or property management) -->
        <div v-if="landlordType === 'company' || landlordType === 'property_management'" class="form-group">
          <label class="form-label">Company Name</label>
          <div class="input-wrapper">
            <ion-icon :icon="businessOutline" class="input-icon"></ion-icon>
            <input
              v-model="formData.company_name"
              type="text"
              class="form-input"
              placeholder="ABC Property Management"
              required
            />
          </div>
        </div>

        <!-- Years of Experience -->
        <div class="form-group">
          <label class="form-label">Years of Experience</label>
          <div class="input-wrapper">
            <ion-icon :icon="timeOutline" class="input-icon"></ion-icon>
            <input
              v-model.number="formData.years_of_experience"
              type="number"
              min="0"
              max="50"
              class="form-input"
              placeholder="5"
              required
            />
          </div>
        </div>

        <!-- Website (Optional) -->
        <div class="form-group">
          <label class="form-label">
            Website
            <span class="optional">(Optional)</span>
          </label>
          <div class="input-wrapper">
            <ion-icon :icon="globeOutline" class="input-icon"></ion-icon>
            <input
              v-model="formData.website_url"
              type="url"
              class="form-input"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </template>

      <!-- Tenant-specific fields -->
      <template v-if="role === 'tenant'">
        <!-- Occupation -->
        <div class="form-group">
          <label class="form-label">Occupation</label>
          <div class="input-wrapper">
            <ion-icon :icon="briefcaseOutline" class="input-icon"></ion-icon>
            <input
              v-model="formData.occupation"
              type="text"
              class="form-input"
              placeholder="Software Engineer"
              required
            />
          </div>
        </div>

        <!-- Employer -->
        <div class="form-group">
          <label class="form-label">
            Employer
            <span class="optional">(Optional)</span>
          </label>
          <div class="input-wrapper">
            <ion-icon :icon="businessOutline" class="input-icon"></ion-icon>
            <input
              v-model="formData.employer"
              type="text"
              class="form-input"
              placeholder="Tech Company Inc."
            />
          </div>
        </div>
      </template>

      <!-- LinkedIn (Optional for both) -->
      <div class="form-group">
        <label class="form-label">
          LinkedIn Profile
          <span class="optional">(Optional)</span>
        </label>
        <div class="input-wrapper">
          <ion-icon :icon="logoLinkedin" class="input-icon"></ion-icon>
          <input
            v-model="formData.linkedin_url"
            type="url"
            class="form-input"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="submit-button"
        :disabled="!isFormValid || loading"
      >
        <span v-if="!loading">Complete Setup</span>
        <span v-else class="loading-content">
          <ion-spinner name="crescent" class="button-spinner"></ion-spinner>
          Saving...
        </span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonIcon, IonSpinner } from '@ionic/vue';
import { 
  cameraOutline, callOutline, businessOutline, timeOutline, 
  globeOutline, briefcaseOutline, logoLinkedin 
} from 'ionicons/icons';

const props = defineProps<{
  role: 'tenant' | 'landlord';
  landlordType?: 'individual' | 'company' | 'property_management';
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', data: any): void;
}>();

const formData = ref({
  bio: '',
  phone_number: '',
  company_name: '',
  years_of_experience: null as number | null,
  website_url: '',
  occupation: '',
  employer: '',
  linkedin_url: '',
  avatar_url: ''
});

const fileInput = ref<HTMLInputElement | null>(null);
const avatarPreview = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

const isFormValid = computed(() => {
  const hasPhone = formData.value.phone_number.length > 0;
  
  if (props.role === 'landlord') {
    const hasCompanyName = (props.landlordType === 'company' || props.landlordType === 'property_management') 
      ? formData.value.company_name.length > 0 
      : true;
    const hasExperience = formData.value.years_of_experience !== null;
    return hasPhone && hasCompanyName && hasExperience;
  } else {
    const hasOccupation = formData.value.occupation.length > 0;
    return hasPhone && hasOccupation;
  }
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    selectedFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', {
      ...formData.value,
      avatarFile: selectedFile.value
    });
  }
};
</script>

<style scoped>
.profile-setup {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.step-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.5rem 0;
}

.step-subtitle {
  font-size: 1.125rem;
  color: #6B7280;
  margin: 0;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.avatar-upload {
  position: relative;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #E5E7EB;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #F9FAFB;
}

.avatar-preview:hover {
  border-color: #667eea;
  transform: scale(1.05);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.camera-icon {
  font-size: 32px;
  color: #9CA3AF;
}

.upload-text {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 600;
}

.file-input {
  display: none;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.optional {
  font-weight: 400;
  color: #9CA3AF;
  font-size: 0.8125rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  font-size: 20px;
  color: #9CA3AF;
  pointer-events: none;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  font-size: 1rem;
  color: #1F2937;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  transition: all 0.3s ease;
  outline: none;
  font-family: inherit;
}

.form-textarea {
  padding: 0.875rem 1rem;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9CA3AF;
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: #9CA3AF;
}

.submit-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  margin-top: 1rem;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button-spinner {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .step-title {
    font-size: 1.75rem;
  }
}
</style>
