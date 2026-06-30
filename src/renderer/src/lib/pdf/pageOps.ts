import { usePdfStore } from '../state/store'
import { flattenAnnotations } from './flatten'
import * as P from './pages'

/**
 * Liefert die aktuellen Bytes; sind Annotationen vorhanden, werden sie zuerst
 * eingebacken, damit sie bei Seiten-Operationen an ihren Seiten bleiben.
 */
async function currentFlatBytes(): Promise<Uint8Array | null> {
  const { bytes, annotations } = usePdfStore.getState()
  if (!bytes) return null
  return annotations.length > 0 ? flattenAnnotations(bytes, annotations) : bytes
}

/** Führt eine in-place Seiten-Operation aus und lädt das Ergebnis. */
async function apply(label: string, op: (bytes: Uint8Array) => Promise<Uint8Array>): Promise<void> {
  const store = usePdfStore.getState()
  const flat = await currentFlatBytes()
  if (!flat) return
  store.setStatus(`${label} …`)
  try {
    const out = await op(flat)
    store.replaceBytes(out)
    store.setStatus(`${label} ✓`)
  } catch (e) {
    store.setStatus(`Fehler: ${e instanceof Error ? e.message : String(e)}`)
  }
}

export const pageOps = {
  rotate: (index: number, delta: number): Promise<void> =>
    apply(delta < 0 ? 'Links drehen' : 'Rechts drehen', (b) => P.rotatePages(b, [index], delta)),

  rotateAll: (delta: number): Promise<void> => {
    const n = usePdfStore.getState().numPages
    const all = Array.from({ length: n }, (_, i) => i)
    return apply('Alle drehen', (b) => P.rotatePages(b, all, delta))
  },

  remove: (index: number): Promise<void> =>
    apply('Seite löschen', (b) => P.deletePages(b, [index])),

  duplicate: (index: number): Promise<void> =>
    apply('Duplizieren', (b) => P.duplicatePage(b, index)),

  insertBlankAfter: (index: number): Promise<void> =>
    apply('Leerseite einfügen', (b) => P.insertBlankPage(b, index + 1)),

  move: (from: number, to: number): Promise<void> => {
    if (from === to) return Promise.resolve()
    return apply('Verschieben', (b) => P.movePage(b, from, to))
  },

  reorder: (order: number[]): Promise<void> => apply('Neu anordnen', (b) => P.reorderPages(b, order)),

  async mergeFile(): Promise<void> {
    const other = await window.jk3da.openPdf()
    if (!other) return
    await apply(`Anfügen: ${other.name}`, (b) => P.appendPdf(b, other.bytes))
  },

  async extract(indices: number[]): Promise<void> {
    const store = usePdfStore.getState()
    const flat = await currentFlatBytes()
    if (!flat) return
    store.setStatus('Extrahiere …')
    try {
      const out = await P.extractPages(flat, indices)
      const saved = await window.jk3da.savePdf(out, 'extrahiert.pdf')
      store.setStatus(saved ? `Extrahiert: ${saved.name}` : 'Abgebrochen')
    } catch (e) {
      store.setStatus(`Fehler: ${e instanceof Error ? e.message : String(e)}`)
    }
  },

  async splitAll(): Promise<void> {
    const store = usePdfStore.getState()
    const flat = await currentFlatBytes()
    if (!flat) return
    store.setStatus('Teile in Einzelseiten …')
    try {
      const parts = await P.splitToSinglePages(flat)
      const base = (store.name ?? 'dokument').replace(/\.pdf$/i, '')
      const files = parts.map((p) => ({
        name: `${base}-Seite-${String(p.index + 1).padStart(3, '0')}.pdf`,
        bytes: p.bytes
      }))
      const res = await window.jk3da.savePdfBatch(files)
      store.setStatus(res ? `${res.count} Seiten in Ordner gespeichert` : 'Abgebrochen')
    } catch (e) {
      store.setStatus(`Fehler: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
}
