import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import PdfPage from './PdfPage'
import { usePdfStore } from '../../lib/state/store'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export default function PdfCanvas(): JSX.Element {
  const bytes = usePdfStore((s) => s.bytes)
  const zoom = usePdfStore((s) => s.zoom)
  const setNumPages = usePdfStore((s) => s.setNumPages)
  const setStatus = usePdfStore((s) => s.setStatus)
  const setCurrentPage = usePdfStore((s) => s.setCurrentPage)

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const docRef = useRef<PDFDocumentProxy | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bytes) {
      setPdf(null)
      return
    }
    let cancelled = false
    setStatus('Lade Dokument …')
    const task = pdfjsLib.getDocument({ data: bytes.slice(0) })
    task.promise
      .then((doc) => {
        if (cancelled) {
          void doc.destroy()
          return
        }
        docRef.current?.destroy()
        docRef.current = doc
        setPdf(doc)
        setNumPages(doc.numPages)
        setStatus(`Bereit · ${doc.numPages} Seite(n)`)
      })
      .catch((e: unknown) => {
        if (!cancelled) setStatus(`Fehler: ${e instanceof Error ? e.message : String(e)}`)
      })
    return () => {
      cancelled = true
      void task.destroy()
    }
  }, [bytes, setNumPages, setStatus])

  useEffect(() => {
    return () => {
      docRef.current?.destroy()
      docRef.current = null
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = (): void => {
      const mid = el.scrollTop + el.clientHeight / 2
      const pages = el.querySelectorAll<HTMLElement>('[data-page]')
      for (const p of pages) {
        if (p.offsetTop <= mid && p.offsetTop + p.offsetHeight >= mid) {
          setCurrentPage(Number(p.dataset.page))
          break
        }
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [setCurrentPage, pdf])

  return (
    <div ref={containerRef} className="h-full w-full overflow-auto bg-canvas py-2" data-testid="pdf-scroll">
      {pdf &&
        Array.from({ length: pdf.numPages }, (_, i) => i + 1).map((n) => (
          <PdfPage key={`p${n}-of${pdf.numPages}`} pdf={pdf} pageNumber={n} zoom={zoom} />
        ))}
    </div>
  )
}
