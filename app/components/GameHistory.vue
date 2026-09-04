<script setup lang="ts">
import { useGameHistory } from '~/composables/useGameHistory'

const { history, stats, clearHistory } = useGameHistory()

const emit = defineEmits<{
  close: []
}>()

function formatDate(isoString: string) {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function getModeLabel(mode: string, filter?: string) {
  const modes: Record<string, string> = {
    random: 'Casuale',
    genre: 'Genere',
    artist: 'Artista',
    decade: 'Periodo'
  }
  let label = modes[mode] || mode
  if (filter) {
    // Truncate filter if too long
    const shortFilter = filter.length > 15 ? filter.substring(0, 15) + '...' : filter
    label += ` (${shortFilter})`
  }
  return label
}
</script>

<template>
  <div class="history-panel neu-surface">
    <div class="panel-header">
      <h2 class="panel-title">Cronologia Partite</h2>
      <button class="close-btn neu-btn neu-flat" @click="emit('close')" aria-label="Chiudi">
        <Icon name="ph:x-bold" class="icon" />
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card neu-concave">
        <div class="stat-value">{{ stats.totalGames }}</div>
        <div class="stat-label">Partite Giocate</div>
      </div>
      <div class="stat-card neu-concave">
        <div class="stat-value text-gradient-accent">{{ stats.winRate }}%</div>
        <div class="stat-label">Vittorie</div>
      </div>
      <div class="stat-card neu-concave">
        <div class="stat-value">{{ stats.totalPoints }}</div>
        <div class="stat-label">Punti Totali</div>
      </div>
    </div>

    <div class="history-list-wrapper neu-concave">
      <div v-if="history.length === 0" class="empty-state">
        Nessuna partita giocata. Inizia subito!
      </div>
      
      <ul v-else class="history-list">
        <li v-for="record in history" :key="record.id" class="history-item">
          <div class="item-left">
            <div 
              class="result-indicator" 
              :class="record.result === 'win' ? 'result-win' : 'result-lose'"
            >
              <Icon v-if="record.result === 'win'" name="ph:check-bold" />
              <Icon v-else name="ph:x-bold" />
            </div>
            <div class="item-details">
              <div class="track-name">{{ record.trackTitle }}</div>
              <div class="track-artist">{{ record.trackArtist }}</div>
              <div class="item-meta">
                <span>{{ formatDate(record.date) }}</span>
                <span class="dot">•</span>
                <span>{{ getModeLabel(record.mode, record.filter) }}</span>
              </div>
            </div>
          </div>
          <div class="item-right">
            <div class="item-points" :class="{'item-points--win': record.result === 'win'}">
              {{ record.points }}<span class="pt">pt</span>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div class="panel-footer" v-if="history.length > 0">
      <button class="clear-btn" @click="clearHistory">
        Cancella cronologia
      </button>
    </div>
  </div>
</template>

<style scoped>
.history-panel {
  width: 100%;
  max-width: 520px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0 auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-neu-text);
}

.close-btn {
  padding: 8px;
  border-radius: 50%;
  color: var(--color-neu-text-muted);
}

.icon {
  width: 20px;
  height: 20px;
}

/* ── Stats ──────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  padding: 16px 10px;
  border-radius: var(--radius-neu-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-neu-text);
}

.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-neu-text-dim);
  font-weight: 600;
  text-align: center;
}

/* ── List ───────── */
.history-list-wrapper {
  border-radius: var(--radius-neu-sm);
  padding: 12px;
  max-height: 350px;
  overflow-y: auto;
}

.empty-state {
  padding: 30px 10px;
  text-align: center;
  color: var(--color-neu-text-dim);
  font-size: 0.95rem;
}

.history-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: var(--radius-neu-sm);
  background: rgba(255, 255, 255, 0.02);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.result-indicator {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-indicator svg {
  font-size: 1.1rem;
  color: #fff;
}

.result-win {
  background: linear-gradient(135deg, var(--color-neu-success), #55efc4);
}

.result-lose {
  background: linear-gradient(135deg, var(--color-neu-error), #e17055);
}

.item-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.track-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-neu-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 0.8rem;
  color: var(--color-neu-accent-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  color: var(--color-neu-text-dim);
  margin-top: 2px;
}

.dot {
  font-size: 0.5rem;
}

.item-right {
  flex-shrink: 0;
  padding-left: 10px;
}

.item-points {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-neu-text-muted);
}

.item-points--win {
  color: var(--color-neu-success);
}

.pt {
  font-size: 0.7rem;
  margin-left: 2px;
}

.panel-footer {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-neu-error);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--radius-neu-sm);
  transition: background 0.2s;
}

.clear-btn:hover {
  background: rgba(253, 114, 114, 0.1);
}

@media (max-width: 480px) {
  .history-panel {
    padding: 20px 16px;
  }
  .stat-card {
    padding: 12px 6px;
  }
}
</style>
