import { create } from 'zustand'
import type { Annotation } from '../annotations/types'

export type ToolId =
  | 'select'
  | 'text'
  | 'highlight'
  | 'rectangle'
  | 'note'
  | 'draw'
  | 'signature'
  | 'stamp'

export const MIN_ZOOM = 0.25
export const MAX_ZOOM = 4
export const HISTORY_LIMIT = 60

const clampZoom = (z: number): number => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))
const clone = (a: Annotation[]): Annotation[] => JSON.parse(JSON.stringify(a)) as Annotation[]

interface PdfState {
  bytes: Uint8Array | null
  name: string | null
  path: string | null
  numPages: number
  currentPage: number
  zoom: number
  tool: ToolId
  status: string
  dirty: boolean

  annotations: Annotation[]
  selectedId: string | null
  currentColor: string
  past: Annotation[][]
  future: Annotation[][]

  setDocument: (bytes: Uint8Array, name: string, path?: string | null) => void
  replaceBytes: (bytes: Uint8Array, name?: string, path?: string | null) => void
  closeDocument: () => void
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
  clearAnnotations: () => void
  undo: () => void
  redo: () => void
}

export const usePdfStore = create<PdfState>((set, get) => ({
  bytes: null,
  name: null,
  path: null,
  numPages: 0,
  currentPage: 1,
  zoom: 1,
  tool: 'select',
  status: 'Bereit',
  dirty: false,

  annotations: [],
  selectedId: null,
  currentColor: '#e11d2a',
  past: [],
  future: [],

  setDocument: (bytes, name, path = null) =>
    set({
      bytes,
      name,
      path,
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
      annotations: [],
      selectedId: null,
      past: [],
      future: [],
      dirty: false
    })),
  closeDocument: () =>
    set({
      bytes: null,
      name: null,
      path: null,
      numPages: 0,
      currentPage: 1,
      annotations: [],
      selectedId: null,
      past: [],
      future: [],
      status: 'Bereit',
      dirty: false
    }),
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
    })
}))
