import { useEffect, useRef, useState } from 'react'
import { Icon } from '../ui/icons'
import { usePdfStore } from '../../lib/state/store'
import { saveCurrentDocument } from '../../lib/pdf/save'

const MENUS = ['Datei', 'Bearbeiten', 'Ansicht', 'Dokument', 'Formulare', 'Werkzeuge', 'Hilfe']

export default function TitleBar({ onOpen }: { onOpen: () => void }): JSX.Element {
  const name = usePdfStore((s) => s.name)
  const dirty = usePdfStore((s) => s.dirty)
  const hasDoc = usePdfStore((s) => s.bytes !== null)
  const [open, setOpen] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const fileItems = [
    { label: 'Öffnen…', icon: 'open', sc: 'Strg+O', onClick: onOpen, disabled: false },
    { label: 'Speichern unter…', icon: 'save', sc: 'Strg+S', onClick: () => void saveCurrentDocument(), disabled: !hasDoc },
    { label: 'Sicherheit & Metadaten', icon: 'encrypt-lock', sc: '', onClick: () => usePdfStore.getState().setModal('security'), disabled: !hasDoc },
    { label: 'Beenden', icon: 'close', sc: 'Alt+F4', onClick: () => void window.jk3da.winClose(), disabled: false }
  ]

  return (
    <div ref={ref} className="app-drag flex h-9 shrink-0 items-center gap-3.5 border-b border-chrome-800 bg-chrome-900 px-2.5">
      <div className="flex items-center gap-2 text-primary">
        <Icon name="app-logo" size={18} />
        <span className="text-ui font-semibold text-ink">JK3DA PDF&nbsp;Studio</span>
      </div>

      <div className="app-no-drag flex items-center gap-0.5 text-ui text-[#c8ccd2]">
        {MENUS.map((m) => (
          <div key={m} className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => (o === m ? null : m === 'Datei' ? m : null))}
              className={`rounded-[5px] px-2.5 py-1 hover:bg-chrome-700 ${open === m ? 'bg-chrome-700' : ''}`}
            >
              {m}
            </button>
            {open === m && m === 'Datei' && (
              <div className="absolute left-0 top-8 z-50 min-w-[230px] rounded-panel border border-chrome-600 bg-chrome-700 p-1.5 text-ui shadow-menu">
                {fileItems.map((it) => (
                  <button
                    key={it.label}
                    type="button"
                    disabled={it.disabled}
                    onClick={() => {
                      setOpen(null)
                      it.onClick()
                    }}
                    className="flex h-8 w-full items-center gap-2.5 rounded-[5px] px-2 text-left text-ink hover:bg-chrome-600 disabled:opacity-40"
                  >
                    <Icon name={it.icon} size={16} />
                    <span className="flex-1">{it.label}</span>
                    <span className="text-[11px] text-ink-muted">{it.sc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex-1" />
      <div className="flex items-center gap-1.5 text-ui-sm text-ink-muted">
        {dirty && <span className="text-warning"><Icon name="dirty-indicator" size={9} /></span>}
        {name ?? 'Kein Dokument'}
      </div>
      <div className="flex-1" />

      <div className="app-no-drag flex items-center gap-1 text-[#9aa3af]">
        <button type="button" title="Minimieren" onClick={() => void window.jk3da.winMinimize()} className="grid h-[22px] w-[26px] place-items-center rounded hover:bg-chrome-700">
          <span className="h-[1.5px] w-2.5 bg-current" />
        </button>
        <button type="button" title="Maximieren" onClick={() => void window.jk3da.winMaximizeToggle()} className="grid h-[22px] w-[26px] place-items-center rounded hover:bg-chrome-700">
          <span className="h-[9px] w-[9px] rounded-[2px] border-[1.5px] border-current" />
        </button>
        <button type="button" title="Schließen" onClick={() => void window.jk3da.winClose()} className="grid h-[22px] w-[26px] place-items-center rounded text-[#c8ccd2] hover:bg-danger hover:text-white">
          <span className="text-[15px] leading-none">✕</span>
        </button>
      </div>
    </div>
  )
}
