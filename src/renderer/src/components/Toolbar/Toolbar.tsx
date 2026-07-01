import { Icon } from '../ui/icons'
import { usePdfStore, type ToolId } from '../../lib/state/store'
import { saveCurrentDocument } from '../../lib/pdf/save'
import { applyRedactionToDoc } from '../../lib/pdf/redactApply'

interface ToolDef {
  id: ToolId
  label: string
  icon: string
}

const TOOLS: ToolDef[] = [
  { id: 'select', label: 'Auswählen', icon: 'select' },
  { id: 'text', label: 'Text', icon: 'text' },
  { id: 'draw', label: 'Freihand', icon: 'freehand' },
  { id: 'highlight', label: 'Markieren', icon: 'highlight' },
  { id: 'rectangle', label: 'Rechteck', icon: 'rectangle' },
  { id: 'redact', label: 'Schwärzen (markieren)', icon: 'redaction' },
  { id: 'note', label: 'Notiz', icon: 'note' },
  { id: 'stamp', label: 'Stempel', icon: 'stamp' }
]

const SWATCHES = ['#e11d2a', '#1d6fe1', '#15a34a', '#f59e0b', '#0a0a0a']

const iconBtn =
  'grid h-control w-control place-items-center rounded-control text-ink transition-colors hover:bg-chrome-600 disabled:cursor-not-allowed disabled:text-ink-muted disabled:hover:bg-transparent'

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
    <div className="flex h-toolbar shrink-0 items-center gap-1 border-b border-chrome-700 bg-chrome-800 px-2 text-ink shadow-toolbar">
      <button type="button" onClick={onOpen} className="flex h-control items-center gap-2 rounded-control px-3 text-ui text-ink hover:bg-chrome-600" title="PDF öffnen (Ctrl+O)">
        <Icon name="open" />
        <span>Öffnen</span>
      </button>

      <button
        type="button"
        onClick={() => void saveCurrentDocument()}
        disabled={!hasDoc}
        className="flex h-control items-center gap-2 rounded-control px-3 text-ui text-ink hover:bg-chrome-600 disabled:cursor-not-allowed disabled:text-ink-muted"
        title="Speichern unter … (Ctrl+S)"
      >
        <Icon name="save" />
        <span>Speichern{dirty ? ' *' : ''}</span>
      </button>

      <div className="mx-1 h-6 w-px bg-chrome-600" />

      <button type="button" onClick={undo} disabled={!canUndo} title="Rückgängig (Ctrl+Z)" className={iconBtn}>
        <Icon name="undo" />
      </button>
      <button type="button" onClick={redo} disabled={!canRedo} title="Wiederholen (Ctrl+Y)" className={iconBtn}>
        <Icon name="redo" />
      </button>

      <div className="mx-1 h-6 w-px bg-chrome-600" />

      <div className="flex items-center gap-0.5">
        {TOOLS.map(({ id, label, icon }) => {
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
                'grid h-control w-control place-items-center rounded-control transition-colors disabled:cursor-not-allowed disabled:text-ink-muted disabled:hover:bg-transparent',
                active ? 'bg-primary/15 text-primary' : 'text-ink hover:bg-chrome-600'
              ].join(' ')}
            >
              <Icon name={icon} />
            </button>
          )
        })}
      </div>

      <div className="mx-1 h-6 w-px bg-chrome-600" />

      <button type="button" onClick={() => setModal('signature')} disabled={!hasDoc} title="Unterschrift" className={iconBtn}>
        <Icon name="signature" />
      </button>
      <button type="button" onClick={() => setModal('forms')} disabled={!hasDoc} title="Formular ausfüllen" className={iconBtn}>
        <Icon name="fill-form" />
      </button>
      <button type="button" onClick={() => setModal('security')} disabled={!hasDoc} title="Sicherheit & Metadaten" className={iconBtn}>
        <Icon name="encrypt-lock" />
      </button>
      {hasRedactMarks && (
        <button
          type="button"
          onClick={() => void applyRedactionToDoc()}
          title="Markierte Schwärzungen dauerhaft anwenden"
          className="flex h-control items-center gap-1.5 rounded-control bg-danger px-2.5 text-ui text-white hover:brightness-110"
        >
          <Icon name="apply-redaction" size={16} /> Schwärzen
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
              currentColor === c ? 'border-white ring ring-primary' : 'border-chrome-600'
            ].join(' ')}
            style={{ background: c }}
          />
        ))}
      </div>

      <div className="ml-auto flex items-center gap-0.5">
        <button type="button" onClick={zoomOut} disabled={!hasDoc} title="Verkleinern" className={iconBtn}>
          <Icon name="zoom-out" />
        </button>
        <button
          type="button"
          onClick={resetZoom}
          disabled={!hasDoc}
          title="Zoom zurücksetzen"
          className="h-control min-w-[56px] rounded-control px-2 text-ui tabular-nums text-ink hover:bg-chrome-600 disabled:text-ink-muted"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button type="button" onClick={zoomIn} disabled={!hasDoc} title="Vergrößern" className={iconBtn}>
          <Icon name="zoom-in" />
        </button>
      </div>
    </div>
  )
}
