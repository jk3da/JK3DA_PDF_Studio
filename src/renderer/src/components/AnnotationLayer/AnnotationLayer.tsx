import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { usePdfStore } from '../../lib/state/store'
import { CURSORS } from '../../lib/cursors'
import { annotationBounds, moveAnnotation, type Annotation } from '../../lib/annotations/types'

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
  rectangle: CURSORS.rectangle,
  ellipse: CURSORS.ellipse,
  redact: CURSORS.redaction,
  note: CURSORS.note,
  stamp: CURSORS.stamp
}

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `a-${Date.now()}-${Math.round(Math.random() * 1e6)}`

type Gesture =
  | { kind: 'move'; id: string; orig: Annotation; startX: number; startY: number }
  | { kind: 'box'; startX: number; startY: number }
  | { kind: 'line'; startX: number; startY: number }
  | { kind: 'draw'; points: Array<{ x: number; y: number }> }

export default function AnnotationLayer({ pageNumber, baseWidth, zoom }: Props): JSX.Element {
  const tool = usePdfStore((s) => s.tool)
  const color = usePdfStore((s) => s.currentColor)
  const strokeW = usePdfStore((s) => s.currentStrokeWidth)
  const opacity = usePdfStore((s) => s.currentOpacity)
  const fontSize = usePdfStore((s) => s.currentFontSize)
  const selectedId = usePdfStore((s) => s.selectedId)
  const annotations = usePdfStore((s) => s.annotations)
  const pending = usePdfStore((s) => s.pending)
  const addAnnotation = usePdfStore((s) => s.addAnnotation)
  const updateAnnotation = usePdfStore((s) => s.updateAnnotation)
  const selectAnnotation = usePdfStore((s) => s.selectAnnotation)
  const beginHistory = usePdfStore((s) => s.beginHistory)
  const setTool = usePdfStore((s) => s.setTool)
  const setPending = usePdfStore((s) => s.setPending)

  const layerRef = useRef<HTMLDivElement>(null)
  const gesture = useRef<Gesture | null>(null)
  const [draft, setDraft] = useState<Annotation | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
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

  const editing = editingId ? pageAnnos.find((a) => a.id === editingId) : null
  const cursor = pending ? 'copy' : (TOOL_CURSOR[tool] ?? 'crosshair')

  return (
    <div
      ref={layerRef}
      className="absolute inset-0"
      style={{ cursor, touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      {pageAnnos.map((a) => (
        <AnnotationView key={a.id} a={a} zoom={zoom} selected={a.id === selectedId} hidden={a.id === editingId} />
      ))}
      {draft && <AnnotationView a={draft} zoom={zoom} selected={false} hidden={false} />}

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
        <div className="absolute grid place-items-center rounded-md font-bold text-[#1b1f24]" style={{ left: a.x * zoom, top: a.y * zoom, width: 26 * zoom, height: 26 * zoom, background: '#f59e0b', borderRadius: `${6 * zoom}px ${6 * zoom}px ${6 * zoom}px ${2 * zoom}px`, ...ring }} title={a.text}>
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
