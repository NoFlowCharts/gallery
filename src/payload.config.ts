import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig, type SharpDependency } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Albums } from './collections/Albums'
import { Media } from './collections/Media'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Albums],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: true,
  }),
  sharp: sharp as unknown as SharpDependency,
  plugins: [
    vercelBlobStorage({
      // Only active on Vercel when the token is set; local dev works without it
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      // Tells the plugin the file is already in Blob — skip server-side re-upload
      clientUploads: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})

