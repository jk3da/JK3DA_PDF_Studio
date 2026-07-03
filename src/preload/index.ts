import { contextBridge, ipcRenderer } from 'electron'
import {
  IPC,
  type OpenedPdf,
  type SavedPdf,
  type SavedBatch,
  type BatchFile,
  type EncryptRequest,
  type EncryptResult,
  type ImageInput,
  type CompressResult,
  type OfficeResult,
  type OcrRequest,
  type OcrResult
} from '../shared/types'

/**
 * Sichere, minimale API für den Renderer. Kein direkter Node-/IPC-Zugriff;
 * alles läuft über diese whitelist-artige Brücke (contextIsolation: true).
 */
const api = {
  /** Öffnet den nativen "PDF öffnen"-Dialog im Main-Prozess. */
  openPdf: (): Promise<OpenedPdf | null> => ipcRenderer.invoke(IPC.openPdf),
  /** Lädt eine PDF direkt von einem Pfad (Zuletzt verwendet). */
  openPdfPath: (path: string): Promise<OpenedPdf | null> =>
    ipcRenderer.invoke(IPC.openPdfPath, path),
  /** Abo für "Datei von außen geöffnet" (Doppelklick / zweite Instanz). */
  onOpenFile: (cb: (f: OpenedPdf) => void): (() => void) => {
    const handler = (_e: unknown, f: OpenedPdf): void => cb(f)
    ipcRenderer.on(IPC.openFileEvent, handler)
    return () => {
      ipcRenderer.removeListener(IPC.openFileEvent, handler)
    }
  },
  /** Meldet ungespeicherte Änderungen an den Main-Prozess (Schließen-Schutz). */
  setDirtyFlag: (d: boolean): void => {
    ipcRenderer.send(IPC.setDirty, d)
  },
  /** Druckt fertiges HTML über ein unsichtbares Fenster + System-Dialog. */
  printHtml: (html: string): Promise<boolean> => ipcRenderer.invoke(IPC.printHtml, html),
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
  /** Komprimiert das PDF via Ghostscript. */
  compressPdf: (bytes: Uint8Array, quality: string): Promise<CompressResult> =>
    ipcRenderer.invoke(IPC.compressPdf, { bytes, quality }),
  /** Konvertiert eine gewählte Office-Datei zu PDF via LibreOffice. */
  convertOfficeToPdf: (): Promise<OfficeResult> => ipcRenderer.invoke(IPC.convertOfficeToPdf),
  /** OCR pro Bild -> durchsuchbare Ein-Seiten-PDFs via Tesseract. */
  ocrImages: (req: OcrRequest): Promise<OcrResult> => ipcRenderer.invoke(IPC.ocrImages, req),
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
