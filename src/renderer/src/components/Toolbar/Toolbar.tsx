import {
  FolderOpen,
  Save,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  Type,
  Highlighter,
  Square,
  StickyNote,
  PenLine,
  Stamp,
  type LucideIcon
} from 'lucide-react'
import { usePdfStore, type ToolId } from '../../lib/state/store'

interface ToolDef {
  id: ToolId
  label: string
  icon: LucideIcon
}

const TOOLS: ToolDef[] = [
  { id: 'select', label: 'Auswählen', icon: MousePointer2 },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'highlight', label: 'Markieren', icon: Highlighter },
  { id: 'rectangle', label: 'Rechteck', icon: Square },
  { id: 'note', label: 'Notiz', icon: StickyNote },
  { id: 'signature', label: 'Unterschrift', icon: PenLine },
  { id: 'stamp', label: 'Stempel', icon: Stamp }
]

interface ToolbarProps {
  onOpen: () => void
}

export default function Toolbar({ onOpen }: ToolbarProps): JSX.Element {
  const tool = usePdfStore((s) => s.tool)
  const setTool = usePdfStore((s) => s.setTool)
  const zoom = usePdfStore((s) => s.zoom)
  const zoomIn = usePdfStore((s) => s.zoomIn)
  const zoomOut = usePdfStore((s) => s.zoomOut)
  const resetZoom = usePdfStore((s) => s.resetZoom)
  const hasDoc = usePdfStore((s) => s.bytes !== null)

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
        disabled={!hasDoc}
        className="flex h-9 items-center gap-2 rounded px-3 text-sm text-gray-200 hover:bg-chrome-700 disabled:cursor-not-allowed disabled:opacity-40"
        title="Speichern unter … (Phase 1)"
      >
        <Save size={18} />
        <span>Speichern</span>
      </button>

      <div className="mx-2 h-6 w-px bg-chrome-600" />

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
