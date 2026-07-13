'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useField } from '@payloadcms/ui'
import { upload } from '@vercel/blob/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadState {
  file: File
  progress: number
  status: 'uploading' | 'registering' | 'done' | 'error'
  error?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhotosDropzone({ path }: { path: string }) {
  const { value, setValue } = useField<any[]>({ path })
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState<UploadState[]>([])
  const [photosData, setPhotosData] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Normalize value to an array
  const currentPhotos = Array.isArray(value) ? value : []

  // Fetch full media documents if we only have IDs
  useEffect(() => {
    const fetchPhotos = async () => {
      if (currentPhotos.length === 0) {
        setPhotosData([])
        return
      }
      const fetchPromises = currentPhotos.map(async (item) => {
        if (typeof item === 'object' && item.url) return item
        const id = typeof item === 'object' ? item.id : item
        try {
          const res = await fetch(`/api/media/${id}`)
          if (res.ok) return await res.json()
        } catch (e) {
          console.error(e)
        }
        return { id }
      })
      setPhotosData(await Promise.all(fetchPromises))
    }
    fetchPhotos()
  }, [JSON.stringify(currentPhotos)])

  // ── Upload a single file ────────────────────────────────────────────────────

  const uploadFile = async (file: File, index: number) => {
    const updateState = (patch: Partial<UploadState>) =>
      setUploads((prev) => prev.map((u, i) => (i === index ? { ...u, ...patch } : u)))

    try {
      // ── Step 1: Client-side direct upload to Vercel Blob ─────────────────
      // No serverless body limit — file goes directly to Vercel Blob.
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/media/upload-url',
        onUploadProgress: ({ percentage }) => {
          updateState({ progress: Math.round(percentage * 0.85) }) // 0–85% for blob upload
        },
      })

      updateState({ status: 'registering', progress: 85 })

      // ── Step 2: Register in Payload (download + Sharp processing on server) ─
      const res = await fetch('/api/media/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: blob.url,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          alt: file.name,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Register failed: ${res.status}`)
      }

      const { doc } = await res.json()
      updateState({ status: 'done', progress: 100 })
      return doc.id as string
    } catch (err) {
      const message = (err as Error).message ?? 'Upload failed'
      updateState({ status: 'error', error: message })
      console.error('[PhotosDropzone] upload error:', err)
      return null
    }
  }

  // ── Handle files (drag-and-drop or file picker) ────────────────────────────

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (imageFiles.length === 0) return

      // Validate sizes (client-side guard — hard cap in token endpoint is 500 MB)
      const oversized = imageFiles.filter((f) => f.size > 500 * 1024 * 1024)
      if (oversized.length > 0) {
        alert(`The following files exceed the 500 MB limit:\n${oversized.map((f) => f.name).join('\n')}`)
        return
      }

      const startIndex = uploads.length
      setUploads((prev) => [
        ...prev,
        ...imageFiles.map((file) => ({ file, progress: 0, status: 'uploading' as const })),
      ])

      // Upload sequentially to avoid hammering the server
      const newIds: string[] = []
      for (let i = 0; i < imageFiles.length; i++) {
        const id = await uploadFile(imageFiles[i]!, startIndex + i)
        if (id) newIds.push(id)
      }

      // Append new IDs to album's photos field
      setValue([...currentPhotos, ...newIds])

      // Clean up completed/errored upload states after a short delay
      setTimeout(() => {
        setUploads((prev) => prev.filter((u) => u.status !== 'done'))
      }, 2000)
    },
    [currentPhotos, setValue, uploads.length],
  )

  // ── Drag & drop handlers ───────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files?.length) await handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        await handleFiles(e.target.files)
        e.target.value = '' // reset so same file can be picked again
      }
    },
    [handleFiles],
  )

  // ── Remove photo from album ────────────────────────────────────────────────

  const removePhoto = (idToRemove: string) => {
    setValue(
      currentPhotos.filter((item) => {
        const id = typeof item === 'object' ? item.id : item
        return id !== idToRemove
      }),
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const isUploading = uploads.some((u) => u.status === 'uploading' || u.status === 'registering')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#000' : '#ccc'}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: isDragging ? '#f0f0f0' : 'transparent',
          transition: 'all 0.2s',
          cursor: 'pointer',
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        {isUploading ? (
          <span style={{ fontWeight: 600 }}>Uploading… please wait</span>
        ) : (
          <>
            <span style={{ fontSize: '1.5rem' }}>📷</span>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              Drag & drop photos here, or <strong>click to browse</strong>
            </span>
            <span style={{ color: '#999', fontSize: '0.75rem' }}>
              JPEG, PNG, WebP, HEIC · up to 500 MB per file
            </span>
          </>
        )}
      </div>

      {/* Active upload progress bars */}
      {uploads.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {uploads.map((u, i) => (
            <div key={i} style={{ fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                  {u.file.name}
                </span>
                <span style={{ color: u.status === 'error' ? '#c00' : '#666' }}>
                  {u.status === 'error'
                    ? '✕ Error'
                    : u.status === 'done'
                      ? '✓ Done'
                      : u.status === 'registering'
                        ? 'Processing…'
                        : `${u.progress}%`}
                </span>
              </div>
              {u.status === 'error' ? (
                <div style={{ color: '#c00', fontSize: '0.75rem', marginTop: '2px' }}>{u.error}</div>
              ) : (
                <div style={{ background: '#eee', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${u.progress}%`,
                      height: '100%',
                      background: u.status === 'done' ? '#22c55e' : '#3b82f6',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Existing photos grid */}
      {photosData.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '0.75rem',
            marginTop: '0.5rem',
          }}
        >
          {photosData.map((photo, i) => {
            const id = photo.id
            const url = photo?.sizes?.thumbnail?.url ?? photo?.url
            return (
              <div
                key={id ?? i}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  backgroundColor: '#eee',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                {url ? (
                  <img src={url} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.75rem', color: '#999' }}>
                    Loading…
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); removePhoto(id) }}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(0,0,0,0.55)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
