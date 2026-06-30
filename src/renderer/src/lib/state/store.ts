import { create } from 'zustand'

export type ToolId =
  | 'select'
  | 'text'
  | 'highlight'
  | 'rectangle'
  | 'note'
  | 'signature'
  | 'stamp'

export const MIN_ZOOM = 0.25
export const MAX_ZOOM = 4

interface PdfState {
  /** Roh-Bytes des aktuell geladenen Dokuments (oder null = leer). */
  bytes: Uint8Array | null
  /** Anzeigename des Dokuments. */
  name: string | null
  /** Quellpfad auf der Platte, falls aus Datei geöffnet. */
  path: string | null
  /** Seitenzahl, sobald pdf.js geladen hat. */
  numPages: number
  /** Aktuell sichtbare/aktive Seite (1-basiert). */
  currentPage: number
  /** Zoomfaktor (1 = 100 %). */
  zoom: number
  /** Aktuell gewähltes Werkzeug. */
  tool: ToolId
  /** Statuszeilen-Text. */
  status: string

  setDocument: (bytes: Uint8Array, name: string, path?: string | null) => void
  closeDocument: () => void
  setNumPages: (n: number) => void
  setCurrentPage: (n: number) => void
  setZoom: (z: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  setTool: (t: ToolId) => void
  setStatus: (s: string) => void
}

const clampZoom = (z: number): number => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))

export const usePdfStore = create<PdfState>((set, get) => ({
  bytes: null,
  name: null,
  path: null,
  numPages: 0,
  currentPage: 1,
  zoom: 1,
  tool: 'select',
  status: 'Bereit',

  setDocument: (bytes, name, path = null) =>
    set({ bytes, name, path, numPages: 0, currentPage: 1 }),
  closeDocument: () =>
    set({ bytes: null, name: null, path: null, numPages: 0, currentPage: 1, status: 'Bereit' }),
  setNumPages: (n) => set({ numPages: n }),
  setCurrentPage: (n) => set({ currentPage: n }),
  setZoom: (z) => set({ zoom: clampZoom(z) }),
  zoomIn: () => set({ zoom: clampZoom(get().zoom + 0.1) }),
  zoomOut: () => set({ zoom: clampZoom(get().zoom - 0.1) }),
  resetZoom: () => set({ zoom: 1 }),
  setTool: (t) => set({ tool: t }),
  setStatus: (s) => set({ status: s })
}))
