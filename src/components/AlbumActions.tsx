'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Button from '@/components/Button'
import {
  RiDownloadLine,
  RiShareBoxLine,
  RiPlayLine,
  RiFileCopyLine,
  RiCloseLine,
  RiArrowLeftLine,
  RiArrowRightLine,
} from '@remixicon/react'

type Photo = {
  id: string | number
  url?: string | null
  sizes?: { full?: { url?: string | null } | null } | null
  alt?: string | null
}

type Props = {
  photos: Photo[]
  slug: string
  albumTitle: string
}

// ── helpers ──────────────────────────────────────────────────────────────────

function photoUrl(p: Photo) {
  return p.sizes?.full?.url ?? p.url ?? ''
}

// ── Download button ───────────────────────────────────────────────────────────

function DownloadButton({ photos, albumTitle }: { photos: Photo[]; albumTitle: string }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (loading) return
    setLoading(true)
    try {
      // Dynamically import JSZip only on client
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const folder = zip.folder(albumTitle) ?? zip

      await Promise.all(
        photos.map(async (photo, i) => {
          const url = photoUrl(photo)
          if (!url) return
          const res = await fetch(url)
          const blob = await res.blob()
          const ext = url.split('.').pop()?.split('?')[0] ?? 'jpg'
          folder.file(`${String(i + 1).padStart(3, '0')}.${ext}`, blob)
        })
      )

      const content = await zip.generateAsync({ type: 'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(content)
      a.download = `${albumTitle}.zip`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e) {
      console.error('Download failed', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="Download album"
      className="flex items-center justify-center w-10 h-10 text-txt-black-prim dark:text-txt-white-prim hover:bg-black/8 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
    >
      <RiDownloadLine size={24} className={loading ? 'animate-spin' : ''} />
    </button>
  )
}

// ── Share button + popup ──────────────────────────────────────────────────────

function ShareButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/gallery/${slug}`
    : `/gallery/${slug}`

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        title="Share album"
        className="flex items-center justify-center w-10 h-10 text-txt-black-prim dark:text-txt-white-prim hover:bg-black/8 dark:hover:bg-white/10 transition-colors"
      >
        <RiShareBoxLine size={24} />
      </button>

      {open && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div 
            className="w-[500px] max-w-[95vw] bg-white dark:bg-[#1E1E1F] border border-black/10 dark:border-white/10 p-8 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-light text-txt-black-prim dark:text-txt-white-prim">
                Share
              </h3>
              <button 
                onClick={() => setOpen(false)}
                className="text-txt-black-sec dark:text-txt-white-sec hover:text-txt-black-prim dark:hover:text-txt-white-prim transition-colors"
              >
                <RiCloseLine size={24} />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 text-[18px] font-light pt-2 pb-2.5 px-6 bg-transparent border border-black/20 dark:border-white/20 text-txt-black-prim dark:text-txt-white-prim outline-none"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button 
                text={copied ? "Copied" : "Copy"} 
                onClick={copy}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

// ── Slideshow ─────────────────────────────────────────────────────────────────

function SlideshowButton({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState(false)
  const [index, setIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [fade, setFade] = useState(true)
  const [mounted, setMounted] = useState(false)

  const advance = useCallback((direction: 1 | -1 = 1) => {
    setFade(false)
    setTimeout(() => {
      setIndex(i => (i + direction + photos.length) % photos.length)
      setFade(true)
    }, 300)
  }, [photos.length])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-advance every 7 s
  useEffect(() => {
    if (!active) return
    intervalRef.current = setInterval(() => advance(1), 7000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [active, advance])

  // Keyboard navigation
  useEffect(() => {
    if (!active) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(false)
      if (e.key === 'ArrowRight') { if (intervalRef.current) clearInterval(intervalRef.current); advance(1) }
      if (e.key === 'ArrowLeft')  { if (intervalRef.current) clearInterval(intervalRef.current); advance(-1) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [active, advance])

  // Lock scroll
  useEffect(() => {
    if (active) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [active])

  const start = () => { setIndex(0); setFade(true); setActive(true) }

  const currentPhoto = photos[index]
  const src = currentPhoto ? photoUrl(currentPhoto) : ''

  return (
    <>
      <button
        onClick={start}
        disabled={photos.length === 0}
        title="Start slideshow"
        className="flex items-center justify-center w-10 h-10 text-txt-black-prim dark:text-txt-white-prim hover:bg-black/8 dark:hover:bg-white/10 transition-colors disabled:opacity-30"
      >
        <RiPlayLine size={24} />
      </button>

      {active && mounted && createPortal(
        <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex items-center justify-center">
          {/* Photo */}
          {src && (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                opacity: fade ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
            >
              <Image
                key={src}
                src={src}
                alt={currentPhoto?.alt ?? ''}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          )}

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm tabular-nums">
            {index + 1} / {photos.length}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
            <div
              key={index}
              className="h-full bg-white/50"
              style={{ animation: 'slideshow-progress 7s linear forwards' }}
            />
          </div>

          {/* Close */}
          <button
            onClick={() => setActive(false)}
            className="absolute top-5 right-5 flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/10 transition-colors"
            aria-label="Close slideshow"
          >
            <RiCloseLine size={24} />
          </button>

          {/* Prev */}
          <button
            onClick={() => { if (intervalRef.current) clearInterval(intervalRef.current); advance(-1) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/10 transition-colors"
            aria-label="Previous photo"
          >
            <RiArrowLeftLine size={24} />
          </button>

          {/* Next */}
          <button
            onClick={() => { if (intervalRef.current) clearInterval(intervalRef.current); advance(1) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/10 transition-colors"
            aria-label="Next photo"
          >
            <RiArrowRightLine size={24} />
          </button>
        </div>,
        document.body
      )}
    </>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AlbumActions({ photos, slug, albumTitle }: Props) {
  return (
    <div className="flex items-center gap-4">
      <DownloadButton photos={photos} albumTitle={albumTitle} />
      <ShareButton slug={slug} />
      <SlideshowButton photos={photos} />
    </div>
  )
}
