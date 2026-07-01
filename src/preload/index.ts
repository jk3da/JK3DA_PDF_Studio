import { contextBridge, ipcRenderer } from 'electron'
import {
  IPC,
  type OpenedPdf,
  type SavedPdf,
  type SavedBatch,
  type BatchFile,
  type EncryptRequest,
  type EncryptResult,
  type ImageInput
} from '../shared/types'

/**
 * Sichere, minimale API für den Renderer. Kein direkter Node-/IPC-Zugriff;
 * alles läuft über diese whitelist-artige Brücke (contextIsolation: true).
 */
const api = {
  /** Öffnet den nativen "PDF öffnen"-Dialog im Main-Prozess. */
  openPdf: (): Promise<OpenedPdf | null> => ipcRenderer.invoke(IPC.openPdf),
  /** Öffnet einen Mehrfach-Dialog für Bilder (PNG/JPG). */
  openImages: (): Promise<ImageInput[] | null> => ipcRenderer.invoke(IPC.openImages),
  /** Öffnet "Speichern unter" und schreibt die Bytes auf die Platte. */
  savePdf: (bytes: Uint8Array, defaultName?: string): Promise<SavedPdf | null> =>
    ipcRenderer.invoke(IPC.savePdf, { bytes, defaultName }),
  /** Wählt einen Zielordner und schreibt mehrere PDFs (z. B. Aufteilen). */
  savePdfBatch: (files: BatchFile[]): Promise<SavedBatch | null> =>
    ipcRenderer.invoke(IPC.savePdfBatch, { files }),
  /** Prüft, ob ein natives Sidecar (z. B. "qpdf") vorhanden ist. */
  toolAvailable: (name: string): Promise<boolean> => ipcRenderer.invoke(IPC.toolAvailable, name),
  /** Verschlüsselt das PDF via qpdf (falls vorhanden). */
  encryptPdf: (req: EncryptRequest): Promise<EncryptResult> =>
    ipcRenderer.invoke(IPC.encryptPdf, req),
  /** Fenster-Steuerung (eigene Titelleiste). */
  winMinimize: (): Promise<void> => ipcRenderer.invoke(IPC.winMinimize),
  winMaximizeToggle: (): Promise<boolean> => ipcRenderer.invoke(IPC.winMaximizeToggle),
  winClose: (): Promise<void> => ipcRenderer.invoke(IPC.winClose),
  winIsMaximized: (): Promise<boolean> => ipcRenderer.invoke(IPC.winIsMaximized),
  toggleFullscreen: (): Promise<boolean> => ipcRenderer.invoke(IPC.toggleFullscreen),
  /** Healthcheck-Roundtrip Renderer -> Main -> Renderer. */
  ping: (): Promise<string> => ipcRenderer.invoke(IPC.ping),
  /** App-Version aus dem Main-Prozess. */
  getVersion: (): Promise<string> => ipcRenderer.invoke(IPC.getVersion)
}

export type Jk3daApi = typeof api

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('jk3da', api)
} else {
  // Fallback (sollte bei contextIsolation: true nie eintreten).
  ;(globalThis as unknown as { jk3da: Jk3daApi }).jk3da = api
}
