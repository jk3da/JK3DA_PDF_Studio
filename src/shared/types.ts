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

/** Ergebnis eines "Speichern unter"-Dialogs. */
export interface SavedPdf {
  path: string
  name: string
}

/** Ergebnis eines Batch-Exports in einen Ordner. */
export interface SavedBatch {
  dir: string
  count: number
}

/** Eine Datei für den Batch-Export. */
export interface BatchFile {
  name: string
  bytes: Uint8Array
}

/** Berechtigungen für die Verschlüsselung. */
export interface EncryptPermissions {
  print: boolean
  modify: boolean
  copy: boolean
}

export interface EncryptRequest {
  bytes: Uint8Array
  userPassword: string
  ownerPassword: string
  permissions: EncryptPermissions
}

export type EncryptResult = { ok: true; bytes: Uint8Array } | { ok: false; error: string }

/** IPC-Kanalnamen zentral, damit Main und Preload sich nicht vertippen. */
export const IPC = {
  openPdf: 'dialog:openPdf',
  savePdf: 'dialog:savePdf',
  savePdfBatch: 'dialog:savePdfBatch',
  toolAvailable: 'sidecar:toolAvailable',
  encryptPdf: 'sidecar:encryptPdf',
  winMinimize: 'win:minimize',
  winMaximizeToggle: 'win:maximizeToggle',
  winClose: 'win:close',
  winIsMaximized: 'win:isMaximized',
  toggleFullscreen: 'win:toggleFullscreen',
  ping: 'app:ping',
  getVersion: 'app:getVersion'
} as const
