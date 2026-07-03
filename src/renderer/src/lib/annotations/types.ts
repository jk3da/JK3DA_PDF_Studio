// Annotations-Datenmodell.
//
// Koordinaten-Konvention: alle x/y/w/h sind in PDF-Punkten mit Ursprung
// OBEN-LINKS (Bildschirm-Konvention) bei Zoom 1. Das Overlay rendert bei
// Zoom z als px = wert * z. Der Flatten-Schritt (pdf-lib) rechnet in den
// PDF-Koordinatenraum (Ursprung unten-links) um: y_pdf = seitenHoehe - y.

export type AnnotationType =
  | 'text'
  | 'highlight'
  | 'rect'
  | 'redact'
  | 'crop'
  | 'measure-area'
  | 'note'
  | 'draw'
  | 'signature'
  | 'line'
  | 'ellipse'
  | 'stamp'
  | 'image'

export interface TextAnnotation {
  id: string
  page: number
  type: 'text'
  x: number
  y: number
  text: string
  color: string
  fontSize: number
}

export interface NoteAnnotation {
  id: string
  page: number
  type: 'note'
  x: number
  y: number
  text: string
  color: string
}

export interface BoxAnnotation {
  id: string
  page: number
  type: 'highlight' | 'rect' | 'redact' | 'crop' | 'measure-area'
  x: number
  y: number
  w: number
  h: number
  color: string
  strokeWidth: number
  opacity?: number
}

export interface EllipseAnnotation {
  id: string
  page: number
  type: 'ellipse'
  x: number
  y: number
  w: number
  h: number
  color: string
  strokeWidth: number
  opacity?: number
}

export interface LineAnnotation {
  id: string
  page: number
  type: 'line'
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
  strokeWidth: number
  /** Pfeilspitze am Endpunkt. */
  arrow?: boolean
  /** Messlinie: zeigt die Länge in mm. */
  measure?: boolean
  opacity?: number
}

export interface DrawAnnotation {
  id: string
  page: number
  type: 'draw' | 'signature'
  points: Array<{ x: number; y: number }>
  color: string
  strokeWidth: number
  opacity?: number
}

export interface StampAnnotation {
  id: string
  page: number
  type: 'stamp'
  x: number
  y: number
  w: number
  h: number
  label: string
  color: string
}

export interface ImageAnnotation {
  id: string
  page: number
  type: 'image'
  x: number
  y: number
  w: number
  h: number
  /** PNG- oder JPEG-Data-URL (z. B. gezeichnete Signatur oder importiertes Bild). */
  dataUrl: string
}

export type Annotation =
  | TextAnnotation
  | NoteAnnotation
  | BoxAnnotation
  | EllipseAnnotation
  | LineAnnotation
  | DrawAnnotation
  | StampAnnotation
  | ImageAnnotation

/** Etwas, das beim nächsten Klick auf eine Seite platziert wird (z. B. Signatur). */
export type PendingPlacement = { kind: 'image'; dataUrl: string; w: number; h: number }

/** Liefert die Bounding-Box einer Annotation in (top-left) Punkten. */
export function annotationBounds(a: Annotation): { x: number; y: number; w: number; h: number } {
  switch (a.type) {
    case 'text':
      return { x: a.x, y: a.y, w: Math.max(40, a.text.length * a.fontSize * 0.5), h: a.fontSize * 1.4 }
    case 'note':
      return { x: a.x, y: a.y, w: 24, h: 24 }
    case 'highlight':
    case 'rect':
    case 'redact':
    case 'crop':
    case 'measure-area':
    case 'stamp':
    case 'image':
    case 'ellipse':
      return { x: a.x, y: a.y, w: a.w, h: a.h }
    case 'line': {
      const x = Math.min(a.x1, a.x2)
      const y = Math.min(a.y1, a.y2)
      return { x, y, w: Math.abs(a.x2 - a.x1), h: Math.abs(a.y2 - a.y1) }
    }
    case 'draw':
    case 'signature': {
      const xs = a.points.map((p) => p.x)
      const ys = a.points.map((p) => p.y)
      const minX = Math.min(...xs)
      const minY = Math.min(...ys)
      return { x: minX, y: minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY }
    }
  }
}

/** Griff-Positionen fürs Skalieren: Box-Ecken/-Kanten bzw. Linien-Endpunkte. */
export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'p1' | 'p2'

const MIN_SIZE = 8

function resizeRect(
  x: number,
  y: number,
  w: number,
  h: number,
  handle: string,
  dx: number,
  dy: number
): { x: number; y: number; w: number; h: number } {
  let nx = x
  let ny = y
  let nw = w
  let nh = h
  if (handle.includes('w')) {
    nx = x + dx
    nw = w - dx
  }
  if (handle.includes('e')) nw = w + dx
  if (handle.includes('n')) {
    ny = y + dy
    nh = h - dy
  }
  if (handle.includes('s')) nh = h + dy
  if (nw < MIN_SIZE) {
    if (handle.includes('w')) nx = x + w - MIN_SIZE
    nw = MIN_SIZE
  }
  if (nh < MIN_SIZE) {
    if (handle.includes('n')) ny = y + h - MIN_SIZE
    nh = MIN_SIZE
  }
  return { x: nx, y: ny, w: nw, h: nh }
}

/**
 * Skaliert/verändert eine Annotation über einen Griff um (dx, dy) — immutabel.
 * Linien bewegen den jeweiligen Endpunkt, Freihand skaliert seine Punkte
 * proportional zur neuen Bounding-Box; Text/Notiz sind nicht skalierbar.
 */
export function resizeAnnotation(
  a: Annotation,
  handle: ResizeHandle,
  dx: number,
  dy: number
): Annotation {
  switch (a.type) {
    case 'line':
      if (handle === 'p1') return { ...a, x1: a.x1 + dx, y1: a.y1 + dy }
      if (handle === 'p2') return { ...a, x2: a.x2 + dx, y2: a.y2 + dy }
      return a
    case 'draw':
    case 'signature': {
      const b = annotationBounds(a)
      const r = resizeRect(b.x, b.y, b.w, b.h, handle, dx, dy)
      const sx = b.w > 0 ? r.w / b.w : 1
      const sy = b.h > 0 ? r.h / b.h : 1
      return { ...a, points: a.points.map((p) => ({ x: r.x + (p.x - b.x) * sx, y: r.y + (p.y - b.y) * sy })) }
    }
    case 'text':
    case 'note':
      return a
    default: {
      const r = resizeRect(a.x, a.y, a.w, a.h, handle, dx, dy)
      return { ...a, ...r }
    }
  }
}

/** Verschiebt eine Annotation um (dx, dy) Punkte (immutabel). */
export function moveAnnotation(a: Annotation, dx: number, dy: number): Annotation {
  switch (a.type) {
    case 'draw':
    case 'signature':
      return { ...a, points: a.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) }
    case 'line':
      return { ...a, x1: a.x1 + dx, y1: a.y1 + dy, x2: a.x2 + dx, y2: a.y2 + dy }
    case 'text':
    case 'note':
    case 'highlight':
    case 'rect':
    case 'redact':
    case 'crop':
    case 'measure-area':
    case 'stamp':
    case 'image':
    case 'ellipse':
      return { ...a, x: a.x + dx, y: a.y + dy }
  }
}
