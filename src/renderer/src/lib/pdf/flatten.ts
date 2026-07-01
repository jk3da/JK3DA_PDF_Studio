import { PDFDocument, StandardFonts, rgb, type RGB } from 'pdf-lib'
import type { Annotation } from '../annotations/types'

function hexToRgb(hex: string): RGB {
  const m = hex.replace('#', '')
  const r = parseInt(m.slice(0, 2), 16) / 255
  const g = parseInt(m.slice(2, 4), 16) / 255
  const b = parseInt(m.slice(4, 6), 16) / 255
  return rgb(
    Number.isFinite(r) ? r : 0,
    Number.isFinite(g) ? g : 0,
    Number.isFinite(b) ? b : 0
  )
}

/**
 * Backt alle Annotationen dauerhaft in eine Kopie des PDFs.
 * Eingabe-Bytes bleiben unangetastet; gibt neue Bytes zurück.
 */
export async function flattenAnnotations(
  bytes: Uint8Array,
  annotations: Annotation[]
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(bytes)
  const helv = await pdf.embedFont(StandardFonts.Helvetica)
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const pages = pdf.getPages()

  for (const a of annotations) {
    const page = pages[a.page - 1]
    if (!page) continue
    const ph = page.getHeight()
    const color = hexToRgb('color' in a ? a.color : '#000000')

    switch (a.type) {
      case 'text': {
        page.drawText(a.text, {
          x: a.x,
          y: ph - a.y - a.fontSize,
          size: a.fontSize,
          font: helv,
          color,
          lineHeight: a.fontSize * 1.2
        })
        break
      }
      case 'highlight': {
        page.drawRectangle({
          x: a.x,
          y: ph - a.y - a.h,
          width: a.w,
          height: a.h,
          color,
          opacity: 0.35
        })
        break
      }
      case 'rect': {
        page.drawRectangle({
          x: a.x,
          y: ph - a.y - a.h,
          width: a.w,
          height: a.h,
          borderColor: color,
          borderWidth: a.strokeWidth
        })
        break
      }
      case 'note': {
        const size = 18
        page.drawRectangle({
          x: a.x,
          y: ph - a.y - size,
          width: size,
          height: size,
          color: hexToRgb('#ffd400'),
          borderColor: rgb(0.6, 0.5, 0),
          borderWidth: 1
        })
        page.drawText('!', {
          x: a.x + 6,
          y: ph - a.y - size + 4,
          size: 13,
          font: helvBold,
          color: rgb(0.3, 0.25, 0)
        })
        if (a.text.trim()) {
          page.drawText(a.text.slice(0, 120), {
            x: a.x + size + 4,
            y: ph - a.y - 12,
            size: 9,
            font: helv,
            color: rgb(0.2, 0.2, 0.2),
            maxWidth: 200,
            lineHeight: 11
          })
        }
        break
      }
      case 'draw':
      case 'signature': {
        for (let i = 0; i < a.points.length - 1; i++) {
          const p1 = a.points[i]
          const p2 = a.points[i + 1]
          page.drawLine({
            start: { x: p1.x, y: ph - p1.y },
            end: { x: p2.x, y: ph - p2.y },
            thickness: a.strokeWidth,
            color
          })
        }
        break
      }
      case 'stamp': {
        page.drawRectangle({
          x: a.x,
          y: ph - a.y - a.h,
          width: a.w,
          height: a.h,
          borderColor: color,
          borderWidth: 2,
          color,
          opacity: 0.08
        })
        const size = Math.min(a.h * 0.5, 20)
        const textWidth = helvBold.widthOfTextAtSize(a.label, size)
        page.drawText(a.label, {
          x: a.x + (a.w - textWidth) / 2,
          y: ph - a.y - a.h / 2 - size / 2,
          size,
          font: helvBold,
          color
        })
        break
      }
      case 'image': {
        const bin = dataUrlToBytes(a.dataUrl)
        const isPng = a.dataUrl.startsWith('data:image/png')
        const img = isPng ? await pdf.embedPng(bin) : await pdf.embedJpg(bin)
        page.drawImage(img, { x: a.x, y: ph - a.y - a.h, width: a.w, height: a.h })
        break
      }
    }
  }

  return pdf.save()
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const bin = atob(base64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
