import { useRef, useState, type DragEvent, type ReactNode } from 'react'
import {
  RotateCcw,
  RotateCw,
  Copy,
  Trash2,
  FilePlus2,
  GitMerge,
  Scissors,
  FileOutput
} from 'lucide-react'
import { usePdfStore } from '../../lib/state/store'
import { pageOps } from '../../lib/pdf/pageOps'
import Thumbnail from './Thumbnail'

const THUMB_W = 150

export default function Sidebar(): JSX.Element {
  const doc = usePdfStore((s) => s.doc)
  const numPages = usePdfStore((s) => s.numPages)
  const currentPage = usePdfStore((s) => s.currentPage)
  const hasDoc = usePdfStore((s) => s.bytes !== null)

  const dragFrom = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const goTo = (page: number): void => {
    document.getElementById(`pdf-page-${page}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    <aside className="flex w-[200px] shrink-0 flex-col border-r border-chrome-700 bg-chrome-800">
      <div className="flex h-9 shrink-0 items-center justify-between px-3 text-xs font-semibold uppercase tracking-wide text-chrome-500">
        <span>Seiten</span>
        <div className="flex items-center gap-0.5">
          <HeaderBtn title="Leerseite nach aktueller" disabled={!hasDoc} onClick={() => void pageOps.insertBlankAfter(currentPage - 1)}>
            <FilePlus2 size={15} />
          </HeaderBtn>
          <HeaderBtn title="PDF anfügen (zusammenführen)" disabled={!hasDoc} onClick={() => void pageOps.mergeFile()}>
            <GitMerge size={15} />
          </HeaderBtn>
          <HeaderBtn title="Aktuelle Seite extrahieren" disabled={!hasDoc} onClick={() => void pageOps.extract([currentPage - 1])}>
            <FileOutput size={15} />
          </HeaderBtn>
          <HeaderBtn title="In Einzelseiten aufteilen" disabled={!hasDoc} onClick={() => void pageOps.splitAll()}>
            <Scissors size={15} />
          </HeaderBtn>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {!hasDoc && <p className="px-2 py-4 text-sm text-chrome-500">Kein Dokument geöffnet.</p>}

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
                  active ? 'border-accent bg-accent/10' : 'border-transparent hover:border-chrome-600',
                  isOver ? 'ring-2 ring-accent' : ''
                ].join(' ')}
              >
                <div className="relative mx-auto w-fit overflow-hidden rounded-sm shadow">
                  <Thumbnail pdf={doc} pageNumber={page} width={THUMB_W} />

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/60 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <PageBtn title="Links drehen" onClick={() => void pageOps.rotate(index, -90)}>
                      <RotateCcw size={14} />
                    </PageBtn>
                    <PageBtn title="Rechts drehen" onClick={() => void pageOps.rotate(index, 90)}>
                      <RotateCw size={14} />
                    </PageBtn>
                    <PageBtn title="Duplizieren" onClick={() => void pageOps.duplicate(index)}>
                      <Copy size={14} />
                    </PageBtn>
                    <PageBtn title="Löschen" danger onClick={() => void pageOps.remove(index)}>
                      <Trash2 size={14} />
                    </PageBtn>
                  </div>
                </div>

                <div className="mt-1 text-center text-xs text-chrome-500">{page}</div>
              </div>
            )
          })}
      </div>
    </aside>
  )
}

function HeaderBtn({
  title,
  disabled,
  onClick,
  children
}: {
  title: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}): JSX.Element {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded text-gray-300 hover:bg-chrome-700 disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function PageBtn({
  title,
  danger,
  onClick,
  children
}: {
  title: string
  danger?: boolean
  onClick: () => void
  children: ReactNode
}): JSX.Element {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={[
        'flex h-6 w-6 items-center justify-center rounded text-white',
        danger ? 'hover:bg-red-600' : 'hover:bg-accent'
      ].join(' ')}
    >
      {children}
    </button>
  )
}
