import { notFound } from 'next/navigation'
import PhotoModal from '@/components/ui/PhotoModal'
import AnimatedPhoto from '@/components/ui/AnimatedPhoto'
import { getPhotoById } from '@/lib/payload'

type Props = { params: Promise<{ slug: string; id: string }> }

export default async function InterceptedPhotoPage({ params }: Props) {
  const { id } = await params
  const photo = await getPhotoById(id)

  if (!photo?.url) notFound()

  return (
    <PhotoModal>
      <AnimatedPhoto src={photo.url} alt={""} layoutId={`photo-${photo.id}`} />
    </PhotoModal>
  )
}