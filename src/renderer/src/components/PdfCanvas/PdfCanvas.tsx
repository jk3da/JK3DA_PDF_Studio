import { useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { usePdfStore } from '../../lib/state/store'

// pdf.js braucht seinen Worker. Vite liefert die Datei als Asset-URL (?url).
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export default function PdfCanvas(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  const bytes = usePdfStore((s) => s.bytes)
  const zoom = usePdfStore((s) => s.zoom)
  const setNumPages = usePdfStore((s) => s.setNumPages)
  const setStatus = usePdfStore((s) => s.setStatus)
  const setCurrentPage = usePdfStore((s) => s.setCurrentPage)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !bytes) return

    let cancelled = false
    // pdf.js detacht den uebergebenen Buffer — daher eine Kopie reingeben,
    // damit die Bytes im Store fuer spaeteres Speichern erhalten bleiben.
    const loadingTask = pdfjsLib.getDocument({ data: bytes.slice(0) })

    const render = async (): Promise<void> => {
      setStatus('Lade Dokument …')
      const pdf = await loadingTask.promise
      if (cancelled) return

      setNumPages(pdf.numPages)
      container.replaceChildren()
      const dpr = window.devicePixelRatio || 1

      for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
        if (cancelled) return
        const page = await pdf.getPage(pageNo)
        const viewport = page.getViewport({ scale: zoom })

        const canvas = document.createElement('canvas')
        canvas.className = 'pdf-page'
        canvas.id = `pdf-page-${pageNo}`
        canvas.dataset.page = String(pageNo)
        // CSS-Groesse = logische Punkte; Backing-Store = * dpr fuer scharfes Rendern.
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`
        canvas.width = Math.floor(viewport.width * dpr)
        canvas.height = Math.floor(viewport.height * dpr)

        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        container.appendChild(canvas)

        await page.render({
          canvasContext: ctx,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined
        }).promise
      }

      if (!cancelled) setStatus(`Bereit · ${pdf.numPages} Seite(n)`)
    }

    render().catch((err: unknown) => {
      if (cancelled) return
      const msg = err instanceof Error ? err.message : String(err)
      setStatus(`Fehler beim Rendern: ${msg}`)
    })

    return () => {
      cancelled = true
      loadingTask.destroy()
    }
  }, [bytes, zoom, setNumPages, setStatus])

  // Aktive Seite anhand der Scroll-Position der Sidebar-Synchronisierung melden.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const onScroll = (): void => {
      const mid = container.scrollTop + container.clientHeight / 2
      const pages = container.querySelectorAll<HTMLCanvasElement>('canvas[data-page]')
      for (const c of pages) {
        if (c.offsetTop <= mid && c.offsetTop + c.offsetHeight >= mid) {
          setCurrentPage(Number(c.dataset.page))
          break
        }
      }
    }
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [setCurrentPage])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-auto bg-canvas"
      data-testid="pdf-scroll"
    >
      {!bytes && (
        <div className="flex h-full w-full items-center justify-center text-chrome-500">
          Kein Dokument geöffnet.
        </div>
      )}
    </div>
  )
}
