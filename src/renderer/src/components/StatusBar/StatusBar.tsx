import { useEffect, useState } from 'react'
import { usePdfStore } from '../../lib/state/store'

export default function StatusBar(): JSX.Element {
  const status = usePdfStore((s) => s.status)
  const name = usePdfStore((s) => s.name)
  const numPages = usePdfStore((s) => s.numPages)
  const currentPage = usePdfStore((s) => s.currentPage)
  const hasDoc = usePdfStore((s) => s.bytes !== null)

  const [version, setVersion] = useState('')
  useEffect(() => {
    window.jk3da?.getVersion().then(setVersion).catch(() => setVersion(''))
  }, [])

  return (
    <footer className="flex h-7 shrink-0 items-center gap-4 border-t border-chrome-700 bg-chrome-900 px-3 text-xs text-chrome-500">
      <span className="truncate">{name ?? 'Kein Dokument'}</span>
      <span className="flex-1" />
      <span>{status}</span>
      {hasDoc && (
        <span className="tabular-nums">
          Seite {currentPage} / {numPages}
        </span>
      )}
      <span className="text-chrome-600">v{version || '0.0.0'}</span>
    </footer>
  )
}
