<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Track } from '~/composables/useAudioRound'

const props = defineProps<{
  show: boolean
  result: 'win' | 'lose' | null
  track: Track | null
  points: number
}>()

const emit = defineEmits<{
  nextRound: []
  backToMenu: []
}>()

const displayPoints = ref(0)
const showConfetti = ref(false)

// Animazione count-up del punteggio
watch(
  () => props.show,
  (visible) => {
    if (visible && props.result === 'win') {
      animatePoints(props.points)
      showConfetti.value = true
      setTimeout(() => (showConfetti.value = false), 3500)
    } else {
      displayPoints.value = props.points
    }
  }
)

function animatePoints(target: number) {
  displayPoints.value = 0
  const duration = 800
  const start = performance.now()

  function tick(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    // Easing: ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    displayPoints.value = Math.round(eased * target)
    if (progress < 1) requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

// Confetti particles
const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 1.5,
  duration: 2 + Math.random() * 2,
  color: ['#6c5ce7', '#a29bfe', '#00cec9', '#fbc531', '#fd7272', '#e4e8ef'][
    Math.floor(Math.random() * 6)
  ],
  size: 6 + Math.random() * 8,
}))
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="emit('backToMenu')">
      <div class="modal-content neu-surface animate-slide-up">
        <!-- Confetti -->
        <div v-if="showConfetti && result === 'win'" class="confetti-container">
          <div
            v-for="p in confettiPieces"
            :key="p.id"
            class="confetti-piece"
            :style="{
              left: p.left + '%',
              animationDelay: p.delay + 's',
              animationDuration: p.duration + 's',
              backgroundColor: p.color,
              width: p.size + 'px',
              height: p.size + 'px',
            }"
          />
        </div>

        <!-- Risultato icona -->
        <div
          class="result-badge"
          :class="result === 'win' ? 'result-badge--win' : 'result-badge--lose'"
        >
          <svg v-if="result === 'win'" viewBox="0 0 24 24" fill="currentColor" class="result-icon">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" class="result-icon">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </div>

        <!-- Copertina Album -->
        <div v-if="track" class="album-reveal">
          <img
            :src="track.cover"
            :alt="`Copertina: ${track.album}`"
            class="album-cover"
          />
          <div class="album-glow" />
        </div>

        <!-- Info traccia -->
        <div v-if="track" class="track-info">
          <h2 class="track-title">{{ track.title }}</h2>
          <p class="track-artist">{{ track.artist }}</p>
          <p class="track-album">{{ track.album }}</p>
        </div>

        <!-- Punteggio -->
        <div class="score-section">
          <span class="score-label">{{ result === 'win' ? 'Punteggio' : 'Punteggio' }}</span>
          <span
            class="score-value"
            :class="result === 'win' ? 'score-value--win' : 'score-value--lose'"
          >
            {{ displayPoints }}
          </span>
        </div>

        <!-- Azioni -->
        <div class="modal-actions">
          <button
            id="next-round-btn"
            class="neu-btn neu-btn-primary modal-btn modal-btn--primary"
            @click="emit('nextRound')"
          >
            <Icon name="ph:music-notes" class="btn-icon" /> Prossima Canzone
          </button>
          <button
            id="back-menu-btn"
            class="neu-btn neu-convex modal-btn modal-btn--secondary"
            @click="emit('backToMenu')"
          >
            <Icon name="ph:house" class="btn-icon" /> Torna al Menu
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 36px 28px 28px;
  overflow: hidden;
}

/* ── Result Badge ──── */
.result-badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-badge--win {
  background: linear-gradient(135deg, var(--color-neu-success), #55efc4);
  box-shadow: 0 4px 18px rgba(0, 206, 201, 0.35);
}

.result-badge--lose {
  background: linear-gradient(135deg, var(--color-neu-error), #e17055);
  box-shadow: 0 4px 18px rgba(253, 114, 114, 0.35);
}

.result-icon {
  width: 28px;
  height: 28px;
  color: #fff;
}

/* ── Album Cover ──── */
.album-reveal {
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: var(--radius-neu);
  overflow: hidden;
}

.album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-neu);
  box-shadow:
    6px 6px 16px var(--shadow-neu-dark),
    -6px -6px 16px var(--shadow-neu-light);
}

.album-glow {
  position: absolute;
  inset: -20%;
  background: radial-gradient(
    circle,
    rgba(108, 92, 231, 0.15) 0%,
    transparent 70%
  );
  pointer-events: none;
}

/* ── Track Info ──── */
.track-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.track-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-neu-text);
}

.track-artist {
  font-size: 1rem;
  color: var(--color-neu-accent-light);
  font-weight: 500;
}

.track-album {
  font-size: 0.82rem;
  color: var(--color-neu-text-dim);
}

/* ── Score ──────── */
.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-neu-text-dim);
  font-weight: 600;
}

.score-value {
  font-size: 2.8rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.score-value--win {
  background: linear-gradient(135deg, var(--color-neu-success), #55efc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.score-value--lose {
  color: var(--color-neu-error);
}

/* ── Actions ──────── */
.modal-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-btn {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius-neu);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  font-size: 1.2rem;
}

.modal-btn--secondary {
  font-size: 0.88rem;
  color: var(--color-neu-text-muted);
}

/* ── Confetti ──────── */
.confetti-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 10;
}

.confetti-piece {
  position: absolute;
  top: -10px;
  border-radius: 2px;
  animation: confetti-fall linear forwards;
}

/* ── Modal Transition ── */
.modal-enter-active {
  animation: fade-in 0.3s ease;
}

.modal-enter-active .modal-content {
  animation: slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.modal-leave-active {
  animation: fade-in 0.2s ease reverse;
}

.modal-leave-active .modal-content {
  animation: slide-up 0.2s ease reverse;
}
</style>
