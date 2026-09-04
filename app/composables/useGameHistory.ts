import { ref, computed } from 'vue'
import type { GameMode } from './useAudioRound'

export interface GameRecord {
  id: string
  date: string
  mode: GameMode
  filter?: string
  trackTitle: string
  trackArtist: string
  result: 'win' | 'lose'
  points: number
  step: number
}

const HISTORY_KEY = 'indovinaudio_history'

export function useGameHistory() {
  const history = ref<GameRecord[]>([])

  // Inizializza la history da localStorage (solo lato client)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(HISTORY_KEY)
    if (saved) {
      try {
        history.value = JSON.parse(saved)
      } catch (e) {
        console.error('Errore nel parse della cronologia', e)
        history.value = []
      }
    }
  }

  function saveRecord(record: Omit<GameRecord, 'id' | 'date'>) {
    const newRecord: GameRecord = {
      ...record,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    }
    
    // Aggiungiamo in testa alla lista
    history.value.unshift(newRecord)
    
    // Manteniamo al massimo 100 partite per non riempire troppo il localStorage
    if (history.value.length > 100) {
      history.value = history.value.slice(0, 100)
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
    }
  }

  function clearHistory() {
    history.value = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HISTORY_KEY)
    }
  }

  const stats = computed(() => {
    const totalGames = history.value.length
    if (totalGames === 0) {
      return { totalGames: 0, wins: 0, winRate: 0, totalPoints: 0, avgPoints: 0 }
    }

    const wins = history.value.filter(r => r.result === 'win').length
    const winRate = Math.round((wins / totalGames) * 100)
    const totalPoints = history.value.reduce((acc, curr) => acc + curr.points, 0)
    const avgPoints = Math.round(totalPoints / totalGames)

    return {
      totalGames,
      wins,
      winRate,
      totalPoints,
      avgPoints
    }
  })

  return {
    history,
    stats,
    saveRecord,
    clearHistory
  }
}
