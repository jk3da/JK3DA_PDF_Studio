import { Icon } from '../ui/icons'
import { usePdfStore, type ToolId, type ModalId } from '../../lib/state/store'

const TOOLS: { id: ToolId; label: string; icon: string }[] = [
  { id: 'select', label: 'Auswählen', icon: 'select' },
  { id: 'hand', label: 'Hand / Verschieben', icon: 'hand-pan' },
  { id: 'text', label: 'Text', icon: 'text' },
  { id: 'note', label: 'Notiz', icon: 'note' },
  { id: 'draw', label: 'Freihand', icon: 'freehand' },
  { id: 'highlight', label: 'Markieren', icon: 'highlight' },
  { id: 'line', label: 'Linie', icon: 'line' },
  { id: 'arrow', label: 'Pfeil', icon: 'arrow' },
  { id: 'rectangle', label: 'Rechteck', icon: 'rectangle' },
  { id: 'ellipse', label: 'Ellipse', icon: 'ellipse' },
  { id: 'redact', label: 'Schwärzen', icon: 'redaction' },
  { id: 'stamp', label: 'Stempel', icon: 'stamp' }
]

const MODAL_TOOLS: { id: ModalId; label: string; icon: string }[] = [
  { id: 'signature', label: 'Unterschrift', icon: 'signature' },
  { id: 'forms', label: 'Formular', icon: 'fill-form' },
  { id: 'security', label: 'Sicherheit', icon: 'encrypt-lock' }
]

export default function ToolRail(): JSX.Element {
  const tool = usePdfStore((s) => s.tool)
  const setTool = usePdfStore((s) => s.setTool)
  const setModal = usePdfStore((s) => s.setModal)
  const hasDoc = usePdfStore((s) => s.bytes !== null)

  return (
    <div className="flex w-12 shrink-0 flex-col items-center gap-[3px] overflow-y-auto border-r border-chrome-800 bg-chrome-900 py-2">
      {TOOLS.map((t) => {
        const active = tool === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTool(t.id)}
            disabled={!hasDoc}
            title={t.label}
            aria-pressed={active}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-control transition-colors disabled:cursor-not-allowed disabled:text-ink-muted disabled:hover:bg-transparent ${
              active ? 'bg-primary/15 text-primary' : 'text-ink hover:bg-chrome-700'
            }`}
          >
            <Icon name={t.icon} />
          </button>
        )
      })}

      <div className="my-1 h-px w-6 bg-chrome-700" />

      {MODAL_TOOLS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setModal(t.id)}
          disabled={!hasDoc}
          title={t.label}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-control text-ink transition-colors hover:bg-chrome-700 disabled:cursor-not-allowed disabled:text-ink-muted disabled:hover:bg-transparent"
        >
          <Icon name={t.icon} />
        </button>
      ))}
    </div>
  )
}
