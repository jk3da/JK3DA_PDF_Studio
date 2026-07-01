import { useEffect, useRef, useState } from 'react'
import { TextLayer, type PDFDocumentProxy } from 'pdfjs-dist'
import AnnotationLayer from '../AnnotationLayer/AnnotationLayer'
import { usePdfStore } from '../../lib/state/store'

interface Props {
  pdf: PDFDocumentProxy
  pageNumber: number
  zoom: number
}

interface CancelableRender {
  cancel: () => void
  promise: Promise<void>
}

export default function PdfPage({ pdf, pageNumber, zoom }: Props): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const renderRef = useRef<CancelableRender | null>(null)
  const textLayerRef = useRef<TextLayer | null>(null)
  const [base, setBase] = useState<{ w: number; h: number } | null>(null)
  const textSelect = usePdfStore((s) => s.textSelect)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const page = await pdf.getPage(pageNumber)
      if (cancelled) return
      const unscaled = page.getViewport({ scale: 1 })
      setBase({ w: unscaled.width, h: unscaled.height })

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const viewport = page.getViewport({ scale: zoom })
      canvas.width = Math.floor(viewport.width * dpr)
      canvas.height = Math.floor(viewport.height * dpr)

      renderRef.current?.cancel()
      const task = page.render({
        canvasContext: ctx,
        viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined
      }) as unknown as CancelableRender
      renderRef.current = task
      try {
        await task.promise
      } catch {
        return
      }

      // Textauswahl-Ebene (für Markieren/Kopieren)
      const container = textRef.current
      if (container && !cancelled) {
        try {
          textLayerRef.current?.cancel()
          container.replaceChildren()
          container.style.setProperty('--scale-factor', String(zoom))
          container.style.setProperty('--total-scale-factor', String(zoom))
          const tl = new TextLayer({
            textContentSource: await page.getTextContent(),
            container,
            viewport
          })
          textLayerRef.current = tl
          await tl.render()
        } catch {
          /* Text-Layer ist optional — Fehler ignorieren */
        }
      }
    })()
    return () => {
      cancelled = true
      renderRef.current?.cancel()
      textLayerRef.current?.cancel()
    }
  }, [pdf, pageNumber, zoom])

  const wPx = base ? base.w * zoom : undefined
  const hPx = base ? base.h * zoom : undefined

  return (
    <div
      id={`pdf-page-${pageNumber}`}
      data-page={pageNumber}
      className="relative mx-auto my-4 bg-white shadow-lg"
      style={{ width: wPx, height: hPx }}
    >
      <canvas ref={canvasRef} className="block" style={{ width: wPx, height: hPx }} />
      <div
        ref={textRef}
        className="textLayer"
        style={{ width: wPx, height: hPx, pointerEvents: textSelect ? 'auto' : 'none', cursor: textSelect ? 'text' : undefined }}
      />
      {base && <AnnotationLayer pageNumber={pageNumber} baseWidth={base.w} zoom={zoom} />}
    </div>
  )
}
