import { useEffect, useState } from 'react'
import { Icon } from '../ui/icons'
import Modal from '../ui/Modal'
import { usePdfStore } from '../../lib/state/store'

export default function AboutModal(): JSX.Element {
  const setModal = usePdfStore((s) => s.setModal)
  const [version, setVersion] = useState('')
  useEffect(() => {
    window.jk3da?.getVersion().then(setVersion).catch(() => setVersion(''))
  }, [])

  return (
    <Modal title="Über JK3DA PDF Studio" onClose={() => setModal(null)} width={420}>
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-primary"><Icon name="app-logo" size={44} /></span>
        <div>
          <div className="text-ui-lg font-semibold text-ink">JK3DA PDF Studio</div>
          <div className="text-ui-sm text-ink-muted">Version {version || '0.0.0'}</div>
        </div>
        <p className="max-w-[40ch] text-ui text-ink-muted">
          Vollständig offline. Kein Abo, keine Cloud, keine Telemetrie. Bearbeiten, organisieren,
          signieren, schwärzen und schützen — lokal auf deinem Rechner.
        </p>
        <div className="mt-1 text-ui-sm text-chrome-500">© JK3DA · Privat &amp; kostenlos</div>
      </div>
    </Modal>
  )
}
