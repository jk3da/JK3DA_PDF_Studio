import { pdfjs as pdfjsLib } from './pdfjs'
import { usePdfStore } from '../state/store'
import { flattenAnnotations } from './flatten'
import { mergePdfs } from './pages'
import { dataUrlToBytes } from '../bytes'

const MISSING = 'Tesseract (tesseract.exe + tessdata) fehlt in resources/bin/win/.'

/** Rendert Seiten zu Bildern, lässt Tesseract je Seite eine durchsuchbare PDF bauen, merged. */
export async function runOcr(lang: string): Promise<void> {
  const store = usePdfStore.getState()
  const { bytes, annotations } = store
  if (!bytes) return
  store.setStatus('OCR: rendere Seiten …')
  try {
    const flat = annotations.length ? await flattenAnnotations(bytes, annotations) : bytes
    const doc = await pdfjsLib.getDocument({ data: flat.slice(0) }).promise
    const images: { bytes: Uint8Array }[] = []
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const vp = page.getViewport({ scale: 2 })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(vp.width)
      canvas.height = Math.ceil(vp.height)
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvasContext: ctx, viewport: vp }).promise
      images.push({ bytes: dataUrlToBytes(canvas.toDataURL('image/png')) })
      store.setStatus(`OCR: Seite ${i}/${doc.numPages} gerendert …`)
    }
    await doc.destroy()

    store.setStatus('OCR läuft (Tesseract) …')
    const res = await window.jk3da.ocrImages({ images, lang })
    if (!res.ok) {
      store.setStatus(res.error === 'tesseract-missing' ? MISSING : `Fehler: ${res.error}`)
      return
    }
    store.replaceBytes(await mergePdfs(res.pages))
    store.setStatus(`OCR fertig (${lang}) · durchsuchbar`)
  } catch (e) {
    store.setStatus(`Fehler: ${e instanceof Error ? e.message : String(e)}`)
  }
}
