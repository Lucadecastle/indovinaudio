<script setup lang="ts">
const props = defineProps<{
  isPlaying: boolean
  disabled?: boolean
  duration: number
}>()

const emit = defineEmits<{
  play: []
}>()
</script>

<template>
  <div class="play-btn-wrapper">
    <!-- Ripple ring durante la riproduzione -->
    <div v-if="isPlaying" class="play-ring" />
    <div v-if="isPlaying" class="play-ring play-ring--delayed" />

    <button
      id="play-btn"
      class="play-btn neu-convex"
      :class="{ 'play-btn--playing': isPlaying }"
      :disabled="disabled"
      :aria-label="isPlaying ? 'In riproduzione' : 'Ascolta il frammento'"
      @click="emit('play')"
    >
      <!-- Play icon -->
      <Icon
        v-if="!isPlaying"
        name="ph:play-fill"
        class="play-icon"
      />

      <!-- Equalizer animation quando in riproduzione -->
      <div v-else class="equalizer">
        <span class="eq-bar" />
        <span class="eq-bar" />
        <span class="eq-bar" />
        <span class="eq-bar" />
      </div>
    </button>

    <span class="duration-label">{{ duration }}s</span>
  </div>
</template>

<style scoped>
.play-btn-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.play-btn {
  position: relative;
  z-index: 2;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  color: var(--color-neu-accent-light);
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-neu-surface) 100%, white 5%),
    color-mix(in srgb, var(--color-neu-surface) 100%, black 10%)
  );
  box-shadow:
    8px 8px 20px var(--shadow-neu-dark),
    -8px -8px 20px var(--shadow-neu-light);
  transition: all 0.2s ease;
}

.play-btn:hover:not(:disabled) {
  transform: scale(1.04);
  box-shadow:
    10px 10px 24px var(--shadow-neu-dark),
    -10px -10px 24px var(--shadow-neu-light);
}

.play-btn:active:not(:disabled),
.play-btn--playing {
  box-shadow:
    inset 6px 6px 14px var(--shadow-neu-inset-dark),
    inset -6px -6px 14px var(--shadow-neu-inset-light);
  transform: scale(0.97);
}

.play-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.play-icon {
  width: 40px;
  height: 40px;
  margin-left: 4px; /* Correzione ottica per il triangolo play */
}

/* ── Equalizer ──────── */
.equalizer {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 32px;
}

.eq-bar {
  width: 5px;
  background: var(--color-neu-accent-light);
  border-radius: 3px;
  animation: eq-bounce 0.8s ease-in-out infinite;
}

.eq-bar:nth-child(1) { height: 60%; animation-delay: 0s; }
.eq-bar:nth-child(2) { height: 100%; animation-delay: 0.15s; }
.eq-bar:nth-child(3) { height: 40%; animation-delay: 0.3s; }
.eq-bar:nth-child(4) { height: 80%; animation-delay: 0.45s; }

@keyframes eq-bounce {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}

/* ── Ripple Rings ──── */
.play-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  margin-top: -50px;
  margin-left: -50px;
  border-radius: 50%;
  border: 2px solid var(--color-neu-accent);
  animation: pulse-ring 1.8s ease-out infinite;
  z-index: 1;
}

.play-ring--delayed {
  animation-delay: 0.6s;
}

/* ── Duration Label ── */
.duration-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-neu-text-muted);
  letter-spacing: 0.03em;
}

@media (max-width: 480px) {
  .play-btn {
    width: 88px;
    height: 88px;
  }

  .play-ring {
    width: 88px;
    height: 88px;
    margin-top: -44px;
    margin-left: -44px;
  }

  .play-icon {
    width: 34px;
    height: 34px;
  }
}
</style>
