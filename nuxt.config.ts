import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/icon'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'it' },
      title: 'Indovinaudio — Riconosci il brano!',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Indovinaudio: ascolta frammenti sonori progressivi e indovina il brano famoso. Sfida musicale con punteggio e modalità multiple.',
        },
        { name: 'theme-color', content: '#1a1d21' },
        { property: 'og:title', content: 'Indovinaudio — Riconosci il brano!' },
        {
          property: 'og:description',
          content:
            'Sfida musicale: riconosci brani famosi da frammenti sonori progressivi.',
        },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },
})
