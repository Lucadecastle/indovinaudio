<script setup lang="ts">
defineProps<{
  canSkip: boolean
  canSubmit: boolean
  isLastStep: boolean
}>()

const emit = defineEmits<{
  skip: []
  submit: []
}>()
</script>

<template>
  <div class="action-bar">
    <button
      id="skip-btn"
      class="neu-btn neu-convex action-btn action-btn--skip"
      :disabled="!canSkip"
      @click="emit('skip')"
    >
      <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
      </svg>
      <span>Salta</span>
    </button>

    <button
      id="submit-btn"
      class="neu-btn neu-btn-primary action-btn action-btn--submit"
      :disabled="!canSubmit"
      @click="emit('submit')"
    >
      <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      <span>Conferma</span>
    </button>
  </div>
</template>

<style scoped>
.action-bar {
  display: flex;
  gap: 14px;
  width: 100%;
  max-width: 460px;
}

.action-btn {
  flex: 1;
  padding: 14px 20px;
  border-radius: var(--radius-neu);
  font-size: 0.95rem;
}

.btn-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.action-btn--skip {
  color: var(--color-neu-text-muted);
}

.action-btn--skip:hover:not(:disabled) {
  color: var(--color-neu-text);
}

.action-btn--submit {
  border-radius: var(--radius-neu);
}

@media (max-width: 480px) {
  .action-btn {
    padding: 12px 16px;
    font-size: 0.88rem;
  }
}
</style>
