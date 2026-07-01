import { useEffect, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { Icon } from '../ui/icons'

interface OutlineNode {
  title: string
  dest: string | unknown[] | null
  items: OutlineNode[]
}

export default function Bookmarks({
  pdf,
  onNavigate
}: {
  pdf: PDFDocumentProxy
  onNavigate: (page: number) => void
}): JSX.Element {
  const [outline, setOutline] = useState<OutlineNode[] | null>(null)

  useEffect(() => {
    let alive = true
    void pdf.getOutline().then((o) => {
      if (alive) setOutline((o as unknown as OutlineNode[]) ?? [])
    })
    return () => {
      alive = false
    }
  }, [pdf])

  const nav = async (dest: OutlineNode['dest']): Promise<void> => {
    if (!dest) return
    try {
      const d = typeof dest === 'string' ? await pdf.getDestination(dest) : dest
      if (!d || !Array.isArray(d)) return
      const ref = d[0] as { num: number; gen: number }
      const idx = await pdf.getPageIndex(ref)
      onNavigate(idx + 1)
    } catch {
      /* nicht auflösbares Ziel — ignorieren */
    }
  }

  if (outline === null) return <div className="p-4 text-ui text-ink-muted">Lade …</div>
  if (outline.length === 0) return <div className="p-4 text-ui text-ink-muted">Keine Lesezeichen.</div>

  return <div className="flex-1 overflow-y-auto p-2">{renderNodes(outline, 0, nav)}</div>
}

function renderNodes(nodes: OutlineNode[], depth: number, nav: (d: OutlineNode['dest']) => void): JSX.Element[] {
  return nodes.map((n, i) => (
    <div key={`${depth}-${i}`}>
      <button
        type="button"
        onClick={() => nav(n.dest)}
        style={{ paddingLeft: 8 + depth * 14 }}
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-ui text-[#c8ccd2] hover:bg-chrome-700"
      >
        <Icon name="panel-bookmarks" size={13} />
        <span className="truncate">{n.title}</span>
      </button>
      {n.items?.length > 0 && renderNodes(n.items, depth + 1, nav)}
    </div>
  ))
}
