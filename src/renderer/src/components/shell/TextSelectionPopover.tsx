import { useEffect, useState } from 'react'
import { Icon } from '../ui/icons'
import { usePdfStore } from '../../lib/state/store'
import type { Annotation } from '../../lib/annotations/types'

interface SelInfo {
  page: number
  /** Zeilen-Rechtecke in PDF-Punkten (top-left). */
  rects: { x: number; y: number; w: number; h: number }[]
  /** Bubble-Position in Viewport-Koordinaten. */
  bx: number
  by: number
  text: string
}

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `a-${Date.now()}-${Math.round(Math.random() * 1e6)}`

/**
 * Erscheint im Textauswahl-Modus unter der Auswahl und bietet
 * Markieren / Unterstreichen / Durchstreichen / Kopieren an.
 */
export default function TextSelectionPopover(): JSX.Element | null {
  const textSelect = usePdfStore((s) => s.textSelect)
  const zoom = usePdfStore((s) => s.zoom)
  const color = usePdfStore((s) => s.currentColor)
  const addAnnotations = usePdfStore((s) => s.addAnnotations)
  const setStatus = usePdfStore((s) => s.setStatus)
  const [info, setInfo] = useState<SelInfo | null>(null)

  useEffect(() => {
    if (!textSelect) {
      setInfo(null)
      return
    }
    const onUp = (): void => {
      // Auswahl erst nach dem Mouseup auslesen (Selection ist dann final).
      window.setTimeout(() => {
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
          setInfo(null)
          return
        }
        const range = sel.getRangeAt(0)
        const node = range.commonAncestorContainer
        const elNode = node instanceof Element ? node : node.parentElement
        const layer = elNode?.closest('.textLayer')
        const pageEl = layer?.parentElement
        if (!layer || !pageEl || !pageEl.id.startsWith('pdf-page-')) {
          setInfo(null)
          return
        }
        const page = Number(pageEl.id.slice('pdf-page-'.length))
        const pr = pageEl.getBoundingClientRect()
        const raw = Array.from(range.getClientRects()).filter((r) => r.width > 2 && r.height > 2)
        if (raw.length === 0) {
          setInfo(null)
          return
        }
        // Span-Rechtecke einer Zeile zu einem Zeilen-Rechteck zusammenfassen.
        const lines: SelInfo['rects'] = []
        for (const r of raw) {
          const x = (r.left - pr.left) / zoom
          const y = (r.top - pr.top) / zoom
          const w = r.width / zoom
          const h = r.height / zoom
          const line = lines.find((l) => Math.abs(l.y + l.h / 2 - (y + h / 2)) < h * 0.6)
          if (line) {
            const right = Math.max(line.x + line.w, x + w)
            line.x = Math.min(line.x, x)
            line.w = right - line.x
            line.y = Math.min(line.y, y)
            line.h = Math.max(line.h, h)
          } else {
            lines.push({ x, y, w, h })
          }
        }
        const last = raw[raw.length - 1]
        setInfo({ page, rects: lines, bx: last.right, by: last.bottom, text: sel.toString() })
      }, 0)
    }
    document.addEventListener('pointerup', onUp)
    return () => document.removeEventListener('pointerup', onUp)
  }, [textSelect, zoom])

  if (!textSelect || !info) return null

  const finish = (): void => {
    window.getSelection()?.removeAllRanges()
    setInfo(null)
  }

  const make = (kind: 'highlight' | 'underline' | 'strike'): void => {
    const annos: Annotation[] = info.rects.map((r) => {
      if (kind === 'highlight') {
        return {
          id: newId(),
          page: info.page,
          type: 'highlight',
          x: r.x,
          y: r.y,
          w: r.w,
          h: r.h,
          color: '#ffd400',
          strokeWidth: 1,
          opacity: 0.35
        }
      }
      const ly = kind === 'underline' ? r.y + r.h : r.y + r.h / 2
      return {
        id: newId(),
        page: info.page,
        type: 'line',
        x1: r.x,
        y1: ly,
        x2: r.x + r.w,
        y2: ly,
        color,
        strokeWidth: 1.5
      }
    })
    addAnnotations(annos)
    finish()
  }

  const copy = (): void => {
    void navigator.clipboard.writeText(info.text)
    setStatus('In die Zwischenablage kopiert')
    finish()
  }

  return (
    <div
      className="fixed z-[70] flex items-center gap-0.5 rounded-panel border border-chrome-600 bg-chrome-900/95 p-1 shadow-menu backdrop-blur"
      style={{ left: Math.min(info.bx, window.innerWidth - 180), top: Math.min(info.by + 8, window.innerHeight - 48) }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <PopBtn icon="highlight" title="Markieren" onClick={() => make('highlight')} />
      <PopBtn icon="underline" title="Unterstreichen" onClick={() => make('underline')} />
      <PopBtn icon="strikethrough" title="Durchstreichen" onClick={() => make('strike')} />
      <div className="mx-0.5 h-5 w-px bg-chrome-600" />
      <PopBtn icon="duplicate" title="Kopieren" onClick={copy} />
    </div>
  )
}

function PopBtn({ icon, title, onClick }: { icon: string; title: string; onClick: () => void }): JSX.Element {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-control text-ink hover:bg-chrome-600"
    >
      <Icon name={icon} size={17} />
    </button>
  )
}
