import {
  FolderOpen,
  Save,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  MousePointer2,
  Type,
  Pencil,
  Highlighter,
  Square,
  StickyNote,
  PenLine,
  Stamp,
  FormInput,
  RectangleHorizontal,
  Lock,
  ShieldCheck,
  type LucideIcon
} from 'lucide-react'
import { usePdfStore, type ToolId } from '../../lib/state/store'
import { saveCurrentDocument } from '../../lib/pdf/save'
import { applyRedactionToDoc } from '../../lib/pdf/redactApply'

interface ToolDef {
  id: ToolId
  label: string
  icon: LucideIcon
}

const TOOLS: ToolDef[] = [
  { id: 'select', label: 'Auswählen', icon: MousePointer2 },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'draw', label: 'Freihand', icon: Pencil },
  { id: 'highlight', label: 'Markieren', icon: Highlighter },
  { id: 'rectangle', label: 'Rechteck', icon: Square },
  { id: 'redact', label: 'Schwärzen (markieren)', icon: RectangleHorizontal },
  { id: 'note', label: 'Notiz', icon: StickyNote },
  { id: 'stamp', label: 'Stempel', icon: Stamp }
]

const SWATCHES = ['#e11d2a', '#1d6fe1', '#15a34a', '#f59e0b', '#0a0a0a']

export default function Toolbar({ onOpen }: { onOpen: () => void }): JSX.Element {
  const tool = usePdfStore((s) => s.tool)
  const setTool = usePdfStore((s) => s.setTool)
  const zoom = usePdfStore((s) => s.zoom)
  const zoomIn = usePdfStore((s) => s.zoomIn)
  const zoomOut = usePdfStore((s) => s.zoomOut)
  const resetZoom = usePdfStore((s) => s.resetZoom)
  const hasDoc = usePdfStore((s) => s.bytes !== null)
  const currentColor = usePdfStore((s) => s.currentColor)
  const setCurrentColor = usePdfStore((s) => s.setCurrentColor)
  const undo = usePdfStore((s) => s.undo)
  const redo = usePdfStore((s) => s.redo)
  const canUndo = usePdfStore((s) => s.past.length > 0)
  const canRedo = usePdfStore((s) => s.future.length > 0)
  const dirty = usePdfStore((s) => s.dirty)
  const setModal = usePdfStore((s) => s.setModal)
  const hasRedactMarks = usePdfStore((s) => s.annotations.some((a) => a.type === 'redact'))

  return (
    <div className="flex h-12 shrink-0 items-center gap-1 border-b border-chrome-700 bg-chrome-800 px-2 text-chrome-100">
      <button
        type="button"
        onClick={onOpen}
        className="flex h-9 items-center gap-2 rounded px-3 text-sm text-gray-200 hover:bg-chrome-700"
        title="PDF öffnen (Ctrl+O)"
      >
        <FolderOpen size={18} />
        <span>Öffnen</span>
      </button>

      <button
        type="button"
        onClick={() => void saveCurrentDocument()}
        disabled={!hasDoc}
        className="flex h-9 items-center gap-2 rounded px-3 text-sm text-gray-200 hover:bg-chrome-700 disabled:cursor-not-allowed disabled:opacity-40"
        title="Speichern unter … (Ctrl+S)"
      >
        <Save size={18} />
        <span>Speichern{dirty ? ' *' : ''}</span>
      </button>

      <div className="mx-1 h-6 w-px bg-chrome-600" />

      <button
        type="button"
        onClick={undo}
        disabled={!canUndo}
        title="Rückgängig (Ctrl+Z)"
        className="flex h-9 w-9 items-center justify-center rounded text-gray-200 hover:bg-chrome-700 disabled:opacity-40"
      >
        <Undo2 size={18} />
      </button>
      <button
        type="button"
        onClick={redo}
        disabled={!canRedo}
        title="Wiederholen (Ctrl+Y)"
        className="flex h-9 w-9 items-center justify-center rounded text-gray-200 hover:bg-chrome-700 disabled:opacity-40"
      >
        <Redo2 size={18} />
      </button>

      <div className="mx-1 h-6 w-px bg-chrome-600" />

      <div className="flex items-center gap-0.5">
        {TOOLS.map(({ id, label, icon: Icon }) => {
          const active = tool === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTool(id)}
              disabled={!hasDoc}
              title={label}
              aria-pressed={active}
              className={[
                'flex h-9 w-9 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                active ? 'bg-accent text-white' : 'text-gray-200 hover:bg-chrome-700'
              ].join(' ')}
            >
              <Icon size={18} />
            </button>
          )
        })}
      </div>

      <div className="mx-1 h-6 w-px bg-chrome-600" />

      <button
        type="button"
        onClick={() => setModal('signature')}
        disabled={!hasDoc}
        title="Unterschrift"
        className="flex h-9 w-9 items-center justify-center rounded text-gray-200 hover:bg-chrome-700 disabled:opacity-40"
      >
        <PenLine size={18} />
      </button>
      <button
        type="button"
        onClick={() => setModal('forms')}
        disabled={!hasDoc}
        title="Formular ausfüllen"
        className="flex h-9 w-9 items-center justify-center rounded text-gray-200 hover:bg-chrome-700 disabled:opacity-40"
      >
        <FormInput size={18} />
      </button>
      <button
        type="button"
        onClick={() => setModal('security')}
        disabled={!hasDoc}
        title="Sicherheit & Metadaten"
        className="flex h-9 w-9 items-center justify-center rounded text-gray-200 hover:bg-chrome-700 disabled:opacity-40"
      >
        <Lock size={18} />
      </button>
      {hasRedactMarks && (
        <button
          type="button"
          onClick={() => void applyRedactionToDoc()}
          title="Markierte Schwärzungen dauerhaft anwenden"
          className="flex h-9 items-center gap-1.5 rounded bg-red-700 px-2.5 text-sm text-white hover:bg-red-600"
        >
          <ShieldCheck size={16} /> Schwärzen
        </button>
      )}

      <div className="mx-1 h-6 w-px bg-chrome-600" />

      <div className="flex items-center gap-1">
        {SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCurrentColor(c)}
            disabled={!hasDoc}
            title={`Farbe ${c}`}
            className={[
              'h-5 w-5 rounded-full border disabled:opacity-40',
              currentColor === c ? 'border-white ring-2 ring-accent' : 'border-chrome-600'
            ].join(' ')}
            style={{ background: c }}
          />
        ))}
      </div>

      <div className="ml-auto flex items-center gap-0.5">
        <button
          type="button"
          onClick={zoomOut}
          disabled={!hasDoc}
          title="Verkleinern"
          className="flex h-9 w-9 items-center justify-center rounded text-gray-200 hover:bg-chrome-700 disabled:opacity-40"
        >
          <ZoomOut size={18} />
        </button>
        <button
          type="button"
          onClick={resetZoom}
          disabled={!hasDoc}
          title="Zoom zurücksetzen"
          className="h-9 min-w-[56px] rounded px-2 text-sm tabular-nums text-gray-200 hover:bg-chrome-700 disabled:opacity-40"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={zoomIn}
          disabled={!hasDoc}
          title="Vergrößern"
          className="flex h-9 w-9 items-center justify-center rounded text-gray-200 hover:bg-chrome-700 disabled:opacity-40"
        >
          <ZoomIn size={18} />
        </button>
      </div>
    </div>
  )
}
