import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Icon } from '../ui/icons'
import Modal from '../ui/Modal'
import { usePdfStore } from '../../lib/state/store'
import { addSignature, loadSignatures, removeSignature } from '../../lib/signatures'

const CW = 460
const CH = 180
const SCALE = 2

export default function SignatureModal(): JSX.Element {
  const setModal = usePdfStore((s) => s.setModal)
  const setPending = usePdfStore((s) => s.setPending)
  const setStatus = usePdfStore((s) => s.setStatus)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [hasInk, setHasInk] = useState(false)
  const [saved, setSaved] = useState<string[]>([])

  useEffect(() => setSaved(loadSignatures()), [])

  const ctx = (): CanvasRenderingContext2D | null => canvasRef.current?.getContext('2d') ?? null

  const pos = (e: ReactPointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const c = canvasRef.current!
    const r = c.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height }
  }

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>): void => {
    drawing.current = true
    last.current = pos(e)
    canvasRef.current?.setPointerCapture(e.pointerId)
  }
  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>): void => {
    if (!drawing.current) return
    const c = ctx()
    const p = pos(e)
    if (!c || !last.current) return
    c.strokeStyle = '#0a0a0a'
    c.lineWidth = 2.4 * SCALE
    c.lineCap = 'round'
    c.lineJoin = 'round'
    c.beginPath()
    c.moveTo(last.current.x, last.current.y)
    c.lineTo(p.x, p.y)
    c.stroke()
    last.current = p
    if (!hasInk) setHasInk(true)
  }
  const onUp = (): void => {
    drawing.current = false
    last.current = null
  }

  const clear = (): void => {
    const c = ctx()
    if (c && canvasRef.current) c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setHasInk(false)
  }

  const place = (dataUrl: string): void => {
    const img = new Image()
    img.onload = (): void => {
      const w = 200
      const h = Math.max(36, Math.round((200 * img.naturalHeight) / img.naturalWidth))
      setPending({ kind: 'image', dataUrl, w, h })
      setModal(null)
      setStatus('Signatur platzieren: auf die gewünschte Stelle klicken')
    }
    img.src = dataUrl
  }

  const saveDrawn = (): void => {
    if (!canvasRef.current || !hasInk) return
    const dataUrl = canvasRef.current.toDataURL('image/png')
    setSaved(addSignature(dataUrl))
    clear()
  }

  const placeDrawn = (): void => {
    if (!canvasRef.current || !hasInk) return
    const dataUrl = canvasRef.current.toDataURL('image/png')
    setSaved(addSignature(dataUrl))
    place(dataUrl)
  }

  const onImport = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (): void => {
      const dataUrl = String(reader.result)
      setSaved(addSignature(dataUrl))
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <Modal title="Unterschrift" onClose={() => setModal(null)} width={520}>
      <p className="mb-2 text-xs text-chrome-500">Im Feld unterschreiben, dann platzieren oder speichern.</p>

      <canvas
        ref={canvasRef}
        width={CW * SCALE}
        height={CH * SCALE}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        className="w-full touch-none rounded border border-chrome-600 bg-white"
        style={{ height: CH }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={clear} className="flex items-center gap-1.5 rounded bg-chrome-700 px-3 py-1.5 text-sm text-gray-200 hover:bg-chrome-600">
          <Icon name="eraser" size={15} /> Leeren
        </button>
        <button type="button" onClick={saveDrawn} disabled={!hasInk} className="flex items-center gap-1.5 rounded bg-chrome-700 px-3 py-1.5 text-sm text-gray-200 hover:bg-chrome-600 disabled:opacity-40">
          Speichern
        </button>
        <button type="button" onClick={placeDrawn} disabled={!hasInk} className="flex items-center gap-1.5 rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40">
          <Icon name="signature" size={15} /> Platzieren
        </button>
        <label className="ml-auto flex cursor-pointer items-center gap-1.5 rounded bg-chrome-700 px-3 py-1.5 text-sm text-gray-200 hover:bg-chrome-600">
          <Icon name="import-image" size={15} /> Bild importieren
          <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onImport} />
        </label>
      </div>

      {saved.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-chrome-500">Gespeichert</div>
          <div className="flex flex-wrap gap-2">
            {saved.map((d) => (
              <div key={d} className="group relative">
                <button
                  type="button"
                  onClick={() => place(d)}
                  className="block h-16 w-28 rounded border border-chrome-600 bg-white p-1 hover:border-accent"
                  title="Platzieren"
                >
                  <img src={d} alt="" className="h-full w-full object-contain" />
                </button>
                <button
                  type="button"
                  onClick={() => setSaved(removeSignature(d))}
                  className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white group-hover:flex"
                  title="Löschen"
                >
                  <Icon name="delete" size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
