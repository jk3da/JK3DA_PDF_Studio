import { pdfjs } from './pdfjs'
import { usePdfStore } from '../state/store'
import { flattenAnnotations } from './flatten'

/**
 * Echtes Drucken: Seiten (inkl. Annotationen) rastern und über ein
 * unsichtbares Fenster an den System-Druckdialog geben — statt die
 * dunkle App-UI mit window.print() zu drucken.
 */
export async function printDocument(): Promise<void> {
  const store = usePdfStore.getState()
  const { bytes, annotations } = store
  if (!bytes) return
  store.setStatus('Bereite Druck vor …')
  try {
    const flat = annotations.length ? await flattenAnnotations(bytes, annotations) : bytes
    const doc = await pdfjs.getDocument({ data: flat.slice(0) }).promise
    const imgs: string[] = []
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const vp = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(vp.width)
      canvas.height = Math.ceil(vp.height)
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvasContext: ctx, viewport: vp }).promise
      imgs.push(canvas.toDataURL('image/jpeg', 0.92))
      store.setStatus(`Bereite Druck vor … Seite ${i}/${doc.numPages}`)
    }
    await doc.destroy()

    const html =
      '<!doctype html><html><head><meta charset="utf-8"><style>' +
      '@page{margin:0}body{margin:0}' +
      'img{display:block;width:100%;page-break-after:always}img:last-child{page-break-after:auto}' +
      '</style></head><body>' +
      imgs.map((s) => `<img src="${s}">`).join('') +
      '</body></html>'

    const ok = await window.jk3da.printHtml(html)
    store.setStatus(ok ? 'Druckauftrag gesendet' : 'Drucken abgebrochen')
  } catch (e) {
    store.setStatus(`Fehler beim Drucken: ${e instanceof Error ? e.message : String(e)}`)
  }
}
