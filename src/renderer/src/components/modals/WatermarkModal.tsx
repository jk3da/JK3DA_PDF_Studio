import { useState } from 'react'
import Modal from '../ui/Modal'
import { usePdfStore } from '../../lib/state/store'
import { docTools } from '../../lib/pdf/docTools'

export default function WatermarkModal(): JSX.Element {
  const setModal = usePdfStore((s) => s.setModal)
  const [text, setText] = useState('VERTRAULICH')
  const [opacity, setOpacity] = useState(0.2)
  const [fontSize, setFontSize] = useState(60)

  const apply = async (): Promise<void> => {
    if (!text.trim()) return
    await docTools.watermark({ text, opacity, fontSize })
    setModal(null)
  }

  return (
    <Modal title="Wasserzeichen" onClose={() => setModal(null)} width={420}>
      <div className="flex flex-col gap-3">
        <label className="text-ui text-ink">
          Text
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 h-9 w-full rounded-control border border-chrome-600 bg-chrome-700 px-2.5 text-ui text-ink outline-none focus:border-primary"
          />
        </label>
        <div>
          <div className="mb-1 flex justify-between text-ui text-[#c8ccd2]"><span>Deckkraft</span><span className="text-[#9aa3af]">{Math.round(opacity * 100)}%</span></div>
          <input type="range" min={5} max={80} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(Number(e.target.value) / 100)} className="w-full accent-primary" />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-ui text-[#c8ccd2]"><span>Schriftgröße</span><span className="text-[#9aa3af]">{fontSize} pt</span></div>
          <input type="range" min={20} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-primary" />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={() => setModal(null)} className="rounded-control bg-chrome-700 px-3 py-1.5 text-ui text-ink hover:bg-chrome-600">Abbrechen</button>
          <button type="button" onClick={() => void apply()} className="rounded-control bg-primary px-3 py-1.5 text-ui font-semibold text-white hover:bg-primary-hover">Anwenden</button>
        </div>
      </div>
    </Modal>
  )
}
