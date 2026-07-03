import { useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

interface Props {
  pdf: PDFDocumentProxy
  pageNumber: number
  width: number
}

interface CancelableRender {
  cancel: () => void
  promise: Promise<void>
}

export default function Thumbnail({ pdf, pageNumber, width }: Props): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderRef = useRef<CancelableRender | null>(null)
  const [height, setHeight] = useState(0)
  const [visible, setVisible] = useState(false)

  // Erst rendern, wenn die Miniatur wirklich in den sichtbaren Bereich scrollt.
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    void (async () => {
      const page = await pdf.getPage(pageNumber)
      if (cancelled) return
      const base = page.getViewport({ scale: 1 })
      const scale = width / base.width
      const vp = page.getViewport({ scale })
      setHeight(vp.height)

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(vp.width * dpr)
      canvas.height = Math.floor(vp.height * dpr)

      renderRef.current?.cancel()
      const task = page.render({
        canvasContext: ctx,
        viewport: vp,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined
      }) as unknown as CancelableRender
      renderRef.current = task
      try {
        await task.promise
      } catch {
        /* cancelled */
      }
    })()
    return () => {
      cancelled = true
      renderRef.current?.cancel()
    }
  }, [pdf, pageNumber, width, visible])

  return (
    <canvas
      ref={canvasRef}
      className="block bg-white"
      style={{ width, height: height || width * 1.414 }}
    />
  )
}
