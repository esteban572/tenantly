<template>
  <div class="image-uploader">
    <div 
      class="dropzone"
      :class="{ 'dragover': isDragging, 'has-images': images.length > 0 }"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @click="triggerFileInput"
    >
      <input 
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <div v-if="images.length === 0" class="dropzone-content">
        <ion-icon :icon="cloudUploadOutline" class="text-5xl text-gray-400 mb-2"></ion-icon>
        <p class="text-gray-600 font-medium">Drag & drop images here</p>
        <p class="text-gray-400 text-sm">or click to browse</p>
      </div>
      
      <div v-else class="image-preview-grid">
        <div v-for="(image, index) in images" :key="index" class="image-preview-item">
          <img :src="image.preview" :alt="`Preview ${index + 1}`" class="preview-image" />
          <button 
            @click.stop="removeImage(index)"
            class="remove-btn"
            type="button"
          >
            <ion-icon :icon="closeCircle"></ion-icon>
          </button>
        </div>
        <div class="add-more-btn" @click.stop="triggerFileInput">
          <ion-icon :icon="addCircleOutline" class="text-3xl text-blue-500"></ion-icon>
          <p class="text-xs text-gray-500">Add more</p>
        </div>
      </div>
    </div>
    
    <div v-if="uploading" class="mt-4">
      <ion-progress-bar :value="uploadProgress"></ion-progress-bar>
      <p class="text-sm text-gray-600 mt-2 text-center">Uploading... {{ Math.round(uploadProgress * 100) }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonIcon, IonProgressBar } from '@ionic/vue';
import { cloudUploadOutline, closeCircle, addCircleOutline } from 'ionicons/icons';
import { supabase } from '@/services/supabaseClient';

interface ImageFile {
  file: File;
  preview: string;
}

const props = defineProps<{
  maxImages?: number;
  existingImages?: string[];
}>();

const emit = defineEmits<{
  (e: 'update:images', urls: string[]): void;
  (e: 'upload-complete', urls: string[]): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const images = ref<ImageFile[]>([]);
const isDragging = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadedUrls = ref<string[]>(props.existingImages || []);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    addFiles(Array.from(target.files));
  }
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files));
  }
};

const addFiles = (files: File[]) => {
  const maxImages = props.maxImages || 10;
  const remainingSlots = maxImages - images.value.length;
  const filesToAdd = files.slice(0, remainingSlots);
  
  filesToAdd.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        images.value.push({
          file,
          preview: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  });
};

const removeImage = (index: number) => {
  images.value.splice(index, 1);
};

const uploadImages = async (): Promise<string[]> => {
  if (images.value.length === 0) return uploadedUrls.value;
  
  uploading.value = true;
  uploadProgress.value = 0;
  const urls: string[] = [...uploadedUrls.value];
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    for (let i = 0; i < images.value.length; i++) {
      const image = images.value[i];
      const fileExt = image.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('property-images')
        .upload(fileName, image.file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);
      
      urls.push(publicUrl);
      uploadProgress.value = (i + 1) / images.value.length;
    }
    
    uploadedUrls.value = urls;
    emit('update:images', urls);
    emit('upload-complete', urls);
    
    return urls;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  } finally {
    uploading.value = false;
  }
};

defineExpose({
  uploadImages,
  images,
  uploadedUrls
});
</script>

<style scoped>
.dropzone {
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f7fafc;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropzone:hover {
  border-color: #4299e1;
  background-color: #ebf8ff;
}

.dropzone.dragover {
  border-color: #3182ce;
  background-color: #bee3f8;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  width: 100%;
}

.image-preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #e53e3e;
  font-size: 24px;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: white;
  transform: scale(1.1);
}

.add-more-btn {
  aspect-ratio: 1;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f7fafc;
}

.add-more-btn:hover {
  border-color: #4299e1;
  background-color: #ebf8ff;
}

.hidden {
  display: none;
}
</style>
