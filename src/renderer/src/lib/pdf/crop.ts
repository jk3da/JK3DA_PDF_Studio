import { PDFDocument } from 'pdf-lib'
import { usePdfStore } from '../state/store'
import { flattenAnnotations } from './flatten'
import type { Annotation, BoxAnnotation } from '../annotations/types'

/** Wendet Zuschneide-Rahmen als CropBox der jeweiligen Seite an. */
export async function applyCrop(bytes: Uint8Array, annotations: Annotation[]): Promise<Uint8Array> {
  const crops = annotations.filter((a): a is BoxAnnotation => a.type === 'crop')
  if (crops.length === 0) return flattenAnnotations(bytes, annotations)

  const others = annotations.filter((a) => a.type !== 'crop')
  const flat = others.length ? await flattenAnnotations(bytes, others) : bytes

  const doc = await PDFDocument.load(flat)
  const pages = doc.getPages()
  for (const c of crops) {
    const page = pages[c.page - 1]
    if (!page) continue
    const pw = page.getWidth()
    const ph = page.getHeight()
    const x = Math.max(0, Math.min(c.x, pw))
    const yTop = Math.max(0, Math.min(c.y, ph))
    const w = Math.max(1, Math.min(c.w, pw - x))
    const h = Math.max(1, Math.min(c.h, ph - yTop))
    // PDF-Ursprung unten-links:
    page.setCropBox(x, ph - yTop - h, w, h)
  }
  return doc.save()
}

/** Controller: schneidet zu und lädt das Ergebnis. */
export async function applyCropToDoc(): Promise<void> {
  const { bytes, annotations, setStatus, replaceBytes } = usePdfStore.getState()
  if (!bytes) return
  if (!annotations.some((a) => a.type === 'crop')) {
    setStatus('Kein Zuschneide-Rahmen gesetzt.')
    return
  }
  setStatus('Zuschneiden …')
  try {
    replaceBytes(await applyCrop(bytes, annotations))
    setStatus('Zugeschnitten ✓')
  } catch (e) {
    setStatus(`Fehler: ${e instanceof Error ? e.message : String(e)}`)
  }
}
