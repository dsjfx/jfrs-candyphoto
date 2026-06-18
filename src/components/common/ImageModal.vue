<template>
  <div v-if="modelValue" class="image-modal" @click.self="close">
    <div class="modal-content">
      <button class="modal-close panzoom-exclude" @click="close">×</button>
      <div class="modal-image-wrapper" @wheel.prevent="onWheel" @pointerdown="onPointerDown"
        @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerUp">
        <img ref="modalImgRef" :src="src"
          :style="{ transform: `translate(${currentX}px, ${currentY}px) scale(${scale})` }" class="modal-img" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: boolean;
  src: string;
}>();

const emit = defineEmits(['update:modelValue']);

const modalImgRef = ref<HTMLElement | null>(null);

const scale = ref(1);
let currentX = 0;
let currentY = 0;
const isPanning = ref(false);
const lastX = ref(0);
const lastY = ref(0);
let pending = false;
let baseRect: DOMRect | null = null;
let containerRect: DOMRect | null = null;
let baseWidth = 0;
let baseHeight = 0;
// inertia state
let velocityX = 0;
let velocityY = 0;
const samples: Array<{ t: number, x: number, y: number }> = [];
let inertiaRaf: number | null = null;

const recomputeRects = () => {
  const img = modalImgRef.value as HTMLElement | null;
  const wrapper = img?.parentElement as HTMLElement | null;
  if (img && wrapper) {
    // temporarily reset transform to measure natural size
    const prev = img.style.transform;
    img.style.transition = 'none';
    img.style.transform = 'translate(0px, 0px) scale(1)';
    baseRect = img.getBoundingClientRect();
    containerRect = wrapper.getBoundingClientRect();
    baseWidth = baseRect.width;
    baseHeight = baseRect.height;
    img.style.transform = prev;
    img.style.transition = '';
  }
}

onMounted(() => {
  window.addEventListener('resize', recomputeRects);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', recomputeRects);
});

const close = () => {
  emit('update:modelValue', false);
}

watch(() => props.modelValue, (v) => {
  if (v) {
    // reset state
    scale.value = 1;
    currentX = 0;
    currentY = 0;
    isPanning.value = false;
    pending = false;
    // measure sizes
    nextTick().then(() => recomputeRects());
    // ensure transform reset
    const img = modalImgRef.value as HTMLElement | null;
    if (img) img.style.transform = `translate(0px, 0px) scale(${scale.value})`;
  }
});

const applyTransform = () => {
  const img = modalImgRef.value as HTMLElement | null;
  if (img) {
    img.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale.value})`;
  }
  pending = false;
}

// clampTranslation: centers image when smaller than container; clamps and returns if at edges
const clampTranslation = (): { clampedX: boolean, clampedY: boolean } => {
  if (!modalImgRef.value || !containerRect || !baseRect) return { clampedX: true, clampedY: true };
  const containerW = containerRect.width;
  const containerH = containerRect.height;
  const imgW = baseWidth * scale.value;
  const imgH = baseHeight * scale.value;

  // if image smaller than container, center it
  if (imgW <= containerW) {
    currentX = 0;
  } else {
    const maxX = (imgW - containerW) / 2;
    currentX = Math.min(maxX, Math.max(-maxX, currentX));
  }

  if (imgH <= containerH) {
    currentY = 0;
  } else {
    const maxY = (imgH - containerH) / 2;
    currentY = Math.min(maxY, Math.max(-maxY, currentY));
  }

  return { clampedX: imgW <= containerW ? true : Math.abs(currentX) === Math.max(0, (imgW - containerW) / 2), clampedY: imgH <= containerH ? true : Math.abs(currentY) === Math.max(0, (imgH - containerH) / 2) };
}

const onWheel = (e: WheelEvent) => {
  e.preventDefault();
  const wrapper = modalImgRef.value?.parentElement as HTMLElement | null;
  if (!modalImgRef.value || !wrapper) return;

  const rect = wrapper.getBoundingClientRect();
  const pointerX = e.clientX - rect.left; // within wrapper
  const pointerY = e.clientY - rect.top;

  const factor = -e.deltaY > 0 ? 0.1 : -0.1;
  const newScale = Math.min(Math.max(0.5, scale.value + factor), 4);

  const imgCurrentWidth = baseWidth * scale.value || 1;
  const imgNewWidth = baseWidth * newScale;
  const imgCurrentHeight = baseHeight * scale.value || 1;
  const imgNewHeight = baseHeight * newScale;

  // pointer position ratio within image coordinate system
  const ratioX = (pointerX - (rect.width / 2) - currentX) / imgCurrentWidth;
  const ratioY = (pointerY - (rect.height / 2) - currentY) / imgCurrentHeight;

  currentX = currentX - (imgNewWidth - imgCurrentWidth) * ratioX;
  currentY = currentY - (imgNewHeight - imgCurrentHeight) * ratioY;

  scale.value = newScale;

  clampTranslation();

  // stop any inertia in progress
  if (inertiaRaf) {
    cancelAnimationFrame(inertiaRaf);
    inertiaRaf = null;
    velocityX = 0; velocityY = 0;
  }

  if (!pending) {
    pending = true;
    requestAnimationFrame(applyTransform);
  }
}

const onPointerDown = (e: PointerEvent) => {
  isPanning.value = true;
  lastX.value = e.clientX;
  lastY.value = e.clientY;
  (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  if (modalImgRef.value) modalImgRef.value.classList.add('no-transition');
  // start sampling for velocity
  samples.length = 0;
  samples.push({ t: performance.now(), x: e.clientX, y: e.clientY });
  // stop inertia
  if (inertiaRaf) { cancelAnimationFrame(inertiaRaf); inertiaRaf = null; velocityX = 0; velocityY = 0; }
}

const onPointerMove = (e: PointerEvent) => {
  if (!isPanning.value) return;
  const dx = e.clientX - lastX.value;
  const dy = e.clientY - lastY.value;
  lastX.value = e.clientX;
  lastY.value = e.clientY;
  currentX += dx;
  currentY += dy;
  clampTranslation();
  // record sample
  samples.push({ t: performance.now(), x: e.clientX, y: e.clientY });
  // keep only last 100ms of samples
  const cutoff = performance.now() - 100;
  while (samples.length > 0 && samples[0].t < cutoff) samples.shift();
  if (!pending) {
    pending = true;
    requestAnimationFrame(applyTransform);
  }
}

const onPointerUp = (e: PointerEvent) => {
  isPanning.value = false;
  try { (e.currentTarget as Element).releasePointerCapture?.(e.pointerId); } catch { }
  if (modalImgRef.value) modalImgRef.value.classList.remove('no-transition');
  // compute velocity from samples
  if (samples.length >= 2) {
    const first = samples[0];
    const last = samples[samples.length - 1];
    const dt = Math.max(1, last.t - first.t); // ms
    velocityX = (last.x - first.x) / dt * 16.6667; // px per frame (assuming 60fps)
    velocityY = (last.y - first.y) / dt * 16.6667;
  } else {
    velocityX = 0; velocityY = 0;
  }
  samples.length = 0;

  // start inertia if velocity significant
  const startInertia = () => {
    const friction = 0.95; // per frame multiplier
    const threshold = 0.3; // px/frame
    const step = () => {
      // apply velocity
      currentX += velocityX;
      currentY += velocityY;
      // apply friction
      velocityX *= friction;
      velocityY *= friction;
      // clamp and detect edges
      const { clampedX, clampedY } = clampTranslation();
      if (pending === false) {
        pending = true; requestAnimationFrame(applyTransform);
      }
      // stop when both velocities small or both axes clamped and moving outwards
      const stopX = Math.abs(velocityX) < threshold || (clampedX && Math.sign(velocityX) !== Math.sign(currentX));
      const stopY = Math.abs(velocityY) < threshold || (clampedY && Math.sign(velocityY) !== Math.sign(currentY));
      if ((stopX && stopY) || (Math.abs(velocityX) + Math.abs(velocityY) < 0.5)) {
        inertiaRaf = null;
        velocityX = 0; velocityY = 0;
        return;
      }
      inertiaRaf = requestAnimationFrame(step);
    };
    inertiaRaf = requestAnimationFrame(step);
  };

  if (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5) startInertia();
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

.modal-img.no-transition {
  transition: none !important;
}

.modal-image-wrapper:active {
  cursor: grabbing;
}
</style>
