'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, MouseEventHandler } from 'react'

export default function PhotoModal({ children }: { children: React.ReactNode }) {
    const overlay = useRef<HTMLDivElement>(null)
    const wrapper = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const onDismiss = useCallback(() => {
        router.back()
    }, [router])

    const onClick: MouseEventHandler = useCallback(
        (e) => {
            if (e.target === overlay.current || e.target === wrapper.current) {
                onDismiss()
            }
        },
        [onDismiss],
    )

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onDismiss()
        },
        [onDismiss],
    )

    useEffect(() => {
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [onKeyDown])

    return (
        <div
            ref={overlay}
            onClick={onClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        >
            <div ref={wrapper} className="relative w-full h-full flex items-center justify-center">
                {children}
            </div>
        </div>
    )
}