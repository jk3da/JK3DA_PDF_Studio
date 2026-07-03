import { Icon } from '../ui/icons'
import { usePdfStore, type ToolId, type ModalId } from '../../lib/state/store'

const TOOLS: { id: ToolId; label: string; icon: string }[] = [
  { id: 'select', label: 'Auswählen (V)', icon: 'select' },
  { id: 'hand', label: 'Hand / Verschieben (H, Leertaste halten)', icon: 'hand-pan' },
  { id: 'text', label: 'Text (T)', icon: 'text' },
  { id: 'note', label: 'Notiz (N)', icon: 'note' },
  { id: 'draw', label: 'Freihand (F)', icon: 'freehand' },
  { id: 'highlight', label: 'Markieren (M)', icon: 'highlight' },
  { id: 'line', label: 'Linie (L)', icon: 'line' },
  { id: 'arrow', label: 'Pfeil (P)', icon: 'arrow' },
  { id: 'measure', label: 'Messen (Distanz)', icon: 'measure-distance' },
  { id: 'measureArea', label: 'Messen (Fläche)', icon: 'measure-area' },
  { id: 'rectangle', label: 'Rechteck (R)', icon: 'rectangle' },
  { id: 'ellipse', label: 'Ellipse (E)', icon: 'ellipse' },
  { id: 'crop', label: 'Zuschneiden', icon: 'crop' },
  { id: 'redact', label: 'Schwärzen (X)', icon: 'redaction' },
  { id: 'stamp', label: 'Stempel (S)', icon: 'stamp' }
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
