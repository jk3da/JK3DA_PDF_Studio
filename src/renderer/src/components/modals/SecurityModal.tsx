import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import Modal from '../ui/Modal'
import { usePdfStore } from '../../lib/state/store'
import { readMetadata, writeMetadata, scrubMetadata, type Metadata } from '../../lib/pdf/metadata'
import type { EncryptPermissions } from '../../../../shared/types'

export default function SecurityModal(): JSX.Element {
  const bytes = usePdfStore((s) => s.bytes)
  const name = usePdfStore((s) => s.name)
  const patchBytes = usePdfStore((s) => s.patchBytes)
  const setStatus = usePdfStore((s) => s.setStatus)
  const setModal = usePdfStore((s) => s.setModal)

  const [meta, setMeta] = useState<Metadata | null>(null)
  const [qpdf, setQpdf] = useState<boolean | null>(null)
  const [userPw, setUserPw] = useState('')
  const [ownerPw, setOwnerPw] = useState('')
  const [perms, setPerms] = useState<EncryptPermissions>({ print: true, modify: false, copy: false })

  useEffect(() => {
    if (bytes) void readMetadata(bytes).then(setMeta)
    void window.jk3da.toolAvailable('qpdf').then(setQpdf)
  }, [bytes])

  const setField = (k: keyof Metadata, v: string): void =>
    setMeta((m) => (m ? { ...m, [k]: v } : m))

  const applyMeta = async (): Promise<void> => {
    if (!bytes || !meta) return
    const out = await writeMetadata(bytes, meta)
    patchBytes(out)
    setStatus('Metadaten aktualisiert ✓')
  }

  const scrub = async (): Promise<void> => {
    if (!bytes) return
    const out = await scrubMetadata(bytes)
    patchBytes(out)
    setMeta(await readMetadata(out))
    setStatus('Metadaten entfernt ✓')
  }

  const encrypt = async (): Promise<void> => {
    if (!bytes) return
    if (!userPw && !ownerPw) {
      setStatus('Bitte mindestens ein Passwort setzen.')
      return
    }
    setStatus('Verschlüssele …')
    const res = await window.jk3da.encryptPdf({
      bytes,
      userPassword: userPw,
      ownerPassword: ownerPw,
      permissions: perms
    })
    if (!res.ok) {
      setStatus(res.error === 'qpdf-missing' ? 'qpdf fehlt.' : `Verschlüsselung fehlgeschlagen: ${res.error}`)
      return
    }
    const base = (name ?? 'dokument').replace(/\.pdf$/i, '')
    const saved = await window.jk3da.savePdf(res.bytes, `${base}-verschluesselt.pdf`)
    setStatus(saved ? `Verschlüsselt gespeichert: ${saved.name}` : 'Abgebrochen')
    setModal(null)
  }

  return (
    <Modal title="Sicherheit & Metadaten" onClose={() => setModal(null)} width={560}>
      {/* Metadaten */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-chrome-500">Metadaten</h3>
        {!meta && <p className="text-sm text-chrome-500">Lese …</p>}
        {meta && (
          <div className="space-y-2">
            <MetaField label="Titel" value={meta.title} onChange={(v) => setField('title', v)} />
            <MetaField label="Autor" value={meta.author} onChange={(v) => setField('author', v)} />
            <MetaField label="Betreff" value={meta.subject} onChange={(v) => setField('subject', v)} />
            <MetaField label="Schlüsselwörter" value={meta.keywords} onChange={(v) => setField('keywords', v)} />
            <MetaField label="Ersteller" value={meta.creator} onChange={(v) => setField('creator', v)} />
            <MetaField label="Programm" value={meta.producer} onChange={(v) => setField('producer', v)} />
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => void applyMeta()} className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover">
                Übernehmen
              </button>
              <button type="button" onClick={() => void scrub()} className="rounded bg-chrome-700 px-3 py-1.5 text-sm text-gray-200 hover:bg-chrome-600">
                Alle Metadaten entfernen
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="my-4 h-px bg-chrome-700" />

      {/* Verschlüsselung */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-chrome-500">Verschlüsselung (AES-256)</h3>

        {qpdf === false && (
          <div className="flex items-start gap-2 rounded border border-amber-600/50 bg-amber-500/10 p-3 text-sm text-amber-200">
            <ShieldAlert size={18} className="mt-0.5 shrink-0" />
            <div>
              <b>qpdf.exe fehlt.</b> Lege es unter <code className="text-amber-100">resources/bin/win/qpdf.exe</code> ab,
              dann funktioniert die Verschlüsselung (Neustart der App).
            </div>
          </div>
        )}

        <div className={qpdf === false ? 'pointer-events-none mt-3 space-y-2 opacity-50' : 'mt-1 space-y-2'}>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm text-gray-300">
              Benutzer-Passwort (Öffnen)
              <input type="password" value={userPw} onChange={(e) => setUserPw(e.target.value)} className="mt-1 w-full rounded border border-chrome-600 bg-chrome-900 px-2 py-1 text-sm text-gray-100 outline-none focus:border-accent" />
            </label>
            <label className="text-sm text-gray-300">
              Besitzer-Passwort (Rechte)
              <input type="password" value={ownerPw} onChange={(e) => setOwnerPw(e.target.value)} className="mt-1 w-full rounded border border-chrome-600 bg-chrome-900 px-2 py-1 text-sm text-gray-100 outline-none focus:border-accent" />
            </label>
          </div>
          <div className="flex flex-wrap gap-4 pt-1 text-sm text-gray-300">
            <Perm label="Drucken erlauben" checked={perms.print} onChange={(v) => setPerms((p) => ({ ...p, print: v }))} />
            <Perm label="Bearbeiten erlauben" checked={perms.modify} onChange={(v) => setPerms((p) => ({ ...p, modify: v }))} />
            <Perm label="Kopieren erlauben" checked={perms.copy} onChange={(v) => setPerms((p) => ({ ...p, copy: v }))} />
          </div>
          <button type="button" onClick={() => void encrypt()} disabled={qpdf !== true} className="mt-1 rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40">
            Verschlüsseln & speichern
          </button>
        </div>
      </section>
    </Modal>
  )
}

function MetaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }): JSX.Element {
  return (
    <label className="grid grid-cols-[130px_1fr] items-center gap-3 text-sm text-gray-300">
      <span>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-chrome-600 bg-chrome-900 px-2 py-1 text-gray-100 outline-none focus:border-accent"
      />
    </label>
  )
}

function Perm({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }): JSX.Element {
  return (
    <label className="flex items-center gap-1.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-accent" />
      {label}
    </label>
  )
}
