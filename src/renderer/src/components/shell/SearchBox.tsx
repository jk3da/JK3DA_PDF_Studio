import { useEffect, useRef, useState } from 'react'
import { Icon } from '../ui/icons'
import { usePdfStore } from '../../lib/state/store'

interface Hit {
  page: number
  snippet: string
}

export default function SearchBox(): JSX.Element {
  const doc = usePdfStore((s) => s.doc)
  const hasDoc = usePdfStore((s) => s.bytes !== null)
  const layoutMode = usePdfStore((s) => s.layoutMode)
  const setCurrentPage = usePdfStore((s) => s.setCurrentPage)
  const query = usePdfStore((s) => s.searchQuery)
  const setQuery = usePdfStore((s) => s.setSearchQuery)

  const [results, setResults] = useState<Hit[] | null>(null)
  const [busy, setBusy] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setResults(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const go = (n: number): void => {
    if (layoutMode === 'single') setCurrentPage(n)
    else document.getElementById(`pdf-page-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const run = async (): Promise<void> => {
    const q = query.trim().toLowerCase()
    if (!doc || q.length < 2) {
      setResults(null)
      return
    }
    setBusy(true)
    const hits: Hit[] = []
    for (let i = 1; i <= doc.numPages && hits.length < 200; i++) {
      const page = await doc.getPage(i)
      const tc = await page.getTextContent()
      const text = tc.items.map((it) => ('str' in it ? it.str : '')).join(' ')
      const lower = text.toLowerCase()
      let idx = lower.indexOf(q)
      while (idx !== -1 && hits.length < 200) {
        const start = Math.max(0, idx - 30)
        const snippet = (start > 0 ? '…' : '') + text.slice(start, idx + q.length + 40).trim() + '…'
        hits.push({ page: i, snippet })
        idx = lower.indexOf(q, idx + q.length)
      }
    }
    setBusy(false)
    setResults(hits)
  }

  return (
    <div ref={ref} className="relative w-[220px]">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted">
        <Icon name="search" size={16} />
      </span>
      <input
        id="doc-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && void run()}
        placeholder="Suchen… (Strg+F)"
        title="Im Dokument suchen (Strg+F), Enter startet"
        disabled={!hasDoc}
        className="h-9 w-full rounded-control border border-chrome-600 bg-chrome-700 pl-[30px] pr-2.5 text-ui text-ink outline-none placeholder:text-ink-muted focus:border-primary disabled:opacity-50"
      />

      {results !== null && (
        <div className="absolute left-0 top-10 z-40 max-h-[320px] w-[360px] overflow-y-auto rounded-panel border border-chrome-600 bg-chrome-700 py-1 shadow-menu">
          <div className="px-3 py-1.5 text-ui-sm text-ink-muted">
            {busy ? 'Suche …' : `${results.length} Treffer${results.length === 200 ? '+' : ''} für „${query}"`}
          </div>
          {results.map((h, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                go(h.page)
                setResults(null)
              }}
              className="flex w-full items-start gap-2 px-3 py-1.5 text-left hover:bg-chrome-600"
            >
              <span className="mt-0.5 rounded bg-chrome-900 px-1.5 text-[11px] text-ink-muted">S.{h.page}</span>
              <span className="flex-1 text-ui-sm text-[#c8ccd2]">{h.snippet}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
