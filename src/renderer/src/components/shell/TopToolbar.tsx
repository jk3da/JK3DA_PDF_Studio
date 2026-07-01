import { useEffect, useState } from 'react'
import { Icon } from '../ui/icons'
import { usePdfStore, type LayoutMode } from '../../lib/state/store'
import { saveCurrentDocument } from '../../lib/pdf/save'

const iconBtn =
  'grid h-9 w-9 place-items-center rounded-control text-ink transition-colors hover:bg-chrome-600 disabled:cursor-not-allowed disabled:text-ink-muted disabled:hover:bg-transparent'

const LAYOUTS: { id: LayoutMode; label: string; icon: string }[] = [
  { id: 'single', label: 'Einzelseite', icon: 'layout-single' },
  { id: 'continuous', label: 'Fortlaufend', icon: 'layout-continuous' },
  { id: 'spread', label: 'Doppelseite', icon: 'layout-spread' }
]

function goToPage(n: number): void {
  document.getElementById(`pdf-page-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function TopToolbar({ onOpen }: { onOpen: () => void }): JSX.Element {
  const hasDoc = usePdfStore((s) => s.bytes !== null)
  const zoom = usePdfStore((s) => s.zoom)
  const zoomIn = usePdfStore((s) => s.zoomIn)
  const zoomOut = usePdfStore((s) => s.zoomOut)
  const resetZoom = usePdfStore((s) => s.resetZoom)
  const requestFit = usePdfStore((s) => s.requestFit)
  const undo = usePdfStore((s) => s.undo)
  const redo = usePdfStore((s) => s.redo)
  const canUndo = usePdfStore((s) => s.past.length > 0)
  const canRedo = usePdfStore((s) => s.future.length > 0)
  const currentPage = usePdfStore((s) => s.currentPage)
  const numPages = usePdfStore((s) => s.numPages)
  const layoutMode = usePdfStore((s) => s.layoutMode)
  const setLayoutMode = usePdfStore((s) => s.setLayoutMode)
  const searchQuery = usePdfStore((s) => s.searchQuery)
  const setSearchQuery = usePdfStore((s) => s.setSearchQuery)

  const [pageInput, setPageInput] = useState(String(currentPage))
  useEffect(() => setPageInput(String(currentPage)), [currentPage])

  const jump = (): void => {
    const n = Math.min(Math.max(1, Number(pageInput) || 1), numPages || 1)
    goToPage(n)
  }

  return (
    <div className="flex h-toolbar shrink-0 items-center gap-0.5 border-b border-chrome-900 bg-chrome-800 px-2 text-ink shadow-toolbar">
      <button type="button" onClick={onOpen} title="PDF öffnen  Strg+O" className={iconBtn}>
        <Icon name="open" />
      </button>
      <button type="button" onClick={() => void saveCurrentDocument()} disabled={!hasDoc} title="Speichern unter  Strg+S" className={iconBtn}>
        <Icon name="save" />
      </button>
      <button type="button" onClick={() => window.print()} disabled={!hasDoc} title="Drucken" className={iconBtn}>
        <Icon name="print" />
      </button>

      <Divider />

      <button type="button" onClick={undo} disabled={!canUndo} title="Rückgängig  Strg+Z" className={iconBtn}>
        <Icon name="undo" />
      </button>
      <button type="button" onClick={redo} disabled={!canRedo} title="Wiederherstellen  Strg+Y" className={iconBtn}>
        <Icon name="redo" />
      </button>

      <Divider />

      <div className="relative w-[220px]">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted">
          <Icon name="search" size={16} />
        </span>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Im Dokument suchen…"
          disabled={!hasDoc}
          className="h-9 w-full rounded-control border border-chrome-600 bg-chrome-700 pl-[30px] pr-2.5 text-ui text-ink outline-none placeholder:text-ink-muted focus:border-primary disabled:opacity-50"
        />
      </div>

      <Divider />

      <button type="button" onClick={zoomOut} disabled={!hasDoc} title="Verkleinern" className={iconBtn}>
        <Icon name="zoom-out" />
      </button>
      <button
        type="button"
        onClick={resetZoom}
        disabled={!hasDoc}
        title="Zoom zurücksetzen"
        className="flex h-8 min-w-[64px] items-center justify-between rounded-control border border-chrome-600 bg-chrome-700 px-2.5 text-ui tabular-nums text-ink disabled:opacity-50"
      >
        {Math.round(zoom * 100)}%<Icon name="field-dropdown" size={14} />
      </button>
      <button type="button" onClick={zoomIn} disabled={!hasDoc} title="Vergrößern" className={iconBtn}>
        <Icon name="zoom-in" />
      </button>
      <button type="button" onClick={() => requestFit('width')} disabled={!hasDoc} title="Seitenbreite" className={iconBtn}>
        <Icon name="fit-width" />
      </button>
      <button type="button" onClick={() => requestFit('page')} disabled={!hasDoc} title="Ganze Seite" className={iconBtn}>
        <Icon name="fit-page" />
      </button>

      <Divider />

      <button type="button" onClick={() => goToPage(Math.max(1, currentPage - 1))} disabled={!hasDoc} title="Vorherige Seite" className={iconBtn}>
        <Icon name="prev-page" />
      </button>
      <div className="flex items-center gap-1.5 text-ui text-[#c8ccd2]">
        <input
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && jump()}
          onBlur={jump}
          disabled={!hasDoc}
          className="h-8 w-[38px] rounded-control border border-chrome-600 bg-chrome-700 text-center text-ink outline-none focus:border-primary disabled:opacity-50"
        />
        / {numPages || 0}
      </div>
      <button type="button" onClick={() => goToPage(Math.min(numPages, currentPage + 1))} disabled={!hasDoc} title="Nächste Seite" className={iconBtn}>
        <Icon name="next-page" />
      </button>

      <div className="flex-1" />

      <div className="mr-1.5 inline-flex gap-0.5 rounded-control border border-chrome-600 bg-chrome-700 p-0.5">
        {LAYOUTS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLayoutMode(l.id)}
            title={l.label}
            className={`grid h-7 w-[30px] place-items-center rounded-[4px] ${layoutMode === l.id ? 'bg-chrome-500 text-ink' : 'text-ink-muted hover:text-ink'}`}
          >
            <Icon name={l.icon} size={16} />
          </button>
        ))}
      </div>
      <button type="button" onClick={() => void window.jk3da.toggleFullscreen()} title="Vollbild" className={iconBtn}>
        <Icon name="fullscreen" />
      </button>

      <Divider />

      <button
        type="button"
        onClick={() => void saveCurrentDocument()}
        disabled={!hasDoc}
        className="inline-flex h-9 items-center gap-2 rounded-control bg-primary px-3.5 text-ui font-semibold text-white hover:bg-primary-hover disabled:opacity-40"
      >
        <Icon name="export-word" size={16} /> Exportieren
      </button>
    </div>
  )
}

function Divider(): JSX.Element {
  return <div className="mx-1.5 h-6 w-px bg-chrome-600" />
}
