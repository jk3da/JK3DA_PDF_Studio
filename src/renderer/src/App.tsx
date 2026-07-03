import { useCallback, useEffect, useRef } from 'react'
import { Icon } from './components/ui/icons'
import TitleBar from './components/shell/TitleBar'
import TopToolbar from './components/shell/TopToolbar'
import FormatBar from './components/shell/FormatBar'
import ToolRail from './components/shell/ToolRail'
import Sidebar from './components/Sidebar/Sidebar'
import PdfCanvas from './components/PdfCanvas/PdfCanvas'
import PropertiesPanel from './components/shell/PropertiesPanel'
import StatusBar from './components/StatusBar/StatusBar'
import { usePdfStore, type ToolId } from './lib/state/store'
import { moveAnnotation } from './lib/annotations/types'
import { createWelcomePdf } from './lib/pdf/sample'
import { saveCurrentDocument } from './lib/pdf/save'
import { applyRedactionToDoc } from './lib/pdf/redactApply'
import { applyCropToDoc } from './lib/pdf/crop'
import SignatureModal from './components/modals/SignatureModal'
import FormsModal from './components/modals/FormsModal'
import SecurityModal from './components/modals/SecurityModal'

// Werkzeug-Schnelltasten (Acrobat-Stil, an deutsche Labels angelehnt).
const TOOL_KEYS: Record<string, ToolId> = {
  v: 'select',
  h: 'hand',
  t: 'text',
  n: 'note',
  f: 'draw',
  m: 'highlight',
  l: 'line',
  p: 'arrow',
  r: 'rectangle',
  e: 'ellipse',
  s: 'stamp',
  x: 'redact'
}

/** Seiten-Navigation, layout-bewusst (Einzelseite blättert, sonst Scroll-Sprung). */
function goPage(n: number): void {
  const st = usePdfStore.getState()
  if (!st.bytes) return
  const c = Math.min(Math.max(1, n), st.numPages || 1)
  if (st.layoutMode === 'single') st.setCurrentPage(c)
  else document.getElementById(`pdf-page-${c}`)?.scrollIntoView({ block: 'start' })
}
import AboutModal from './components/modals/AboutModal'
import ShortcutsModal from './components/modals/ShortcutsModal'
import WatermarkModal from './components/modals/WatermarkModal'
import HeaderFooterModal from './components/modals/HeaderFooterModal'
import PlacementGhost from './components/shell/PlacementGhost'

export default function App(): JSX.Element {
  const setDocument = usePdfStore((s) => s.setDocument)
  const setStatus = usePdfStore((s) => s.setStatus)
  const hasDoc = usePdfStore((s) => s.bytes !== null)
  const modal = usePdfStore((s) => s.modal)
  const pending = usePdfStore((s) => s.pending)
  const tool = usePdfStore((s) => s.tool)
  const selectedId = usePdfStore((s) => s.selectedId)
  const currentPage = usePdfStore((s) => s.currentPage)
  const numPages = usePdfStore((s) => s.numPages)
  const hasRedactMarks = usePdfStore((s) => s.annotations.some((a) => a.type === 'redact'))
  const hasCropMarks = usePdfStore((s) => s.annotations.some((a) => a.type === 'crop'))

  const handleOpen = useCallback(async () => {
    setStatus('Öffne Datei …')
    const result = await window.jk3da.openPdf()
    if (result) setDocument(result.bytes, result.name, result.path)
    else setStatus('Bereit')
  }, [setDocument, setStatus])

  useEffect(() => {
    let cancelled = false
    createWelcomePdf()
      .then((bytes) => {
        if (!cancelled) setDocument(bytes, 'Willkommen.pdf')
      })
      .catch(() => {
        if (!cancelled) setStatus('Konnte Willkommens-PDF nicht erzeugen.')
      })
    return () => {
      cancelled = true
    }
  }, [setDocument, setStatus])

  // Globale Tastenkürzel (Industrie-Standard: Acrobat-/Browser-Konventionen).
  const prevToolRef = useRef<ToolId | null>(null)
  const nudgeAtRef = useRef(0)
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const ctrl = e.ctrlKey || e.metaKey
      const el = document.activeElement
      const typing =
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLInputElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      const store = usePdfStore.getState()
      const hasDocNow = store.bytes !== null
      const k = e.key.toLowerCase()

      // Datei / Bearbeiten
      if (ctrl && k === 'o') { e.preventDefault(); void handleOpen(); return }
      if (ctrl && k === 's') { e.preventDefault(); void saveCurrentDocument(); return }
      if (ctrl && k === 'p') { e.preventDefault(); if (hasDocNow) window.print(); return }
      if (ctrl && k === 'w') {
        e.preventDefault()
        if (hasDocNow && (!store.dirty || window.confirm('Ungespeicherte Änderungen verwerfen und Dokument schließen?'))) {
          store.closeDocument()
        }
        return
      }
      if (ctrl && k === 'f') {
        e.preventDefault()
        const inp = document.getElementById('doc-search') as HTMLInputElement | null
        inp?.focus()
        inp?.select()
        return
      }
      if (ctrl && k === 'z' && !e.shiftKey) { if (!typing) { e.preventDefault(); store.undo() } return }
      if (ctrl && (k === 'y' || (k === 'z' && e.shiftKey))) { if (!typing) { e.preventDefault(); store.redo() } return }

      // Zoom (Acrobat: Strg+0 ganze Seite, Strg+1 Originalgröße, Strg+2 Seitenbreite)
      if (ctrl && (e.key === '+' || e.key === '=')) { e.preventDefault(); store.zoomIn(); return }
      if (ctrl && e.key === '-') { e.preventDefault(); store.zoomOut(); return }
      if (ctrl && e.key === '0') { e.preventDefault(); store.requestFit('page'); return }
      if (ctrl && e.key === '1') { e.preventDefault(); store.resetZoom(); return }
      if (ctrl && e.key === '2') { e.preventDefault(); store.requestFit('width'); return }
      if (e.key === 'F11') { e.preventDefault(); void window.jk3da.toggleFullscreen(); return }

      // In Eingabefeldern: nur Esc entfokussiert, Rest normal tippen lassen.
      if (typing) {
        if (e.key === 'Escape' && el instanceof HTMLElement) el.blur()
        return
      }

      // Seiten-Navigation
      if (e.key === 'PageDown') { e.preventDefault(); goPage(store.currentPage + 1); return }
      if (e.key === 'PageUp') { e.preventDefault(); goPage(store.currentPage - 1); return }
      if (e.key === 'Home' && hasDocNow) { e.preventDefault(); goPage(1); return }
      if (e.key === 'End' && hasDocNow) { e.preventDefault(); goPage(store.numPages); return }

      if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedId) {
        e.preventDefault()
        store.removeAnnotation(store.selectedId)
        return
      }

      if (e.key === 'Escape') {
        if (store.modal) store.setModal(null)
        else if (store.pending) store.setPending(null)
        else {
          store.selectAnnotation(null)
          store.setTool('select')
        }
        return
      }

      // Auswahl mit Pfeiltasten verschieben (Shift = 10 pt)
      if (store.selectedId && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        const a = store.annotations.find((x) => x.id === store.selectedId)
        if (a) {
          const step = e.shiftKey ? 10 : 1
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
          const now = Date.now()
          if (now - nudgeAtRef.current > 800) store.beginHistory()
          nudgeAtRef.current = now
          store.updateAnnotation(a.id, moveAnnotation(a, dx, dy))
        }
        return
      }

      // Leertaste halten = temporäres Hand-Werkzeug (Acrobat-Standard)
      if (e.key === ' ' && !e.repeat && !store.modal && prevToolRef.current === null) {
        e.preventDefault()
        prevToolRef.current = store.tool
        store.setTool('hand')
        return
      }

      // Werkzeug-Schnelltasten (V/H/T/N/F/M/L/P/R/E/S/X)
      if (!ctrl && !e.altKey && hasDocNow && !store.modal && !store.pending) {
        const t = TOOL_KEYS[k]
        if (t) store.setTool(t)
      }
    }

    const onKeyUp = (e: KeyboardEvent): void => {
      if (e.key === ' ' && prevToolRef.current !== null) {
        usePdfStore.getState().setTool(prevToolRef.current)
        prevToolRef.current = null
      }
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [handleOpen])

  const showFormatBar = (tool !== 'select' && tool !== 'hand') || selectedId !== null

  return (
    <div className="flex h-full w-full flex-col bg-chrome-900 font-sans text-ink">
      <TitleBar onOpen={handleOpen} />
      <TopToolbar onOpen={handleOpen} />
      {showFormatBar && <FormatBar />}

      <div className="flex min-h-0 flex-1">
        <ToolRail />
        <Sidebar />
        <main className="relative min-w-0 flex-1 bg-canvas">
          {hasDoc ? (
            <PdfCanvas />
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <div className="flex flex-col items-center gap-2 rounded-panel border-2 border-dashed border-chrome-500 p-10 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-chrome-700 text-ink-muted"><Icon name="open" size={26} /></span>
                <p className="text-ui-lg font-semibold text-ink">Kein Dokument geöffnet</p>
                <p className="max-w-[36ch] text-ui text-ink-muted">Öffne eine PDF-Datei, um zu beginnen.</p>
                <button type="button" onClick={handleOpen} className="mt-1.5 inline-flex h-9 items-center gap-2 rounded-control bg-primary px-3.5 text-ui font-semibold text-white hover:bg-primary-hover">
                  <Icon name="open" size={16} /> Datei öffnen
                </button>
              </div>
            </div>
          )}

          {pending && (
            <div className="pointer-events-none absolute inset-x-0 top-3 z-40 flex justify-center">
              <span className="rounded-full bg-primary px-3 py-1 text-ui-sm font-medium text-white shadow-lg">
                Auf die Seite klicken zum Platzieren · Esc bricht ab
              </span>
            </div>
          )}

          {!pending && (hasRedactMarks || hasCropMarks) && (
            <div className="absolute inset-x-0 top-3 z-40 flex justify-center gap-2">
              {hasRedactMarks && (
                <button type="button" onClick={() => void applyRedactionToDoc()} className="flex items-center gap-1.5 rounded-full bg-danger px-3 py-1 text-ui-sm font-semibold text-white shadow-lg hover:brightness-110">
                  <Icon name="apply-redaction" size={15} /> Schwärzen anwenden
                </button>
              )}
              {hasCropMarks && (
                <button type="button" onClick={() => void applyCropToDoc()} className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-ui-sm font-semibold text-white shadow-lg hover:bg-primary-hover">
                  <Icon name="crop" size={15} /> Zuschneiden anwenden
                </button>
              )}
            </div>
          )}

          {hasDoc && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-panel border border-chrome-600 bg-chrome-900/90 px-3 py-1.5 text-ui-sm text-[#c8ccd2] backdrop-blur">
              <Icon name="hand-pan" size={15} /> Seite {currentPage} von {numPages}
            </div>
          )}
        </main>
        <PropertiesPanel />
      </div>

      <StatusBar />

      <PlacementGhost />

      {modal === 'signature' && <SignatureModal />}
      {modal === 'forms' && <FormsModal />}
      {modal === 'security' && <SecurityModal />}
      {modal === 'about' && <AboutModal />}
      {modal === 'shortcuts' && <ShortcutsModal />}
      {modal === 'watermark' && <WatermarkModal />}
      {modal === 'headerFooter' && <HeaderFooterModal />}
    </div>
  )
}
