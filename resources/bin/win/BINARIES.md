# Native Sidecars — hierher (`resources/bin/win/`)

JK3DA PDF Studio läuft komplett ohne diese Binaries. Legst du sie hier ab, schalten sich die
jeweiligen Funktionen frei (App neu starten). Der Main-Prozess ruft sie per `child_process` auf
(siehe `src/main/index.ts` + `src/main/sidecars/`). Fehlt eine Binary, zeigt die App einen
klaren Hinweis statt zu crashen.

Die App sucht **exakt diese Dateinamen** in diesem Ordner:

| Funktion | Datei (genau so benennen) | Woher | Menü |
|---|---|---|---|
| Verschlüsselung / Passwort / Rechte | `qpdf.exe` (+ ggf. Begleit-DLLs aus dem qpdf-`bin`) | qpdf Release (GitHub `qpdf/qpdf`) | Datei → Sicherheit & Metadaten |
| Komprimieren / PDF-A | `gswin64c.exe` | Ghostscript (AGPL/GPL Release) | Werkzeuge → Komprimieren |
| OCR (durchsuchbar) | `tesseract.exe` **+ Ordner `tessdata/`** mit `deu.traineddata`, `eng.traineddata` | UB-Mannheim Tesseract-Build | Werkzeuge → OCR |
| Office ↔ PDF | `soffice.exe` (portable LibreOffice; ggf. ganzes `program/` daneben) | LibreOffice (portable) | Werkzeuge → Office importieren |

## Hinweise
- **qpdf**: Die `qpdf.exe` braucht die DLLs aus ihrem Original-`bin`-Ordner. Am einfachsten den
  ganzen qpdf-`bin`-Inhalt hierher kopieren.
- **tesseract**: Der Ordner `tessdata/` muss **neben** `tesseract.exe` liegen. Sprachdateien
  (`deu`, `eng`, …) dort hineinlegen. Aufruf: `tesseract in.png out -l deu pdf`.
- **soffice**: Portable LibreOffice mitsamt seinem `program/`-Verzeichnis. `soffice.exe` muss
  direkt hier liegen (oder Pfad in `src/main/sidecars/index.ts` anpassen). Aufruf:
  `soffice --headless --convert-to pdf --outdir <tmp> <datei>`.
- **Lizenzen**: qpdf/Ghostscript/Tesseract/LibreOffice sind frei (AGPL/GPL/Apache/MPL). Für den
  privaten Gebrauch unkritisch; bei Weitergabe die jeweiligen Lizenztexte beilegen.
- Beim Packaging kopiert electron-builder `resources/bin/` nach `resources/bin/` ins Paket
  (siehe `electron-builder.yml` → `extraResources`), also landen die Binaries automatisch mit.

## Prüfen
Nach dem Ablegen: App neu starten. Ist eine Binary korrekt hier, funktioniert der zugehörige
Menüpunkt; fehlt sie, kommt in der Statusleiste z. B. „Ghostscript (gswin64c.exe) fehlt …".
