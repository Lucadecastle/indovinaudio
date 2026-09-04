<script setup lang="ts">
import { ref } from 'vue'
import { useAudioRound, STEPS } from '~/composables/useAudioRound'
import type { GameMode } from '~/composables/useAudioRound'

const {
  track,
  currentStep,
  phase,
  result,
  earnedPoints,
  isPlaying,
  isLoading,
  error,
  hasListened,
  maxPoints,
  currentDuration,
  isLastStep,
  startRound,
  play,
  skip,
  guess,
  nextRound,
} = useAudioRound()

const guessInput = ref('')

function handleStart(mode: GameMode, filter?: string) {
  startRound(mode, filter)
}

function handleGuessSubmit(value?: string) {
  const input = value || guessInput.value
  if (!input.trim()) return
  guess(input)
}

function handleSkip() {
  skip()
  guessInput.value = ''
}

function handleNextRound() {
  guessInput.value = ''
  nextRound()
}

function handleBackToMenu() {
  guessInput.value = ''
  nextRound()
}

function handleSelectSuggestion(value: string) {
  guessInput.value = value
}

useHead({
  title: 'Indovinaudio — Riconosci il brano!',
})
</script>

<template>
  <div class="game-container">
    <!-- ── FASE 1: Selezione Modalità ──────────────── -->
    <Transition name="phase" mode="out-in">
      <div v-if="phase === 'selecting'" key="selecting" class="phase-wrapper">
        <ModeSelector @start="handleStart" />
      </div>

      <!-- ── FASE 2: Gioco ─────────────────────────── -->
      <div v-else-if="phase === 'playing'" key="playing" class="phase-wrapper game-phase">
        <!-- Header con punti potenziali -->
        <div class="game-header">
          <button
            id="back-btn"
            class="back-btn"
            @click="handleBackToMenu"
            aria-label="Torna al menu"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="back-icon">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <div class="points-badge neu-concave">
            <span class="points-label">Punti in palio</span>
            <span class="points-value text-gradient-accent">{{ maxPoints }}</span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner" />
          <p class="loading-text">Caricamento traccia...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state neu-surface">
          <p class="error-text">{{ error }}</p>
          <button class="neu-btn neu-convex" @click="handleBackToMenu">
            Torna al menu
          </button>
        </div>

        <!-- Game Board -->
        <template v-else>
          <!-- Barra segmenti -->
          <SegmentBar :current-step="currentStep" :is-playing="isPlaying" />

          <!-- Play Button -->
          <PlayButton
            :is-playing="isPlaying"
            :duration="currentDuration"
            @play="play"
          />

          <!-- Input Indovinello -->
          <GuessInput
            v-model="guessInput"
            :disabled="isPlaying"
            @submit="handleGuessSubmit"
            @select-suggestion="handleSelectSuggestion"
          />

          <!-- Barra Azioni -->
          <ActionBar
            :can-skip="!isPlaying"
            :can-submit="guessInput.trim().length > 0 && !isPlaying"
            :is-last-step="isLastStep"
            @skip="handleSkip"
            @submit="handleGuessSubmit()"
          />
        </template>
      </div>
    </Transition>

    <!-- ── FASE 3: Risultato (modale sovrapposta) ── -->
    <RoundModal
      :show="phase === 'result'"
      :result="result"
      :track="track"
      :points="earnedPoints"
      @next-round="handleNextRound"
      @back-to-menu="handleBackToMenu"
    />
  </div>
</template>

<style scoped>
.game-container {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
}

.phase-wrapper {
  width: 100%;
  max-width: 520px;
}

.game-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

/* ── Header ──────── */
.game-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-neu-text-muted);
  padding: 8px;
  border-radius: var(--radius-neu-sm);
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--color-neu-text);
}

.back-icon {
  width: 24px;
  height: 24px;
}

.points-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 22px;
  border-radius: var(--radius-neu);
}

.points-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-neu-text-dim);
  font-weight: 600;
}

.points-value {
  font-size: 1.6rem;
  font-weight: 800;
}

/* ── Loading ──────── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-neu-surface-alt);
  border-top-color: var(--color-neu-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--color-neu-text-muted);
  font-size: 0.9rem;
}

/* ── Error ──────── */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  text-align: center;
}

.error-text {
  color: var(--color-neu-error);
  font-size: 0.95rem;
}

/* ── Phase Transitions ── */
.phase-enter-active {
  animation: slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.phase-leave-active {
  animation: fade-in 0.2s ease reverse;
}

@media (max-width: 480px) {
  .game-container {
    align-items: flex-start;
    padding-top: 40px;
  }

  .game-phase {
    gap: 22px;
  }
}
</style>
