import { describe, it, expect } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { createBlankPdf } from './sample'
import { addWatermark, addPageNumbers, addHeaderFooter } from './decorate'

const count = async (bytes: Uint8Array): Promise<number> => (await PDFDocument.load(bytes)).getPageCount()

describe('decorate', () => {
  it('watermark preserves page count', async () => {
    expect(await count(await addWatermark(await createBlankPdf(2), { text: 'VERTRAULICH', opacity: 0.2, fontSize: 40 }))).toBe(2)
  })
  it('page numbers preserve page count', async () => {
    expect(await count(await addPageNumbers(await createBlankPdf(3)))).toBe(3)
  })
  it('header/footer preserves page count', async () => {
    expect(await count(await addHeaderFooter(await createBlankPdf(2), { header: 'H', footer: 'F' }))).toBe(2)
  })
})
