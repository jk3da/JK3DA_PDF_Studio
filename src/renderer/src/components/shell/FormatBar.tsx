import { useEffect, useRef, useState } from 'react'
import { Icon } from '../ui/icons'
import { usePdfStore } from '../../lib/state/store'

const SWATCHES = ['#e11d2a', '#f59e0b', '#ffd400', '#15a34a', '#3b82f6', '#7c3aed', '#1b1f24', '#ffffff']
const WIDTHS = [1, 2, 3, 5, 8]
const SIZES = [10, 12, 14, 16, 20, 28]

export default function FormatBar(): JSX.Element {
  const color = usePdfStore((s) => s.currentColor)
  const setColor = usePdfStore((s) => s.setCurrentColor)
  const strokeW = usePdfStore((s) => s.currentStrokeWidth)
  const setStrokeW = usePdfStore((s) => s.setCurrentStrokeWidth)
  const opacity = usePdfStore((s) => s.currentOpacity)
  const setOpacity = usePdfStore((s) => s.setCurrentOpacity)
  const fontSize = usePdfStore((s) => s.currentFontSize)
  const setFontSize = usePdfStore((s) => s.setCurrentFontSize)
  const selectedId = usePdfStore((s) => s.selectedId)
  const updateAnnotation = usePdfStore((s) => s.updateAnnotation)
  const removeAnnotation = usePdfStore((s) => s.removeAnnotation)
  const duplicateAnnotation = usePdfStore((s) => s.duplicateAnnotation)
  const bringToFront = usePdfStore((s) => s.bringToFront)
  const sendToBack = usePdfStore((s) => s.sendToBack)

  const patch = (p: Record<string, unknown>): void => {
    if (selectedId) updateAnnotation(selectedId, p)
  }
  const applyColor = (c: string): void => {
    setColor(c)
    patch({ color: c })
  }
  const applyWidth = (w: number): void => {
    setStrokeW(w)
    patch({ strokeWidth: w })
  }
  const applyOpacity = (o: number): void => {
    setOpacity(o)
    patch({ opacity: o })
  }
  const applySize = (n: number): void => {
    setFontSize(n)
    patch({ fontSize: n })
  }

  const hasSel = selectedId !== null

  return (
    <div className="flex h-[42px] shrink-0 items-center gap-1.5 overflow-hidden border-b border-chrome-900 bg-chrome-700 px-2">
      <span className="pr-0.5 text-ui-sm font-semibold text-ink-muted">FORMAT</span>

      <span title="Füllfarbe" className="text-ink"><Icon name="fill-color" size={17} /></span>
      <Popover
        button={
          <>
            <span className="h-4 w-4 rounded border border-black/40" style={{ background: color }} />
            <Icon name="field-dropdown" size={13} />
          </>
        }
      >
        <div className="grid grid-cols-4 gap-2">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => applyColor(c)}
              title={c}
              className={`h-[22px] w-[22px] rounded-[5px] border ${color.toLowerCase() === c.toLowerCase() ? 'ring ring-primary border-white/20' : 'border-black/40'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </Popover>

      <span title="Konturfarbe" className="text-ink"><Icon name="stroke-color" size={17} /></span>
      <Popover button={<><span className="text-ui-sm">{strokeW.toString().replace('.', ',')} pt</span><Icon name="field-dropdown" size={13} /></>}>
        <div className="flex flex-col gap-1">
          {WIDTHS.map((w) => (
            <button key={w} type="button" onClick={() => applyWidth(w)} className={`flex items-center gap-2 rounded px-2 py-1 text-left text-ui hover:bg-chrome-600 ${strokeW === w ? 'text-primary' : 'text-ink'}`}>
              <span className="w-8 rounded bg-current" style={{ height: Math.min(w, 6) }} /> {w} pt
            </button>
          ))}
        </div>
      </Popover>

      <Divider />
      <span title="Deckkraft" className="text-ink"><Icon name="opacity" size={17} /></span>
      <input type="range" min={0} max={100} value={Math.round(opacity * 100)} onChange={(e) => applyOpacity(Number(e.target.value) / 100)} className="w-20 accent-primary" />
      <span className="w-9 text-ui-sm text-[#9aa3af]">{Math.round(opacity * 100)}%</span>

      <Divider />
      <span className="flex h-7 items-center gap-1.5 rounded-control border border-chrome-600 bg-chrome-800 px-2 text-ui-sm text-ink">Segoe UI</span>
      <select value={fontSize} onChange={(e) => applySize(Number(e.target.value))} className="h-7 rounded-control border border-chrome-600 bg-chrome-800 px-1.5 text-ui-sm text-ink outline-none">
        {SIZES.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <FmtIcon name="bold" title="Fett" />
      <FmtIcon name="italic" title="Kursiv" />
      <div className="inline-flex gap-0.5 rounded-control border border-chrome-600 bg-chrome-800 p-0.5">
        <FmtIcon name="align-left" title="Linksbündig" small />
        <FmtIcon name="align-center" title="Zentriert" small />
        <FmtIcon name="align-right" title="Rechtsbündig" small />
      </div>

      <Divider />
      <button type="button" disabled={!hasSel} onClick={() => selectedId && bringToFront(selectedId)} title="In den Vordergrund" className={fmtBtn}>
        <Icon name="bring-front" size={17} />
      </button>
      <button type="button" disabled={!hasSel} onClick={() => selectedId && sendToBack(selectedId)} title="In den Hintergrund" className={fmtBtn}>
        <Icon name="send-back" size={17} />
      </button>
      <button type="button" disabled={!hasSel} onClick={() => selectedId && duplicateAnnotation(selectedId)} title="Duplizieren" className={fmtBtn}>
        <Icon name="duplicate" size={17} />
      </button>
      <button type="button" disabled={!hasSel} onClick={() => selectedId && removeAnnotation(selectedId)} title="Löschen" className="grid h-7 w-7 place-items-center rounded-control text-danger hover:bg-chrome-600 disabled:opacity-30">
        <Icon name="delete" size={17} />
      </button>
    </div>
  )
}

const fmtBtn = 'grid h-7 w-7 place-items-center rounded-control text-ink hover:bg-chrome-600 disabled:opacity-30'

function FmtIcon({ name, title, small }: { name: string; title: string; small?: boolean }): JSX.Element {
  return (
    <span title={title} className={`grid ${small ? 'h-6 w-[26px]' : 'h-7 w-7'} cursor-pointer place-items-center rounded-control text-ink hover:bg-chrome-600`}>
      <Icon name={name} size={small ? 16 : 17} />
    </span>
  )
}

function Divider(): JSX.Element {
  return <div className="mx-0.5 h-[22px] w-px bg-chrome-600" />
}

function Popover({ button, children }: { button: JSX.Element; children: JSX.Element }): JSX.Element {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const close = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex h-7 items-center gap-1.5 rounded-control border border-chrome-600 bg-chrome-800 px-1.5 text-ink">
        {button}
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-30 rounded-panel border border-chrome-600 bg-chrome-700 p-2.5 shadow-menu" onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  )
}
