import { useState } from 'react'
import Modal from '../ui/Modal'
import { usePdfStore } from '../../lib/state/store'
import { docTools } from '../../lib/pdf/docTools'

export default function HeaderFooterModal(): JSX.Element {
  const setModal = usePdfStore((s) => s.setModal)
  const [header, setHeader] = useState('')
  const [footer, setFooter] = useState('')

  const apply = async (): Promise<void> => {
    if (!header.trim() && !footer.trim()) return
    await docTools.headerFooter({ header, footer })
    setModal(null)
  }

  const field = 'mt-1 h-9 w-full rounded-control border border-chrome-600 bg-chrome-700 px-2.5 text-ui text-ink outline-none focus:border-primary'

  return (
    <Modal title="Kopf- / Fußzeile" onClose={() => setModal(null)} width={420}>
      <div className="flex flex-col gap-3">
        <label className="text-ui text-ink">
          Kopfzeile (oben, mittig)
          <input value={header} onChange={(e) => setHeader(e.target.value)} placeholder="z. B. Vertraulich" className={field} />
        </label>
        <label className="text-ui text-ink">
          Fußzeile (unten, mittig)
          <input value={footer} onChange={(e) => setFooter(e.target.value)} placeholder="z. B. JK3DA · 2026" className={field} />
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={() => setModal(null)} className="rounded-control bg-chrome-700 px-3 py-1.5 text-ui text-ink hover:bg-chrome-600">Abbrechen</button>
          <button type="button" onClick={() => void apply()} className="rounded-control bg-primary px-3 py-1.5 text-ui font-semibold text-white hover:bg-primary-hover">Anwenden</button>
        </div>
      </div>
    </Modal>
  )
}
