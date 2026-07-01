import { useEffect, useState } from 'react'
import { Icon } from '../ui/icons'
import { usePdfStore } from '../../lib/state/store'

function mm(pt: number): number {
  return Math.round((pt / 72) * 25.4)
}

export default function StatusBar(): JSX.Element {
  const status = usePdfStore((s) => s.status)
  const numPages = usePdfStore((s) => s.numPages)
  const currentPage = usePdfStore((s) => s.currentPage)
  const zoom = usePdfStore((s) => s.zoom)
  const hasDoc = usePdfStore((s) => s.bytes !== null)
  const dirty = usePdfStore((s) => s.dirty)
  const pageSize = usePdfStore((s) => s.pageSize)

  const [version, setVersion] = useState('')
  useEffect(() => {
    window.jk3da?.getVersion().then(setVersion).catch(() => setVersion(''))
  }, [])

  return (
    <footer className="flex h-7 shrink-0 items-center gap-4 border-t border-chrome-600 bg-chrome-900 px-3 text-ui-sm text-ink-muted">
      {hasDoc && (
        <>
          <span className="flex items-center gap-1.5"><Icon name="panel-thumbnails" size={13} />Seite {currentPage} / {numPages}</span>
          <span>{Math.round(zoom * 100)}%</span>
          {pageSize && <span>{mm(pageSize.w)} × {mm(pageSize.h)} mm</span>}
        </>
      )}
      <span className="truncate">{status}</span>

      <div className="flex-1" />

      {dirty && (
        <span className="flex items-center gap-1.5 text-warning"><Icon name="dirty-indicator" size={9} />Nicht gespeicherte Änderungen</span>
      )}
      <span>Deutsch (DE)</span>
      <span className="text-chrome-500">v{version || '0.0.0'}</span>
    </footer>
  )
}
