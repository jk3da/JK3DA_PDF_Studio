import { PDFDocument } from 'pdf-lib'

export interface Metadata {
  title: string
  author: string
  subject: string
  keywords: string
  creator: string
  producer: string
  creationDate: string
  modDate: string
}

function safe<T>(fn: () => T | undefined, fallback: T): T {
  try {
    return fn() ?? fallback
  } catch {
    return fallback
  }
}

export async function readMetadata(bytes: Uint8Array): Promise<Metadata> {
  const doc = await PDFDocument.load(bytes)
  const fmt = (d?: Date): string => (d ? d.toISOString().slice(0, 19).replace('T', ' ') : '')
  return {
    title: safe(() => doc.getTitle(), ''),
    author: safe(() => doc.getAuthor(), ''),
    subject: safe(() => doc.getSubject(), ''),
    keywords: safe(() => doc.getKeywords(), ''),
    creator: safe(() => doc.getCreator(), ''),
    producer: safe(() => doc.getProducer(), ''),
    creationDate: safe(() => fmt(doc.getCreationDate()), ''),
    modDate: safe(() => fmt(doc.getModificationDate()), '')
  }
}

/** Schreibt die Info-Dictionary-Felder (überschreibt Producer NICHT automatisch). */
export async function writeMetadata(
  bytes: Uint8Array,
  meta: Partial<Metadata>
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  if (meta.title !== undefined) doc.setTitle(meta.title)
  if (meta.author !== undefined) doc.setAuthor(meta.author)
  if (meta.subject !== undefined) doc.setSubject(meta.subject)
  if (meta.keywords !== undefined)
    doc.setKeywords(meta.keywords ? meta.keywords.split(',').map((k) => k.trim()) : [])
  if (meta.creator !== undefined) doc.setCreator(meta.creator)
  if (meta.producer !== undefined) doc.setProducer(meta.producer)
  return doc.save()
}

/**
 * Entfernt die Dokument-Metadaten (Info-Dictionary). updateMetadata:false
 * verhindert, dass pdf-lib beim Speichern Producer/ModDate neu setzt.
 */
export async function scrubMetadata(bytes: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  doc.setTitle('')
  doc.setAuthor('')
  doc.setSubject('')
  doc.setKeywords([])
  doc.setCreator('')
  doc.setProducer('')
  return doc.save()
}
