# HANDOVER — JK3DA PDF Studio

> Übergabeprotokoll für die Entwicklung in VS Code / Claude Code.
> Lies diese Datei zuerst komplett, bevor du Code schreibst.
> Sprache im Code: Englisch. Kommentare/Commits: egal. UI: Deutsch.

---

## 0. Was das hier ist

Eine **vollständig offline laufende, kostenlose PDF-Desktop-App** für den privaten Gebrauch.
Kein Abo, keine Cloud, kein Server, kein Telemetrie-Dreck. Adobe-Acrobat-Funktionsumfang,
aber nur die Teile, die ein einzelner Power-User wirklich braucht.

**Ziel-Plattform:** Windows (primär). macOS/Linux später, kostenlos durch Electron-Cross-Build.

**Status:** Es existiert ein funktionierender **Web-Prototyp** (HTML/JS, Single-File) mit:
Text-Annotation, Highlight, Rechteck, Notiz, Unterschrift-Zeichnen, Stempel, Formularfeld-
Platzierung, Zoom, Undo, Drag&Drop, pdf.js-Rendering. Dieser Prototyp ist die **UI-Referenz** —
Look, Toolbar-Aufbau und Interaktionsmuster übernehmen, dann auf echte PDF-Persistenz umbauen.

---

## 1. Tech-Stack (final entschieden)

| Schicht | Wahl | Warum |
|---|---|---|
| Shell | **Electron** | Ganzes JS-PDF-Ökosystem läuft sofort; native Sidecars einfach bundlebar |
| Build/Dev | **Vite** | Schneller HMR, sauberes Renderer-Bundling |
| UI | **React + TypeScript** | Wartbar, typsicher, gut für Claude Code |
| Styling | **Tailwind** (oder CSS Modules) | Schnell, der Prototyp ist eh utility-lastig |
| Packaging | **electron-builder** | Erzeugt `.exe` / portable / nsis-Installer für Windows |

> **Nicht Tauri.** Begründung: Die schweren Features brauchen native Binaries (siehe §4).
> Electron lässt den kompletten JS-PDF-Stack ohne Reibung laufen.

> **Build-Tooling-Hinweis (Phase 0):** Umgesetzt mit **electron-vite** (Framework) statt dem
> ursprünglich genannten `vite-plugin-electron`. Gleicher Stack, vorhersehbare `out/`-Ausgaben.

### Prozess-Architektur

```
┌─────────────────── Renderer (React) ───────────────────┐
│  UI, pdf.js-Rendering, Annotation-Layer, State          │
│  pdf-lib für reine JS-Operationen                       │
└───────────────▲───────────── IPC ──────────▼────────────┘
                │                             │
┌───────────────┴───── Main (Node) ───────────┴───────────┐
│  Dateisystem, Dialoge, Orchestrierung der Sidecars      │
│  child_process → qpdf / ghostscript / tesseract / ...   │
└─────────────────────────────────────────────────────────┘
```

Renderer macht **alles Reine in JS**. Sobald ein nativer Binary nötig ist (OCR, Office-
Konvertierung, Kompression, Verschlüsselung, echte Redaction), geht der Auftrag per **IPC an
den Main-Prozess**, der das Binary via `child_process.spawn` aufruft.

---

## 2. Library- & Tool-Mapping

| Aufgabe | Werkzeug | Typ |
|---|---|---|
| PDF rendern (Anzeige) | `pdf.js` | JS |
| Merge, Split, Rotate, Delete/Insert/Reorder Pages | `pdf-lib` | JS |
| Annotationen flatten, Formulare ausfüllen | `pdf-lib` | JS |
| Stempel, Wasserzeichen, Seitenzahlen, Header/Footer | `pdf-lib` | JS |
| Metadaten lesen/schreiben/entfernen | `pdf-lib` + `qpdf` | beides |
| Verschlüsselung / Passwort / Berechtigungen | **qpdf** | nativ |
| Struktur-Reparatur, Linearisierung | **qpdf** | nativ |
| Kompression / Dateigröße / PDF/A | **Ghostscript** | nativ |
| OCR | **Tesseract** | beides |
| Office ↔ PDF | **LibreOffice** (`soffice --headless`) | nativ |
| Render / Textextraktion / echtes Text-Editing | **MuPDF** / **PDFium** | nativ |
| Bild → PDF, Redaction-Rasterung | **ImageMagick** / pdf-lib+canvas | beides |
| Volltextsuche | pdf.js Text-Layer | JS |

> **Redaction:** Echtes Schwärzen heißt *Inhalt entfernen*, nicht nur ein schwarzes Rechteck.
> Korrekt: Region per `mutool` aus dem Content-Stream entfernen **oder** Seite rastern +
> Text-Layer löschen + optional neu-OCRen. Niemals nur ein opakes Rect zeichnen.

---

## 3. Feature-Scope — siehe Original-Handover (DRIN/RAUS).

Faustregel: Wenn ein Feature einen Server, ein Team oder ein Abo voraussetzt → RAUS.

---

## 4. Native Sidecar-Binaries (resources/bin/win/)

| Binary | Zweck | Aufruf-Beispiel |
|---|---|---|
| `qpdf.exe` | Encrypt/Decrypt, Permissions, Repair | `qpdf --encrypt user owner 256 -- in.pdf out.pdf` |
| `gswin64c.exe` | Komprimieren, PDF/A | `gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook ...` |
| `tesseract.exe` | OCR | `tesseract in.png out pdf -l deu` |
| `soffice.exe` | Office ↔ PDF | `soffice --headless --convert-to pdf file.docx` |
| `mutool.exe` | Render, Textextraktion, Redaction | `mutool draw / mutool clean` |
| `magick.exe` | Bild↔PDF | `magick a.jpg b.jpg out.pdf` |

> LibreOffice ist groß (~400 MB) → ggf. optionales Nachlade-Modul. Mit Jonas abstimmen.

---

## 5. Projektstruktur (umgesetzt)

```
jk3da-pdf-studio/
├─ HANDOVER.md
├─ package.json
├─ electron.vite.config.ts
├─ electron-builder.yml
├─ tsconfig.{json,node,web}.json
├─ tailwind.config.js / postcss.config.js
├─ resources/bin/win/         ← native Sidecars (leer in Phase 0)
└─ src/
   ├─ shared/types.ts          ← IPC-Typen (Main/Preload/Renderer)
   ├─ main/index.ts            ← Electron Main, IPC-Handler
   ├─ preload/index.ts         ← contextBridge (window.jk3da)
   └─ renderer/
      ├─ index.html
      └─ src/
         ├─ App.tsx
         ├─ main.tsx
         ├─ components/{Toolbar,Sidebar,PdfCanvas,StatusBar}/
         ├─ lib/pdf/           ← pdf-lib Operationen
         ├─ lib/state/store.ts ← zustand
         └─ styles/index.css
```

---

## 6. Roadmap

- **Phase 0 — Scaffold** ✅ Electron+Vite+React+TS, pdf.js-Render, IPC-Roundtrip.
- **Phase 1 — Markup & Annotation:** Tools + echte Persistenz (pdf-lib flatten, Speichern unter).
- **Phase 2 — Seiten organisieren:** Merge/Split/Delete/Insert/Reorder/Rotate/Extract/Crop, Thumbnails.
- **Phase 3 — Signaturen & Formulare.**
- **Phase 4 — Sicherheit & Redaction** (qpdf, mutool).
- **Phase 5 — Konvertieren & OCR** (LibreOffice, Tesseract).
- **Phase 6 — Optimieren & Feinschliff** (Ghostscript, Suche, Lesezeichen, Messen, Druck).
- **Optional (post-v1):** PDF-Vergleich, Batch.

---

## 7. Dev-Setup & Commands

```bash
npm install
npm run dev          # electron-vite dev (HMR, startet Electron)
npm run typecheck    # tsc node + web
npm run build        # electron-vite build -> out/
npm run package:win  # build + electron-builder --win
```

---

## 9. Designprinzipien (nicht verhandelbar)

- **Offline-first.** Keine Netzwerkaufrufe. Keine Telemetrie.
- **Verlustfrei wo möglich.** Original nie überschreiben — „Speichern unter", Auto-Backup.
- **Redaction ist heilig.** Lieber kein Redaction-Feature als ein unsicheres.
- **Native nur wenn nötig.** Erst JS (pdf-lib), Sidecar nur für das, was JS nicht kann.
- **UI bleibt wie im Prototyp.** (Prototyp-HTML steht noch aus — UI wird dann 1:1 angeglichen.)
