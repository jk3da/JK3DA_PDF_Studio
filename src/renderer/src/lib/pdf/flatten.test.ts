import { describe, it, expect } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { createBlankPdf } from './sample'
import { flattenAnnotations } from './flatten'
import type { Annotation } from '../annotations/types'

const annos: Annotation[] = [
  { id: 't', page: 1, type: 'text', x: 50, y: 50, text: 'Hallo', color: '#e11d2a', fontSize: 14 },
  { id: 'h', page: 1, type: 'highlight', x: 50, y: 100, w: 100, h: 12, color: '#ffd400', strokeWidth: 2, opacity: 0.4 },
  { id: 'r', page: 1, type: 'rect', x: 50, y: 150, w: 80, h: 40, color: '#3b82f6', strokeWidth: 2 },
  { id: 'e', page: 2, type: 'ellipse', x: 60, y: 60, w: 100, h: 60, color: '#15a34a', strokeWidth: 2 },
  { id: 'l', page: 2, type: 'line', x1: 10, y1: 10, x2: 100, y2: 100, color: '#000', strokeWidth: 2, arrow: true },
  { id: 'm', page: 2, type: 'line', x1: 10, y1: 200, x2: 200, y2: 200, color: '#000', strokeWidth: 1, measure: true },
  { id: 'd', page: 1, type: 'draw', points: [{ x: 0, y: 0 }, { x: 10, y: 10 }], color: '#000', strokeWidth: 2 },
  { id: 'n', page: 1, type: 'note', x: 200, y: 200, text: 'Notiz', color: '#ffd400' },
  { id: 's', page: 2, type: 'stamp', x: 100, y: 300, w: 120, h: 36, label: 'GENEHMIGT', color: '#15a34a' },
  { id: 'a', page: 2, type: 'measure-area', x: 20, y: 400, w: 100, h: 50, color: '#3b82f6', strokeWidth: 1 }
]

describe('flattenAnnotations', () => {
  it('produces a valid PDF with the same page count', async () => {
    const out = await flattenAnnotations(await createBlankPdf(2), annos)
    const doc = await PDFDocument.load(out)
    expect(doc.getPageCount()).toBe(2)
    expect(new TextDecoder().decode(out.slice(0, 5))).toBe('%PDF-')
  })

  it('does not mutate the input bytes', async () => {
    const pdf = await createBlankPdf(1)
    const before = pdf.slice()
    await flattenAnnotations(pdf, [{ id: 't', page: 1, type: 'text', x: 1, y: 1, text: 'x', color: '#000', fontSize: 12 }])
    expect(pdf).toEqual(before)
  })

  it('ignores annotations on non-existent pages', async () => {
    const out = await flattenAnnotations(await createBlankPdf(1), [
      { id: 'r', page: 9, type: 'rect', x: 0, y: 0, w: 10, h: 10, color: '#000', strokeWidth: 2 }
    ])
    expect((await PDFDocument.load(out)).getPageCount()).toBe(1)
  })
})
