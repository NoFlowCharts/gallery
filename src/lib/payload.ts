import { getPayload } from 'payload'
import config from '@payload-config'
import type { Album, Media } from '@/payload-types'

// ─── Albums ──────────────────────────────────────────────────────────────────

export async function getAlbums(): Promise<Album[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'albums',
    depth: 1,       // depth:1 resolves cover → Media object
    limit: 100,
    sort: '-createdAt',
  })
  return result.docs
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'albums',
    where: { slug: { equals: slug } },
    depth: 2,       // depth:2 resolves cover + photos → Media objects
    limit: 1,
  })
  return result.docs[0] ?? null
}

export async function getAllAlbumSlugs(): Promise<string[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'albums',
    select: { slug: true },
    limit: 1000,
  })
  return result.docs
      .map((a) => a.slug)
      .filter((slug): slug is string => Boolean(slug))
}

// ─── Photos ──────────────────────────────────────────────────────────────────

export async function getPhotoById(id: string): Promise<Media | null> {
  const payload = await getPayload({ config })
  try {
    const doc = await payload.findByID({
      collection: 'media',
      id,
    })
    return doc
  } catch {
    return null
  }
}
