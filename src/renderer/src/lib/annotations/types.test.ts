import { describe, it, expect } from 'vitest'
import { annotationBounds, moveAnnotation, resizeAnnotation, type Annotation } from './types'

describe('annotationBounds', () => {
  it('box types return x/y/w/h', () => {
    const a: Annotation = { id: '1', page: 1, type: 'rect', x: 10, y: 20, w: 30, h: 40, color: '#000', strokeWidth: 2 }
    expect(annotationBounds(a)).toEqual({ x: 10, y: 20, w: 30, h: 40 })
  })
  it('line normalizes to top-left bounds', () => {
    const a: Annotation = { id: '1', page: 1, type: 'line', x1: 10, y1: 100, x2: 50, y2: 20, color: '#000', strokeWidth: 2 }
    expect(annotationBounds(a)).toEqual({ x: 10, y: 20, w: 40, h: 80 })
  })
  it('note is fixed 24x24', () => {
    const a: Annotation = { id: '1', page: 1, type: 'note', x: 5, y: 5, text: '', color: '#ffd400' }
    expect(annotationBounds(a)).toEqual({ x: 5, y: 5, w: 24, h: 24 })
  })
  it('draw bounds from points', () => {
    const a: Annotation = { id: '1', page: 1, type: 'draw', points: [{ x: 0, y: 0 }, { x: 10, y: 20 }, { x: 5, y: 5 }], color: '#000', strokeWidth: 2 }
    expect(annotationBounds(a)).toEqual({ x: 0, y: 0, w: 10, h: 20 })
  })
})

describe('moveAnnotation', () => {
  it('moves box by dx/dy', () => {
    const a: Annotation = { id: '1', page: 1, type: 'rect', x: 10, y: 20, w: 30, h: 40, color: '#000', strokeWidth: 2 }
    expect(moveAnnotation(a, 5, -5)).toMatchObject({ x: 15, y: 15 })
  })
  it('moves both line endpoints', () => {
    const a: Annotation = { id: '1', page: 1, type: 'line', x1: 0, y1: 0, x2: 10, y2: 10, color: '#000', strokeWidth: 2 }
    expect(moveAnnotation(a, 3, 4)).toMatchObject({ x1: 3, y1: 4, x2: 13, y2: 14 })
  })
  it('moves each draw point', () => {
    const a: Annotation = { id: '1', page: 1, type: 'draw', points: [{ x: 0, y: 0 }, { x: 2, y: 2 }], color: '#000', strokeWidth: 2 }
    const m = moveAnnotation(a, 1, 1)
    expect(m.type === 'draw' && m.points).toEqual([{ x: 1, y: 1 }, { x: 3, y: 3 }])
  })
  it('does not mutate the original', () => {
    const a: Annotation = { id: '1', page: 1, type: 'rect', x: 10, y: 20, w: 30, h: 40, color: '#000', strokeWidth: 2 }
    moveAnnotation(a, 5, 5)
    expect(a.x).toBe(10)
  })
})

describe('resizeAnnotation', () => {
  const box: Annotation = { id: '1', page: 1, type: 'rect', x: 10, y: 20, w: 30, h: 40, color: '#000', strokeWidth: 2 }

  it('se handle grows width/height', () => {
    expect(resizeAnnotation(box, 'se', 5, 10)).toMatchObject({ x: 10, y: 20, w: 35, h: 50 })
  })
  it('nw handle moves origin and shrinks', () => {
    expect(resizeAnnotation(box, 'nw', 5, 10)).toMatchObject({ x: 15, y: 30, w: 25, h: 30 })
  })
  it('clamps to minimum size instead of flipping', () => {
    const r = resizeAnnotation(box, 'se', -100, -100)
    expect(r).toMatchObject({ w: 8, h: 8 })
  })
  it('edge handle only affects one axis', () => {
    expect(resizeAnnotation(box, 'e', 12, 99)).toMatchObject({ x: 10, y: 20, w: 42, h: 40 })
  })
  it('line handles move a single endpoint', () => {
    const l: Annotation = { id: '1', page: 1, type: 'line', x1: 0, y1: 0, x2: 10, y2: 10, color: '#000', strokeWidth: 2 }
    expect(resizeAnnotation(l, 'p2', 5, -5)).toMatchObject({ x1: 0, y1: 0, x2: 15, y2: 5 })
  })
  it('draw scales points proportionally', () => {
    const d: Annotation = { id: '1', page: 1, type: 'draw', points: [{ x: 0, y: 0 }, { x: 10, y: 20 }], color: '#000', strokeWidth: 2 }
    const r = resizeAnnotation(d, 'se', 10, 20) // 10x20 -> 20x40
    expect(r.type === 'draw' && r.points[1]).toEqual({ x: 20, y: 40 })
  })
  it('text/note are not resizable', () => {
    const t: Annotation = { id: '1', page: 1, type: 'text', x: 1, y: 1, text: 'x', color: '#000', fontSize: 12 }
    expect(resizeAnnotation(t, 'se', 10, 10)).toBe(t)
  })
})
