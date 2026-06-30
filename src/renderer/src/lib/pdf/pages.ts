import { PDFDocument, degrees } from 'pdf-lib'

/**
 * Baut ein neues PDF aus einer Reihenfolge von Quell-Seitenindizes (0-basiert).
 * Deckt Reorder, Löschen (Indizes weglassen), Duplizieren (Index wiederholen)
 * und Extrahieren (Teilmenge) in einem ab.
 */
export async function buildFromOrder(bytes: Uint8Array, order: number[]): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const dst = await PDFDocument.create()
  const valid = order.filter((i) => i >= 0 && i < src.getPageCount())
  const copied = await dst.copyPages(src, valid)
  copied.forEach((p) => dst.addPage(p))
  return dst.save()
}

async function pageCount(bytes: Uint8Array): Promise<number> {
  const doc = await PDFDocument.load(bytes)
  return doc.getPageCount()
}

/** Löscht die angegebenen Seiten (0-basiert). */
export async function deletePages(bytes: Uint8Array, indices: number[]): Promise<Uint8Array> {
  const n = await pageCount(bytes)
  const drop = new Set(indices)
  const order = Array.from({ length: n }, (_, i) => i).filter((i) => !drop.has(i))
  if (order.length === 0) throw new Error('Mindestens eine Seite muss übrig bleiben.')
  return buildFromOrder(bytes, order)
}

/** Verschiebt eine Seite von from nach to (0-basiert). */
export async function movePage(bytes: Uint8Array, from: number, to: number): Promise<Uint8Array> {
  const n = await pageCount(bytes)
  const order = Array.from({ length: n }, (_, i) => i)
  const [moved] = order.splice(from, 1)
  order.splice(to, 0, moved)
  return buildFromOrder(bytes, order)
}

/** Setzt eine komplett neue Reihenfolge (Permutation der Indizes). */
export async function reorderPages(bytes: Uint8Array, order: number[]): Promise<Uint8Array> {
  return buildFromOrder(bytes, order)
}

/** Dupliziert eine Seite (die Kopie folgt direkt dahinter). */
export async function duplicatePage(bytes: Uint8Array, index: number): Promise<Uint8Array> {
  const n = await pageCount(bytes)
  const order: number[] = []
  for (let i = 0; i < n; i++) {
    order.push(i)
    if (i === index) order.push(i)
  }
  return buildFromOrder(bytes, order)
}

/** Extrahiert die angegebenen Seiten in ein neues PDF. */
export async function extractPages(bytes: Uint8Array, indices: number[]): Promise<Uint8Array> {
  if (indices.length === 0) throw new Error('Keine Seiten ausgewählt.')
  return buildFromOrder(bytes, indices)
}

/** Dreht Seiten in-place um delta Grad (90er-Schritte), 0..360 normalisiert. */
export async function rotatePages(
  bytes: Uint8Array,
  indices: number[],
  delta: number
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const pages = doc.getPages()
  for (const i of indices) {
    const p = pages[i]
    if (!p) continue
    const next = (((p.getRotation().angle + delta) % 360) + 360) % 360
    p.setRotation(degrees(next))
  }
  return doc.save()
}

/** Fügt an Position atIndex eine leere Seite ein (Größe = Referenzseite oder A4). */
export async function insertBlankPage(
  bytes: Uint8Array,
  atIndex: number,
  size?: { width: number; height: number }
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const count = doc.getPageCount()
  const ref = doc.getPage(Math.min(Math.max(atIndex - 1, 0), count - 1))
  const dim = size ?? (ref ? { width: ref.getWidth(), height: ref.getHeight() } : { width: 595.28, height: 841.89 })
  const clamped = Math.min(Math.max(atIndex, 0), count)
  doc.insertPage(clamped, [dim.width, dim.height])
  return doc.save()
}

/** Hängt ein weiteres PDF hinten an. */
export async function appendPdf(bytes: Uint8Array, other: Uint8Array): Promise<Uint8Array> {
  return mergePdfs([bytes, other])
}

/** Führt mehrere PDFs in der angegebenen Reihenfolge zusammen. */
export async function mergePdfs(list: Uint8Array[]): Promise<Uint8Array> {
  const dst = await PDFDocument.create()
  for (const b of list) {
    const src = await PDFDocument.load(b)
    const copied = await dst.copyPages(src, src.getPageIndices())
    copied.forEach((p) => dst.addPage(p))
  }
  return dst.save()
}

/** Teilt das PDF in einzelne Ein-Seiten-PDFs. */
export async function splitToSinglePages(
  bytes: Uint8Array
): Promise<Array<{ index: number; bytes: Uint8Array }>> {
  const src = await PDFDocument.load(bytes)
  const out: Array<{ index: number; bytes: Uint8Array }> = []
  for (let i = 0; i < src.getPageCount(); i++) {
    const d = await PDFDocument.create()
    const [pg] = await d.copyPages(src, [i])
    d.addPage(pg)
    out.push({ index: i, bytes: await d.save() })
  }
  return out
}
