import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { usePdfStore } from '../../lib/state/store'
import {
  annotationBounds,
  moveAnnotation,
  type Annotation,
  type BoxAnnotation,
  type DrawAnnotation
} from '../../lib/annotations/types'

interface Props {
  pageNumber: number
  baseWidth: number
  baseHeight: number
  zoom: number
}

const HIGHLIGHT_COLOR = '#ffd400'
const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `a-${Date.now()}-${Math.round(Math.random() * 1e6)}`

type Gesture =
  | { kind: 'move'; id: string; orig: Annotation; startX: number; startY: number }
  | { kind: 'box'; startX: number; startY: number }
  | { kind: 'draw'; points: Array<{ x: number; y: number }> }

export default function AnnotationLayer({ pageNumber, baseWidth, zoom }: Props): JSX.Element {
  const tool = usePdfStore((s) => s.tool)
  const color = usePdfStore((s) => s.currentColor)
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

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>): void => {
    if (e.button !== 0) return
    const { x, y } = toPoints(e.clientX, e.clientY)

    // Wartende Platzierung (Signatur/Bild) hat Vorrang vor dem aktiven Werkzeug.
    if (pending) {
      addAnnotation({
        id: newId(),
        page: pageNumber,
        type: 'image',
        x: x - pending.w / 2,
        y: y - pending.h / 2,
        w: pending.w,
        h: pending.h,
        dataUrl: pending.dataUrl
      })
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
      addAnnotation({ id, page: pageNumber, type: 'text', x, y, text: '', color, fontSize: 16 })
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

    if (tool === 'draw' || tool === 'signature') {
      gesture.current = { kind: 'draw', points: [{ x, y }] }
      return
    }

    // highlight | rectangle | stamp -> Box ziehen
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
      setDraft({
        id: 'draft',
        page: pageNumber,
        type: tool === 'signature' ? 'signature' : 'draw',
        points: [...g.points],
        color: tool === 'signature' ? '#0a0a0a' : color,
        strokeWidth: tool === 'signature' ? 2.2 : 2
      })
    } else if (g.kind === 'box') {
      const bx = Math.min(g.startX, x)
      const by = Math.min(g.startY, y)
      const bw = Math.abs(x - g.startX)
      const bh = Math.abs(y - g.startY)
      setDraft(makeBoxDraft(tool, pageNumber, bx, by, bw, bh, color))
    }
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const g = gesture.current
    gesture.current = null
    layerRef.current?.releasePointerCapture(e.pointerId)
    setDraft(null)
    if (!g) return

    if (g.kind === 'box') {
      const { x, y } = toPoints(e.clientX, e.clientY)
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
      addAnnotation({ ...makeBoxDraft(tool, pageNumber, bx, by, bw, bh, color), id: newId() })
    } else if (g.kind === 'draw') {
      if (g.points.length < 2) return
      const drawn: DrawAnnotation = {
        id: newId(),
        page: pageNumber,
        type: tool === 'signature' ? 'signature' : 'draw',
        points: g.points,
        color: tool === 'signature' ? '#0a0a0a' : color,
        strokeWidth: tool === 'signature' ? 2.2 : 2
      }
      addAnnotation(drawn)
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
  const cursor =
    tool === 'select' ? 'default' : tool === 'text' || tool === 'note' ? 'text' : 'crosshair'

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
          className="absolute resize-none rounded border border-accent bg-white/95 p-1 text-black shadow-lg outline-none"
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

function makeBoxDraft(
  tool: string,
  page: number,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): BoxAnnotation | Annotation {
  if (tool === 'stamp') {
    return { id: 'draft', page, type: 'stamp', x, y, w, h, label: 'GENEHMIGT', color } as Annotation
  }
  const type = tool === 'highlight' ? 'highlight' : tool === 'redact' ? 'redact' : 'rect'
  const boxColor = type === 'highlight' ? HIGHLIGHT_COLOR : type === 'redact' ? '#111111' : color
  return { id: 'draft', page, type, x, y, w, h, color: boxColor, strokeWidth: 2 }
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
      return (
        <div
          className="absolute"
          style={{ left: a.x * zoom, top: a.y * zoom, width: a.w * zoom, height: a.h * zoom, background: a.color, opacity: 0.35, ...ring }}
        />
      )
    case 'rect':
      return (
        <div
          className="absolute"
          style={{ left: a.x * zoom, top: a.y * zoom, width: a.w * zoom, height: a.h * zoom, border: `${a.strokeWidth * zoom}px solid ${a.color}`, ...ring }}
        />
      )
    case 'redact':
      return (
        <div
          className="absolute"
          style={{ left: a.x * zoom, top: a.y * zoom, width: a.w * zoom, height: a.h * zoom, background: 'rgba(10,10,10,0.82)', border: '1.5px solid #e11d2a', ...ring }}
          title="Schwärzung (anwenden macht Inhalt unwiderruflich unlesbar)"
        />
      )
    case 'stamp':
      return (
        <div
          className="absolute flex items-center justify-center font-bold uppercase tracking-wide"
          style={{
            left: a.x * zoom,
            top: a.y * zoom,
            width: a.w * zoom,
            height: a.h * zoom,
            border: `2px solid ${a.color}`,
            color: a.color,
            background: `${a.color}14`,
            fontSize: Math.min(a.h * 0.45, 18) * zoom,
            ...ring
          }}
        >
          {a.label}
        </div>
      )
    case 'text':
      return (
        <div
          className="absolute whitespace-pre-wrap"
          style={{ left: a.x * zoom, top: a.y * zoom, color: a.color, fontSize: a.fontSize * zoom, lineHeight: 1.2, ...ring }}
        >
          {a.text || ' '}
        </div>
      )
    case 'note':
      return (
        <div
          className="absolute flex items-center justify-center rounded-sm font-bold text-yellow-900"
          style={{ left: a.x * zoom, top: a.y * zoom, width: 22 * zoom, height: 22 * zoom, background: '#ffd400', border: '1px solid #998400', fontSize: 13 * zoom, ...ring }}
          title={a.text}
        >
          !
        </div>
      )
    case 'image':
      return (
        <img
          src={a.dataUrl}
          alt=""
          draggable={false}
          className="absolute select-none"
          style={{ left: a.x * zoom, top: a.y * zoom, width: a.w * zoom, height: a.h * zoom, ...ring }}
        />
      )
    case 'draw':
    case 'signature': {
      const b = annotationBounds(a)
      const pts = a.points.map((p) => `${p.x * zoom},${p.y * zoom}`).join(' ')
      return (
        <svg className="pointer-events-none absolute inset-0 overflow-visible" style={{ ...ring }}>
          <polyline points={pts} fill="none" stroke={a.color} strokeWidth={a.strokeWidth * zoom} strokeLinecap="round" strokeLinejoin="round" />
          {selected && (
            <rect x={b.x * zoom} y={b.y * zoom} width={b.w * zoom} height={b.h * zoom} fill="none" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 3" />
          )}
        </svg>
      )
    }
  }
}
