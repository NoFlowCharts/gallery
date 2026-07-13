import type { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    hidden: false,
    group: 'Gallery',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        try {
          const albums = await req.payload.find({
            collection: 'albums',
            where: {
              photos: {
                contains: doc.id,
              },
            },
            limit: 100,
            depth: 0,
          })
          for (const album of albums.docs) {
            if (album.slug) {
              revalidatePath(`/gallery/${album.slug}`)
            }
          }
        } catch (err) {
          console.error('Error revalidating path after media change:', err)
        }
      }
    ],
    afterDelete: [
      async ({ doc, req }) => {
        try {
          const albums = await req.payload.find({
            collection: 'albums',
            where: {
              photos: {
                contains: doc.id,
              },
            },
            limit: 100,
            depth: 0,
          })
          for (const album of albums.docs) {
            if (album.slug) {
              revalidatePath(`/gallery/${album.slug}`)
            }
          }
        } catch (err) {
          console.error('Error revalidating path after media delete:', err)
        }
      }
    ]
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
      admin: {
        description: 'Alternative text for accessibility (optional)',
      },
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'centre',
        formatOptions: {
          format: 'jpeg',
          options: { quality: 70 },
        },
      },
      {
        name: 'card',
        width: 800,
        height: 600,
        position: 'centre',
        formatOptions: {
          format: 'jpeg',
          options: { quality: 75 },
        },
      },
      {
        name: 'full',
        width: 1920,
        height: undefined,
        formatOptions: {
          format: 'jpeg',
          options: { quality: 85 },
        },
      },
    ],
    adminThumbnail: 'thumbnail',
  },
}
