import Modal from '../ui/Modal'
import { usePdfStore } from '../../lib/state/store'

interface Row {
  keys: string[]
  label: string
}

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: 'Datei',
    rows: [
      { keys: ['Strg', 'O'], label: 'Öffnen' },
      { keys: ['Strg', 'S'], label: 'Speichern unter' },
      { keys: ['Strg', 'P'], label: 'Drucken' },
      { keys: ['Strg', 'W'], label: 'Dokument schließen' }
    ]
  },
  {
    title: 'Bearbeiten',
    rows: [
      { keys: ['Strg', 'Z'], label: 'Rückgängig' },
      { keys: ['Strg', 'Y'], label: 'Wiederholen' },
      { keys: ['Entf'], label: 'Auswahl löschen' },
      { keys: ['Pfeiltasten'], label: 'Auswahl verschieben (Shift = 10 pt)' },
      { keys: ['Esc'], label: 'Abwählen / zurück zum Auswählen' }
    ]
  },
  {
    title: 'Ansicht & Zoom',
    rows: [
      { keys: ['Strg', 'Mausrad'], label: 'Zoomen' },
      { keys: ['Strg', '+/−'], label: 'Vergrößern / Verkleinern' },
      { keys: ['Strg', '0'], label: 'Ganze Seite' },
      { keys: ['Strg', '1'], label: 'Originalgröße (100 %)' },
      { keys: ['Strg', '2'], label: 'Seitenbreite' },
      { keys: ['F11'], label: 'Vollbild' }
    ]
  },
  {
    title: 'Navigation',
    rows: [
      { keys: ['Bild ↑/↓'], label: 'Vorherige / nächste Seite' },
      { keys: ['Pos1 / Ende'], label: 'Erste / letzte Seite' },
      { keys: ['Strg', 'F'], label: 'Im Dokument suchen' }
    ]
  },
  {
    title: 'Werkzeuge',
    rows: [
      { keys: ['Leertaste halten'], label: 'Temporär verschieben (Hand)' },
      { keys: ['Mittlere Maustaste'], label: 'Verschieben (Panning)' },
      { keys: ['V'], label: 'Auswählen' },
      { keys: ['H'], label: 'Hand' },
      { keys: ['T'], label: 'Text' },
      { keys: ['N'], label: 'Notiz' },
      { keys: ['F'], label: 'Freihand' },
      { keys: ['M'], label: 'Markieren' },
      { keys: ['L'], label: 'Linie' },
      { keys: ['P'], label: 'Pfeil' },
      { keys: ['R'], label: 'Rechteck' },
      { keys: ['E'], label: 'Ellipse' },
      { keys: ['S'], label: 'Stempel' },
      { keys: ['X'], label: 'Schwärzen' }
    ]
  }
]

export default function ShortcutsModal(): JSX.Element {
  const setModal = usePdfStore((s) => s.setModal)
  return (
    <Modal title="Tastenkürzel" onClose={() => setModal(null)} width={560}>
      <div className="grid max-h-[62vh] grid-cols-2 gap-x-6 gap-y-4 overflow-y-auto pr-1">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{g.title}</h3>
            <div className="flex flex-col gap-1.5">
              {g.rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-3 text-ui">
                  <span className="text-[#c8ccd2]">{r.label}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {r.keys.map((key) => (
                      <kbd
                        key={key}
                        className="grid h-5 min-w-[20px] place-items-center rounded border border-chrome-600 bg-chrome-900 px-1.5 text-[11px] font-medium text-ink-muted"
                      >
                        {key}
                      </kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Modal>
  )
}
