<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  start: [mode: 'random' | 'genre' | 'artist', filter?: string]
}>()

type Mode = 'random' | 'genre' | 'artist'

const selectedMode = ref<Mode | null>(null)
const selectedGenre = ref<string | null>(null)
const artistQuery = ref('')
const selectedArtistId = ref<number | null>(null)
const artistSuggestions = ref<{ id: number; name: string; picture: string }[]>([])
const showArtistDropdown = ref(false)
const isSearching = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const genres = [
  { id: 'pop', label: 'Pop', emoji: '🎤' },
  { id: 'rock', label: 'Rock', emoji: '🎸' },
  { id: 'hip-hop', label: 'Hip-Hop', emoji: '🎧' },
  { id: 'dance', label: 'Dance', emoji: '💃' },
  { id: 'r&b', label: 'R&B', emoji: '🎵' },
]

const modes = [
  {
    id: 'random' as Mode,
    label: 'Casuale',
    description: 'Una traccia dalla Top Chart',
    emoji: '🎲',
  },
  {
    id: 'genre' as Mode,
    label: 'Per Genere',
    description: 'Scegli una macro-categoria',
    emoji: '🎶',
  },
  {
    id: 'artist' as Mode,
    label: 'Per Artista',
    description: 'Cerca il tuo artista preferito',
    emoji: '🎤',
  },
]

const canStart = computed(() => {
  if (!selectedMode.value) return false
  if (selectedMode.value === 'genre') return !!selectedGenre.value
  if (selectedMode.value === 'artist') return !!selectedArtistId.value
  return true
})

function selectMode(mode: Mode) {
  selectedMode.value = mode
  // Reset sub-selections
  if (mode !== 'genre') selectedGenre.value = null
  if (mode !== 'artist') {
    artistQuery.value = ''
    selectedArtistId.value = null
    artistSuggestions.value = []
  }
}

function selectGenre(id: string) {
  selectedGenre.value = id
}

async function searchArtists(query: string) {
  if (debounceTimer) clearTimeout(debounceTimer)

  if (query.trim().length < 2) {
    artistSuggestions.value = []
    showArtistDropdown.value = false
    return
  }

  debounceTimer = setTimeout(async () => {
    isSearching.value = true
    try {
      const data = await $fetch<{ id: number; name: string; picture: string }[]>(
        '/api/search/suggestions',
        { params: { q: query, type: 'artist' } }
      )
      artistSuggestions.value = data
      showArtistDropdown.value = data.length > 0
    } catch {
      artistSuggestions.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

function selectArtist(artist: { id: number; name: string }) {
  artistQuery.value = artist.name
  selectedArtistId.value = artist.id
  showArtistDropdown.value = false
  artistSuggestions.value = []
}

function handleStart() {
  if (!canStart.value || !selectedMode.value) return

  const filter =
    selectedMode.value === 'genre'
      ? selectedGenre.value!
      : selectedMode.value === 'artist'
        ? String(selectedArtistId.value)
        : undefined

  emit('start', selectedMode.value, filter)
}
</script>

<template>
  <div class="mode-selector">
    <h1 class="title">
      <span class="text-gradient-accent">Indovinaudio</span>
    </h1>
    <p class="subtitle">Riconosci il brano dal frammento sonoro</p>

    <!-- Modalità -->
    <div class="modes-grid">
      <button
        v-for="mode in modes"
        :key="mode.id"
        :id="`mode-${mode.id}`"
        class="mode-card neu-convex"
        :class="{ 'mode-card--active neu-pressed': selectedMode === mode.id }"
        @click="selectMode(mode.id)"
      >
        <span class="mode-emoji">{{ mode.emoji }}</span>
        <span class="mode-label">{{ mode.label }}</span>
        <span class="mode-desc">{{ mode.description }}</span>
      </button>
    </div>

    <!-- Sub-selezione: Genere -->
    <Transition name="expand">
      <div v-if="selectedMode === 'genre'" class="sub-selection animate-slide-up">
        <p class="sub-label">Scegli un genere</p>
        <div class="genre-chips">
          <button
            v-for="g in genres"
            :key="g.id"
            :id="`genre-${g.id}`"
            class="genre-chip neu-convex"
            :class="{ 'genre-chip--active neu-pressed': selectedGenre === g.id }"
            @click="selectGenre(g.id)"
          >
            <span>{{ g.emoji }}</span>
            <span>{{ g.label }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Sub-selezione: Artista -->
    <Transition name="expand">
      <div v-if="selectedMode === 'artist'" class="sub-selection animate-slide-up">
        <p class="sub-label">Cerca un artista</p>
        <div class="artist-search-wrapper">
          <input
            id="artist-search-input"
            v-model="artistQuery"
            type="text"
            class="neu-input"
            placeholder="Es. Tame Impala, Dua Lipa..."
            autocomplete="off"
            @input="searchArtists(artistQuery)"
            @focus="showArtistDropdown = artistSuggestions.length > 0"
            @blur="setTimeout(() => (showArtistDropdown = false), 200)"
          />
          <Transition name="expand">
            <ul
              v-if="showArtistDropdown"
              class="suggestions-dropdown neu-surface"
            >
              <li
                v-for="artist in artistSuggestions"
                :key="artist.id"
                class="suggestion-item"
                @mousedown.prevent="selectArtist(artist)"
              >
                <img
                  v-if="artist.picture"
                  :src="artist.picture"
                  :alt="artist.name"
                  class="suggestion-img"
                />
                <span>{{ artist.name }}</span>
              </li>
            </ul>
          </Transition>
        </div>
      </div>
    </Transition>

    <!-- Pulsante Start -->
    <Transition name="expand">
      <button
        v-if="selectedMode"
        id="start-game-btn"
        class="start-btn neu-btn neu-btn-primary"
        :class="{ 'neu-convex': true }"
        :disabled="!canStart"
        @click="handleStart"
      >
        🚀 Inizia la sfida
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.mode-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 24px 16px;
  max-width: 520px;
  margin: 0 auto;
}

.title {
  font-size: 2.8rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-align: center;
}

.subtitle {
  color: var(--color-neu-text-muted);
  font-size: 1.05rem;
  text-align: center;
  margin-top: -12px;
}

/* ── Mode Cards ────────── */
.modes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  width: 100%;
}

.mode-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 22px 12px;
  cursor: pointer;
  border: 2px solid transparent;
  text-align: center;
}

.mode-card--active {
  border-color: var(--color-neu-accent);
}

.mode-emoji {
  font-size: 2rem;
}

.mode-label {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-neu-text);
}

.mode-desc {
  font-size: 0.72rem;
  color: var(--color-neu-text-muted);
  line-height: 1.3;
}

/* ── Sub Selections ────── */
.sub-selection {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.sub-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-neu-text-muted);
}

/* ── Genre Chips ────────── */
.genre-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.genre-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: var(--radius-neu-full);
  color: var(--color-neu-text);
  font-family: var(--font-sans);
}

.genre-chip--active {
  border-color: var(--color-neu-accent);
  color: var(--color-neu-accent-light);
}

/* ── Artist Search ────── */
.artist-search-wrapper {
  width: 100%;
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 50;
  list-style: none;
  padding: 6px;
  max-height: 280px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-neu-sm);
  cursor: pointer;
  font-size: 0.92rem;
  transition: background 0.15s;
}

.suggestion-item:hover {
  background: var(--color-neu-surface-alt);
}

.suggestion-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

/* ── Start Button ────── */
.start-btn {
  margin-top: 8px;
  padding: 16px 48px;
  font-size: 1.1rem;
  border-radius: var(--radius-neu-lg);
}

/* ── Transitions ────── */
.expand-enter-active {
  animation: slide-up 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.expand-leave-active {
  animation: slide-up 0.25s cubic-bezier(0.22, 1, 0.36, 1) reverse;
}

/* ── Responsive ────── */
@media (max-width: 480px) {
  .title {
    font-size: 2.2rem;
  }

  .modes-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .mode-card {
    flex-direction: row;
    justify-content: flex-start;
    gap: 14px;
    padding: 16px 20px;
    text-align: left;
  }

  .mode-emoji {
    font-size: 1.6rem;
  }
}
</style>
