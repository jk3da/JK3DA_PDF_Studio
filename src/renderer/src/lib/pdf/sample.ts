import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

/**
 * Erzeugt das Willkommens-PDF, das beim Start angezeigt wird —
 * kurzer Schnellstart für neue Nutzer, komplett lokal erzeugt (pdf-lib).
 */
export async function createWelcomePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle('Willkommen — JK3DA PDF Studio')
  doc.setProducer('JK3DA PDF Studio')

  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const regular = await doc.embedFont(StandardFonts.Helvetica)

  const page = doc.addPage([595.28, 841.89]) // A4 in Punkten
  const { height } = page.getSize()

  const ink = rgb(0.106, 0.122, 0.141)
  const muted = rgb(0.42, 0.46, 0.52)
  const blue = rgb(0.231, 0.51, 0.965)

  page.drawRectangle({ x: 0, y: height - 8, width: 595.28, height: 8, color: blue })

  page.drawText('Willkommen!', { x: 56, y: height - 110, size: 34, font: bold, color: ink })
  page.drawText('JK3DA PDF Studio — dein PDF-Editor. Komplett offline.', {
    x: 56,
    y: height - 144,
    size: 15,
    font: regular,
    color: muted
  })

  let y = height - 205
  const section = (title: string, lines: string[]): void => {
    page.drawText(title, { x: 56, y, size: 14, font: bold, color: ink })
    y -= 24
    for (const line of lines) {
      page.drawText(line, { x: 70, y, size: 12, font: regular, color: ink })
      y -= 20
    }
    y -= 14
  }

  section('So startest du', [
    'Eigene PDF oeffnen: Strg+O — oder die Datei einfach ins Fenster ziehen.',
    'Links findest du alle Werkzeuge: Text, Markieren, Formen, Stempel u. v. m.',
    'Aenderungen sichern mit Strg+S ("Speichern unter" — dein Original bleibt unberuehrt).'
  ])

  section('Praktisch zu wissen', [
    'Strg+Mausrad zoomt, die Leertaste gedrueckt halten verschiebt die Ansicht.',
    'Rechtsklick auf eine Anmerkung oeffnet das Kontextmenue.',
    'Alle Tastenkuerzel: Menue "Hilfe" -> "Tastenkuerzel".'
  ])

  section('Deine Daten bleiben bei dir', [
    'Diese App stellt keinerlei Netzwerkverbindungen her.',
    'Kein Konto, keine Cloud, keine Telemetrie.'
  ])

  page.drawText('Viel Spass!', { x: 56, y: y - 6, size: 13, font: bold, color: blue })

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
