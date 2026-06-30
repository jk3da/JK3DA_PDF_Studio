// Typen, die zwischen Main-, Preload- und Renderer-Prozess geteilt werden.

/** Ergebnis eines "Datei öffnen"-Dialogs aus dem Main-Prozess. */
export interface OpenedPdf {
  /** Absoluter Pfad der geöffneten Datei. */
  path: string
  /** Reiner Dateiname (z. B. "rechnung.pdf"). */
  name: string
  /** Roh-Bytes der PDF-Datei. */
  bytes: Uint8Array
}

/** IPC-Kanalnamen zentral, damit Main und Preload sich nicht vertippen. */
export const IPC = {
  openPdf: 'dialog:openPdf',
  ping: 'app:ping',
  getVersion: 'app:getVersion'
} as const
