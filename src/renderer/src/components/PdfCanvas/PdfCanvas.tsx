import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { pdfjs as pdfjsLib } from '../../lib/pdf/pdfjs'
import PdfPage from './PdfPage'
import { usePdfStore } from '../../lib/state/store'

export default function PdfCanvas(): JSX.Element {
  const bytes = usePdfStore((s) => s.bytes)
  const zoom = usePdfStore((s) => s.zoom)
  const doc = usePdfStore((s) => s.doc)
  const setDoc = usePdfStore((s) => s.setDoc)
  const setNumPages = usePdfStore((s) => s.setNumPages)
  const setStatus = usePdfStore((s) => s.setStatus)
  const setCurrentPage = usePdfStore((s) => s.setCurrentPage)
  const setPageSize = usePdfStore((s) => s.setPageSize)
  const pageSize = usePdfStore((s) => s.pageSize)
  const fitRequest = usePdfStore((s) => s.fitRequest)
  const requestFit = usePdfStore((s) => s.requestFit)
  const setZoom = usePdfStore((s) => s.setZoom)
  const layoutMode = usePdfStore((s) => s.layoutMode)
  const currentPage = usePdfStore((s) => s.currentPage)
  const tool = usePdfStore((s) => s.tool)

  const docRef = useRef<typeof doc>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pan = useRef<{ x: number; y: number; sl: number; st: number } | null>(null)

  useEffect(() => {
    if (!bytes) {
      setDoc(null)
      return
    }
    let cancelled = false
    setStatus('Lade Dokument …')
    const task = pdfjsLib.getDocument({ data: bytes.slice(0) })
    task.promise
      .then((loaded) => {
        if (cancelled) {
          void loaded.destroy()
          return
        }
        docRef.current?.destroy()
        docRef.current = loaded
        setDoc(loaded)
        setNumPages(loaded.numPages)
        setStatus(`Bereit · ${loaded.numPages} Seite(n)`)
        void loaded.getPage(1).then((p) => {
          const v = p.getViewport({ scale: 1 })
          setPageSize({ w: v.width, h: v.height })
        })
      })
      .catch((e: unknown) => {
        if (!cancelled) setStatus(`Fehler: ${e instanceof Error ? e.message : String(e)}`)
      })
    return () => {
      cancelled = true
      void task.destroy()
    }
  }, [bytes, setDoc, setNumPages, setStatus])

  useEffect(() => {
    return () => {
      docRef.current?.destroy()
      docRef.current = null
    }
  }, [])

  // Strg+Mausrad zoomt; im Einzelseiten-Modus blättert das Rad an den Seitenrändern.
  const flipAtRef = useRef(0)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent): void => {
      const s = usePdfStore.getState()
      if (e.ctrlKey) {
        e.preventDefault()
        s.setZoom(s.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1))
        return
      }
      if (s.layoutMode !== 'single') return
      const now = Date.now()
      if (now - flipAtRef.current < 350) return
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
      const atTop = el.scrollTop <= 2
      if (e.deltaY > 0 && atBottom && s.currentPage < s.numPages) {
        flipAtRef.current = now
        s.setCurrentPage(s.currentPage + 1)
        el.scrollTop = 0
      } else if (e.deltaY < 0 && atTop && s.currentPage > 1) {
        flipAtRef.current = now
        s.setCurrentPage(s.currentPage - 1)
        el.scrollTop = el.scrollHeight
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Zoom einpassen (Seitenbreite / ganze Seite).
  useEffect(() => {
    if (!fitRequest) return
    const el = containerRef.current
    if (el && pageSize) {
      const availW = el.clientWidth - 48
      const availH = el.clientHeight - 48
      const z =
        fitRequest === 'page'
          ? Math.min(availW / pageSize.w, availH / pageSize.h)
          : availW / pageSize.w
      setZoom(z)
    }
    requestFit(null)
  }, [fitRequest, pageSize, setZoom, requestFit])

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
  }, [setCurrentPage, doc])

  const pageNumbers =
    doc && layoutMode === 'single'
      ? [Math.min(Math.max(1, currentPage), doc.numPages)]
      : doc
        ? Array.from({ length: doc.numPages }, (_, i) => i + 1)
        : []

  const containerCls =
    layoutMode === 'spread'
      ? 'flex flex-row flex-wrap content-start justify-center gap-3'
      : 'flex flex-col items-center'

  // Hand-Werkzeug oder mittlere Maustaste: Ziehen scrollt den Canvas (Panning).
  const onPanDown = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const middle = e.button === 1
    if (!middle && (tool !== 'hand' || e.button !== 0)) return
    const el = containerRef.current
    if (!el) return
    if (middle) e.preventDefault()
    pan.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop }
    el.setPointerCapture(e.pointerId)
  }
  const onPanMove = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const p = pan.current
    const el = containerRef.current
    if (!p || !el) return
    el.scrollLeft = p.sl - (e.clientX - p.x)
    el.scrollTop = p.st - (e.clientY - p.y)
  }
  const onPanUp = (e: ReactPointerEvent<HTMLDivElement>): void => {
    pan.current = null
    containerRef.current?.releasePointerCapture(e.pointerId)
  }

  return (
    <div
      ref={containerRef}
      className={`h-full w-full overflow-auto bg-canvas py-2 ${containerCls}`}
      style={tool === 'hand' ? { cursor: pan.current ? 'grabbing' : 'grab' } : undefined}
      onPointerDown={onPanDown}
      onPointerMove={onPanMove}
      onPointerUp={onPanUp}
      data-testid="pdf-scroll"
    >
      {doc && pageNumbers.map((n) => <PdfPage key={`p${n}-of${doc.numPages}`} pdf={doc} pageNumber={n} zoom={zoom} />)}
    </div>
  )
}
