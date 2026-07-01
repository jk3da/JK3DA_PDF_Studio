import { useRef, useState, type DragEvent } from 'react'
import { Icon } from '../ui/icons'
import { usePdfStore, type LeftTab } from '../../lib/state/store'
import { pageOps } from '../../lib/pdf/pageOps'
import Thumbnail from './Thumbnail'

const THUMB_W = 150

const TABS: { id: LeftTab; label: string; icon: string }[] = [
  { id: 'thumbnails', label: 'Miniaturansichten', icon: 'panel-thumbnails' },
  { id: 'bookmarks', label: 'Lesezeichen', icon: 'panel-bookmarks' },
  { id: 'outline', label: 'Gliederung', icon: 'outline-toc' }
]

export default function Sidebar(): JSX.Element {
  const doc = usePdfStore((s) => s.doc)
  const numPages = usePdfStore((s) => s.numPages)
  const currentPage = usePdfStore((s) => s.currentPage)
  const hasDoc = usePdfStore((s) => s.bytes !== null)
  const leftTab = usePdfStore((s) => s.leftTab)
  const setLeftTab = usePdfStore((s) => s.setLeftTab)
  const layoutMode = usePdfStore((s) => s.layoutMode)
  const setCurrentPage = usePdfStore((s) => s.setCurrentPage)

  const dragFrom = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const goTo = (page: number): void => {
    if (layoutMode === 'single') setCurrentPage(page)
    else document.getElementById(`pdf-page-${page}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const onDragStart = (index: number) => (e: DragEvent): void => {
    dragFrom.current = index
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDragOver = (index: number) => (e: DragEvent): void => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOver !== index) setDragOver(index)
  }
  const onDrop = (index: number) => (e: DragEvent): void => {
    e.preventDefault()
    const from = dragFrom.current
    dragFrom.current = null
    setDragOver(null)
    if (from !== null && from !== index) void pageOps.move(from, index)
  }
  const onDragEnd = (): void => {
    dragFrom.current = null
    setDragOver(null)
  }

  return (
    <aside className="flex w-[214px] shrink-0 flex-col border-r border-chrome-600 bg-chrome-800">
      <div className="flex h-[38px] items-center gap-0.5 border-b border-chrome-600 px-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setLeftTab(t.id)}
            title={t.label}
            className={`grid h-7 w-[34px] place-items-center rounded-[5px] ${leftTab === t.id ? 'bg-primary/15 text-primary' : 'text-ink-muted hover:text-ink'}`}
          >
            <Icon name={t.icon} size={17} />
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Seiten</span>
      </div>

      {leftTab === 'thumbnails' && (
        <>
          <div className="flex items-center gap-0.5 border-b border-chrome-700 px-2 py-1">
            <PageAction title="Leerseite nach aktueller" icon="insert-blank" disabled={!hasDoc} onClick={() => void pageOps.insertBlankAfter(currentPage - 1)} />
            <PageAction title="PDF anfügen" icon="merge" disabled={!hasDoc} onClick={() => void pageOps.mergeFile()} />
            <PageAction title="Aktuelle Seite extrahieren" icon="extract" disabled={!hasDoc} onClick={() => void pageOps.extract([currentPage - 1])} />
            <PageAction title="In Einzelseiten aufteilen" icon="split" disabled={!hasDoc} onClick={() => void pageOps.splitAll()} />
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {!hasDoc && <p className="px-2 py-4 text-ui text-ink-muted">Kein Dokument geöffnet.</p>}
            {doc &&
              Array.from({ length: numPages }, (_, i) => i + 1).map((page) => {
                const index = page - 1
                const active = page === currentPage
                const isOver = dragOver === index
                return (
                  <div
                    key={page}
                    draggable
                    onDragStart={onDragStart(index)}
                    onDragOver={onDragOver(index)}
                    onDrop={onDrop(index)}
                    onDragEnd={onDragEnd}
                    onClick={() => goTo(page)}
                    className={[
                      'group relative mb-3 cursor-pointer rounded border p-1 transition-colors',
                      active ? 'border-primary bg-primary/10' : 'border-transparent hover:border-chrome-600',
                      isOver ? 'ring ring-primary' : ''
                    ].join(' ')}
                  >
                    <div className="relative mx-auto w-fit overflow-hidden rounded-sm shadow">
                      <Thumbnail pdf={doc} pageNumber={page} width={THUMB_W} />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/60 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <PageBtn title="Links drehen" icon="rotate-left" onClick={() => void pageOps.rotate(index, -90)} />
                        <PageBtn title="Rechts drehen" icon="rotate-right" onClick={() => void pageOps.rotate(index, 90)} />
                        <PageBtn title="Duplizieren" icon="duplicate-page" onClick={() => void pageOps.duplicate(index)} />
                        <PageBtn title="Löschen" icon="delete-page" danger onClick={() => void pageOps.remove(index)} />
                      </div>
                    </div>
                    <div className={`mt-1 text-center text-[11px] ${active ? 'font-semibold text-ink' : 'text-ink-muted'}`}>{page}</div>
                  </div>
                )
              })}
          </div>
        </>
      )}

      {leftTab === 'bookmarks' && <Placeholder text="Keine Lesezeichen." />}
      {leftTab === 'outline' && <Placeholder text="Keine Gliederung." />}
    </aside>
  )
}

function Placeholder({ text }: { text: string }): JSX.Element {
  return <div className="flex-1 p-4 text-ui text-ink-muted">{text}</div>
}

function PageAction({ title, icon, disabled, onClick }: { title: string; icon: string; disabled?: boolean; onClick: () => void }): JSX.Element {
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick} className="grid h-6 w-6 place-items-center rounded text-ink-muted hover:bg-chrome-700 hover:text-ink disabled:opacity-30">
      <Icon name={icon} size={15} />
    </button>
  )
}

function PageBtn({ title, icon, danger, onClick }: { title: string; icon: string; danger?: boolean; onClick: () => void }): JSX.Element {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`grid h-6 w-6 place-items-center rounded text-white ${danger ? 'hover:bg-danger' : 'hover:bg-primary'}`}
    >
      <Icon name={icon} size={14} />
    </button>
  )
}
