import type { CollectionConfig } from 'payload'
import slugify from 'slugify'

export const Albums: CollectionConfig = {
  slug: 'albums',
  admin: {
    useAsTitle: 'title',
    group: 'Gallery',
    defaultColumns: ['title', 'slug', 'cover', 'updatedAt'],
    components: {
      edit: {
        beforeDocumentControls: ['@/components/admin/CopyLinkButton'],
      }
    }
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // 1. Auto-generate slug from title
        if (data.title && (!data.slug || data.slug === '')) {
          let baseSlug = slugify(data.title, { lower: true, strict: true })
          let uniqueSlug = baseSlug
          let counter = 2
          
          // Check for existing slug
          let exists = true
          while (exists) {
            const result = await req.payload.find({
              collection: 'albums',
              where: { slug: { equals: uniqueSlug } },
              limit: 1,
            })
            if (result.totalDocs > 0 && result.docs[0].id !== originalDoc?.id) {
              uniqueSlug = `${baseSlug}-${counter}`
              counter++
            } else {
              exists = false
            }
          }
          data.slug = uniqueSlug
        }

        // 2. Auto-assign cover if none is set, but photos exist
        if (!data.cover && data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
          data.cover = data.photos[0]
        }

        return data
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        // Collect all media IDs referenced by this album (photos + cover)
        const mediaIds: (string | number)[] = []

        if (doc.cover) {
          const coverId = typeof doc.cover === 'object' ? doc.cover.id : doc.cover
          if (coverId) mediaIds.push(coverId)
        }

        if (Array.isArray(doc.photos)) {
          for (const photo of doc.photos) {
            const photoId = typeof photo === 'object' ? photo.id : photo
            if (photoId && !mediaIds.includes(photoId)) {
              mediaIds.push(photoId)
            }
          }
        }

        // Delete each media document in parallel — Payload will also remove the file from storage
        await Promise.all(
          mediaIds.map(async (id) => {
            try {
              await req.payload.delete({ collection: 'media', id })
            } catch (err) {
              req.payload.logger.error(`Failed to delete media ${id} for album ${doc.id}: ${err}`)
            }
          })
        )
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Auto-generated from title if left blank',
      }
    },
    {
      name: 'photographer',
      type: 'text',
      admin: {
        description: 'Name of the photographer',
      }
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Auto-assigned from first photo if left blank',
      }
    },
    {
      name: 'photos',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/admin/PhotosDropzone',
        }
      }
    },
  ],
}
