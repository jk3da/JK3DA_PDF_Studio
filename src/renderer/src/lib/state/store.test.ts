import { describe, it, expect, beforeEach } from 'vitest'
import { usePdfStore } from './store'
import type { Annotation } from '../annotations/types'

const rect = (id: string): Annotation => ({ id, page: 1, type: 'rect', x: 0, y: 0, w: 10, h: 10, color: '#000', strokeWidth: 2 })

beforeEach(() => {
  usePdfStore.getState().closeDocument()
  usePdfStore.setState({ annotations: [], past: [], future: [], selectedId: null })
})

describe('store: annotations', () => {
  it('adds, selects and removes', () => {
    usePdfStore.getState().addAnnotation(rect('a'))
    expect(usePdfStore.getState().annotations).toHaveLength(1)
    expect(usePdfStore.getState().selectedId).toBe('a')
    usePdfStore.getState().removeAnnotation('a')
    expect(usePdfStore.getState().annotations).toHaveLength(0)
    expect(usePdfStore.getState().selectedId).toBeNull()
  })

  it('undo/redo restore counts', () => {
    usePdfStore.getState().addAnnotation(rect('a'))
    usePdfStore.getState().addAnnotation(rect('b'))
    expect(usePdfStore.getState().annotations).toHaveLength(2)
    usePdfStore.getState().undo()
    expect(usePdfStore.getState().annotations).toHaveLength(1)
    usePdfStore.getState().redo()
    expect(usePdfStore.getState().annotations).toHaveLength(2)
  })

  it('duplicate offsets by 12 and selects the copy', () => {
    usePdfStore.getState().addAnnotation(rect('a'))
    usePdfStore.getState().duplicateAnnotation('a')
    const st = usePdfStore.getState()
    expect(st.annotations).toHaveLength(2)
    expect(st.selectedId).not.toBe('a')
    const copy = st.annotations[1]
    expect(copy.type === 'rect' && copy.x).toBe(12)
  })

  it('bringToFront / sendToBack reorder', () => {
    usePdfStore.getState().addAnnotation(rect('a'))
    usePdfStore.getState().addAnnotation(rect('b'))
    usePdfStore.getState().bringToFront('a')
    expect(usePdfStore.getState().annotations.map((a) => a.id)).toEqual(['b', 'a'])
    usePdfStore.getState().sendToBack('a')
    expect(usePdfStore.getState().annotations.map((a) => a.id)).toEqual(['a', 'b'])
  })

  it('updateAnnotation merges a patch', () => {
    usePdfStore.getState().addAnnotation(rect('a'))
    usePdfStore.getState().updateAnnotation('a', { color: '#fff' })
    expect((usePdfStore.getState().annotations[0] as { color: string }).color).toBe('#fff')
  })

  it('addAnnotations adds many with a single history entry', () => {
    usePdfStore.getState().addAnnotations([rect('a'), rect('b'), rect('c')])
    expect(usePdfStore.getState().annotations).toHaveLength(3)
    usePdfStore.getState().undo()
    expect(usePdfStore.getState().annotations).toHaveLength(0)
  })

  it('shallow history snapshots are safe: updates never leak into past states', () => {
    // Bewegungs-Muster wie im Canvas: beginHistory + updateAnnotation.
    usePdfStore.getState().addAnnotation(rect('a'))
    usePdfStore.getState().beginHistory()
    usePdfStore.getState().updateAnnotation('a', { x: 50 })
    expect((usePdfStore.getState().annotations[0] as { x: number }).x).toBe(50)
    usePdfStore.getState().undo()
    expect((usePdfStore.getState().annotations[0] as { x: number }).x).toBe(0)
  })
})

describe('store: zoom + document', () => {
  it('clamps zoom to [0.25, 4]', () => {
    usePdfStore.getState().setZoom(100)
    expect(usePdfStore.getState().zoom).toBe(4)
    usePdfStore.getState().setZoom(0.01)
    expect(usePdfStore.getState().zoom).toBe(0.25)
  })

  it('setDocument clears annotations, history and marks clean', () => {
    usePdfStore.getState().addAnnotation(rect('a'))
    usePdfStore.getState().setDocument(new Uint8Array([1, 2, 3]), 'x.pdf')
    const st = usePdfStore.getState()
    expect(st.annotations).toHaveLength(0)
    expect(st.past).toHaveLength(0)
    expect(st.future).toHaveLength(0)
    expect(st.name).toBe('x.pdf')
    expect(st.dirty).toBe(false)
  })

  it('setCurrentOpacity clamps to [0,1]', () => {
    usePdfStore.getState().setCurrentOpacity(5)
    expect(usePdfStore.getState().currentOpacity).toBe(1)
    usePdfStore.getState().setCurrentOpacity(-1)
    expect(usePdfStore.getState().currentOpacity).toBe(0)
  })
})
