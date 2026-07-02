import { describe, it, expect } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { createBlankPdf } from './sample'
import { applyCrop } from './crop'
import type { Annotation } from '../annotations/types'

describe('applyCrop', () => {
  it('sets the CropBox on the marked page (top-left → PDF coords)', async () => {
    const crop: Annotation = { id: 'c', page: 1, type: 'crop', x: 50, y: 50, w: 200, h: 300, color: '#3b82f6', strokeWidth: 1 }
    const doc = await PDFDocument.load(await applyCrop(await createBlankPdf(2), [crop]))
    const cb = doc.getPage(0).getCropBox()
    expect(Math.round(cb.width)).toBe(200)
    expect(Math.round(cb.height)).toBe(300)
    expect(Math.round(cb.x)).toBe(50)
    expect(Math.round(cb.y)).toBe(Math.round(841.89 - 50 - 300))
  })

  it('with no crop marks just flattens (page count kept)', async () => {
    const out = await applyCrop(await createBlankPdf(3), [])
    expect((await PDFDocument.load(out)).getPageCount()).toBe(3)
  })
})
