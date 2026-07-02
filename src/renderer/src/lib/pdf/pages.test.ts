import { describe, it, expect } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { createBlankPdf } from './sample'
import {
  deletePages,
  movePage,
  duplicatePage,
  rotatePages,
  insertBlankPage,
  mergePdfs,
  splitToSinglePages,
  extractPages
} from './pages'

const count = async (bytes: Uint8Array): Promise<number> => (await PDFDocument.load(bytes)).getPageCount()

describe('pages', () => {
  it('deletePages removes the given page', async () => {
    expect(await count(await deletePages(await createBlankPdf(3), [1]))).toBe(2)
  })
  it('deletePages refuses to empty the document', async () => {
    await expect(deletePages(await createBlankPdf(1), [0])).rejects.toThrow()
  })
  it('duplicatePage adds one page', async () => {
    expect(await count(await duplicatePage(await createBlankPdf(2), 0))).toBe(3)
  })
  it('insertBlankPage adds one page', async () => {
    expect(await count(await insertBlankPage(await createBlankPdf(2), 1))).toBe(3)
  })
  it('extractPages keeps only the subset', async () => {
    expect(await count(await extractPages(await createBlankPdf(5), [0, 2]))).toBe(2)
  })
  it('mergePdfs concatenates', async () => {
    expect(await count(await mergePdfs([await createBlankPdf(2), await createBlankPdf(3)]))).toBe(5)
  })
  it('splitToSinglePages yields one-page docs', async () => {
    const parts = await splitToSinglePages(await createBlankPdf(4))
    expect(parts).toHaveLength(4)
    expect(await count(parts[0].bytes)).toBe(1)
  })
  it('movePage preserves the page count', async () => {
    expect(await count(await movePage(await createBlankPdf(3), 0, 2))).toBe(3)
  })
  it('rotatePages rotates only the targeted page', async () => {
    const doc = await PDFDocument.load(await rotatePages(await createBlankPdf(2), [0], 90))
    expect(doc.getPage(0).getRotation().angle).toBe(90)
    expect(doc.getPage(1).getRotation().angle).toBe(0)
  })
  it('rotatePages normalizes to 0..360', async () => {
    const doc = await PDFDocument.load(await rotatePages(await createBlankPdf(1), [0], -90))
    expect(doc.getPage(0).getRotation().angle).toBe(270)
  })
})
