import { usePdfStore } from '../../lib/state/store'

/**
 * Phase-0-Sidebar: einfache Seitenliste. Klick scrollt zur Seite im Canvas.
 * Echte Miniaturansichten + Drag&Drop-Reihenfolge folgen in Phase 2.
 */
export default function Sidebar(): JSX.Element {
  const numPages = usePdfStore((s) => s.numPages)
  const currentPage = usePdfStore((s) => s.currentPage)
  const hasDoc = usePdfStore((s) => s.bytes !== null)

  const goToPage = (page: number): void => {
    document.getElementById(`pdf-page-${page}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-chrome-700 bg-chrome-800">
      <div className="flex h-9 shrink-0 items-center px-3 text-xs font-semibold uppercase tracking-wide text-chrome-500">
        Seiten
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {!hasDoc && (
          <p className="px-2 py-4 text-sm text-chrome-500">Kein Dokument geöffnet.</p>
        )}
        {hasDoc &&
          Array.from({ length: numPages }, (_, i) => i + 1).map((page) => {
            const active = page === currentPage
            return (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                className={[
                  'mb-1 flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm transition-colors',
                  active
                    ? 'bg-accent/20 text-white ring-1 ring-accent/60'
                    : 'text-gray-300 hover:bg-chrome-700'
                ].join(' ')}
              >
                <span
                  className="flex h-9 w-7 items-center justify-center rounded-sm bg-chrome-600 text-xs text-gray-300"
                  aria-hidden
                >
                  {page}
                </span>
                <span>Seite {page}</span>
              </button>
            )
          })}
      </div>
    </aside>
  )
}
