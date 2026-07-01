import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'

/** Diagonales Wasserzeichen auf alle Seiten. */
export async function addWatermark(
  bytes: Uint8Array,
  opts: { text: string; opacity: number; fontSize: number }
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  const c = Math.cos(Math.PI / 4)
  const s = Math.sin(Math.PI / 4)
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize()
    const tw = font.widthOfTextAtSize(opts.text, opts.fontSize)
    page.drawText(opts.text, {
      x: width / 2 - (tw / 2) * c,
      y: height / 2 - (tw / 2) * s,
      size: opts.fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: opts.opacity,
      rotate: degrees(45)
    })
  }
  return doc.save()
}

/** Seitenzahlen "n / N" mittig unten. */
export async function addPageNumbers(bytes: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const pages = doc.getPages()
  const n = pages.length
  pages.forEach((page, i) => {
    const { width } = page.getSize()
    const label = `${i + 1} / ${n}`
    const size = 10
    const tw = font.widthOfTextAtSize(label, size)
    page.drawText(label, { x: width / 2 - tw / 2, y: 22, size, font, color: rgb(0.3, 0.3, 0.3) })
  })
  return doc.save()
}
