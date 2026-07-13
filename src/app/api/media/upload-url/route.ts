/**
 * /api/media/upload-url
 *
 * Vercel Blob client-side upload token endpoint.
 * The client calls this to get a short-lived token, then uploads directly
 * to Vercel Blob storage — bypassing the 4.5 MB serverless body limit.
 *
 * Flow:
 *   Client → handleUploadUrl (get token) → upload() to Vercel Blob
 *         → /api/media/register (save metadata + Sharp thumbnails to Payload)
 */
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,

      // Called before issuing an upload token — verify auth here
      onBeforeGenerateToken: async (_pathname) => {
        const payload = await getPayload({ config })
        const { user } = await payload.auth({ headers: request.headers })

        if (!user) {
          throw new Error('Unauthorized: you must be logged in to upload files')
        }

        return {
          // Upload path prefix in the blob store
          allowedContentTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/avif'],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB hard cap
          tokenPayload: JSON.stringify({ userId: user.id }),
        }
      },

      // Called by Vercel Blob servers after upload completes.
      // We intentionally leave this empty — the client calls /api/media/register
      // after upload() resolves so we can run Sharp processing and create the
      // Payload media document in one clean request.
      onUploadCompleted: async ({ blob: _blob }) => {
        // no-op: client handles registration
      },
    })

    return Response.json(jsonResponse)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload token generation failed'
    const status = message.startsWith('Unauthorized') ? 401 : 400
    return Response.json({ error: message }, { status })
  }
}
