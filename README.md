# 🎵 Indovinaudio

**Indovinaudio** è un gioco musicale web in cui devi riconoscere un brano famoso ascoltando frammenti sonori progressivamente più lunghi. Utilizza l'API di [Deezer](https://developers.deezer.com/) per accedere a un catalogo di milioni di tracce.

## Come si gioca

1. **Scegli una modalità** — casuale, per genere, per artista, per decennio o per nazione.
2. **Ascolta il frammento** — si parte da 0.5 secondi.
3. **Indovina** — scrivi il titolo o l'artista e conferma.
4. **Salta** — se non sei sicuro, il frammento si allunga (1s → 2s → 4s → 8s) ma i punti calano.
5. **Risultato** — indovina per guadagnare punti; più veloce rispondi, più punti ottieni!

## Tech Stack

| Layer       | Tecnologia                             |
|-------------|----------------------------------------|
| Framework   | [Nuxt 4](https://nuxt.com/) (Vue 3)   |
| Styling     | [Tailwind CSS 4](https://tailwindcss.com/) + CSS custom (neumorphism) |
| Server API  | Nitro (H3) — proxy verso Deezer API   |
| Font        | [Poppins](https://fonts.google.com/specimen/Poppins) (Google Fonts) |
| Icone       | [Phosphor Icons](https://phosphoricons.com/) via `@nuxt/icon` |
| PWA         | Manifest + Apple Touch Icon            |

## Struttura del progetto

```
indovinaudio/
├── app/
│   ├── assets/css/         # Design system (variabili, utility, neumorphism)
│   ├── components/         # Componenti Vue (ModeSelector, GuessInput, ecc.)
│   ├── composables/        # Logica di gioco (useAudioRound, useGameHistory)
│   ├── pages/              # Pagina principale (index.vue)
│   └── app.vue             # Entry point dell'app
├── server/
│   └── api/
│       ├── tracks/         # GET /api/tracks/random — traccia casuale
│       └── search/         # GET /api/search/suggestions — autocomplete
├── public/                 # Asset statici, favicon, manifest PWA
├── nuxt.config.ts          # Configurazione Nuxt (meta SEO, font, plugin)
└── package.json
```

## Setup locale

```bash
# Installa le dipendenze
pnpm install

# Avvia il dev server (http://localhost:3000)
pnpm dev
```

## Build di produzione

```bash
# Build per la produzione
pnpm build

# Anteprima locale della build
pnpm preview
```

## Modalità di gioco

| Modalità       | Descrizione                                      |
|----------------|--------------------------------------------------|
| 🎲 Casuale     | Traccia casuale dalla Top Chart globale           |
| 🎵 Per Genere  | Pop, Rock, Hip-Hop, Jazz, Classica e altri       |
| 🎤 Per Artista | Cerca un artista e gioca con le sue top tracks   |
| 📅 Per Periodo | Dagli anni '50 agli anni 2020                    |
| 📍 Per Nazione | Hit da Italia, USA, UK, Francia e altri paesi    |

## Sistema di punteggio

| Step | Durata | Punti |
|------|--------|-------|
| 1    | 0.5s   | 1000  |
| 2    | 1s     | 800   |
| 3    | 2s     | 600   |
| 4    | 4s     | 400   |
| 5    | 8s     | 200   |

## Licenza

Progetto privato. I dati musicali sono forniti da [Deezer](https://www.deezer.com/).
