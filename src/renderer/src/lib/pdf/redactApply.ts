import { usePdfStore } from '../state/store'
import { applyRedaction } from './redact'

/** Wendet alle markierten Schwärzungen dauerhaft an (mit Rückfrage). */
export async function applyRedactionToDoc(): Promise<void> {
  const { bytes, annotations, setStatus, replaceBytes } = usePdfStore.getState()
  if (!bytes) return
  if (!annotations.some((a) => a.type === 'redact')) {
    setStatus('Keine Schwärzungen markiert.')
    return
  }
  const ok = window.confirm(
    'Schwärzungen jetzt dauerhaft anwenden?\n\nDer Inhalt unter den Markierungen wird unwiderruflich entfernt (betroffene Seiten werden gerastert).'
  )
  if (!ok) return
  setStatus('Wende Schwärzungen an …')
  try {
    const out = await applyRedaction(bytes, annotations)
    replaceBytes(out)
    setStatus('Schwärzungen angewendet ✓')
  } catch (e) {
    setStatus(`Fehler: ${e instanceof Error ? e.message : String(e)}`)
  }
}
