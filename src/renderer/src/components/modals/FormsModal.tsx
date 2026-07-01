import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { usePdfStore } from '../../lib/state/store'
import { readFields, applyValues, flattenForm, type FormFieldInfo, type FieldValue } from '../../lib/pdf/forms'

export default function FormsModal(): JSX.Element {
  const bytes = usePdfStore((s) => s.bytes)
  const setModal = usePdfStore((s) => s.setModal)
  const setStatus = usePdfStore((s) => s.setStatus)
  const replaceBytes = usePdfStore((s) => s.replaceBytes)

  const [fields, setFields] = useState<FormFieldInfo[] | null>(null)
  const [values, setValues] = useState<Record<string, FieldValue>>({})

  useEffect(() => {
    let alive = true
    if (!bytes) return
    void readFields(bytes).then((fs) => {
      if (!alive) return
      setFields(fs)
      const init: Record<string, FieldValue> = {}
      fs.forEach((f) => (init[f.name] = f.value))
      setValues(init)
    })
    return () => {
      alive = false
    }
  }, [bytes])

  const set = (name: string, v: FieldValue): void => setValues((p) => ({ ...p, [name]: v }))

  const run = async (flatten: boolean): Promise<void> => {
    if (!bytes) return
    setStatus('Formular wird gefüllt …')
    try {
      let out = await applyValues(bytes, values)
      if (flatten) out = await flattenForm(out)
      replaceBytes(out)
      setStatus(flatten ? 'Formular gefüllt & festgeschrieben ✓' : 'Formular gefüllt ✓')
      setModal(null)
    } catch (e) {
      setStatus(`Fehler: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return (
    <Modal title="Formular ausfüllen" onClose={() => setModal(null)} width={520}>
      {fields === null && <p className="text-sm text-chrome-500">Felder werden gelesen …</p>}
      {fields !== null && fields.length === 0 && (
        <p className="text-sm text-chrome-500">Dieses Dokument enthält keine Formularfelder.</p>
      )}

      {fields !== null && fields.length > 0 && (
        <>
          <div className="max-h-[52vh] space-y-3 overflow-auto pr-1">
            {fields.map((f) => (
              <div key={f.name} className="grid grid-cols-[1fr_1.4fr] items-center gap-3">
                <label className="truncate text-sm text-gray-300" title={f.name}>
                  {f.name}
                </label>
                {f.kind === 'text' && (
                  <input
                    type="text"
                    value={String(values[f.name] ?? '')}
                    onChange={(e) => set(f.name, e.target.value)}
                    className="rounded border border-chrome-600 bg-chrome-900 px-2 py-1 text-sm text-gray-100 outline-none focus:border-accent"
                  />
                )}
                {f.kind === 'checkbox' && (
                  <input
                    type="checkbox"
                    checked={Boolean(values[f.name])}
                    onChange={(e) => set(f.name, e.target.checked)}
                    className="h-4 w-4 accent-accent"
                  />
                )}
                {(f.kind === 'dropdown' || f.kind === 'radio') && (
                  <select
                    value={String(values[f.name] ?? '')}
                    onChange={(e) => set(f.name, e.target.value)}
                    className="rounded border border-chrome-600 bg-chrome-900 px-2 py-1 text-sm text-gray-100 outline-none focus:border-accent"
                  >
                    <option value="">—</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                )}
                {f.kind === 'optionlist' && (
                  <select
                    multiple
                    value={Array.isArray(values[f.name]) ? (values[f.name] as string[]) : []}
                    onChange={(e) =>
                      set(
                        f.name,
                        Array.from(e.target.selectedOptions).map((o) => o.value)
                      )
                    }
                    className="rounded border border-chrome-600 bg-chrome-900 px-2 py-1 text-sm text-gray-100 outline-none focus:border-accent"
                  >
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                )}
                {f.kind === 'other' && <span className="text-xs text-chrome-500">nicht unterstützt</span>}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-chrome-700 pt-3">
            <button
              type="button"
              onClick={() => void run(false)}
              className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Ausfüllen
            </button>
            <button
              type="button"
              onClick={() => void run(true)}
              className="rounded bg-chrome-700 px-3 py-1.5 text-sm text-gray-200 hover:bg-chrome-600"
              title="Werte fest ins Dokument schreiben (nicht mehr editierbar)"
            >
              Ausfüllen & festschreiben
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
