import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent
} from 'react'
import { usePdfStore } from '../../lib/state/store'
import { CURSORS } from '../../lib/cursors'
import { Menu } from '../ui/components'
import {
  annotationBounds,
  moveAnnotation,
  resizeAnnotation,
  type Annotation,
  type ResizeHandle
} from '../../lib/annotations/types'

interface Props {
  pageNumber: number
  baseWidth: number
  zoom: number
}

const HIGHLIGHT_COLOR = '#ffd400'

const TOOL_CURSOR: Record<string, string> = {
  select: CURSORS.select,
  hand: CURSORS['hand-pan'],
  text: CURSORS.text,
  draw: CURSORS.freehand,
  highlight: CURSORS.highlight,
  line: CURSORS.line,
  arrow: CURSORS.arrow,
  measure: CURSORS['measure-distance'],
  measureArea: CURSORS['measure-area'],
  rectangle: CURSORS.rectangle,
  ellipse: CURSORS.ellipse,
  redact: CURSORS.redaction,
  crop: 'crosshair',
  note: CURSORS.note,
  stamp: CURSORS.stamp
}

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `a-${Date.now()}-${Math.round(Math.random() * 1e6)}`

type Gesture =
  | { kind: 'move'; id: string; orig: Annotation; startX: number; startY: number }
  | { kind: 'resize'; id: string; orig: Annotation; handle: ResizeHandle; startX: number; startY: number }
  | { kind: 'box'; startX: number; startY: number }
  | { kind: 'line'; startX: number; startY: number }
  | { kind: 'draw'; points: Array<{ x: number; y: number }> }

const HANDLE_CURSOR: Record<ResizeHandle, string> = {
  nw: 'nwse-resize',
  se: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  p1: 'move',
  p2: 'move'
}

/** Griff-Positionen (in PDF-Punkten) für die ausgewählte Annotation. */
function handlesFor(a: Annotation): { id: ResizeHandle; x: number; y: number }[] {
  if (a.type === 'line') {
    return [
      { id: 'p1', x: a.x1, y: a.y1 },
      { id: 'p2', x: a.x2, y: a.y2 }
    ]
  }
  if (a.type === 'text' || a.type === 'note') return []
  const b = annotationBounds(a)
  const corners: { id: ResizeHandle; x: number; y: number }[] = [
    { id: 'nw', x: b.x, y: b.y },
    { id: 'ne', x: b.x + b.w, y: b.y },
    { id: 'se', x: b.x + b.w, y: b.y + b.h },
    { id: 'sw', x: b.x, y: b.y + b.h }
  ]
  // Freihand/Signatur: nur Ecken (proportionales Skalieren).
  if (a.type === 'draw' || a.type === 'signature') return corners
  return [
    ...corners,
    { id: 'n', x: b.x + b.w / 2, y: b.y },
    { id: 'e', x: b.x + b.w, y: b.y + b.h / 2 },
    { id: 's', x: b.x + b.w / 2, y: b.y + b.h },
    { id: 'w', x: b.x, y: b.y + b.h / 2 }
  ]
}

export default function AnnotationLayer({ pageNumber, baseWidth, zoom }: Props): JSX.Element {
  const tool = usePdfStore((s) => s.tool)
  const textSelect = usePdfStore((s) => s.textSelect)
  const color = usePdfStore((s) => s.currentColor)
  const strokeW = usePdfStore((s) => s.currentStrokeWidth)
  const opacity = usePdfStore((s) => s.currentOpacity)
  const fontSize = usePdfStore((s) => s.currentFontSize)
  const selectedId = usePdfStore((s) => s.selectedId)
  const annotations = usePdfStore((s) => s.annotations)
  const pending = usePdfStore((s) => s.pending)
  const addAnnotation = usePdfStore((s) => s.addAnnotation)
  const updateAnnotation = usePdfStore((s) => s.updateAnnotation)
  const removeAnnotation = usePdfStore((s) => s.removeAnnotation)
  const duplicateAnnotation = usePdfStore((s) => s.duplicateAnnotation)
  const bringToFront = usePdfStore((s) => s.bringToFront)
  const sendToBack = usePdfStore((s) => s.sendToBack)
  const selectAnnotation = usePdfStore((s) => s.selectAnnotation)
  const beginHistory = usePdfStore((s) => s.beginHistory)
  const setTool = usePdfStore((s) => s.setTool)
  const setPending = usePdfStore((s) => s.setPending)

  const layerRef = useRef<HTMLDivElement>(null)
  const gesture = useRef<Gesture | null>(null)
  const [draft, setDraft] = useState<Annotation | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; id: string } | null>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const pageAnnos = annotations.filter((a) => a.page === pageNumber)

  useEffect(() => {
    if (editingId) editorRef.current?.focus()
  }, [editingId])

  const toPoints = (clientX: number, clientY: number): { x: number; y: number } => {
    const rect = layerRef.current!.getBoundingClientRect()
    return { x: (clientX - rect.left) / zoom, y: (clientY - rect.top) / zoom }
  }

  const hitTest = (x: number, y: number): Annotation | null => {
    const pad = 6
    for (let i = pageAnnos.length - 1; i >= 0; i--) {
      const b = annotationBounds(pageAnnos[i])
      if (x >= b.x - pad && x <= b.x + b.w + pad && y >= b.y - pad && y <= b.y + b.h + pad) {
        return pageAnnos[i]
      }
    }
    return null
  }

  const makeShape = (bx: number, by: number, bw: number, bh: number): Annotation => {
    if (tool === 'stamp') return { id: 'draft', page: pageNumber, type: 'stamp', x: bx, y: by, w: bw, h: bh, label: 'GENEHMIGT', color }
    if (tool === 'ellipse') return { id: 'draft', page: pageNumber, type: 'ellipse', x: bx, y: by, w: bw, h: bh, color, strokeWidth: strokeW, opacity }
    if (tool === 'highlight') return { id: 'draft', page: pageNumber, type: 'highlight', x: bx, y: by, w: bw, h: bh, color: HIGHLIGHT_COLOR, strokeWidth: strokeW, opacity: 0.35 }
    if (tool === 'redact') return { id: 'draft', page: pageNumber, type: 'redact', x: bx, y: by, w: bw, h: bh, color: '#111111', strokeWidth: strokeW }
    if (tool === 'crop') return { id: 'draft', page: pageNumber, type: 'crop', x: bx, y: by, w: bw, h: bh, color: '#3b82f6', strokeWidth: 1 }
    if (tool === 'measureArea') return { id: 'draft', page: pageNumber, type: 'measure-area', x: bx, y: by, w: bw, h: bh, color, strokeWidth: strokeW, opacity }
    return { id: 'draft', page: pageNumber, type: 'rect', x: bx, y: by, w: bw, h: bh, color, strokeWidth: strokeW, opacity }
  }

  const makeLine = (x1: number, y1: number, x2: number, y2: number): Annotation => ({
    id: 'draft',
    page: pageNumber,
    type: 'line',
    x1,
    y1,
    x2,
    y2,
    color,
    strokeWidth: strokeW,
    arrow: tool === 'arrow',
    measure: tool === 'measure',
    opacity
  })

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>): void => {
    if (e.button !== 0 || tool === 'hand') return
    const { x, y } = toPoints(e.clientX, e.clientY)

    if (pending) {
      addAnnotation({ id: newId(), page: pageNumber, type: 'image', x: x - pending.w / 2, y: y - pending.h / 2, w: pending.w, h: pending.h, dataUrl: pending.dataUrl })
      setPending(null)
      setTool('select')
      return
    }

    layerRef.current?.setPointerCapture(e.pointerId)

    if (tool === 'select') {
      const hit = hitTest(x, y)
      selectAnnotation(hit ? hit.id : null)
      if (hit) {
        beginHistory()
        gesture.current = { kind: 'move', id: hit.id, orig: hit, startX: x, startY: y }
      }
      return
    }

    if (tool === 'text') {
      const id = newId()
      addAnnotation({ id, page: pageNumber, type: 'text', x, y, text: '', color, fontSize })
      setTool('select')
      selectAnnotation(id)
      setEditingId(id)
      return
    }

    if (tool === 'note') {
      const id = newId()
      addAnnotation({ id, page: pageNumber, type: 'note', x, y, text: '', color: HIGHLIGHT_COLOR })
      setTool('select')
      selectAnnotation(id)
      setEditingId(id)
      return
    }

    if (tool === 'draw') {
      gesture.current = { kind: 'draw', points: [{ x, y }] }
      return
    }

    if (tool === 'line' || tool === 'arrow' || tool === 'measure') {
      gesture.current = { kind: 'line', startX: x, startY: y }
      return
    }

    gesture.current = { kind: 'box', startX: x, startY: y }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const g = gesture.current
    if (!g) return
    const { x, y } = toPoints(e.clientX, e.clientY)

    if (g.kind === 'move') {
      updateAnnotation(g.id, moveAnnotation(g.orig, x - g.startX, y - g.startY))
    } else if (g.kind === 'resize') {
      updateAnnotation(g.id, resizeAnnotation(g.orig, g.handle, x - g.startX, y - g.startY))
    } else if (g.kind === 'draw') {
      g.points.push({ x, y })
      setDraft({ id: 'draft', page: pageNumber, type: 'draw', points: [...g.points], color, strokeWidth: strokeW, opacity })
    } else if (g.kind === 'line') {
      setDraft(makeLine(g.startX, g.startY, x, y))
    } else {
      const bx = Math.min(g.startX, x)
      const by = Math.min(g.startY, y)
      setDraft(makeShape(bx, by, Math.abs(x - g.startX), Math.abs(y - g.startY)))
    }
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const g = gesture.current
    gesture.current = null
    layerRef.current?.releasePointerCapture(e.pointerId)
    setDraft(null)
    if (!g) return
    const { x, y } = toPoints(e.clientX, e.clientY)

    if (g.kind === 'box') {
      let bx = Math.min(g.startX, x)
      let by = Math.min(g.startY, y)
      let bw = Math.abs(x - g.startX)
      let bh = Math.abs(y - g.startY)
      if (tool === 'stamp' && bw < 8) {
        bw = 130
        bh = 38
        bx = g.startX
        by = g.startY
      }
      if (bw < 4 || bh < 4) return
      addAnnotation({ ...makeShape(bx, by, bw, bh), id: newId() })
    } else if (g.kind === 'line') {
      if (Math.hypot(x - g.startX, y - g.startY) < 4) return
      addAnnotation({ ...makeLine(g.startX, g.startY, x, y), id: newId() })
    } else if (g.kind === 'draw') {
      if (g.points.length < 2) return
      addAnnotation({ id: newId(), page: pageNumber, type: 'draw', points: g.points, color, strokeWidth: strokeW, opacity })
    }
  }

  const onDoubleClick = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const { x, y } = toPoints(e.clientX, e.clientY)
    const hit = hitTest(x, y)
    if (hit && (hit.type === 'text' || hit.type === 'note')) {
      selectAnnotation(hit.id)
      setEditingId(hit.id)
    }
  }

  // Resize-Griffe: stopPropagation, damit die Auswahl-Logik nicht anspringt.
  const startResize = (e: ReactPointerEvent<HTMLDivElement>, a: Annotation, handle: ResizeHandle): void => {
    if (e.button !== 0) return
    e.stopPropagation()
    const { x, y } = toPoints(e.clientX, e.clientY)
    beginHistory()
    gesture.current = { kind: 'resize', id: a.id, orig: a, handle, startX: x, startY: y }
    layerRef.current?.setPointerCapture(e.pointerId)
  }

  // Rechtsklick: Kontextmenü auf der getroffenen Annotation.
  const onContextMenu = (e: ReactMouseEvent<HTMLDivElement>): void => {
    e.preventDefault()
    const { x, y } = toPoints(e.clientX, e.clientY)
    const hit = hitTest(x, y)
    if (hit) {
      selectAnnotation(hit.id)
      setCtxMenu({ x: e.clientX, y: e.clientY, id: hit.id })
    } else {
      setCtxMenu(null)
    }
  }

  const onCtxSelect = (action: string): void => {
    const id = ctxMenu?.id
    setCtxMenu(null)
    if (!id) return
    if (action === 'duplicate') duplicateAnnotation(id)
    else if (action === 'front') bringToFront(id)
    else if (action === 'back') sendToBack(id)
    else if (action === 'delete') removeAnnotation(id)
  }

  const editing = editingId ? pageAnnos.find((a) => a.id === editingId) : null
  const selAnno = tool === 'select' && !draft ? pageAnnos.find((a) => a.id === selectedId) : undefined
  const cursor = pending ? 'copy' : (TOOL_CURSOR[tool] ?? 'crosshair')

  return (
    <div
      ref={layerRef}
      className="absolute inset-0"
      style={{ cursor, touchAction: 'none', pointerEvents: textSelect ? 'none' : undefined }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      {pageAnnos.map((a) => (
        <AnnotationView key={a.id} a={a} zoom={zoom} selected={a.id === selectedId} hidden={a.id === editingId} />
      ))}
      {draft && <AnnotationView a={draft} zoom={zoom} selected={false} hidden={false} />}

      {selAnno &&
        handlesFor(selAnno).map((h) => (
          <div
            key={h.id}
            onPointerDown={(e) => startResize(e, selAnno, h.id)}
            className="absolute z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[2px] border-[1.5px] border-white bg-primary shadow"
            style={{ left: h.x * zoom, top: h.y * zoom, cursor: HANDLE_CURSOR[h.id] }}
          />
        ))}

      {ctxMenu && (
        <div
          className="fixed inset-0 z-[80]"
          onPointerDown={() => setCtxMenu(null)}
          onContextMenu={(e) => {
            e.preventDefault()
            setCtxMenu(null)
          }}
        >
          <div
            className="absolute"
            style={{ left: ctxMenu.x, top: ctxMenu.y }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Menu
              items={[
                { id: 'duplicate', label: 'Duplizieren', icon: 'duplicate' },
                { id: 'front', label: 'In den Vordergrund', icon: 'bring-front' },
                { id: 'back', label: 'In den Hintergrund', icon: 'send-back' },
                { id: 'd1', label: '', divider: true },
                { id: 'delete', label: 'Löschen', icon: 'delete', shortcut: ['Entf'], danger: true }
              ]}
              onSelect={onCtxSelect}
            />
          </div>
        </div>
      )}

      {editing && (editing.type === 'text' || editing.type === 'note') && (
        <textarea
          ref={editorRef}
          value={editing.text}
          onChange={(ev) => updateAnnotation(editing.id, { text: ev.target.value })}
          onBlur={() => setEditingId(null)}
          onKeyDown={(ev) => {
            if (ev.key === 'Escape') ev.currentTarget.blur()
          }}
          onPointerDown={(ev) => ev.stopPropagation()}
          className="absolute resize-none rounded border border-primary bg-white/95 p-1 text-black shadow-lg outline-none"
          style={{
            left: editing.x * zoom,
            top: editing.type === 'note' ? (editing.y + 26) * zoom : editing.y * zoom,
            width: Math.max(140, baseWidth * 0.4) * zoom,
            minHeight: 28,
            fontSize: (editing.type === 'text' ? editing.fontSize : 12) * zoom,
            lineHeight: 1.2
          }}
        />
      )}
    </div>
  )
}

interface ViewProps {
  a: Annotation
  zoom: number
  selected: boolean
  hidden: boolean
}

function AnnotationView({ a, zoom, selected, hidden }: ViewProps): JSX.Element | null {
  if (hidden) return null
  const ring = selected ? { outline: '1.5px dashed #3b82f6', outlineOffset: 2 } : undefined

  switch (a.type) {
    case 'highlight':
      return <div className="absolute" style={{ left: a.x * zoom, top: a.y * zoom, width: a.w * zoom, height: a.h * zoom, background: a.color, opacity: a.opacity ?? 0.35, ...ring }} />
    case 'rect':
      return <div className="absolute" style={{ left: a.x * zoom, top: a.y * zoom, width: a.w * zoom, height: a.h * zoom, border: `${a.strokeWidth * zoom}px solid ${a.color}`, opacity: a.opacity ?? 1, ...ring }} />
    case 'ellipse':
      return <div className="absolute" style={{ left: a.x * zoom, top: a.y * zoom, width: a.w * zoom, height: a.h * zoom, border: `${a.strokeWidth * zoom}px solid ${a.color}`, borderRadius: '50%', opacity: a.opacity ?? 1, ...ring }} />
    case 'redact':
      return <div className="absolute" style={{ left: a.x * zoom, top: a.y * zoom, width: a.w * zoom, height: a.h * zoom, background: 'rgba(10,10,10,0.82)', border: '1.5px solid #e11d2a', ...ring }} title="Schwärzung (anwenden macht Inhalt unwiderruflich unlesbar)" />
    case 'crop':
      return <div className="absolute" style={{ left: a.x * zoom, top: a.y * zoom, width: a.w * zoom, height: a.h * zoom, border: '1.5px dashed #3b82f6', background: 'rgba(59,130,246,0.08)', ...ring }} title="Zuschneiden — in der Toolbar anwenden" />
    case 'measure-area': {
      const areaMm = Math.round((a.w / 72) * 25.4 * ((a.h / 72) * 25.4))
      const periMm = Math.round(2 * (((a.w + a.h) / 72) * 25.4))
      return (
        <div className="absolute" style={{ left: a.x * zoom, top: a.y * zoom, width: a.w * zoom, height: a.h * zoom, border: `${a.strokeWidth * zoom}px dashed ${a.color}`, opacity: a.opacity ?? 1, ...ring }}>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
            {areaMm} mm² · {periMm} mm
          </div>
        </div>
      )
    }
    case 'stamp':
      return (
        <div className="absolute flex items-center justify-center font-bold uppercase tracking-wide" style={{ left: a.x * zoom, top: a.y * zoom, width: a.w * zoom, height: a.h * zoom, border: `2px solid ${a.color}`, color: a.color, background: `${a.color}14`, fontSize: Math.min(a.h * 0.45, 18) * zoom, ...ring }}>
          {a.label}
        </div>
      )
    case 'text':
      return <div className="absolute whitespace-pre-wrap" style={{ left: a.x * zoom, top: a.y * zoom, color: a.color, fontSize: a.fontSize * zoom, lineHeight: 1.2, ...ring }}>{a.text || ' '}</div>
    case 'note':
      return (
        <div className="absolute grid place-items-center font-bold text-[#1b1f24]" style={{ left: a.x * zoom, top: a.y * zoom, width: 24 * zoom, height: 24 * zoom, background: '#f59e0b', borderRadius: `${6 * zoom}px ${6 * zoom}px ${6 * zoom}px ${2 * zoom}px`, ...ring }} title={a.text}>
          <span style={{ fontSize: 13 * zoom }}>!</span>
        </div>
      )
    case 'image':
      return <img src={a.dataUrl} alt="" draggable={false} className="absolute select-none" style={{ left: a.x * zoom, top: a.y * zoom, width: a.w * zoom, height: a.h * zoom, ...ring }} />
    case 'line': {
      const b = annotationBounds(a)
      const arrowHead = (): JSX.Element | null => {
        if (!a.arrow) return null
        const ang = Math.atan2(a.y2 - a.y1, a.x2 - a.x1)
        const len = 10 + a.strokeWidth * 2
        const h1 = ang - Math.PI / 6
        const h2 = ang + Math.PI / 6
        const p1 = `${(a.x2 - len * Math.cos(h1)) * zoom},${(a.y2 - len * Math.sin(h1)) * zoom}`
        const p2 = `${(a.x2 - len * Math.cos(h2)) * zoom},${(a.y2 - len * Math.sin(h2)) * zoom}`
        return <polyline points={`${p1} ${a.x2 * zoom},${a.y2 * zoom} ${p2}`} fill="none" stroke={a.color} strokeWidth={a.strokeWidth * zoom} strokeLinecap="round" strokeLinejoin="round" />
      }
      const mx = ((a.x1 + a.x2) / 2) * zoom
      const my = ((a.y1 + a.y2) / 2) * zoom
      const mmLen = Math.round((Math.hypot(a.x2 - a.x1, a.y2 - a.y1) / 72) * 25.4)
      return (
        <svg className="pointer-events-none absolute inset-0 overflow-visible" style={{ opacity: a.opacity ?? 1 }}>
          <line x1={a.x1 * zoom} y1={a.y1 * zoom} x2={a.x2 * zoom} y2={a.y2 * zoom} stroke={a.color} strokeWidth={a.strokeWidth * zoom} strokeLinecap="round" />
          {arrowHead()}
          {a.measure && (
            <text x={mx} y={my - 5} textAnchor="middle" fontSize={11} fill={a.color} stroke="#fff" strokeWidth={3} style={{ paintOrder: 'stroke', fontWeight: 600 }}>
              {mmLen} mm
            </text>
          )}
          {selected && <rect x={b.x * zoom - 3} y={b.y * zoom - 3} width={b.w * zoom + 6} height={b.h * zoom + 6} fill="none" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 3" />}
        </svg>
      )
    }
    case 'draw':
    case 'signature': {
      const b = annotationBounds(a)
      const pts = a.points.map((p) => `${p.x * zoom},${p.y * zoom}`).join(' ')
      return (
        <svg className="pointer-events-none absolute inset-0 overflow-visible" style={{ opacity: a.opacity ?? 1, ...ring }}>
          <polyline points={pts} fill="none" stroke={a.color} strokeWidth={a.strokeWidth * zoom} strokeLinecap="round" strokeLinejoin="round" />
          {selected && <rect x={b.x * zoom} y={b.y * zoom} width={b.w * zoom} height={b.h * zoom} fill="none" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 3" />}
        </svg>
      )
    }
  }
}
