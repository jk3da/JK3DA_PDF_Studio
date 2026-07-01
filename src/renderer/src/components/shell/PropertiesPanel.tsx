import { Icon } from '../ui/icons'
import { usePdfStore } from '../../lib/state/store'
import { annotationBounds, moveAnnotation, type Annotation } from '../../lib/annotations/types'

function meta(a: Annotation): { icon: string; label: string } {
  switch (a.type) {
    case 'rect': return { icon: 'rectangle', label: 'Rechteck-Anmerkung' }
    case 'ellipse': return { icon: 'ellipse', label: 'Ellipse' }
    case 'line': return a.arrow ? { icon: 'arrow', label: 'Pfeil' } : { icon: 'line', label: 'Linie' }
    case 'highlight': return { icon: 'highlight', label: 'Markierung' }
    case 'redact': return { icon: 'redaction', label: 'Schwärzung' }
    case 'crop': return { icon: 'crop', label: 'Zuschneiden' }
    case 'measure-area': return { icon: 'measure-area', label: 'Fläche' }
    case 'text': return { icon: 'text', label: 'Text' }
    case 'note': return { icon: 'note', label: 'Notiz' }
    case 'draw':
    case 'signature': return { icon: 'freehand', label: 'Freihand' }
    case 'stamp': return { icon: 'stamp', label: 'Stempel' }
    case 'image': return { icon: 'insert-image', label: 'Bild / Signatur' }
  }
}

export default function PropertiesPanel(): JSX.Element {
  const rightTab = usePdfStore((s) => s.rightTab)
  const setRightTab = usePdfStore((s) => s.setRightTab)
  const annotations = usePdfStore((s) => s.annotations)
  const selectedId = usePdfStore((s) => s.selectedId)
  const updateAnnotation = usePdfStore((s) => s.updateAnnotation)
  const selectAnnotation = usePdfStore((s) => s.selectAnnotation)

  const sel = annotations.find((a) => a.id === selectedId) ?? null

  const tabs: { id: 'properties' | 'comments'; label: string; icon: string }[] = [
    { id: 'properties', label: 'Eigenschaften', icon: 'settings' },
    { id: 'comments', label: 'Kommentare', icon: 'note' }
  ]

  return (
    <aside className="flex w-[296px] shrink-0 flex-col border-l border-chrome-600 bg-chrome-800">
      <div className="flex h-[38px] items-center gap-0.5 border-b border-chrome-600 px-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setRightTab(t.id)}
            className={`flex h-[37px] items-center gap-1.5 border-b-2 px-3 text-ui font-semibold ${
              rightTab === t.id ? 'border-primary text-ink' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      {rightTab === 'properties' && (
        <div className="flex-1 overflow-y-auto p-3.5">
          {!sel && <p className="text-ui text-ink-muted">Keine Auswahl. Wähle eine Anmerkung mit dem Auswählen-Werkzeug.</p>}
          {sel && <PropsForm sel={sel} update={updateAnnotation} />}
        </div>
      )}

      {rightTab === 'comments' && (
        <div className="flex-1 overflow-y-auto p-3">
          {annotations.filter((a) => a.type === 'text' || a.type === 'note').length === 0 && (
            <p className="text-ui text-ink-muted">Keine Kommentare.</p>
          )}
          <div className="flex flex-col gap-2.5">
            {annotations
              .filter((a): a is Extract<Annotation, { type: 'text' | 'note' }> => a.type === 'text' || a.type === 'note')
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectAnnotation(c.id)}
                  className={`rounded-panel border p-2.5 text-left ${selectedId === c.id ? 'border-primary bg-chrome-700' : 'border-chrome-600 bg-chrome-700/60 hover:border-chrome-500'}`}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">Ich</span>
                    <span className="flex-1 text-ui-sm font-semibold text-ink">Ich</span>
                    <span className="inline-flex items-center gap-1 text-[10.5px] text-warning"><Icon name={c.type === 'note' ? 'note' : 'text'} size={13} />{c.type === 'note' ? 'Notiz' : 'Text'}</span>
                  </div>
                  <div className="text-[12.5px] leading-relaxed text-[#c8ccd2]">{c.text || <span className="text-ink-muted">(leer)</span>}</div>
                </button>
              ))}
          </div>
        </div>
      )}
    </aside>
  )
}

function PropsForm({ sel, update }: { sel: Annotation; update: (id: string, p: Partial<Annotation>) => void }): JSX.Element {
  const m = meta(sel)
  const b = annotationBounds(sel)
  const hasWH = 'w' in sel
  const color = 'color' in sel ? sel.color : '#000000'
  const opacity = 'opacity' in sel && sel.opacity !== undefined ? sel.opacity : 1

  const setX = (x: number): void => update(sel.id, moveAnnotation(sel, x - b.x, 0))
  const setY = (y: number): void => update(sel.id, moveAnnotation(sel, 0, y - b.y))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-ui text-ink">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-control bg-danger/15 text-danger"><Icon name={m.icon} size={15} /></span>
        {m.label}
      </div>

      <div>
        <SectionTitle>Geometrie</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <NumField label="X" value={Math.round(b.x)} onChange={setX} />
          <NumField label="Y" value={Math.round(b.y)} onChange={setY} />
          <NumField label="Breite" value={Math.round(b.w)} disabled={!hasWH} onChange={(w) => update(sel.id, { w } as Partial<Annotation>)} />
          <NumField label="Höhe" value={Math.round(b.h)} disabled={!hasWH} onChange={(h) => update(sel.id, { h } as Partial<Annotation>)} />
        </div>
      </div>

      <div>
        <SectionTitle>Darstellung</SectionTitle>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-ui text-[#c8ccd2]">Konturfarbe</span>
            <span className="h-[22px] w-[22px] rounded-[5px] border border-black/40" style={{ background: color }} />
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-ui text-[#c8ccd2]"><span>Deckkraft</span><span className="text-[#9aa3af]">{Math.round(opacity * 100)}%</span></div>
            <input type="range" min={0} max={100} value={Math.round(opacity * 100)} onChange={(e) => update(sel.id, { opacity: Number(e.target.value) / 100 } as Partial<Annotation>)} className="w-full accent-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: string }): JSX.Element {
  return <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{children}</div>
}

function NumField({ label, value, onChange, disabled }: { label: string; value: number; onChange: (n: number) => void; disabled?: boolean }): JSX.Element {
  return (
    <label className="text-ui-sm text-[#9aa3af]">
      {label}
      <input
        type="number"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-[34px] w-full rounded-control border border-chrome-600 bg-chrome-700 px-2 text-ui text-ink outline-none focus:border-primary disabled:opacity-40"
      />
    </label>
  )
}
