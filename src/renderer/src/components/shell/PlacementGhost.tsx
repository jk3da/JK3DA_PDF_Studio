import { useEffect, useState } from 'react'
import { usePdfStore } from '../../lib/state/store'

/**
 * Halbtransparente Vorschau des zu platzierenden Bildes (Signatur/Stempel),
 * die dem Cursor folgt — damit man exakt platzieren kann. Zentriert wie der
 * spätere Klick (AnnotationLayer platziert auf x - w/2, y - h/2).
 */
export default function PlacementGhost(): JSX.Element | null {
  const pending = usePdfStore((s) => s.pending)
  const zoom = usePdfStore((s) => s.zoom)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!pending) {
      setPos(null)
      return
    }
    const onMove = (e: PointerEvent): void => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [pending])

  if (!pending || !pos) return null
  const w = pending.w * zoom
  const h = pending.h * zoom

  return (
    <img
      src={pending.dataUrl}
      alt=""
      draggable={false}
      className="pointer-events-none fixed z-[60] select-none opacity-60"
      style={{
        left: pos.x - w / 2,
        top: pos.y - h / 2,
        width: w,
        height: h,
        outline: '1px dashed #3b82f6',
        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.45))'
      }}
    />
  )
}
