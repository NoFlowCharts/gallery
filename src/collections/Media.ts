import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    hidden: false,
    group: 'Gallery',
  },
  access: {
    read: () => true,
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
