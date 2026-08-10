import { useEffect, useState } from 'react'

// Foundation for a future desktop/mobile split - the game is desktop-only for now (mobile support
// is planned much later). Nothing is actually blocked on this yet; it just gives the app a single
// place to know which target it's rendering for so features can be tagged "desktop only" ahead of
// mobile support landing, rather than hardcoding viewport checks ad hoc wherever they come up.
export type PlatformTarget = 'desktop' | 'mobile'

// Below this viewport width, the app is currently considered a "mobile" target.
export const MOBILE_BREAKPOINT_PX = 768

export function getPlatformTarget(viewportWidth: number): PlatformTarget {
  return viewportWidth < MOBILE_BREAKPOINT_PX ? 'mobile' : 'desktop'
}

function readViewportWidth(): number {
  return typeof window === 'undefined' ? MOBILE_BREAKPOINT_PX : window.innerWidth
}

// Tracks the current platform target across viewport resizes. Defaults to 'desktop' during SSR/
// non-browser environments so desktop-only UI isn't hidden before the first client render.
export function usePlatformTarget(): PlatformTarget {
  const [target, setTarget] = useState<PlatformTarget>(() => getPlatformTarget(readViewportWidth()))

  useEffect(() => {
    const handleResize = () => setTarget(getPlatformTarget(window.innerWidth))

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return target
}
