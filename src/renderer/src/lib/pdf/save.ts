import { usePdfStore } from '../state/store'
import { flattenAnnotations } from './flatten'

/**
 * Backt die Annotationen ins PDF und bietet "Speichern unter" an.
 * Überschreibt nie das Original (verlustfreies Arbeitsprinzip).
 */
export async function saveCurrentDocument(): Promise<void> {
  const { bytes, annotations, name, setStatus, setDirty } = usePdfStore.getState()
  if (!bytes) return
  // Redaction ist heilig: nicht angewendete Schwärzungen werden beim normalen
  // Speichern NICHT eingebrannt (Inhalt bliebe lesbar) — davor warnen.
  if (annotations.some((a) => a.type === 'redact')) {
    const ok = window.confirm(
      'Es gibt nicht angewendete Schwärzungen.\n\nBeim normalen Speichern werden sie NICHT angewendet — der Inhalt darunter bliebe lesbar.\n\nTrotzdem ohne Schwärzung speichern?\n(Abbrechen, um zuerst „Schwärzen anwenden" zu nutzen.)'
    )
    if (!ok) {
      setStatus('Abgebrochen — bitte zuerst „Schwärzen anwenden".')
      return
    }
  }
  setStatus('Backe Annotationen …')
  try {
    const out = await flattenAnnotations(bytes, annotations)
    const base = (name ?? 'dokument').replace(/\.pdf$/i, '')
    const saved = await window.jk3da.savePdf(out, `${base}-bearbeitet.pdf`)
    setStatus(saved ? `Gespeichert: ${saved.name}` : 'Speichern abgebrochen')
    if (saved) setDirty(false)
  } catch (e) {
    setStatus(`Fehler beim Speichern: ${e instanceof Error ? e.message : String(e)}`)
  }
}
