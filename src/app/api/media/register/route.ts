/**
 * /api/media/register
 *
 * After the client has uploaded a file directly to Vercel Blob via upload(),
 * it calls this endpoint with the blob URL + basic metadata.
 *
 * This endpoint:
 *   1. Verifies auth
 *   2. Downloads the file buffer from Vercel Blob (egress — no serverless body limit)
 *   3. Calls payload.create() with the buffer → Payload runs Sharp, generates
 *      thumbnails, and @payloadcms/storage-vercel-blob uploads them all to Blob
 *   4. Deletes the original "temp" blob uploaded by the client (Payload creates
 *      its own permanent copy via the storage plugin)
 *   5. Returns the new Payload media document
 */
import { del } from '@vercel/blob'
import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
// Give enough time to download + Sharp-process large images
export const maxDuration = 60

interface RegisterBody {
  /** The temporary Vercel Blob URL created by the client-side upload() call */
  url: string
  filename: string
  mimeType: string
  /** File size in bytes */
  size: number
  alt?: string
}

export async function POST(request: NextRequest): Promise<Response> {
  // ── 1. Auth check ─────────────────────────────────────────────────────────
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parse body ──────────────────────────────────────────────────────────
  let body: RegisterBody
  try {
    body = (await request.json()) as RegisterBody
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { url, filename, mimeType, size, alt } = body

  if (!url || !filename || !mimeType) {
    return Response.json({ error: 'Missing required fields: url, filename, mimeType' }, { status: 400 })
  }

  // Only allow images
  if (!mimeType.startsWith('image/')) {
    return Response.json({ error: 'Only image files are supported' }, { status: 400 })
  }

  // ── 3. Download file buffer from Vercel Blob ───────────────────────────────
  // This is egress (outbound), not a serverless request body — no 4.5 MB limit.
  let fileBuffer: Buffer
  try {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch blob: ${res.status} ${res.statusText}`)
    }
    fileBuffer = Buffer.from(await res.arrayBuffer())
  } catch (err) {
    return Response.json(
      { error: `Could not download file from Vercel Blob: ${(err as Error).message}` },
      { status: 502 },
    )
  }

  // ── 4. Create Payload media document (runs Sharp + storage-vercel-blob) ────
  // Payload's local API accepts a `file` object here — it will generate image
  // size variants via Sharp and upload them all through the storage plugin.
  let doc: Awaited<ReturnType<typeof payload.create>>
  try {
    doc = await payload.create({
      collection: 'media',
      data: { alt: alt ?? '' },
      file: {
        data: fileBuffer,
        mimetype: mimeType,
        name: filename,
        size: size ?? fileBuffer.byteLength,
      },
    })
  } catch (err) {
    return Response.json(
      { error: `Payload media creation failed: ${(err as Error).message}` },
      { status: 500 },
    )
  }

  // ── 5. Delete the original temp blob (Payload created its own permanent copy) ─
  try {
    await del(url)
  } catch (err) {
    // Non-fatal: log but don't fail the request
    console.warn(`[media/register] Could not delete temp blob ${url}:`, err)
  }

  // ── 6. Return the new Payload media document ───────────────────────────────
  return Response.json({ doc }, { status: 201 })
}
