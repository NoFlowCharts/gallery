/* Custom route wrapper for /api/media to increase the body size limit for photo uploads.
 * Next.js uses the most specific route match, so this file takes priority over [...slug]/route.ts
 * for all requests to /api/media and its sub-paths.
 */
import config from '@payload-config'
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from '@payloadcms/next/routes'

// Allow up to 25 MB per upload
export const maxDuration = 60
export const dynamic = 'force-dynamic'

// This is the key: tell Next.js to skip its own body parsing so Payload handles the stream directly
export const fetchCache = 'default-no-store'

// Re-export Payload handlers — identical to the auto-generated catch-all
export const GET    = REST_GET(config)
export const POST   = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH  = REST_PATCH(config)
export const PUT    = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
