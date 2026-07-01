import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  width?: number
}

export default function Modal({ title, onClose, children, width = 480 }: Props): JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onPointerDown={onClose}
    >
      <div
        className="max-h-[88vh] overflow-auto rounded-lg border border-chrome-600 bg-chrome-800 shadow-2xl"
        style={{ width }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-chrome-700 px-4 py-2.5">
          <h2 className="text-sm font-semibold text-gray-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-chrome-500 hover:bg-chrome-700 hover:text-gray-200"
            title="Schließen (Esc)"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
