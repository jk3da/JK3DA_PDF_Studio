import { PDFDocument } from 'pdf-lib'
import { usePdfStore } from '../state/store'

type Img = { name: string; bytes: Uint8Array }

/** Erzeugt ein PDF, bei dem jede Seite ein Bild in Originalgröße ist. */
export async function createFromImages(images: Img[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  for (const img of images) {
    const isPng = img.name.toLowerCase().endsWith('.png') || img.bytes[0] === 0x89
    const embedded = isPng ? await doc.embedPng(img.bytes) : await doc.embedJpg(img.bytes)
    const page = doc.addPage([embedded.width, embedded.height])
    page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height })
  }
  return doc.save()
}

/** Öffnet Bilder und erstellt daraus ein neues PDF-Dokument. */
export async function openImagesAsPdf(): Promise<void> {
  const store = usePdfStore.getState()
  const imgs = await window.jk3da.openImages()
  if (!imgs || imgs.length === 0) return
  store.setStatus('Erzeuge PDF aus Bildern …')
  try {
    store.setDocument(await createFromImages(imgs), 'Aus Bildern.pdf')
    store.setStatus(`PDF aus ${imgs.length} Bild(ern) erstellt`)
  } catch (e) {
    store.setStatus(`Fehler: ${e instanceof Error ? e.message : String(e)}`)
  }
}
