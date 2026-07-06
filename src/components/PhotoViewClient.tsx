'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import {
  RiDownloadLine,
  RiShareBoxLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCloseLine,
} from '@remixicon/react'

type Photo = {
  id: string | number
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

type PhotoViewClientProps = {
  photo: Photo
  prevPhotoId: string | number | null
  nextPhotoId: string | number | null
  slug: string
}

export default function PhotoViewClient({
  photo,
  prevPhotoId,
  nextPhotoId,
  slug,
}: PhotoViewClientProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/gallery/${slug}/photo/${photo.id}`
    : `/gallery/${slug}/photo/${photo.id}`

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevPhotoId) {
        router.push(`/gallery/${slug}/photo/${prevPhotoId}`)
      }
      if (e.key === 'ArrowRight' && nextPhotoId) {
        router.push(`/gallery/${slug}/photo/${nextPhotoId}`)
      }
      if (e.key === 'Escape') {
        if (open) {
          setOpen(false)
        } else {
          router.push(`/gallery/${slug}`)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, prevPhotoId, nextPhotoId, slug, open])

  const downloadPhoto = async () => {
    if (!photo.url) return
    try {
      const res = await fetch(photo.url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      const ext = photo.url.split('.').pop()?.split('?')[0] ?? 'jpg'
      a.download = `photo-${photo.id}.${ext}`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e) {
      console.error('Download failed', e)
    }
  }

  return (
    <div className="min-h-screen bg-[#1E1E1F] text-[#FAFAFC] flex flex-col justify-between select-none">
      {/* Header */}
      <header className="w-full flex items-center justify-center py-4 px-5">
        <div className="flex justify-between items-center w-full xl:max-w-[1190px] lg:max-w-[986px]">
          {/* Back button */}
          <Button 
            text="Back" 
            href={`/gallery/${slug}`} 
            variant="secondary" 
            className="!border-[#FAFAFC] !text-[#FAFAFC] hover:!bg-[#FAFAFC] hover:!text-[#1E1E1F]"
          />

          {/* Individual Photo Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={downloadPhoto}
              title="Download photo"
              className="flex items-center justify-center w-10 h-10 text-[#FAFAFC] hover:bg-white/10 transition-colors"
            >
              <RiDownloadLine size={24} />
            </button>
            <button
              onClick={() => setOpen(true)}
              title="Share photo"
              className="flex items-center justify-center w-10 h-10 text-[#FAFAFC] hover:bg-white/10 transition-colors"
            >
              <RiShareBoxLine size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main photo container area */}
      <main className="flex-1 w-full flex items-center justify-center py-8">
        <div className="flex items-center justify-between w-full xl:max-w-[1190px] lg:max-w-[986px] px-5 gap-6">
          {/* Previous photo button (Desktop) */}
          <div className="w-[68px] flex-shrink-0 hidden md:block">
            {prevPhotoId ? (
              <Link
                href={`/gallery/${slug}/photo/${prevPhotoId}`}
                className="flex justify-center items-center w-[68px] h-[38px] border border-[#FAFAFC] hover:bg-[#FAFAFC] hover:text-[#1E1E1F] transition-colors"
              >
                <RiArrowLeftLine size={20} className="text-current" />
              </Link>
            ) : (
              <div className="w-[68px] h-[38px] border border-[#FAFAFC]/10 opacity-10 flex justify-center items-center cursor-not-allowed">
                <RiArrowLeftLine size={20} className="text-current" />
              </div>
            )}
          </div>

          {/* Photo content & Mobile Arrows */}
          <div className="flex-1 flex flex-col items-center justify-center max-h-[75vh] relative">
            <div className="w-full flex justify-center items-center max-h-[65vh] md:max-h-[75vh]">
              {photo.url && (
                <Image
                  src={photo.url}
                  alt={photo.alt ?? ''}
                  width={photo.width ?? 1200}
                  height={photo.height ?? 900}
                  priority
                  className="max-h-[65vh] md:max-h-[75vh] w-auto h-auto object-contain select-none shadow-2xl"
                  style={{ maxWidth: '100%' }}
                />
              )}
            </div>

            {/* Mobile Arrows (below photo) */}
            <div className="flex md:hidden justify-center items-center gap-4 mt-6">
              {prevPhotoId ? (
                <Link
                  href={`/gallery/${slug}/photo/${prevPhotoId}`}
                  className="flex justify-center items-center w-[68px] h-[38px] border border-[#FAFAFC] hover:bg-[#FAFAFC] hover:text-[#1E1E1F] transition-colors"
                >
                  <RiArrowLeftLine size={20} className="text-current" />
                </Link>
              ) : (
                <div className="w-[68px] h-[38px] border border-[#FAFAFC]/10 opacity-10 flex justify-center items-center cursor-not-allowed">
                  <RiArrowLeftLine size={20} className="text-current" />
                </div>
              )}

              {nextPhotoId ? (
                <Link
                  href={`/gallery/${slug}/photo/${nextPhotoId}`}
                  className="flex justify-center items-center w-[68px] h-[38px] border border-[#FAFAFC] hover:bg-[#FAFAFC] hover:text-[#1E1E1F] transition-colors"
                >
                  <RiArrowRightLine size={20} className="text-current" />
                </Link>
              ) : (
                <div className="w-[68px] h-[38px] border border-[#FAFAFC]/10 opacity-10 flex justify-center items-center cursor-not-allowed">
                  <RiArrowRightLine size={20} className="text-current" />
                </div>
              )}
            </div>
          </div>

          {/* Next photo button (Desktop) */}
          <div className="w-[68px] flex-shrink-0 hidden md:block">
            {nextPhotoId ? (
              <Link
                href={`/gallery/${slug}/photo/${nextPhotoId}`}
                className="flex justify-center items-center w-[68px] h-[38px] border border-[#FAFAFC] hover:bg-[#FAFAFC] hover:text-[#1E1E1F] transition-colors"
              >
                <RiArrowRightLine size={20} className="text-current" />
              </Link>
            ) : (
              <div className="w-[68px] h-[38px] border border-[#FAFAFC]/10 opacity-10 flex justify-center items-center cursor-not-allowed">
                <RiArrowRightLine size={20} className="text-current" />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer spacer */}
      <footer className="h-16" />

      {/* Share Modal Portal */}
      {open && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div 
            className="w-[500px] max-w-[95vw] bg-[#1E1E1F] border border-white/10 p-8 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-light text-[#FAFAFC]">
                Share
              </h3>
              <button 
                onClick={() => setOpen(false)}
                className="text-[#FAFAFC]/60 hover:text-[#FAFAFC] transition-colors"
              >
                <RiCloseLine size={24} />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 text-[18px] font-light pt-2 pb-2.5 px-6 bg-transparent border border-white/20 text-[#FAFAFC] outline-none"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button 
                text={copied ? "Copied" : "Copy"} 
                onClick={copy}
                className="!bg-[#FAFAFC] !text-[#1E1E1F] hover:!bg-[#FAFAFC]/90"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
