import { pdfjs as pdfjsLib } from './pdfjs'
import { PDFDocument } from 'pdf-lib'
import type { Annotation, BoxAnnotation } from '../annotations/types'
import { flattenAnnotations } from './flatten'
import { dataUrlToBytes } from '../bytes'

// Auflösung der gerasterten Seiten (2 ≈ 144 dpi). Höher = schärfer, aber größer.
const RASTER_SCALE = 2

/**
 * ECHTE Schwärzung: markierte Seiten werden gerastert, die Boxen dauerhaft
 * schwarz übermalt und die Seite durch dieses Bild ersetzt — der ursprüngliche
 * Text/Vektorinhalt ist danach nicht mehr im Dokument. Nicht markierte Seiten
 * bleiben unverändert (verlustfrei). Andere Annotationen werden vorher eingebacken.
 */
export async function applyRedaction(
  bytes: Uint8Array,
  annotations: Annotation[]
): Promise<Uint8Array> {
  const redactions = annotations.filter((a): a is BoxAnnotation => a.type === 'redact')
  const others = annotations.filter((a) => a.type !== 'redact')

  // Nichts zu schwärzen: nur die restlichen Annotationen einbacken.
  if (redactions.length === 0) return flattenAnnotations(bytes, annotations)

  const flat = others.length ? await flattenAnnotations(bytes, others) : bytes

  const marksByPage = new Map<number, BoxAnnotation[]>()
  for (const r of redactions) {
    const arr = marksByPage.get(r.page) ?? []
    arr.push(r)
    marksByPage.set(r.page, arr)
  }

  const src = await PDFDocument.load(flat)
  const dst = await PDFDocument.create()
  const pdfjsDoc = await pdfjsLib.getDocument({ data: flat.slice(0) }).promise

  const pageCount = src.getPageCount()
  for (let i = 0; i < pageCount; i++) {
    const marks = marksByPage.get(i + 1)
    if (!marks || marks.length === 0) {
      const [copied] = await dst.copyPages(src, [i])
      dst.addPage(copied)
      continue
    }

    const page = await pdfjsDoc.getPage(i + 1)
    const vp1 = page.getViewport({ scale: 1 })
    const vp = page.getViewport({ scale: RASTER_SCALE })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(vp.width)
    canvas.height = Math.ceil(vp.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) continue
    await page.render({ canvasContext: ctx, viewport: vp }).promise

    ctx.fillStyle = '#000000'
    for (const m of marks) {
      ctx.fillRect(m.x * RASTER_SCALE, m.y * RASTER_SCALE, m.w * RASTER_SCALE, m.h * RASTER_SCALE)
    }

    const bin = dataUrlToBytes(canvas.toDataURL('image/jpeg', 0.85))
    const img = await dst.embedJpg(bin)
    const newPage = dst.addPage([vp1.width, vp1.height])
    newPage.drawImage(img, { x: 0, y: 0, width: vp1.width, height: vp1.height })
  }

  await pdfjsDoc.destroy()
  return dst.save()
}
