import { usePdfStore } from '../state/store'
import { flattenAnnotations } from './flatten'

const MISSING = 'Ghostscript (gswin64c.exe) fehlt in resources/bin/win/.'

export type CompressQuality = 'screen' | 'ebook' | 'printer' | 'prepress'

export async function compressDocument(quality: CompressQuality): Promise<void> {
  const store = usePdfStore.getState()
  const { bytes, annotations } = store
  if (!bytes) return
  store.setStatus('Komprimiere …')
  try {
    const flat = annotations.length ? await flattenAnnotations(bytes, annotations) : bytes
    const res = await window.jk3da.compressPdf(flat, quality)
    if (!res.ok) {
      store.setStatus(res.error === 'gswin64c-missing' ? MISSING : `Fehler: ${res.error}`)
      return
    }
    const before = flat.length / 1e6
    const after = res.bytes.length / 1e6
    store.replaceBytes(res.bytes)
    store.setStatus(`Komprimiert: ${before.toFixed(1)} → ${after.toFixed(1)} MB`)
  } catch (e) {
    store.setStatus(`Fehler: ${e instanceof Error ? e.message : String(e)}`)
  }
}
