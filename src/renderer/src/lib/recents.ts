import { usePdfStore } from './state/store'

export interface RecentFile {
  path: string
  name: string
  ts: number
}

const KEY = 'jk3da.recent'
const MAX = 8

export function loadRecents(): RecentFile[] {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? (JSON.parse(raw) as RecentFile[]) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function addRecent(path: string, name: string): void {
  try {
    const list = [{ path, name, ts: Date.now() }, ...loadRecents().filter((r) => r.path !== path)]
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    /* Speicher blockiert — ignorieren */
  }
}

export function removeRecent(path: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(loadRecents().filter((r) => r.path !== path)))
  } catch {
    /* ignorieren */
  }
}

/** Öffnet einen Eintrag; verschwundene Dateien fliegen aus dem Verlauf. */
export async function openRecentFile(r: RecentFile): Promise<void> {
  const store = usePdfStore.getState()
  const res = await window.jk3da.openPdfPath(r.path)
  if (res) {
    store.setDocument(res.bytes, res.name, res.path)
    addRecent(res.path, res.name)
  } else {
    removeRecent(r.path)
    store.setStatus('Datei nicht gefunden — aus dem Verlauf entfernt.')
  }
}
