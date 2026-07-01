import { create } from 'zustand'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { moveAnnotation, type Annotation, type PendingPlacement } from '../annotations/types'

export type ModalId = 'signature' | 'forms' | 'security' | 'about'

export type ToolId =
  | 'select'
  | 'hand'
  | 'text'
  | 'draw'
  | 'highlight'
  | 'line'
  | 'arrow'
  | 'rectangle'
  | 'ellipse'
  | 'redact'
  | 'note'
  | 'stamp'

export type LeftTab = 'thumbnails' | 'bookmarks' | 'outline'
export type RightTab = 'properties' | 'comments'
export type LayoutMode = 'single' | 'continuous' | 'spread'

export const MIN_ZOOM = 0.25
export const MAX_ZOOM = 4
export const HISTORY_LIMIT = 60

const clampZoom = (z: number): number => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))
const clone = (a: Annotation[]): Annotation[] => JSON.parse(JSON.stringify(a)) as Annotation[]
const genId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `a-${Date.now()}-${Math.round(Math.random() * 1e6)}`

interface PdfState {
  bytes: Uint8Array | null
  name: string | null
  path: string | null
  /** Geladenes pdf.js-Dokument (von PdfCanvas gesetzt, von Sidebar geteilt). */
  doc: PDFDocumentProxy | null
  numPages: number
  currentPage: number
  zoom: number
  tool: ToolId
  status: string
  dirty: boolean

  annotations: Annotation[]
  selectedId: string | null
  currentColor: string
  currentStrokeWidth: number
  currentOpacity: number
  currentFontSize: number
  past: Annotation[][]
  future: Annotation[][]
  /** Wartet auf Platzierung per Klick (z. B. Signatur/Bild). */
  pending: PendingPlacement | null
  /** Aktuell offener modaler Dialog. */
  modal: ModalId | null
  /** UI-Zustand für Panels/Layout/Suche. */
  leftTab: LeftTab
  rightTab: RightTab
  layoutMode: LayoutMode
  searchQuery: string
  /** Größe der ersten Seite in PDF-Punkten (für Statusleiste/Fit). */
  pageSize: { w: number; h: number } | null
  /** Anforderung an den Canvas, den Zoom einzupassen. */
  fitRequest: 'width' | 'page' | null

  setDocument: (bytes: Uint8Array, name: string, path?: string | null) => void
  replaceBytes: (bytes: Uint8Array, name?: string, path?: string | null) => void
  /** Bytes ersetzen, aber Annotationen/History behalten (z. B. Metadaten). */
  patchBytes: (bytes: Uint8Array) => void
  closeDocument: () => void
  setDoc: (doc: PDFDocumentProxy | null) => void
  setNumPages: (n: number) => void
  setCurrentPage: (n: number) => void
  setZoom: (z: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  setTool: (t: ToolId) => void
  setStatus: (s: string) => void
  setDirty: (d: boolean) => void

  setCurrentColor: (c: string) => void
  beginHistory: () => void
  addAnnotation: (a: Annotation) => void
  updateAnnotation: (id: string, patch: Partial<Annotation>) => void
  removeAnnotation: (id: string) => void
  selectAnnotation: (id: string | null) => void
  duplicateAnnotation: (id: string) => void
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  clearAnnotations: () => void
  undo: () => void
  redo: () => void
  setPending: (p: PendingPlacement | null) => void
  setModal: (m: ModalId | null) => void
  setCurrentStrokeWidth: (n: number) => void
  setCurrentOpacity: (n: number) => void
  setCurrentFontSize: (n: number) => void
  setLeftTab: (t: LeftTab) => void
  setRightTab: (t: RightTab) => void
  setLayoutMode: (m: LayoutMode) => void
  setSearchQuery: (q: string) => void
  setPageSize: (s: { w: number; h: number } | null) => void
  requestFit: (m: 'width' | 'page' | null) => void
}

export const usePdfStore = create<PdfState>((set, get) => ({
  bytes: null,
  name: null,
  path: null,
  doc: null,
  numPages: 0,
  currentPage: 1,
  zoom: 1,
  tool: 'select',
  status: 'Bereit',
  dirty: false,

  annotations: [],
  selectedId: null,
  currentColor: '#e11d2a',
  currentStrokeWidth: 2,
  currentOpacity: 1,
  currentFontSize: 16,
  past: [],
  future: [],
  pending: null,
  modal: null,
  leftTab: 'thumbnails',
  rightTab: 'properties',
  layoutMode: 'continuous',
  searchQuery: '',
  pageSize: null,
  fitRequest: null,

  setDocument: (bytes, name, path = null) =>
    set({
      bytes,
      name,
      path,
      doc: null,
      numPages: 0,
      currentPage: 1,
      annotations: [],
      selectedId: null,
      past: [],
      future: [],
      dirty: false
    }),
  // Ersetzt nur die Bytes (z. B. nach einer Seiten-Operation), behält den Kontext.
  replaceBytes: (bytes, name, path) =>
    set((s) => ({
      bytes,
      name: name ?? s.name,
      path: path !== undefined ? path : s.path,
      doc: null,
      annotations: [],
      selectedId: null,
      past: [],
      future: [],
      dirty: false
    })),
  patchBytes: (bytes) => set({ bytes, doc: null, dirty: true }),
  closeDocument: () =>
    set({
      bytes: null,
      name: null,
      path: null,
      doc: null,
      numPages: 0,
      currentPage: 1,
      annotations: [],
      selectedId: null,
      past: [],
      future: [],
      status: 'Bereit',
      dirty: false
    }),
  setDoc: (doc) => set({ doc }),
  setNumPages: (n) => set({ numPages: n }),
  setCurrentPage: (n) => set({ currentPage: n }),
  setZoom: (z) => set({ zoom: clampZoom(z) }),
  zoomIn: () => set({ zoom: clampZoom(get().zoom + 0.1) }),
  zoomOut: () => set({ zoom: clampZoom(get().zoom - 0.1) }),
  resetZoom: () => set({ zoom: 1 }),
  setTool: (t) => set({ tool: t, selectedId: null }),
  setStatus: (s) => set({ status: s }),
  setDirty: (d) => set({ dirty: d }),

  setCurrentColor: (c) => set({ currentColor: c }),

  beginHistory: () =>
    set((s) => ({
      past: [...s.past.slice(-(HISTORY_LIMIT - 1)), clone(s.annotations)],
      future: []
    })),

  addAnnotation: (a) =>
    set((s) => ({
      past: [...s.past.slice(-(HISTORY_LIMIT - 1)), clone(s.annotations)],
      future: [],
      annotations: [...s.annotations, a],
      selectedId: a.id,
      dirty: true
    })),

  updateAnnotation: (id, patch) =>
    set((s) => ({
      annotations: s.annotations.map((a) => (a.id === id ? ({ ...a, ...patch } as Annotation) : a)),
      dirty: true
    })),

  removeAnnotation: (id) =>
    set((s) => ({
      past: [...s.past.slice(-(HISTORY_LIMIT - 1)), clone(s.annotations)],
      future: [],
      annotations: s.annotations.filter((a) => a.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
      dirty: true
    })),

  selectAnnotation: (id) => set({ selectedId: id }),

  duplicateAnnotation: (id) =>
    set((s) => {
      const orig = s.annotations.find((a) => a.id === id)
      if (!orig) return s
      const copy = { ...moveAnnotation(orig, 12, 12), id: genId() } as Annotation
      return {
        past: [...s.past.slice(-(HISTORY_LIMIT - 1)), clone(s.annotations)],
        future: [],
        annotations: [...s.annotations, copy],
        selectedId: copy.id,
        dirty: true
      }
    }),

  bringToFront: (id) =>
    set((s) => {
      const a = s.annotations.find((x) => x.id === id)
      if (!a) return s
      return {
        past: [...s.past.slice(-(HISTORY_LIMIT - 1)), clone(s.annotations)],
        future: [],
        annotations: [...s.annotations.filter((x) => x.id !== id), a],
        dirty: true
      }
    }),

  sendToBack: (id) =>
    set((s) => {
      const a = s.annotations.find((x) => x.id === id)
      if (!a) return s
      return {
        past: [...s.past.slice(-(HISTORY_LIMIT - 1)), clone(s.annotations)],
        future: [],
        annotations: [a, ...s.annotations.filter((x) => x.id !== id)],
        dirty: true
      }
    }),

  clearAnnotations: () =>
    set((s) => ({
      past: [...s.past.slice(-(HISTORY_LIMIT - 1)), clone(s.annotations)],
      future: [],
      annotations: [],
      selectedId: null,
      dirty: true
    })),

  undo: () =>
    set((s) => {
      if (s.past.length === 0) return s
      const previous = s.past[s.past.length - 1]
      return {
        annotations: previous,
        past: s.past.slice(0, -1),
        future: [clone(s.annotations), ...s.future],
        selectedId: null,
        dirty: true
      }
    }),

  redo: () =>
    set((s) => {
      if (s.future.length === 0) return s
      const next = s.future[0]
      return {
        annotations: next,
        past: [...s.past, clone(s.annotations)],
        future: s.future.slice(1),
        selectedId: null,
        dirty: true
      }
    }),

  setPending: (p) => set({ pending: p }),
  setModal: (m) => set({ modal: m }),
  setCurrentStrokeWidth: (n) => set({ currentStrokeWidth: n }),
  setCurrentOpacity: (n) => set({ currentOpacity: Math.min(1, Math.max(0, n)) }),
  setCurrentFontSize: (n) => set({ currentFontSize: n }),
  setLeftTab: (t) => set({ leftTab: t }),
  setRightTab: (t) => set({ rightTab: t }),
  setLayoutMode: (m) => set({ layoutMode: m }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setPageSize: (s) => set({ pageSize: s }),
  requestFit: (m) => set({ fitRequest: m })
}))
