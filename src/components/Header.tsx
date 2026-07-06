'use client'

import { useEffect, useState, useRef } from 'react'
import AlbumActions from '@/components/AlbumActions'

type Photo = {
  id: string | number
  url?: string | null
  sizes?: { full?: { url?: string | null } | null } | null
  alt?: string | null
}

type HeaderProps = {
  photos?: Photo[]
  slug?: string
  albumTitle?: string
}

const Header = ({ photos = [], slug = '', albumTitle = '' }: HeaderProps) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isSticky, setIsSticky] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Determine if we've scrolled past the hero section (approx. 100vh)
      const heroThreshold = window.innerHeight - 80
      const isPastHero = currentScrollY > heroThreshold
      setIsSticky(isPastHero)

      // Only allow hiding if we are past the hero section
      if (!isPastHero) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down -> hide
        setIsVisible(false)
      } else {
        // Scrolling up -> show
        setIsVisible(true)
      }
      
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-30 w-full flex items-center justify-center py-3 px-5 transition-all duration-300 ${
        isSticky 
          ? 'bg-bg backdrop-blur-md ' 
          : 'bg-transparent border-transparent'
      } ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex justify-between items-center w-full xl:max-w-[1190px] lg:max-w-[986px]">
        <div className="flex gap-3 items-center">
          <img src="/logo/sign.svg" alt="Logo" className="h-[48px] dark:invert" />
          <div className="flex flex-col gap-2">
            <span className="font-light text-txt-black-prim dark:text-txt-white-prim text-3xl">
              Gallery
            </span>
          </div>
        </div>

        <AlbumActions photos={photos} slug={slug} albumTitle={albumTitle} />
      </div>
    </header>
  )
}

export default Header