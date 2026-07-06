import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Button from '@/components/Button'
import { getAlbumBySlug, getAllAlbumSlugs } from '@/lib/payload'
import type { Media } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const slugs = await getAllAlbumSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch (error) {
    console.warn('Could not fetch album slugs for static generation (Postgres might be offline during build):', error)
    return []
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  try {
    const album = await getAlbumBySlug(slug)
    return {
      title: album ? `${album.title} — Gallery` : 'Album not found',
    }
  } catch (error) {
    console.warn('Could not fetch album metadata (Postgres might be offline during build):', error)
    return {
      title: 'Gallery',
    }
  }
}

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params
  const album = await getAlbumBySlug(slug)

  if (!album) notFound()

  const photos = (album.photos ?? []) as Media[]
  const cover = album.cover && typeof album.cover === 'object' ? (album.cover as Media) : null
  const coverUrl = cover?.url

  return (
    <div className="flex flex-col">
      <div className={`relative w-full min-h-screen px-5 pb-10 flex justify-center items-end overflow-hidden ${coverUrl ? 'dark' : ''}`}>
        {coverUrl && (
          <>
            <Image
              src={coverUrl}
              alt={cover.alt ?? album.title}
              fill
              priority
              className="object-cover -z-20 animate-fade-in"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 -z-10" />
          </>
        )}
        <div className="w-full max-w-[990px] flex flex-col gap-[270px] z-10">
          <div className="flex flex-col gap-8 w-full items-center">
            <h1 className="text-6xl font-light text-txt-black-prim dark:text-txt-white-prim text-center">
              {album.title}
            </h1>
            <Button text="View gallery" href="#photos-grid" />
          </div>
          <div className="w-full mt-2 flex justify-center items-center gap-6">
            <span className="text-txt-black-prim dark:text-txt-white-prim text-sm">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </span>
            {(album as any).photographer && (
              <span className="text-txt-black-prim dark:text-txt-white-prim text-sm">
                {(album as any).photographer}
              </span>
            )}
          </div>
        </div>
      </div>

      <Header photos={photos} slug={slug} albumTitle={album.title} />

      <div id="photos-grid" className="md:pb-[80px] pb-[50px] pt-5">
        {photos.length === 0 ? (
        <div className="px-5 text-txt-black-sec dark:text-txt-white-sec">
          <p className="text-lg font-light">No photos in this album yet.</p>
        </div>
      ) : (
        <div
          className="
            w-full md:px-5 px-2.5
            columns-2
            sm:columns-3
            lg:columns-4
            min-[1600px]:columns-5
            gap-2.5
          "
        >
          {photos.map((photo) => {
            const src = photo.sizes?.full?.url ?? photo.url ?? ''
            if (!src) return null
            return (
              <Link
                key={photo.id}
                href={`/gallery/${slug}/photo/${photo.id}`}
                className="block mb-2.5 break-inside-avoid overflow-hidden group"
              >
                <Image
                  src={src}
                  alt={photo.alt ?? ''}
                  width={photo.sizes?.full?.width ?? photo.width ?? 1200}
                  height={photo.sizes?.full?.height ?? photo.height ?? 800}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </Link>
            )
          })}
        </div>
      )}
      </div>

      <div className="lg:px-0 md:px-5 px-2.5 pb-10">
        <Footer />
      </div>
    </div>
  )
}