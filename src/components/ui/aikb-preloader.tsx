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
    const overlay = overlayRef.current
    const spiral = spiralRef.current
    const text = textRef.current

    if (!overlay || !spiral || !text) return

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
        setIsActive(false)
      })

    return () => {
      timelineRef.current?.kill()
      timelineRef.current = null
    }
  }, [])

  if (!isActive) {
    return null
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white"
      style={{ opacity: 0, visibility: 'hidden' }}
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
