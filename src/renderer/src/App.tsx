import { useCallback, useEffect } from 'react'
import Toolbar from './components/Toolbar/Toolbar'
import Sidebar from './components/Sidebar/Sidebar'
import PdfCanvas from './components/PdfCanvas/PdfCanvas'
import StatusBar from './components/StatusBar/StatusBar'
import { usePdfStore } from './lib/state/store'
import { createWelcomePdf } from './lib/pdf/sample'
import { saveCurrentDocument } from './lib/pdf/save'
import SignatureModal from './components/modals/SignatureModal'
import FormsModal from './components/modals/FormsModal'

export default function App(): JSX.Element {
  const setDocument = usePdfStore((s) => s.setDocument)
  const setStatus = usePdfStore((s) => s.setStatus)
  const hasDoc = usePdfStore((s) => s.bytes !== null)
  const modal = usePdfStore((s) => s.modal)
  const pending = usePdfStore((s) => s.pending)

  const handleOpen = useCallback(async () => {
    setStatus('Öffne Datei …')
    const result = await window.jk3da.openPdf()
    if (result) {
      setDocument(result.bytes, result.name, result.path)
    } else {
      setStatus('Bereit')
    }
  }, [setDocument, setStatus])

  // Sofort sichtbarer Render-Test: Willkommens-PDF beim Start laden.
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

  // Globale Tastenkürzel.
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

  return (
    <div className="relative flex h-full w-full flex-col bg-chrome-900 font-sans text-gray-100">
      <Toolbar onOpen={handleOpen} />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1">
          {hasDoc ? (
            <PdfCanvas />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-canvas text-chrome-500">
              <p>Kein Dokument geöffnet.</p>
              <button
                type="button"
                onClick={handleOpen}
                className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                PDF öffnen
              </button>
            </div>
          )}
        </main>
      </div>
      <StatusBar />

      {pending && (
        <div className="pointer-events-none absolute inset-x-0 top-14 z-40 flex justify-center">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-white shadow-lg">
            Auf die Seite klicken zum Platzieren · Esc bricht ab
          </span>
        </div>
      )}

      {modal === 'signature' && <SignatureModal />}
      {modal === 'forms' && <FormsModal />}
    </div>
  )
}
