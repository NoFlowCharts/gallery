import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import { getAlbumBySlug, getAllAlbumSlugs } from '@/lib/payload'
import type { Media } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getAllAlbumSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const album = await getAlbumBySlug(slug)
  return {
    title: album ? `${album.title} — Gallery` : 'Album not found',
  }
}

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params
  const album = await getAlbumBySlug(slug)

  if (!album) notFound()

  const photos = (album.photos ?? []) as Media[]

  return (
    <>
      {/* Album hero */}
      <div className="w-full min-h-[40vh] px-5 pb-10 flex items-end">
        <div className="w-full max-w-[990px]">
          <div className="flex flex-col gap-4 w-full">
            <h1 className="text-4xl font-light text-txt-black-prim dark:text-txt-white-prim">
              {album.title}
            </h1>
          </div>
          <div className="w-full mt-2">
            <span className="text-txt-black-sec dark:text-txt-white-sec text-sm">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </span>
          </div>
        </div>
      </div>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="px-5 pb-20 text-txt-black-sec dark:text-txt-white-sec">
          <p className="text-lg font-light">No photos in this album yet.</p>
        </div>
      ) : (
        <div
          className="
            w-full px-5 pb-20
            columns-1
            sm:columns-2
            md:columns-3
            lg:columns-4
            gap-4
          "
        >
          {photos.map((photo) => {
            const src = photo.sizes?.card?.url ?? photo.url ?? ''
            if (!src) return null
            return (
              <Link
                key={photo.id}
                href={`/gallery/${slug}/photo/${photo.id}`}
                className="block mb-4 break-inside-avoid overflow-hidden rounded-md group"
              >
                <Image
                  src={src}
                  alt={photo.alt ?? ''}
                  width={photo.sizes?.card?.width ?? photo.width ?? 800}
                  height={photo.sizes?.card?.height ?? photo.height ?? 600}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </Link>
            )
          })}
        </div>
      )}

      <div className="px-5 pb-10">
        <Footer />
      </div>
    </>
  )
}