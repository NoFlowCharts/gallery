import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],
  turbopack: {
    resolveAlias: {
      '@payload-config': './src/payload.config.ts',
    },
  },
  images: {
    remotePatterns: [
      // Vercel Blob Storage
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      // Local dev (Payload serves uploads from /api/media/file/...)
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
}

export default withPayload(nextConfig)