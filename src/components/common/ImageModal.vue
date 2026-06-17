<template>
  <div v-if="modelValue" class="image-modal" @click.self="close">
    <div class="modal-content">
      <button class="modal-close" @click="close">×</button>
      <div class="modal-image-wrapper" @wheel.passive.prevent="onWheel">
        <img :src="src" :style="{ transform: `translate(${translateX}px, ${translateY}px) scale(${scale})` }"
          class="modal-img" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean;
  src: string;
}>();

const emit = defineEmits(['update:modelValue']);

const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isPanning = ref(false);
const lastX = ref(0);
const lastY = ref(0);

watch(() => props.modelValue, (v) => {
  if (v) scale.value = 1;
  if (v) {
    translateX.value = 0;
    translateY.value = 0;
    isPanning.value = false;
  }
});

const close = () => {
  emit('update:modelValue', false);
}

const onWheel = (e: WheelEvent) => {
  const delta = -e.deltaY;
  const factor = delta > 0 ? 0.1 : -0.1;
  scale.value = Math.min(Math.max(0.5, scale.value + factor), 4);
}

const onPointerDown = (e: PointerEvent) => {
  isPanning.value = true;
  lastX.value = e.clientX;
  lastY.value = e.clientY;
  (e.target as Element).setPointerCapture?.(e.pointerId);
}

const onPointerMove = (e: PointerEvent) => {
  if (!isPanning.value) return;
  const dx = e.clientX - lastX.value;
  const dy = e.clientY - lastY.value;
  lastX.value = e.clientX;
  lastY.value = e.clientY;
  translateX.value += dx;
  translateY.value += dy;
}

const onPointerUp = (e: PointerEvent) => {
  isPanning.value = false;
  try {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  } catch { }
}
</script>

<style scoped lang="scss">
.image-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
}

.modal-content {
  position: relative;
  max-width: 95%;
  max-height: 95%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #fff;
  font-size: 22px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
}

.modal-image-wrapper {
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  /* allow pointer events for pan */
  cursor: grab;
}

.modal-img {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.1s linear;
  will-change: transform;
}

.modal-image-wrapper:active {
  cursor: grabbing;
}
</style>
