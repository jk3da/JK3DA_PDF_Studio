# JK3DA PDF Studio

**Kostenloser PDF-Editor für Windows — komplett offline.**
*Free, fully offline PDF editor for Windows (German UI).*

Kein Abo, keine Cloud, kein Konto, keine Telemetrie. Alles läuft lokal auf deinem Rechner.

---

## Features

- **Ansehen & Navigieren** — schnelles Rendering, Zoom (Strg+Mausrad), Einzelseite/Fortlaufend/Doppelseite, Volltextsuche, Lesezeichen, Text markieren & kopieren
- **Anmerkungen** — Text, Markieren, Unterstreichen, Durchstreichen, Freihand, Linien, Pfeile, Rechtecke, Ellipsen, Notizen — mit Resize-Griffen, Kontextmenü, Undo/Redo
- **Unterschriften** — zeichnen, speichern, per Vorschau exakt platzieren
- **Stempel** — GENEHMIGT, BEZAHLT, ENTWURF oder eigener Text, optional mit Datum
- **Seiten organisieren** — drehen, löschen, duplizieren, verschieben (Drag & Drop), zusammenführen, aufteilen, extrahieren, zuschneiden
- **Formulare** — Felder erkennen und ausfüllen, festschreiben (flatten)
- **Echtes Schwärzen** — Inhalte werden wirklich entfernt, nicht nur überdeckt
- **Messen** — Distanz, Fläche und Umfang in mm
- **Konvertieren** — PDF zu Bildern (PNG/JPG), PDF aus Bildern erstellen
- **Dokument-Werkzeuge** — Wasserzeichen, Kopf-/Fußzeilen, Seitenzahlen, Metadaten bearbeiten/entfernen
- **Drucken** — sauber über den System-Druckdialog
- **Gewohnte Bedienung** — Acrobat-Tastenkürzel (Hilfe → Tastenkürzel), Drag & Drop, „Öffnen mit"-Integration

## Download

**[Neueste Version unter Releases](../../releases/latest)**

| Datei | Zweck |
|---|---|
| `…-Setup.exe` | Installation mit Startmenü-Eintrag und „Öffnen mit"-Integration |
| `…-Portable.exe` | Ohne Installation, läuft auch vom USB-Stick |

> **Hinweis zur Windows-SmartScreen-Warnung:** Beim ersten Start kann „Unbekannter
> Herausgeber" erscheinen, weil die App nicht code-signiert ist (Zertifikate kosten
> laufend Geld). Das ist bei kostenloser Open-Source-Software üblich —
> *Weitere Informationen → Trotzdem ausführen*. Der komplette Quellcode liegt offen
> in diesem Repository; die App macht keinerlei Netzwerkzugriffe.

## Transparenz

Diese App wurde mit **Claude** (KI-Assistent von Anthropic) entwickelt — unter Anleitung,
Prüfung und Aufsicht von JK3DA. Der gesamte Quellcode ist hier offen einsehbar, inklusive
der vollständigen Commit-Historie und einer Unit-Test-Suite.

## Optionale Zusatzfunktionen

Verschlüsselung/Passwortschutz (qpdf), OCR (Tesseract), Office-Import (LibreOffice) und
Kompression (Ghostscript) nutzen freie externe Programme. Die App funktioniert ohne sie
vollständig; zum Aktivieren siehe [`resources/bin/win/BINARIES.md`](resources/bin/win/BINARIES.md).
Diese Programme werden bewusst **nicht mitgeliefert** (eigene Lizenzen, u. a. GPL/AGPL).

## Selbst bauen

```bash
npm install
npm run dev          # Entwicklung mit Hot-Reload
npm test             # Unit-Tests (Vitest)
npm run typecheck    # TypeScript
npm run package:win  # Setup- + Portable-exe nach release/
```

**Stack:** Electron · React · TypeScript · Vite · Tailwind · [pdf.js](https://mozilla.github.io/pdf.js/) · [pdf-lib](https://pdf-lib.js.org/) · zustand

## Datenschutz

Die App stellt **keine Netzwerkverbindungen** her. Keine Telemetrie, keine Update-Pings,
keine Cloud. Was du bearbeitest, bleibt auf deinem Rechner.

## Lizenz

[MIT](LICENSE) — verwendete Open-Source-Bibliotheken stehen unter ihren jeweiligen
Lizenzen (MIT/Apache-2.0).
