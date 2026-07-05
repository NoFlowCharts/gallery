'use client'

import { motion } from 'motion/react'

export default function AnimatedPhoto({
                                          src,
                                          alt,
                                          layoutId,
                                      }: {
    src: string
    alt: string
    layoutId: string
}) {
    return (
        <motion.img
            layoutId={layoutId}
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
    )
}