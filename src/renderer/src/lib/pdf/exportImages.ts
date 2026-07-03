import { pdfjs as pdfjsLib } from './pdfjs'
import { usePdfStore } from '../state/store'
import { flattenAnnotations } from './flatten'
import { dataUrlToBytes } from '../bytes'

/** Rendert jede Seite (inkl. Annotationen) und speichert sie als PNG/JPG in einen Ordner. */
export async function exportToImages(format: 'png' | 'jpeg', scale = 2): Promise<void> {
  const store = usePdfStore.getState()
  const { bytes, annotations, name } = store
  if (!bytes) return
  store.setStatus('Rendere Seiten …')
  try {
    const flat = annotations.length ? await flattenAnnotations(bytes, annotations) : bytes
    const doc = await pdfjsLib.getDocument({ data: flat.slice(0) }).promise
    const base = (name ?? 'dokument').replace(/\.pdf$/i, '')
    const ext = format === 'png' ? 'png' : 'jpg'
    const files: { name: string; bytes: Uint8Array }[] = []
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const vp = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(vp.width)
      canvas.height = Math.ceil(vp.height)
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      if (format === 'jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      await page.render({ canvasContext: ctx, viewport: vp }).promise
      const url = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.9)
      files.push({ name: `${base}-Seite-${String(i).padStart(3, '0')}.${ext}`, bytes: dataUrlToBytes(url) })
    }
    await doc.destroy()
    const res = await window.jk3da.savePdfBatch(files)
    store.setStatus(res ? `${res.count} Bild(er) gespeichert` : 'Abgebrochen')
  } catch (e) {
    store.setStatus(`Fehler: ${e instanceof Error ? e.message : String(e)}`)
  }
}
