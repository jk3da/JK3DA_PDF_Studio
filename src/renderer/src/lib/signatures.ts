// Persistenz gespeicherter Signaturen/Initialen — lokal, offline (localStorage).

const KEY = 'jk3da.signatures'

export function loadSignatures(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? (arr as string[]) : []
  } catch {
    return []
  }
}

export function saveSignatures(list: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 24)))
  } catch {
    /* Speicher voll/blockiert — ignorieren */
  }
}

export function addSignature(dataUrl: string): string[] {
  const list = [dataUrl, ...loadSignatures().filter((d) => d !== dataUrl)]
  saveSignatures(list)
  return list
}

export function removeSignature(dataUrl: string): string[] {
  const list = loadSignatures().filter((d) => d !== dataUrl)
  saveSignatures(list)
  return list
}
