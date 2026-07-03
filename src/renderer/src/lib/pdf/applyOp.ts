import { usePdfStore } from '../state/store'
import { flattenAnnotations } from './flatten'

/**
 * Liefert die aktuellen Bytes; vorhandene Annotationen werden zuerst
 * eingebacken, damit sie bei Dokument-Operationen erhalten bleiben.
 */
export async function currentFlatBytes(): Promise<Uint8Array | null> {
  const { bytes, annotations } = usePdfStore.getState()
  if (!bytes) return null
  return annotations.length > 0 ? flattenAnnotations(bytes, annotations) : bytes
}

/** Führt eine Dokument-Operation aus, lädt das Ergebnis und meldet den Status. */
export async function applyToDocument(
  label: string,
  op: (bytes: Uint8Array) => Promise<Uint8Array>
): Promise<void> {
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
