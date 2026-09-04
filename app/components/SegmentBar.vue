<script setup lang="ts">
import { STEPS } from '~/composables/useAudioRound'

const props = defineProps<{
  currentStep: number
  isPlaying: boolean
}>()
</script>

<template>
  <div class="segment-bar" role="progressbar" :aria-valuenow="currentStep + 1" aria-valuemin="1" :aria-valuemax="STEPS.length">
    <div
      v-for="(step, i) in STEPS"
      :key="i"
      :id="`segment-${i}`"
      class="segment"
      :class="{
        'segment--active': i === currentStep,
        'segment--done': i < currentStep,
        'segment--future': i > currentStep,
        'segment--playing': i === currentStep && isPlaying,
      }"
    >
      <div class="segment-fill" />
      <div class="segment-info">
        <span class="segment-duration">{{ step.label }}</span>
        <span class="segment-points">{{ step.points }}pt</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.segment-bar {
  display: flex;
  gap: 6px;
  width: 100%;
  max-width: 460px;
  padding: 4px;
}

.segment {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px 8px;
  border-radius: var(--radius-neu-sm);
  background: var(--color-neu-surface);
  box-shadow:
    inset 2px 2px 5px var(--shadow-neu-inset-dark),
    inset -2px -2px 5px var(--shadow-neu-inset-light);
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

.segment-fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  background: linear-gradient(135deg, var(--color-neu-accent), var(--color-neu-accent-light));
  transition: opacity 0.35s ease;
}

/* ── States ──────── */
.segment--active .segment-fill {
  opacity: 0.18;
}

.segment--active {
  border: 1.5px solid var(--color-neu-accent);
  box-shadow:
    0 0 12px rgba(108, 92, 231, 0.2),
    inset 2px 2px 5px var(--shadow-neu-inset-dark),
    inset -2px -2px 5px var(--shadow-neu-inset-light);
}

.segment--done .segment-fill {
  opacity: 0.08;
}

.segment--done {
  opacity: 0.45;
}

.segment--future {
  opacity: 0.55;
}

.segment--playing {
  animation: segment-pulse 1s ease-in-out infinite;
}

@keyframes segment-pulse {
  0%, 100% {
    box-shadow:
      0 0 12px rgba(108, 92, 231, 0.2),
      inset 2px 2px 5px var(--shadow-neu-inset-dark),
      inset -2px -2px 5px var(--shadow-neu-inset-light);
  }
  50% {
    box-shadow:
      0 0 22px rgba(108, 92, 231, 0.4),
      inset 2px 2px 5px var(--shadow-neu-inset-dark),
      inset -2px -2px 5px var(--shadow-neu-inset-light);
  }
}

/* ── Info ──────── */
.segment-info {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.segment-duration {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-neu-text);
}

.segment--active .segment-duration {
  color: var(--color-neu-accent-light);
}

.segment-points {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--color-neu-text-dim);
}

.segment--active .segment-points {
  color: var(--color-neu-text-muted);
}

@media (max-width: 480px) {
  .segment-duration {
    font-size: 0.72rem;
  }
  .segment-points {
    font-size: 0.58rem;
  }
}
</style>
