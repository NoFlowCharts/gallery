'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useField } from '@payloadcms/ui'

export default function PhotosDropzone({ path }: { path: string }) {
  const { value, setValue } = useField<any[]>({ path })
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photosData, setPhotosData] = useState<any[]>([])

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
          if (res.ok) {
            return await res.json()
          }
        } catch (e) {
          console.error(e)
        }
        return { id }
      })

      const resolved = await Promise.all(fetchPromises)
      setPhotosData(resolved)
    }
    fetchPhotos()
  }, [JSON.stringify(currentPhotos)])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploading(true)
      const newIds: string[] = []

      // Upload each file
      for (const file of Array.from(e.dataTransfer.files)) {
        if (!file.type.startsWith('image/')) continue

        const formData = new FormData()
        formData.append('file', file)
        formData.append('alt', file.name)

        try {
          const res = await fetch('/api/media', {
            method: 'POST',
            body: formData,
          })
          if (res.ok) {
            const data = await res.json()
            if (data.doc && data.doc.id) {
              newIds.push(data.doc.id)
            }
          }
        } catch (error) {
          console.error('Upload failed', error)
        }
      }

      // Append new IDs to current value
      setValue([...currentPhotos, ...newIds])
      setUploading(false)
    }
  }, [currentPhotos, setValue])

  const removePhoto = (idToRemove: string) => {
    const newPhotos = currentPhotos.filter((item) => {
      const id = typeof item === 'object' ? item.id : item
      return id !== idToRemove
    })
    setValue(newPhotos)
  }

  return (
    <div className="photos-dropzone-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? '#000' : '#ccc'}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: isDragging ? '#f9f9f9' : 'transparent',
          transition: 'all 0.2s',
          cursor: 'pointer',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {uploading ? (
          <span style={{ fontWeight: 'bold' }}>Uploading photos... Please wait.</span>
        ) : (
          <span style={{ color: '#666' }}>Drag & drop photos here to instantly upload and add them to the album.</span>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '1rem',
        marginTop: '1rem'
      }}>
        {photosData.map((photo, i) => {
          const id = photo.id
          const url = photo?.sizes?.thumbnail?.url || photo?.url
          return (
            <div key={id || i} style={{ position: 'relative', aspectRatio: '1', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
              {url ? (
                <img src={url} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Loading...</div>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); removePhoto(id); }}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
