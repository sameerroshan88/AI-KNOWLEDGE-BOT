'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { SpiralAnimation } from '@/components/ui/spiral-animation'

export function AIKBPreloader() {
  const [isActive, setIsActive] = useState(true)
  const overlayRef = useRef<HTMLDivElement>(null)
  const spiralRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    let mounted = true
    const overlay = overlayRef.current
    const spiral = spiralRef.current
    const text = textRef.current

    if (!overlay || !spiral || !text) return

    // Ensure popstate/pageshow history navigations mark the preloader as done
    // so back/forward traversals do not show the preloader.
    const handlePopState = () => {
      try {
        ;(window as any).__aikbPreloaderDone = true
      } catch (e) {}
    }

    const handlePageShow = (ev: PageTransitionEvent) => {
      try {
        if ((ev as any).persisted) {
          ;(window as any).__aikbPreloaderDone = true
        }
      } catch (e) {}
    }

    try {
      window.addEventListener('popstate', handlePopState)
      window.addEventListener('pageshow', handlePageShow)
    } catch (e) {}

    // Detect whether this is the first page load, a reload, or a history navigation.
    try {
      let shouldSkip = false
      let isBackForward = false

      if (typeof window !== 'undefined') {
        const navigation = (performance as any).navigation
        const perfEntries = performance.getEntriesByType?.('navigation') as PerformanceNavigationTiming[] | undefined

        let navType = navigation?.type
        if (perfEntries && perfEntries.length > 0) {
          navType = (perfEntries[0] as any).type
        }

        // Navigation types:
        // 'navigate' = normal navigation
        // 'reload' = page reload (F5, Ctrl+R)
        // 'back_forward' = browser back/forward buttons
        // 0 = navigate, 1 = reload, 2 = back_forward

        if (navType === 'back_forward' || navType === 2) {
          shouldSkip = true
          isBackForward = true
        }

        // If an OAuth flow set a skip flag, skip and clear it. This ensures
        // returning from external auth (Google) won't show the preloader.
        try {
          const skipFlag = sessionStorage.getItem('aikb_skip_preloader')
          if (skipFlag) {
            try {
              sessionStorage.removeItem('aikb_skip_preloader')
            } catch (e) {}
            shouldSkip = true
          }
        } catch (e) {}

        // Skip the preloader for client-side navigations by checking a
        // transient window-scoped flag. This flag is cleared on a full
        // navigation (address-bar paste+enter or reload) because the global
        // `window` object is recreated.
        if ((window as any).__aikbPreloaderDone) {
          shouldSkip = true
        }
      }

      if (shouldSkip) {
        if (mounted) setIsActive(false)
        try {
          if (typeof window !== 'undefined') {
            ;(window as any).__aikbPreloaderDone = true
            window.dispatchEvent(new Event('aikb:preloader:done'))
          }
        } catch (e) {}
        return
      }
    } catch (e) {
      // ignore errors
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    timelineRef.current = tl

    tl.set([overlay, spiral, text], { autoAlpha: 1 })
      .from(text, { opacity: 0, y: 18, duration: 0.5 }, 0)
      .to(
        text,
        {
          filter: 'drop-shadow(0 0 28px rgba(255,255,255,0.24))',
          duration: 1.5,
          repeat: -1,
          yoyo: true,
        },
        0,
      )
      .to({}, { duration: 2.5 }, 0.5)
      .to([spiral, text], { opacity: 0, duration: 1.0, ease: 'power2.inOut' }, 3.0)
      .to(overlay, { autoAlpha: 0, duration: 0.01 }, 4.0)
      .call(() => {
        if (mounted) setIsActive(false)
        try {
          if (typeof window !== 'undefined') {
            ;(window as any).__aikbPreloaderDone = true
            window.dispatchEvent(new Event('aikb:preloader:done'))
          }
        } catch (e) {}
      })

    return () => {
      mounted = false
      timelineRef.current?.kill()
      timelineRef.current = null
      try {
        window.removeEventListener('popstate', handlePopState)
        window.removeEventListener('pageshow', handlePageShow)
      } catch (e) {}
    }
  }, [])

  if (!isActive) {
    return null
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white"
      style={{ opacity: 1, visibility: 'visible' }}
    >
      <div ref={spiralRef} className="absolute inset-0 opacity-100 transition-opacity duration-500">
        <SpiralAnimation />
      </div>
      <div className="relative z-10 flex items-center justify-center px-6">
        <div
          ref={textRef}
          className="text-white font-black uppercase leading-none text-[clamp(4rem,8vw,8rem)] tracking-[0.35em] text-center"
          style={{ textShadow: '0 0 30px rgba(255,255,255,0.18), 0 0 60px rgba(255,255,255,0.1)' }}
        >
          AIKB
        </div>
      </div>
    </div>
  )
}
