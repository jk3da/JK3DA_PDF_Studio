import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

/**
 * Erzeugt ein kleines Willkommens-PDF rein in JS (pdf-lib).
 * Dient in Phase 0 als sofort sichtbarer Render-Test und beweist,
 * dass der pdf-lib-Stack im Renderer läuft.
 */
export async function createWelcomePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle('JK3DA PDF Studio — Willkommen')
  doc.setProducer('JK3DA PDF Studio')

  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const regular = await doc.embedFont(StandardFonts.Helvetica)

  const page = doc.addPage([595.28, 841.89]) // A4 in Punkten
  const { height } = page.getSize()

  const ink = rgb(0.106, 0.122, 0.141)
  const muted = rgb(0.42, 0.46, 0.52)
  const blue = rgb(0.231, 0.51, 0.965)

  page.drawRectangle({ x: 0, y: height - 8, width: 595.28, height: 8, color: blue })

  page.drawText('JK3DA PDF Studio', { x: 56, y: height - 110, size: 34, font: bold, color: ink })
  page.drawText('Phase 0 — Scaffold läuft.', {
    x: 56,
    y: height - 144,
    size: 15,
    font: regular,
    color: muted
  })

  const lines = [
    'Electron + Vite + React + TypeScript steht.',
    'pdf.js rendert dieses Dokument (gerade jetzt).',
    'pdf-lib hat dieses Dokument im Browser erzeugt.',
    'IPC-Bruecke Renderer <-> Main ist verbunden ("PDF oeffnen").',
    '',
    'Naechster Schritt: Annotationen via pdf-lib echt ins PDF schreiben (Phase 1).'
  ]
  lines.forEach((line, i) => {
    page.drawText(line, { x: 56, y: height - 200 - i * 26, size: 13, font: regular, color: ink })
  })

  return doc.save()
}

/** Erzeugt ein einfaches PDF mit N A4-Seiten (für Tests/Platzhalter). */
export async function createBlankPdf(pageCount = 3): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([595.28, 841.89])
    page.drawText(`Seite ${i + 1}`, { x: 50, y: 780, size: 20, font })
  }
  return doc.save()
}
