'use client'

import Image from 'next/image'

type AnimatedPhotoProps = {
  src: string
  alt?: string | null | undefined
  layoutId?: string
  className?: string
  priority?: boolean
}

export default function AnimatedPhoto({
  src,
  alt,
  className = '',
  priority = false,
}: AnimatedPhotoProps) {
  return (
    <Image
      src={src}
      alt={alt ?? ''}
      width={1200}
      height={900}
      priority={priority}
      className={`max-h-[90vh] w-auto object-contain rounded-sm ${className}`}
      style={{ maxWidth: '95vw' }}
    />
  )
}
