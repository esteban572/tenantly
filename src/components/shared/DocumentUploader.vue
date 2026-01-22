<template>
  <div class="document-uploader">
    <div 
      class="dropzone"
      :class="{ 'dragover': isDragging }"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @click="triggerFileInput"
    >
      <input 
        ref="fileInput"
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <div class="dropzone-content">
        <ion-icon :icon="documentAttachOutline" class="text-5xl text-gray-400 mb-2"></ion-icon>
        <p class="text-gray-600 font-medium">Drag & drop documents here</p>
        <p class="text-gray-400 text-sm">or click to browse</p>
        <p class="text-gray-400 text-xs mt-2">Supported: PDF, DOC, DOCX, JPG, PNG</p>
      </div>
    </div>

    <!-- Document List -->
    <div v-if="documents.length > 0" class="document-list mt-4">
      <div v-for="(doc, index) in documents" :key="index" class="document-item">
        <div class="flex items-center gap-3 flex-1">
          <ion-icon :icon="getFileIcon(doc.file.type)" class="text-2xl text-blue-500"></ion-icon>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate">{{ doc.file.name }}</p>
            <p class="text-xs text-gray-500">{{ formatFileSize(doc.file.size) }}</p>
          </div>
        </div>
        
        <select 
          v-model="doc.category"
          class="category-select"
          @click.stop
        >
          <option value="id">ID</option>
          <option value="financial">Financial</option>
          <option value="reference">Reference</option>
          <option value="lease">Lease</option>
          <option value="other">Other</option>
        </select>

        <button 
          @click.stop="removeDocument(index)"
          class="remove-btn"
          type="button"
        >
          <ion-icon :icon="closeCircle"></ion-icon>
        </button>
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
import { documentAttachOutline, closeCircle, documentTextOutline, imageOutline } from 'ionicons/icons';
import { supabase } from '@/services/supabaseClient';

interface DocumentFile {
  file: File;
  category: string;
}

const props = defineProps<{
  maxFiles?: number;
  relatedToId?: string;
  relatedToType?: 'property' | 'application' | 'tenancy';
}>();

const emit = defineEmits<{
  (e: 'update:documents', docs: string[]): void;
  (e: 'upload-complete', docs: any[]): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const documents = ref<DocumentFile[]>([]);
const isDragging = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);

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
  const maxFiles = props.maxFiles || 10;
  const remainingSlots = maxFiles - documents.value.length;
  const filesToAdd = files.slice(0, remainingSlots);
  
  filesToAdd.forEach(file => {
    documents.value.push({
      file,
      category: 'other'
    });
  });
};

const removeDocument = (index: number) => {
  documents.value.splice(index, 1);
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return imageOutline;
  return documentTextOutline;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const uploadDocuments = async (): Promise<any[]> => {
  if (documents.value.length === 0) return [];
  
  uploading.value = true;
  uploadProgress.value = 0;
  const uploadedDocs: any[] = [];
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    for (let i = 0; i < documents.value.length; i++) {
      const doc = documents.value[i];
      const fileExt = doc.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('documents')
        .upload(fileName, doc.file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Create document record in database
      const { data: docRecord, error: docError } = await supabase
        .from('documents')
        .insert([{
          uploader_id: user.id,
          related_to_id: props.relatedToId,
          related_to_type: props.relatedToType,
          file_name: doc.file.name,
          file_path: fileName,
          file_type: doc.file.type,
          file_size: doc.file.size,
          category: doc.category,
          is_public: false
        }])
        .select()
        .single();
      
      if (docError) throw docError;
      
      uploadedDocs.push(docRecord);
      uploadProgress.value = (i + 1) / documents.value.length;
    }
    
    emit('upload-complete', uploadedDocs);
    
    return uploadedDocs;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  } finally {
    uploading.value = false;
  }
};

defineExpose({
  uploadDocuments,
  documents
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
  min-height: 150px;
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

.document-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
}

.document-item:hover {
  border-color: #cbd5e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.remove-btn {
  background: none;
  border: none;
  color: #e53e3e;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  transform: scale(1.1);
}

.hidden {
  display: none;
}
</style>
