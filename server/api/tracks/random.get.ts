import { defineEventHandler, getQuery, createError } from 'h3'

/** Mappa macro-categorie → Deezer genre_id */
const GENRE_MAP: Record<string, number> = {
  pop: 132,
  rock: 152,
  'hip-hop': 116,
  dance: 113,
  'r&b': 165,
  alternative: 85,
  electro: 106,
  folk: 466,
  reggae: 144,
  jazz: 129,
  classical: 98,
  latin: 457,
  asian: 16,
}

/** Mappa decenni → search query generica per hit */
const DECADE_MAP: Record<string, string> = {
  '2020s': 'hits 2020 2021 2022 2023 2024',
  '2010s': 'hits 2010s',
  '2000s': 'hits 2000s',
  '90s': 'hits 90s',
  '80s': 'hits 80s',
  '70s': 'hits 70s',
  '60s': 'hits 60s',
  '50s': 'hits 50s',
}

/** Mappa nazioni → search query generica per top */
const COUNTRY_MAP: Record<string, string> = {
  italia: 'top 50 italia',
  usa: 'top 50 usa',
  uk: 'top 50 uk',
  france: 'top 50 france',
  spain: 'top 50 spain',
  germany: 'top 50 germany',
  brazil: 'top 50 brazil',
  mexico: 'top 50 mexico',
  japan: 'top 50 japan',
  canada: 'top 50 canada',
  australia: 'top 50 australia',
  korea: 'top 50 south korea',
}

interface DeezerTrack {
  id: number
  title: string
  title_short: string
  preview: string
  artist: { id: number; name: string; picture_medium: string }
  album: {
    id: number
    title: string
    cover_medium: string
    cover_big: string
  }
}

interface DeezerSearchResponse {
  data: DeezerTrack[]
  total?: number
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const genre = (query.genre as string)?.toLowerCase()
  const artistId = query.artistId as string
  const decade = query.decade as string
  const country = query.country as string

  let apiUrl: string

  if (artistId) {
    // Modalità "Per Artista": usa l'ID numerico per ottenere le top tracks
    // L'endpoint /artist/{id}/top restituisce SOLO le tracce di quell'artista
    apiUrl = `https://api.deezer.com/artist/${encodeURIComponent(artistId)}/top?limit=50`
  } else if (decade && DECADE_MAP[decade]) {
    // Modalità "Per Periodo": usa una search query per hit di quel periodo
    const encoded = encodeURIComponent(DECADE_MAP[decade])
    apiUrl = `https://api.deezer.com/search/track?q=${encoded}&order=RATING_DESC&limit=80`
  } else if (country && COUNTRY_MAP[country]) {
    // Modalità "Per Nazione": cerca hit del paese
    const encoded = encodeURIComponent(COUNTRY_MAP[country])
    apiUrl = `https://api.deezer.com/search/track?q=${encoded}&order=RATING_DESC&limit=80`
  } else if (genre && GENRE_MAP[genre]) {
    // Modalità "Per Genere": top chart di quel genere
    apiUrl = `https://api.deezer.com/chart/${GENRE_MAP[genre]}/tracks?limit=100`
  } else {
    // Modalità "Casuale": top chart globale
    apiUrl = `https://api.deezer.com/chart/0/tracks?limit=100`
  }

  try {
    const response = await $fetch<DeezerSearchResponse>(apiUrl)

    if (!response?.data?.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Nessuna traccia trovata.',
      })
    }

    // Filtra solo tracce con preview MP3 valida
    const withPreview = response.data.filter(
      (t) => t.preview && t.preview.length > 0
    )

    if (withPreview.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Nessuna traccia con anteprima audio disponibile.',
      })
    }

    // Selezione casuale
    const track = withPreview[Math.floor(Math.random() * withPreview.length)]

    return {
      id: track.id,
      title: track.title_short || track.title,
      artist: track.artist.name,
      artistPicture: track.artist.picture_medium,
      preview: track.preview,
      cover: track.album.cover_big || track.album.cover_medium,
      album: track.album.title,
    }
  } catch (err: unknown) {
    // Rilancia errori h3 noti
    if (err && typeof err === 'object' && 'statusCode' in err) {
      throw err
    }

    throw createError({
      statusCode: 502,
      statusMessage: 'Errore di comunicazione con il servizio musicale.',
    })
  }
})
