<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()

defineProps<{
  show: boolean
}>()
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content neu-surface animate-slide-up">
        <div class="panel-header">
          <h2 class="panel-title">Credits</h2>
          <button class="close-btn neu-btn neu-flat" @click="emit('close')" aria-label="Chiudi">
            <Icon name="ph:x" class="icon" />
          </button>
        </div>

        <div class="credits-body">
          <div class="credit-section neu-concave">
            <h3>🎵 Musica & API</h3>
            <p>
              Questo progetto utilizza le API di 
              <a href="https://www.deezer.com" target="_blank" class="text-gradient-accent font-bold">Deezer</a>
              per la ricerca e riproduzione dei brani musicali.
            </p>
            <p class="small-text">
              Tutti i diritti sui brani, sulle copertine degli album e sui metadati appartengono ai rispettivi proprietari e a Deezer.
            </p>
            <div class="deezer-logo-wrapper">
              <span class="powered-by">Powered by Deezer</span>
              <svg viewBox="0 0 512 512" class="deezer-logo" fill="currentColor">
                <path d="M112 376v64H16v-64h96zm128 0v64h-96v-64h96zm128 0v64h-96v-64h96zm128 0v64h-96v-64h96zm-256-96v64h-96v-64h96zm128 0v64h-96v-64h96zm128 0v64h-96v-64h96zm-128-96v64h-96v-64h96zm128 0v64h-96v-64h96zm0-96v64h-96V88h96z"/>
              </svg>
            </div>
          </div>

          <div class="credit-section neu-concave">
            <h3>🎨 Icone</h3>
            <p>
              Le icone dell'interfaccia sono fornite da 
              <a href="https://phosphoricons.com/" target="_blank" class="text-gradient-accent font-bold">Phosphor Icons</a>.
            </p>
          </div>
          
          <div class="credit-section neu-concave">
            <h3>💻 Sviluppo</h3>
            <p>
              Indovinaudio è un progetto dimostrativo open-source costruito con Nuxt 4 e Tailwind CSS.
            </p>
          </div>
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
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  border-radius: var(--radius-neu-lg);
  max-height: 90vh;
  overflow-y: auto;
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

.credits-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.credit-section {
  padding: 16px;
  border-radius: var(--radius-neu);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.credit-section h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-neu-text);
  margin-bottom: 4px;
}

.credit-section p {
  font-size: 0.9rem;
  color: var(--color-neu-text-muted);
  line-height: 1.5;
}

.credit-section p.small-text {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 4px;
}

.credit-section a {
  text-decoration: none;
}

.credit-section a:hover {
  text-decoration: underline;
}

.deezer-logo-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.powered-by {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-neu-text);
}

.deezer-logo {
  height: 16px;
  width: auto;
  color: #fff;
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
