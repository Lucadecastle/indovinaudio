<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  disabled?: boolean
}>()

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{
  submit: [value: string]
  selectSuggestion: [value: string]
}>()

const suggestions = ref<{ id: number; name: string; title?: string; artist?: string }[]>([])
const showDropdown = ref(false)
const isSearching = ref(false)
const highlightIndex = ref(-1)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function fetchSuggestions(query: string) {
  if (debounceTimer) clearTimeout(debounceTimer)

  if (query.trim().length < 2) {
    suggestions.value = []
    showDropdown.value = false
    return
  }

  debounceTimer = setTimeout(async () => {
    isSearching.value = true
    try {
      const data = await $fetch<{ id: number; name: string; title?: string; artist?: string }[]>(
        '/api/search/suggestions',
        { params: { q: query, type: 'track' } }
      )
      suggestions.value = data
      showDropdown.value = data.length > 0
      highlightIndex.value = -1
    } catch {
      suggestions.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

function selectItem(item: { name: string }) {
  model.value = item.name
  showDropdown.value = false
  suggestions.value = []
  emit('selectSuggestion', item.name)
}

function handleKeydown(e: KeyboardEvent) {
  if (!showDropdown.value) {
    if (e.key === 'Enter') {
      e.preventDefault()
      emit('submit', model.value)
    }
    return
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      highlightIndex.value = Math.min(
        highlightIndex.value + 1,
        suggestions.value.length - 1
      )
      break
    case 'ArrowUp':
      e.preventDefault()
      highlightIndex.value = Math.max(highlightIndex.value - 1, -1)
      break
    case 'Enter':
      e.preventDefault()
      if (highlightIndex.value >= 0 && suggestions.value[highlightIndex.value]) {
        selectItem(suggestions.value[highlightIndex.value])
      } else {
        emit('submit', model.value)
      }
      showDropdown.value = false
      break
    case 'Escape':
      showDropdown.value = false
      break
  }
}

watch(model, (val) => {
  fetchSuggestions(val)
})
</script>

<template>
  <div class="guess-input-wrapper">
    <div class="input-container">
      <Icon name="ph:magnifying-glass" class="input-icon" />
      <input
        id="guess-input"
        v-model="model"
        type="text"
        class="neu-input guess-field"
        placeholder="Titolo del brano o artista..."
        autocomplete="off"
        :disabled="disabled"
        @keydown="handleKeydown"
        @focus="showDropdown = suggestions.length > 0"
        @blur="setTimeout(() => (showDropdown = false), 200)"
      />
      <div v-if="isSearching" class="input-spinner" />
    </div>

    <Transition name="dropdown">
      <ul
        v-if="showDropdown && suggestions.length > 0"
        class="suggestions-dropdown neu-surface"
      >
        <li
          v-for="(item, i) in suggestions"
          :key="item.id"
          class="suggestion-item"
          :class="{ 'suggestion-item--highlight': i === highlightIndex }"
          @mousedown.prevent="selectItem(item)"
        >
          <Icon name="ph:music-notes" class="suggestion-icon" />
          <span class="suggestion-text">{{ item.name }}</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.guess-input-wrapper {
  width: 100%;
  max-width: 460px;
  position: relative;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  width: 18px;
  height: 18px;
  color: var(--color-neu-text-dim);
  pointer-events: none;
  z-index: 1;
}

.guess-field {
  padding-left: 44px;
  padding-right: 44px;
}

.input-spinner {
  position: absolute;
  right: 16px;
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-neu-text-dim);
  border-top-color: var(--color-neu-accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Dropdown ──────── */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 50;
  list-style: none;
  padding: 6px;
  max-height: 260px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-neu-sm);
  cursor: pointer;
  font-size: 0.88rem;
  color: var(--color-neu-text);
  transition: background 0.15s;
}

.suggestion-item:hover,
.suggestion-item--highlight {
  background: var(--color-neu-surface-alt);
}

.suggestion-icon {
  width: 16px;
  height: 16px;
  color: var(--color-neu-text-dim);
  flex-shrink: 0;
}

.suggestion-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Transition ──── */
.dropdown-enter-active {
  animation: slide-up 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.dropdown-leave-active {
  animation: slide-up 0.15s cubic-bezier(0.22, 1, 0.36, 1) reverse;
}
</style>
