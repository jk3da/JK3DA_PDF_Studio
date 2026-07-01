import { usePdfStore } from '../state/store'

const MISSING = 'LibreOffice (soffice.exe) fehlt in resources/bin/win/.'

/** Öffnet eine Office-Datei und lädt sie als PDF (LibreOffice). */
export async function importOfficeAsPdf(): Promise<void> {
  const store = usePdfStore.getState()
  store.setStatus('Konvertiere Office → PDF …')
  try {
    const res = await window.jk3da.convertOfficeToPdf()
    if (!res.ok) {
      if (res.error === 'canceled') store.setStatus('Bereit')
      else store.setStatus(res.error === 'soffice-missing' ? MISSING : `Fehler: ${res.error}`)
      return
    }
    store.setDocument(res.bytes, res.name)
    store.setStatus(`Importiert: ${res.name}`)
  } catch (e) {
    store.setStatus(`Fehler: ${e instanceof Error ? e.message : String(e)}`)
  }
}
