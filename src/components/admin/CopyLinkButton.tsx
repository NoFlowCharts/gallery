'use client'

import React, { useState } from 'react'
import { useFormFields } from '@payloadcms/ui'

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false)
  
  // Hook into Payload's form state to get the current slug
  const slugField = useFormFields(([fields]) => fields.slug)
  const slug = slugField?.value

  if (!slug) return null // Hide if slug isn't generated yet

  const handleCopy = () => {
    // Determine the base URL. If in dev, localhost:3000, else window.location.origin
    const baseUrl = window.location.origin
    const link = `${baseUrl}/gallery/${slug}`
    
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        {copied ? 'Copied!' : 'Copy link to album'}
      </button>
    </div>
  )
}
