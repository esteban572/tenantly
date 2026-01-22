<template>
  <div class="signature-canvas-container">
    <div class="canvas-wrapper" ref="canvasWrapper">
      <canvas 
        ref="canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="startDrawing"
        @touchmove.prevent="draw"
        @touchend.prevent="stopDrawing"
        class="signature-canvas"
      ></canvas>
    </div>
    
    <div class="canvas-controls">
      <ion-button fill="outline" size="small" @click="clear">
        <ion-icon slot="start" :icon="trashOutline"></ion-icon>
        Clear
      </ion-button>
      <ion-button fill="outline" size="small" @click="undo" :disabled="!canUndo">
        <ion-icon slot="start" :icon="arrowUndoOutline"></ion-icon>
        Undo
      </ion-button>
    </div>
    
    <p class="text-xs text-gray-500 text-center mt-2">
      Sign above using your mouse or finger
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { trashOutline, arrowUndoOutline } from 'ionicons/icons';

const canvas = ref<HTMLCanvasElement | null>(null);
const canvasWrapper = ref<HTMLDivElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const isDrawing = ref(false);
const strokes = ref<Array<Array<{x: number, y: number}>>>([]);
const currentStroke = ref<Array<{x: number, y: number}>>([]);
const canUndo = ref(false);

const initCanvas = () => {
  if (!canvas.value || !canvasWrapper.value) return;
  
  const wrapper = canvasWrapper.value;
  canvas.value.width = wrapper.clientWidth;
  canvas.value.height = 200;
  
  ctx.value = canvas.value.getContext('2d');
  if (ctx.value) {
    ctx.value.strokeStyle = '#000';
    ctx.value.lineWidth = 2;
    ctx.value.lineCap = 'round';
    ctx.value.lineJoin = 'round';
  }
};

const getCoordinates = (event: MouseEvent | TouchEvent) => {
  if (!canvas.value) return { x: 0, y: 0 };
  
  const rect = canvas.value.getBoundingClientRect();
  
  if (event instanceof MouseEvent) {
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  } else {
    const touch = event.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }
};

const startDrawing = (event: MouseEvent | TouchEvent) => {
  isDrawing.value = true;
  currentStroke.value = [];
  const coords = getCoordinates(event);
  currentStroke.value.push(coords);
  
  if (ctx.value) {
    ctx.value.beginPath();
    ctx.value.moveTo(coords.x, coords.y);
  }
};

const draw = (event: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !ctx.value) return;
  
  const coords = getCoordinates(event);
  currentStroke.value.push(coords);
  
  ctx.value.lineTo(coords.x, coords.y);
  ctx.value.stroke();
};

const stopDrawing = () => {
  if (isDrawing.value && currentStroke.value.length > 0) {
    strokes.value.push([...currentStroke.value]);
    canUndo.value = true;
  }
  isDrawing.value = false;
  currentStroke.value = [];
};

const clear = () => {
  if (!ctx.value || !canvas.value) return;
  
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
  strokes.value = [];
  canUndo.value = false;
};

const undo = () => {
  if (strokes.value.length === 0) return;
  
  strokes.value.pop();
  redraw();
  canUndo.value = strokes.value.length > 0;
};

const redraw = () => {
  if (!ctx.value || !canvas.value) return;
  
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
  
  strokes.value.forEach(stroke => {
    if (stroke.length === 0) return;
    
    ctx.value!.beginPath();
    ctx.value!.moveTo(stroke[0].x, stroke[0].y);
    
    stroke.forEach(point => {
      ctx.value!.lineTo(point.x, point.y);
    });
    
    ctx.value!.stroke();
  });
};

const getSignatureData = (): string => {
  if (!canvas.value) return '';
  return canvas.value.toDataURL('image/png');
};

const isEmpty = (): boolean => {
  return strokes.value.length === 0;
};

onMounted(() => {
  initCanvas();
  window.addEventListener('resize', initCanvas);
});

onUnmounted(() => {
  window.removeEventListener('resize', initCanvas);
});

defineExpose({
  getSignatureData,
  isEmpty,
  clear
});
</script>

<style scoped>
.signature-canvas-container {
  width: 100%;
}

.canvas-wrapper {
  width: 100%;
  border: 2px solid #cbd5e0;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.signature-canvas {
  display: block;
  width: 100%;
  height: 200px;
  cursor: crosshair;
  touch-action: none;
}

.canvas-controls {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  justify-content: center;
}
</style>
