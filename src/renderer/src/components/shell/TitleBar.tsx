import { useEffect, useRef, useState } from 'react'
import { Icon } from '../ui/icons'
import { usePdfStore } from '../../lib/state/store'
import { saveCurrentDocument } from '../../lib/pdf/save'
import { applyRedactionToDoc } from '../../lib/pdf/redactApply'
import { pageOps } from '../../lib/pdf/pageOps'
import { docTools } from '../../lib/pdf/docTools'

interface MItem {
  label?: string
  icon?: string
  sc?: string
  onClick?: () => void
  disabled?: boolean
  divider?: boolean
}

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

  const s = (): ReturnType<typeof usePdfStore.getState> => usePdfStore.getState()
  const curIdx = (): number => s().currentPage - 1
  const dis = !hasDoc

  const MENUS: { name: string; items: MItem[] }[] = [
    {
      name: 'Datei',
      items: [
        { label: 'Öffnen…', icon: 'open', sc: 'Strg+O', onClick: onOpen },
        { label: 'Speichern unter…', icon: 'save', sc: 'Strg+S', onClick: () => void saveCurrentDocument(), disabled: dis },
        { label: 'Drucken…', icon: 'print', sc: 'Strg+P', onClick: () => window.print(), disabled: dis },
        { divider: true },
        { label: 'Sicherheit & Metadaten', icon: 'encrypt-lock', onClick: () => s().setModal('security'), disabled: dis },
        { divider: true },
        { label: 'Beenden', icon: 'close', sc: 'Alt+F4', onClick: () => void window.jk3da.winClose() }
      ]
    },
    {
      name: 'Bearbeiten',
      items: [
        { label: 'Rückgängig', icon: 'undo', sc: 'Strg+Z', onClick: () => s().undo() },
        { label: 'Wiederholen', icon: 'redo', sc: 'Strg+Y', onClick: () => s().redo() },
        { divider: true },
        { label: 'Duplizieren', icon: 'duplicate', onClick: () => { const id = s().selectedId; if (id) s().duplicateAnnotation(id) }, disabled: !s().selectedId },
        { label: 'Auswahl löschen', icon: 'delete', sc: 'Entf', onClick: () => { const id = s().selectedId; if (id) s().removeAnnotation(id) }, disabled: !s().selectedId },
        { label: 'Alle Anmerkungen entfernen', icon: 'clear-form', onClick: () => s().clearAnnotations(), disabled: dis }
      ]
    },
    {
      name: 'Ansicht',
      items: [
        { label: 'Vergrößern', icon: 'zoom-in', onClick: () => s().zoomIn(), disabled: dis },
        { label: 'Verkleinern', icon: 'zoom-out', onClick: () => s().zoomOut(), disabled: dis },
        { label: 'Originalgröße (100 %)', icon: 'actual-size', onClick: () => s().resetZoom(), disabled: dis },
        { label: 'Seitenbreite', icon: 'fit-width', onClick: () => s().requestFit('width'), disabled: dis },
        { label: 'Ganze Seite', icon: 'fit-page', onClick: () => s().requestFit('page'), disabled: dis },
        { divider: true },
        { label: 'Einzelseite', icon: 'layout-single', onClick: () => s().setLayoutMode('single'), disabled: dis },
        { label: 'Fortlaufend', icon: 'layout-continuous', onClick: () => s().setLayoutMode('continuous'), disabled: dis },
        { label: 'Doppelseite', icon: 'layout-spread', onClick: () => s().setLayoutMode('spread'), disabled: dis },
        { divider: true },
        { label: 'Vollbild', icon: 'fullscreen', sc: 'F11', onClick: () => void window.jk3da.toggleFullscreen() }
      ]
    },
    {
      name: 'Dokument',
      items: [
        { label: 'Leerseite einfügen', icon: 'insert-blank', onClick: () => void pageOps.insertBlankAfter(curIdx()), disabled: dis },
        { label: 'PDF anfügen…', icon: 'merge', onClick: () => void pageOps.mergeFile(), disabled: dis },
        { label: 'Seite extrahieren…', icon: 'extract', onClick: () => void pageOps.extract([curIdx()]), disabled: dis },
        { label: 'In Einzelseiten aufteilen…', icon: 'split', onClick: () => void pageOps.splitAll(), disabled: dis },
        { divider: true },
        { label: 'Seite links drehen', icon: 'rotate-left', onClick: () => void pageOps.rotate(curIdx(), -90), disabled: dis },
        { label: 'Seite rechts drehen', icon: 'rotate-right', onClick: () => void pageOps.rotate(curIdx(), 90), disabled: dis },
        { label: 'Seite löschen', icon: 'delete-page', onClick: () => void pageOps.remove(curIdx()), disabled: dis },
        { divider: true },
        { label: 'Wasserzeichen…', icon: 'watermark', onClick: () => s().setModal('watermark'), disabled: dis },
        { label: 'Seitenzahlen einfügen', icon: 'page-numbers', onClick: () => void docTools.pageNumbers(), disabled: dis }
      ]
    },
    {
      name: 'Formulare',
      items: [{ label: 'Formular ausfüllen…', icon: 'fill-form', onClick: () => s().setModal('forms'), disabled: dis }]
    },
    {
      name: 'Werkzeuge',
      items: [
        { label: 'Unterschrift…', icon: 'signature', onClick: () => s().setModal('signature'), disabled: dis },
        { label: 'Schwärzen anwenden', icon: 'apply-redaction', onClick: () => void applyRedactionToDoc(), disabled: dis },
        { label: 'Sicherheit & Metadaten…', icon: 'encrypt-lock', onClick: () => s().setModal('security'), disabled: dis }
      ]
    },
    {
      name: 'Hilfe',
      items: [{ label: 'Über JK3DA PDF Studio', icon: 'about', onClick: () => s().setModal('about') }]
    }
  ]

  return (
    <div ref={ref} className="app-drag flex h-9 shrink-0 items-center gap-3.5 border-b border-chrome-800 bg-chrome-900 px-2.5">
      <div className="flex items-center gap-2 text-primary">
        <Icon name="app-logo" size={18} />
        <span className="text-ui font-semibold text-ink">JK3DA PDF&nbsp;Studio</span>
      </div>

      <div className="app-no-drag flex items-center gap-0.5 text-ui text-[#c8ccd2]">
        {MENUS.map((menu) => (
          <div key={menu.name} className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => (o === menu.name ? null : menu.name))}
              onMouseEnter={() => setOpen((o) => (o ? menu.name : o))}
              className={`rounded-[5px] px-2.5 py-1 hover:bg-chrome-700 ${open === menu.name ? 'bg-chrome-700' : ''}`}
            >
              {menu.name}
            </button>
            {open === menu.name && (
              <div className="absolute left-0 top-8 z-50 min-w-[240px] rounded-panel border border-chrome-600 bg-chrome-700 p-1.5 text-ui shadow-menu">
                {menu.items.map((it, i) =>
                  it.divider ? (
                    <div key={`d${i}`} className="my-1 h-px bg-chrome-600" />
                  ) : (
                    <button
                      key={it.label}
                      type="button"
                      disabled={it.disabled}
                      onClick={() => {
                        setOpen(null)
                        it.onClick?.()
                      }}
                      className="flex h-8 w-full items-center gap-2.5 rounded-[5px] px-2 text-left text-ink hover:bg-chrome-600 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      {it.icon && <Icon name={it.icon} size={16} />}
                      <span className="flex-1">{it.label}</span>
                      {it.sc && <span className="text-[11px] text-ink-muted">{it.sc}</span>}
                    </button>
                  )
                )}
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
