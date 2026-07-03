import { useCallback, useEffect } from 'react'
import { Icon } from './components/ui/icons'
import TitleBar from './components/shell/TitleBar'
import TopToolbar from './components/shell/TopToolbar'
import FormatBar from './components/shell/FormatBar'
import ToolRail from './components/shell/ToolRail'
import Sidebar from './components/Sidebar/Sidebar'
import PdfCanvas from './components/PdfCanvas/PdfCanvas'
import PropertiesPanel from './components/shell/PropertiesPanel'
import StatusBar from './components/StatusBar/StatusBar'
import { usePdfStore } from './lib/state/store'
import { createWelcomePdf } from './lib/pdf/sample'
import { saveCurrentDocument } from './lib/pdf/save'
import { applyRedactionToDoc } from './lib/pdf/redactApply'
import { applyCropToDoc } from './lib/pdf/crop'
import SignatureModal from './components/modals/SignatureModal'
import FormsModal from './components/modals/FormsModal'
import SecurityModal from './components/modals/SecurityModal'
import AboutModal from './components/modals/AboutModal'
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const ctrl = e.ctrlKey || e.metaKey
      const el = document.activeElement
      const typing = el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement
      const store = usePdfStore.getState()

      if (ctrl && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        void handleOpen()
      } else if (ctrl && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void saveCurrentDocument()
      } else if (ctrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!typing) {
          e.preventDefault()
          store.undo()
        }
      } else if (ctrl && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        if (!typing) {
          e.preventDefault()
          store.redo()
        }
      } else if (ctrl && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        store.zoomIn()
      } else if (ctrl && e.key === '-') {
        e.preventDefault()
        store.zoomOut()
      } else if (ctrl && e.key === '0') {
        e.preventDefault()
        store.resetZoom()
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !typing && store.selectedId) {
        e.preventDefault()
        store.removeAnnotation(store.selectedId)
      } else if (e.key === 'Escape') {
        if (store.modal) store.setModal(null)
        else if (store.pending) store.setPending(null)
        else store.selectAnnotation(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
      {modal === 'watermark' && <WatermarkModal />}
      {modal === 'headerFooter' && <HeaderFooterModal />}
    </div>
  )
}
