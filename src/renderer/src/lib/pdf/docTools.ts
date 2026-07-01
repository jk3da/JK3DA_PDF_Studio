import { usePdfStore } from '../state/store'
import { flattenAnnotations } from './flatten'
import { addWatermark, addPageNumbers } from './decorate'

async function currentFlatBytes(): Promise<Uint8Array | null> {
  const { bytes, annotations } = usePdfStore.getState()
  if (!bytes) return null
  return annotations.length ? flattenAnnotations(bytes, annotations) : bytes
}

async function apply(label: string, op: (b: Uint8Array) => Promise<Uint8Array>): Promise<void> {
  const store = usePdfStore.getState()
  const flat = await currentFlatBytes()
  if (!flat) return
  store.setStatus(`${label} …`)
  try {
    store.replaceBytes(await op(flat))
    store.setStatus(`${label} ✓`)
  } catch (e) {
    store.setStatus(`Fehler: ${e instanceof Error ? e.message : String(e)}`)
  }
}

export const docTools = {
  watermark: (opts: { text: string; opacity: number; fontSize: number }): Promise<void> =>
    apply('Wasserzeichen', (b) => addWatermark(b, opts)),
  pageNumbers: (): Promise<void> => apply('Seitenzahlen', (b) => addPageNumbers(b))
}
