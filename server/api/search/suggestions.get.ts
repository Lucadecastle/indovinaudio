import { defineEventHandler, getQuery, createError } from 'h3'

interface DeezerArtistResult {
  id: number
  name: string
  picture_medium: string
}

interface DeezerTrackResult {
  id: number
  title: string
  title_short: string
  artist: { id: number; name: string }
}

interface DeezerSearchResponse<T> {
  data: T[]
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q as string)?.trim()
  const type = (query.type as string)?.toLowerCase() || 'track'

  if (!q || q.length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Il parametro "q" deve contenere almeno 2 caratteri.',
    })
  }

  const encoded = encodeURIComponent(q)
  const limit = 8

  try {
    if (type === 'artist') {
      const response = await $fetch<DeezerSearchResponse<DeezerArtistResult>>(
        `https://api.deezer.com/search/artist?q=${encoded}&limit=${limit}`
      )

      return (response.data || []).map((a) => ({
        id: a.id,
        name: a.name,
        picture: a.picture_medium,
      }))
    }

    // Default: ricerca tracce
    const response = await $fetch<DeezerSearchResponse<DeezerTrackResult>>(
      `https://api.deezer.com/search/track?q=${encoded}&limit=${limit}`
    )

    return (response.data || []).map((t) => ({
      id: t.id,
      name: `${t.title_short || t.title} - ${t.artist.name}`,
      title: t.title_short || t.title,
      artist: t.artist.name,
    }))
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) {
      throw err
    }

    throw createError({
      statusCode: 502,
      statusMessage: 'Errore nella ricerca dei suggerimenti.',
    })
  }
})
