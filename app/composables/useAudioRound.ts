import { ref, computed, onUnmounted } from 'vue'
import { useGameHistory } from './useGameHistory'

/* ─── Types ────────────────────────────────────────────────── */
export interface Track {
  id: number
  title: string
  artist: string
  artistPicture: string
  preview: string
  cover: string
  album: string
}

export type GamePhase = 'selecting' | 'playing' | 'result'
export type GameResult = 'win' | 'lose' | null
export type GameMode = 'random' | 'genre' | 'artist' | 'decade' | 'country'

/* ─── Constants ────────────────────────────────────────────── */
export const STEPS = [
  { duration: 0.5, points: 1000, label: '0.5s' },
  { duration: 1, points: 800, label: '1s' },
  { duration: 2, points: 600, label: '2s' },
  { duration: 4, points: 400, label: '4s' },
  { duration: 8, points: 200, label: '8s' },
] as const

/* ─── Composable ───────────────────────────────────────────── */
export function useAudioRound() {
  // ── State ──
  const track = ref<Track | null>(null)
  const currentStep = ref(0)
  const phase = ref<GamePhase>('selecting')
  const result = ref<GameResult>(null)
  const earnedPoints = ref(0)
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasListened = ref(false)

  // ── Audio ──
  let audio: HTMLAudioElement | null = null
  let stopTimer: ReturnType<typeof setTimeout> | null = null

  // ── History & Replay ──
  const lastMode = ref<GameMode | null>(null)
  const lastFilter = ref<string | null>(null)
  const { saveRecord } = useGameHistory()

  // ── Computed ──
  const maxPoints = computed(() => STEPS[currentStep.value]?.points ?? 0)
  const currentDuration = computed(() => STEPS[currentStep.value]?.duration ?? 0)
  const isLastStep = computed(() => currentStep.value >= STEPS.length - 1)

  // ── MediaSession Privacy ──
  function maskMediaSession() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Indovinaudio',
        artist: 'Traccia misteriosa',
        album: 'In ascolto...',
        artwork: [],
      })
      // Disabilita i controlli del media tray
      const actions: MediaSessionAction[] = ['play', 'pause', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack']
      actions.forEach((action) => {
        try {
          navigator.mediaSession.setActionHandler(action, null)
        } catch {
          // Azione non supportata, ignora
        }
      })
    }
  }

  // ── Methods ──
  async function startRound(mode: GameMode, filter?: string) {
    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      if (mode === 'genre' && filter) params.set('genre', filter)
      if (mode === 'artist' && filter) params.set('artistId', filter)
      if (mode === 'decade' && filter) params.set('decade', filter)
      if (mode === 'country' && filter) params.set('country', filter)

      lastMode.value = mode
      lastFilter.value = filter || null

      const qs = params.toString()
      const url = `/api/tracks/random${qs ? '?' + qs : ''}`

      const data = await $fetch<Track>(url)
      track.value = data
      currentStep.value = 0
      phase.value = 'playing'
      result.value = null
      earnedPoints.value = 0
      hasListened.value = false

      // Pre-carica l'audio
      cleanupAudio()
      audio = new Audio(data.preview)
      audio.preload = 'auto'

      // Maschera immediatamente i metadati
      maskMediaSession()
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { statusMessage?: string } }).data?.statusMessage
          : undefined
      error.value = message || 'Errore nel caricamento della traccia.'
    } finally {
      isLoading.value = false
    }
  }

  function play() {
    if (!audio || isPlaying.value) return

    // Reset alla posizione 0
    audio.currentTime = 0
    audio.play()
    isPlaying.value = true
    hasListened.value = true

    // Maschera i metadati ad ogni riproduzione
    maskMediaSession()

    // Stoppa dopo la durata esatta del segmento
    const duration = STEPS[currentStep.value].duration * 1000
    stopTimer = setTimeout(() => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      isPlaying.value = false
    }, duration)
  }

  function stopPlayback() {
    if (stopTimer) {
      clearTimeout(stopTimer)
      stopTimer = null
    }
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    isPlaying.value = false
  }

  function skip() {
    stopPlayback()

    if (isLastStep.value) {
      // Sconfitta: nessun tentativo rimasto
      endRound('lose', 0)
      return
    }

    currentStep.value++
    hasListened.value = false
  }

  function guess(input: string): boolean {
    stopPlayback()

    if (!track.value || !input.trim()) return false

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // rimuovi accenti
        .replace(/[^a-z0-9\s]/g, '')     // rimuovi punteggiatura
        .trim()

    const userInput = normalize(input)
    const trackTitle = normalize(track.value.title)
    const trackArtist = normalize(track.value.artist)
    const combined = normalize(`${track.value.title} ${track.value.artist}`)

    // Match fuzzy: il titolo o l'artista sono contenuti nell'input o viceversa
    const isMatch =
      userInput === trackTitle ||
      userInput === trackArtist ||
      userInput === combined ||
      trackTitle.includes(userInput) ||
      userInput.includes(trackTitle) ||
      // Match parziale: almeno 60% di similarità
      similarity(userInput, trackTitle) > 0.6 ||
      similarity(userInput, combined) > 0.6

    if (isMatch) {
      endRound('win', STEPS[currentStep.value].points)
      return true
    }

    // Risposta sbagliata = sconfitta
    endRound('lose', 0)
    return false
  }

  function endRound(outcome: 'win' | 'lose', points: number) {
    result.value = outcome
    earnedPoints.value = points
    phase.value = 'result'
    stopPlayback()

    if (track.value && lastMode.value) {
      saveRecord({
        mode: lastMode.value,
        filter: lastFilter.value || undefined,
        trackTitle: track.value.title,
        trackArtist: track.value.artist,
        result: outcome,
        points: outcome === 'win' ? points : 0,
        step: currentStep.value + 1
      })
    }
  }

  function replayRound() {
    if (lastMode.value) {
      startRound(lastMode.value, lastFilter.value || undefined)
    }
  }

  function surrender() {
    if (phase.value === 'playing') {
      endRound('lose', 0)
    }
  }

  function nextRound() {
    cleanupAudio()
    phase.value = 'selecting'
    track.value = null
    currentStep.value = 0
    result.value = null
    earnedPoints.value = 0
    hasListened.value = false
  }

  function cleanupAudio() {
    stopPlayback()
    if (audio) {
      audio.src = ''
      audio = null
    }
  }

  // ── Similarity helper (Dice coefficient) ──
  function similarity(a: string, b: string): number {
    if (a === b) return 1
    if (a.length < 2 || b.length < 2) return 0

    const bigramsA = new Set<string>()
    for (let i = 0; i < a.length - 1; i++) {
      bigramsA.add(a.substring(i, i + 2))
    }

    let intersection = 0
    for (let i = 0; i < b.length - 1; i++) {
      const bigram = b.substring(i, i + 2)
      if (bigramsA.has(bigram)) {
        intersection++
        bigramsA.delete(bigram) // conta una sola volta
      }
    }

    return (2 * intersection) / (a.length - 1 + (b.length - 1))
  }

  // ── Cleanup on unmount ──
  onUnmounted(() => {
    cleanupAudio()
  })

  return {
    // State
    track,
    currentStep,
    phase,
    result,
    earnedPoints,
    isPlaying,
    isLoading,
    error,
    hasListened,

    // Computed
    maxPoints,
    currentDuration,
    isLastStep,

    // Methods
    startRound,
    replayRound,
    play,
    skip,
    guess,
    surrender,
    nextRound,
    stopPlayback,
  }
}
