import { notFound } from 'next/navigation'
import AnimatedPhoto from '@/components/ui/AnimatedPhoto'
import { getPhotoById } from '@/lib/payload'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string; id: string }> }

export default async function PhotoPage({ params }: Props) {
  const { id } = await params
  const photo = await getPhotoById(id)

  if (!photo?.url) notFound()

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <AnimatedPhoto src={photo.url} layoutId={`photo-${photo.id}`} alt={""} />
    </div>
  )
}