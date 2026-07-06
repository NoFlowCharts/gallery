import { notFound } from 'next/navigation'
import PhotoModal from '@/components/ui/PhotoModal'
import AnimatedPhoto from '@/components/ui/AnimatedPhoto'
import { getPhotoById, getAlbumBySlug } from '@/lib/payload'
import type { Media } from '@/payload-types'

type Props = { params: Promise<{ slug: string; id: string }> }

export default async function InterceptedPhotoPage({ params }: Props) {
  const { slug, id } = await params
  const photo = await getPhotoById(id)

  if (!photo?.url) notFound()

  const album = await getAlbumBySlug(slug)
  const photos = (album?.photos ?? []) as Media[]
  const currentIndex = photos.findIndex(p => String(p.id) === String(id))

  let prevPhotoId: string | number | null = null
  let nextPhotoId: string | number | null = null

  if (currentIndex !== -1 && photos.length > 1) {
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length
    const nextIndex = (currentIndex + 1) % photos.length
    prevPhotoId = photos[prevIndex]?.id
    nextPhotoId = photos[nextIndex]?.id
  }

  return (
    <PhotoModal
      photoUrl={photo.url}
      photoId={photo.id}
      prevPhotoId={prevPhotoId}
      nextPhotoId={nextPhotoId}
      slug={slug}
    >
      <AnimatedPhoto src={photo.url} alt={""} layoutId={`photo-${photo.id}`} />
    </PhotoModal>
  )
}