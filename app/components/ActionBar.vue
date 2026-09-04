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
      <Icon name="ph:skip-forward-fill" class="btn-icon" />
      <span>Salta</span>
    </button>

    <button
      id="submit-btn"
      class="neu-btn neu-btn-primary action-btn action-btn--submit"
      :disabled="!canSubmit"
      @click="emit('submit')"
    >
      <Icon name="ph:check-circle-fill" class="btn-icon" />
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
