# JK3DA PDF Studio — Design-Brief & Element-Inventar

Ziel: ein **eigenes, einheitliches Icon- + UI-Kit** (statt lucide von der Stange), das zum
dunklen, Adobe-artigen Look passt. Deutsche UI. Diese Datei enthält (1) die Design-Tokens,
(2) das vollständige Element-Inventar über alle Phasen, (3) einen fertigen Prompt für Claude.

---

## 1. Design-Tokens (bereits im Code etabliert — bitte einhalten)

- **Chrome (dunkel):** `#1b1f24` (900), `#22272e` (800), `#2b313a` (700), `#363d48` (600), `#454d5a` (500)
- **Canvas-Hintergrund:** `#3a3f47` · Seiten: weiß
- **Akzent/Primär:** `#3b82f6` (hover `#2f6fe0`)
- **Text:** `#e5e7eb` (hell), muted `#6b7280`
- **Semantik:** success `#15a34a`, warning `#f59e0b`, danger `#e11d2a`
- **Annotation-Defaults:** rot `#e11d2a`, Highlight gelb `#ffd400`
- **Font:** Segoe UI / system-ui · **Radius:** 6px (Controls), 8px (Panels)
- **Maße:** Control-Höhe 36px, Icons 18px, Toolbar-Höhe 48px, Fokus-Ring 1.5px Akzent

---

## 2. Element-Inventar (alles, was wir brauchen)

### A. Datei
Öffnen · Speichern · Speichern unter · Drucken · Zuletzt verwendet · Schließen · Neu (aus Bildern/Office)

### B. Verlauf
Rückgängig · Wiederholen

### C. Ansicht / Zoom
Vergrößern · Verkleinern · Zoom-% · Breite anpassen · Seite anpassen · Originalgröße ·
Ansicht drehen · Vollbild · Einzelseite/Fortlaufend · Doppelseite · Hand/Verschieben

### D. Navigation
Erste/Vorherige/Nächste/Letzte Seite · Seitenzahl-Eingabe · Gehe zu Seite ·
Miniaturen-Panel · Lesezeichen-Panel · Inhaltsverzeichnis · Suchen · Weiter/Zurück suchen

### E. Markup-Werkzeuge (die „Standard-Sachen")
Auswählen · Text/Schreibmaschine · Notiz/Kommentar · Markieren · Unterstreichen ·
Durchstreichen · Wellig unterstreichen · Freihand/Stift · Radierer · **Linie** · **Pfeil** ·
Rechteck · Ellipse/Kreis · Polygon · Wolke (Revision) · Sprechblase/Callout ·
Unterschrift · Initialen · Stempel · Bild einfügen · Link · Schwärzen (Redaction)

### F. Eigenschaften-/Formatleiste (kontextabhängig)
Füllfarbe · Linienfarbe · Farbfelder/Picker · Linienstärke · Deckkraft ·
Schriftart · Schriftgröße · Fett/Kursiv/Unterstrichen · Ausrichtung ·
Pfeilspitzen (Anfang/Ende) · Linienstil (durchgezogen/gestrichelt) ·
Löschen · Duplizieren · Nach vorn/hinten

### G. Seiten organisieren (Miniaturen)
Links/Rechts drehen · Seite löschen · Duplizieren · Leerseite einfügen · Aus Datei einfügen ·
Extrahieren · Ersetzen · Verschieben/Drag-Griff · Zuschneiden · Größe ändern ·
Zusammenführen · Aufteilen · Auswahl-Checkboxen · Alle auswählen

### H. Formulare
Textfeld · Checkbox · Optionsfeld · Dropdown · Listenfeld · Button · Datumsfeld ·
Signaturfeld · Felder erkennen · Ausfüllen · Flatten · Formular leeren · Felder hervorheben

### I. Sicherheit & Schwärzen
Verschlüsseln/Schloss · Entsperren · Passwort · Berechtigungen (Drucken/Bearbeiten/Kopieren) ·
Schwärzungs-Markierung · Schwärzung anwenden · Bereinigen/Sanitize · Metadaten entfernen

### J. Konvertieren / OCR / Optimieren
Export → Word/Excel/PowerPoint · Export → JPG/PNG/TIFF · Export → HTML/TXT ·
Import ← Bild/Office/Scanner · OCR ausführen · Sprache wählen · Komprimieren · PDF/A

### K. Messwerkzeuge
Distanz · Fläche · Umfang · Maßstab kalibrieren

### L. Lesezeichen / Links / Wasserzeichen
Lesezeichen hinzufügen/bearbeiten/löschen/einrücken · Link (intern/extern) ·
Wasserzeichen · Kopf-/Fußzeile · Hintergrund · Seitenzahlen · Bates-Nummerierung

### M. Panels / Layout
Linke Sidebar-Tabs (Miniaturen, Lesezeichen, Suchergebnisse) · Rechtes Eigenschaften-Panel ·
Kommentar-Liste · Statusleiste (Dokumentname, Seite X/N, Zoom, geändert-*, Tool-Hinweis, Fortschritt)

### N. Allgemeine Komponenten
Buttons (primär/sekundär/ghost/danger/icon/toggle) · Button-Gruppe/Segmented Control ·
Dropdown-Menü · Kontextmenü · Tooltip · Modal/Dialog · Toast · Tabs ·
Inputs (Text/Zahl/Suche) · Select · Checkbox · Radio · Switch · Slider (Deckkraft/Zoom) ·
Color-Picker-Popover · Swatch · Progressbar/Spinner · Empty-State · Badge · Divider ·
Scrollbar · Splitter/Resizer · Drag-Griff · Shortcut-Chips

### O. Identität & Feedback
App-Icon/Logo · Über-Dialog · Splash (optional) · Tool-Cursor ·
Lade-Skeletons · Fortschritt für native Ops (OCR/Konvertieren/Komprimieren) ·
Fehlerbanner · Bestätigungs-Dialoge (destruktiv: Seite löschen, Schwärzung anwenden)

---

## 3. Prompt für Claude (Copy-Paste)

> Hinweis: Prompt ist auf Englisch (bessere Generierungsergebnisse), verlangt aber deutsche
> Labels. Bei claude.ai als neuen Chat einfügen; erzeugt ein Artifact-Gallery + die SVGs.

```text
You are designing the complete, custom visual UI kit for "JK3DA PDF Studio", a fully
offline, free PDF editor desktop app (Electron + React + Tailwind, Windows-first, GERMAN UI).
It should look and feel like a lean Adobe Acrobat. I want one cohesive, hand-designed icon +
component system — NOT off-the-shelf icons.

MATCH THESE TOKENS EXACTLY:
- Dark chrome backgrounds: #1b1f24, #22272e, #2b313a, #363d48, #454d5a. Canvas backdrop
  #3a3f47, document pages are white.
- Accent/primary #3b82f6 (hover #2f6fe0). Text #e5e7eb, muted #6b7280.
- Semantic: success #15a34a, warning #f59e0b, danger #e11d2a. Annotation red #e11d2a,
  highlight yellow #ffd400.
- Font Segoe UI / system-ui. Radius 6px (controls) / 8px (panels). Subtle shadows.
  1.5px accent focus ring. Control height 36px, icons 18px, toolbar 48px. Compact desktop density.

ICON SPEC (strict — must be code-ready):
- viewBox="0 0 24 24", fill="none", stroke="currentColor", stroke-width="1.75",
  stroke-linecap="round", stroke-linejoin="round".
- NO width/height attrs (size comes from a prop), NO hardcoded colors, NO <style>, NO classes,
  NO ids, NO <defs>/gradients, NO inline transforms baked into a wrapper. Paths/primitives only.
- ~2px optical padding, consistent metaphors and visual weight across the whole set.

OUTPUT FORMAT (this is how I will implement it — follow exactly):
1. TOKENS — give me BOTH:
   (a) a `tailwind.config` theme.extend object (JS) with the colors/spacing/radii/shadows, and
   (b) the same as CSS custom properties under :root. Plain values, no SCSS.
2. ICONS — give me ONE ready-to-paste TypeScript file `icons.tsx` that exports
   `export const ICONS: Record<string, ReactNode> = { 'arrow': (<path .../>), ... }`
   where each value is ONLY the inner SVG markup (paths/primitives, no <svg> wrapper).
   Use the exact kebab-case names from the list. Also include a tiny `Icon` component:
   `function Icon({ name, size = 18 }: { name: keyof typeof ICONS; size?: number })` that wraps
   the inner markup in the standard <svg> above. One file, valid TSX, React 18 + TS.
3. COMPONENTS — for the core widgets, give copy-paste `.tsx` snippets using ONLY Tailwind v3
   utility classes (no external UI library, no styled-components, no extra deps). Functional
   components, TypeScript, props typed. Match our stack (React 18 + Tailwind v3).
   Plus ONE interactive React+Tailwind artifact = a visual gallery of the dark theme:
   top toolbar, tool strip, contextual property bar, left thumbnail panel, right
   properties/comments panel, status bar, and every widget (buttons in all variants+states,
   segmented control, dropdown + context menu, tooltip, modal, toast, tabs, text/number/search
   inputs, select, checkbox/radio/switch, slider, color-picker popover + swatches,
   progress/spinner, empty state, badge, drag handle, shortcut chips). German labels.
4. CURSORS — per-tool cursors as inline SVG `data:` URI strings (ready for CSS `cursor:`),
   keyed by tool name.
5. MANIFEST — a JSON object mapping every app action/tool name -> icon name, so wiring is
   mechanical (e.g. { "tool.arrow": "arrow", "file.save": "save", ... }).

Keep everything visually consistent: same stroke, same radii, same weight. German tooltips/labels.

ELEMENTS TO DESIGN (icons + states):
Datei: open, save, save-as, print, recent, close, new-from-images, new-from-office.
History: undo, redo.
View/Zoom: zoom-in, zoom-out, fit-width, fit-page, actual-size, rotate-view, fullscreen,
  layout-single, layout-continuous, layout-spread, hand-pan.
Navigation: first-page, prev-page, next-page, last-page, goto-page, panel-thumbnails,
  panel-bookmarks, outline-toc, search, find-next, find-prev.
Markup tools: select, text, note, highlight, underline, strikethrough, squiggly, freehand,
  eraser, line, arrow, rectangle, ellipse, polygon, cloud, callout, signature, initials,
  stamp, insert-image, link, redaction.
Format bar: fill-color, stroke-color, color-swatch, stroke-width, opacity, font-family,
  font-size, bold, italic, underline-text, align-left/center/right, arrowhead-start,
  arrowhead-end, line-style-solid, line-style-dashed, delete, duplicate, bring-front, send-back.
Pages: rotate-left, rotate-right, delete-page, duplicate-page, insert-blank, insert-from-file,
  extract, replace, drag-handle, crop, resize, merge, split, select-all, page-checkbox.
Forms: field-text, field-checkbox, field-radio, field-dropdown, field-listbox, field-button,
  field-date, field-signature, detect-fields, fill-form, flatten, clear-form, highlight-fields.
Security/Redaction: encrypt-lock, unlock, password, permissions, redaction-mark,
  apply-redaction, sanitize, remove-metadata.
Convert/OCR/Optimize: export-word, export-excel, export-powerpoint, export-image, export-html,
  export-txt, import-image, import-office, import-scanner, ocr, language, compress, pdf-a.
Measure: measure-distance, measure-area, measure-perimeter, calibrate-scale.
Bookmarks/Links/Watermark: bookmark-add, bookmark-edit, bookmark-delete, bookmark-indent,
  link-internal, link-external, watermark, header-footer, background, page-numbers, bates.
Status/feedback: dirty-indicator, spinner, progress, error-banner, confirm-destructive.
App: app-logo, about, settings.

Then give me the raw SVGs as a separate copyable list so I can save each as a file.
```

---

## 4. Integration (wenn die Lieferung da ist)

Die oben verlangten 5 Artefakte droppen 1:1 rein:
- **`icons.tsx`** → `src/renderer/src/components/icons/icons.tsx`. Die `Icon`-Komponente
  ersetzt lucide-react schrittweise (Toolbar/Sidebar/Modals nutzen dann `<Icon name="…" />`).
- **Manifest (JSON)** → `src/renderer/src/components/icons/manifest.ts`. Action→Icon-Mapping,
  damit Buttons mechanisch verdrahtet werden.
- **Tokens** → `theme.extend` nach `tailwind.config.js` (Farben großteils schon drin),
  CSS-Variablen nach `styles/index.css`.
- **Component-Snippets** → `src/renderer/src/components/ui/` (Button, Menu, Modal, Toast,
  Tabs, Slider, ColorPicker, …) als Basis-Kit.
- **Cursors** → `styles/index.css` als `cursor: url("data:image/svg+xml,…")` pro Werkzeug.

> Wenn du die Antwort von Claude einfach hier reinpastest, baue ich daraus diese Dateien
> und ziehe Toolbar/Sidebar/Modals auf das neue Kit um.
