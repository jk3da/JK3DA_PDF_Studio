import React, { ReactNode } from "react";

/**
 * JK3DA PDF Studio — hand-drawn icon set.
 * Every value below is ONLY the inner SVG markup (no <svg> wrapper).
 * The <svg> wrapper is supplied by <Icon/>:
 *   viewBox 0 0 24 24, fill none, stroke currentColor, stroke-width 1.75,
 *   round caps + joins. Size comes from the `size` prop (default 18).
 * Names are kebab-case and match MANIFEST + cursors.ts + the action map.
 */

export const ICONS: Record<string, ReactNode> = {
  // ── Datei ────────────────────────────────────────────────────────────────
  "open": (<><path d="M3 7a1 1 0 0 1 1-1h4l2 2h9a1 1 0 0 1 1 1v2H3z"/><path d="M3 11h18l-1.7 7.3a1 1 0 0 1-1 .7H5.7a1 1 0 0 1-1-.7z"/></>),
  "save": (<><path d="M5 4h10l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M8 4v4h6V4"/><path d="M7 19v-6h10v6"/></>),
  "save-as": (<><path d="M13 20H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10l4 4v3"/><path d="M8 4v4h6V4"/><path d="M16 20h6m0 0-2.4-2.4M22 20l-2.4 2.4"/></>),
  "print": (<><path d="M7 9V4h10v5"/><path d="M7 18H5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2"/><path d="M7 15h10v5H7z"/><path d="M16.5 12.5h.01"/></>),
  "recent": (<><path d="M3.5 9a9 9 0 1 1-.4 5.5"/><path d="M3 14v-4.5h4.5"/><path d="M12 8v4.2l3 1.8"/></>),
  "close": (<><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9.5 12.5l5 5M14.5 12.5l-5 5"/></>),
  "new-from-images": (<><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><circle cx="9.5" cy="12" r="1.1"/><path d="M8 18l2.5-2.5 2 1.5 2-2L17 18"/></>),
  "new-from-office": (<><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 16h8M11.3 12.5v5"/></>),

  // ── Verlauf ──────────────────────────────────────────────────────────────
  "undo": (<><path d="M9 8 5 12l4 4"/><path d="M5 12h9a5 5 0 0 1 5 5v1"/></>),
  "redo": (<><path d="M15 8l4 4-4 4"/><path d="M19 12h-9a5 5 0 0 0-5 5v1"/></>),

  // ── Ansicht / Zoom ───────────────────────────────────────────────────────
  "zoom-in": (<><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.4-4.4"/><path d="M11 8.5v5M8.5 11h5"/></>),
  "zoom-out": (<><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.4-4.4"/><path d="M8.5 11h5"/></>),
  "fit-width": (<><rect x="4" y="5" width="16" height="14" rx="1"/><path d="M9 12H6m0 0 1.5-1.5M6 12l1.5 1.5"/><path d="M15 12h3m0 0-1.5-1.5M18 12l-1.5 1.5"/></>),
  "fit-page": (<><rect x="6" y="4" width="12" height="16" rx="1"/><path d="M12 9V6m0 0-1.5 1.5M12 6l1.5 1.5"/><path d="M12 15v3m0 0 1.5-1.5M12 18l-1.5-1.5"/></>),
  "actual-size": (<><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.4-4.4"/><path d="M11 8.5v5m0-5-1.5 1.1"/></>),
  "rotate-view": (<><path d="M4 12a8 8 0 1 1 2.4 5.7"/><path d="M4 18v-4.5h4.5"/></>),
  "fullscreen": (<><path d="M4 9V5a1 1 0 0 1 1-1h4"/><path d="M20 9V5a1 1 0 0 0-1-1h-4"/><path d="M4 15v4a1 1 0 0 0 1 1h4"/><path d="M20 15v4a1 1 0 0 1-1 1h-4"/></>),
  "layout-single": (<rect x="7" y="4" width="10" height="16" rx="1"/>),
  "layout-continuous": (<><rect x="7" y="3" width="10" height="7" rx="1"/><rect x="7" y="12" width="10" height="7" rx="1"/></>),
  "layout-spread": (<><rect x="3" y="5" width="8" height="14" rx="1"/><rect x="13" y="5" width="8" height="14" rx="1"/></>),
  "hand-pan": (<><path d="M9 11.5V6a1.5 1.5 0 0 1 3 0v4.5"/><path d="M12 10.5V5a1.5 1.5 0 0 1 3 0v6"/><path d="M15 11V7a1.5 1.5 0 0 1 3 0v6.5a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.3-1.8L5 15.4a1.4 1.4 0 0 1 2-2l2 1.9"/><path d="M9 11.5V9a1.5 1.5 0 0 0-3 0v4"/></>),

  // ── Navigation ───────────────────────────────────────────────────────────
  "first-page": (<><path d="M18 6 10 12l8 6z"/><path d="M6 5v14"/></>),
  "prev-page": (<path d="M14 6l-6 6 6 6"/>),
  "next-page": (<path d="M10 6l6 6-6 6"/>),
  "last-page": (<><path d="M6 6l8 6-8 6z"/><path d="M18 5v14"/></>),
  "goto-page": (<><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9.5 12h5M9 16h5M11.5 11l-1 6M14 11l-1 6"/></>),
  "panel-thumbnails": (<><rect x="4" y="5" width="6" height="14" rx="1"/><path d="M13 7.5h7M13 12h7M13 16.5h4"/></>),
  "panel-bookmarks": (<><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9h6"/><path d="M14 4v6l2-1.4L18 10V4"/></>),
  "outline-toc": (<><path d="M9 6.5h11M9 12h11M9 17.5h11"/><path d="M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01"/></>),
  "search": (<><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.4-4.4"/></>),
  "find-next": (<><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.4-4.4"/><path d="M11 8.6v4.8m0 0-1.8-1.8M11 13.4l1.8-1.8"/></>),
  "find-prev": (<><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.4-4.4"/><path d="M11 13.4V8.6m0 0-1.8 1.8M11 8.6l1.8 1.8"/></>),

  // ── Markup-Werkzeuge ─────────────────────────────────────────────────────
  "select": (<><path d="M5 4l4.4 15.5 2.7-6.6L19 10.2z"/></>),
  "text": (<path d="M6 6h12M12 6v13M9.5 19h5"/>),
  "note": (<path d="M20 13a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/>),
  "highlight": (<><path d="M15 4.5l4.5 4.5-8.5 8.5-4.5 1 1-4.5z"/><path d="M13.5 6l4.5 4.5"/><path d="M5 21h9"/></>),
  "underline": (<><path d="M7 5v6a5 5 0 0 0 10 0V5"/><path d="M5 20h14"/></>),
  "strikethrough": (<><path d="M16 8.2a4 3 0 0 0-7 .8c0 3.8 7 1.8 7 5.8a4 3 0 0 1-7 1"/><path d="M4 12h16"/></>),
  "squiggly": (<><path d="M6 7.5h12M6 11h8"/><path d="M5 16.5c1.3-1.8 2.7-1.8 4 0s2.7 1.8 4 0 2.7-1.8 4 0"/></>),
  "freehand": (<><path d="M3 16.5c2-4 4-4 6 0s4 4 5.8.4"/><path d="M14.8 16.9l4.4-4.4 2 2-4.4 4.4-2.6.6z"/></>),
  "eraser": (<><path d="M8.5 18.5H6l-1.2-1.2a2 2 0 0 1 0-2.8l8.5-8.5a2 2 0 0 1 2.8 0l3 3a2 2 0 0 1 0 2.8l-6.7 6.7z"/><path d="M8.5 18.5H20"/><path d="M9.5 11l5 5"/></>),
  "line": (<path d="M5 19 19 5"/>),
  "arrow": (<><path d="M5 19 19 5"/><path d="M19 5h-6M19 5v6"/></>),
  "rectangle": (<rect x="4" y="6" width="16" height="12" rx="1"/>),
  "ellipse": (<ellipse cx="12" cy="12" rx="8" ry="6"/>),
  "polygon": (<path d="M12 4l7 5-2.6 8.2H7.6L5 9z"/>),
  "cloud": (<path d="M7 17.5a4.2 4.2 0 0 1-.4-8.4 5 5 0 0 1 9.5-1 3.6 3.6 0 0 1 .4 9.4z"/>),
  "callout": (<><rect x="8" y="5" width="12" height="9" rx="1"/><path d="M11 14l-5 5 1.4-5"/></>),
  "signature": (<><path d="M4 16.5c4 0 4-8 6-8s2 6 4 6 2-4.5 6-4.5"/><path d="M4 20h16"/></>),
  "initials": (<><rect x="3" y="6" width="18" height="12" rx="1"/><path d="M6.5 15l2-6 2 6M7 13h3"/><path d="M13.5 15V9h2.4a1.6 1.6 0 0 1 0 3.2h-2.4"/></>),
  "stamp": (<><path d="M9.5 4.5h5a1.5 1.5 0 0 1 1.4 2L14.5 12h-5L8.1 6.5a1.5 1.5 0 0 1 1.4-2z"/><path d="M5 15h14"/><path d="M7 19h10"/></>),
  "insert-image": (<><rect x="4" y="5" width="16" height="14" rx="1.5"/><circle cx="9" cy="10" r="1.5"/><path d="M5 17l4.5-4.5 3 2.5L16 11l3 3"/></>),
  "link": (<><path d="M9.5 13.5h5"/><path d="M11 9H8a4 4 0 0 0 0 8h3"/><path d="M13 9h3a4 4 0 0 1 0 8h-3"/></>),
  "redaction": (<><rect x="3" y="8" width="14" height="5" rx="1" fill="currentColor"/><path d="M5 17h12M5 20h8"/></>),

  // ── Format-Leiste ────────────────────────────────────────────────────────
  "fill-color": (<><path d="M5 11l6.5-6.5 6.5 6.5-6 6a1.5 1.5 0 0 1-2 0l-5-5a1.5 1.5 0 0 1 0-2z"/><path d="M11.5 4.5 10 3"/><path d="M5 13h12"/><path d="M19.5 14.5c1.2 1.6 2 2.7 2 3.7a2 2 0 0 1-4 0c0-1 .8-2.1 2-3.7z"/></>),
  "stroke-color": (<><path d="M3 16.5 13 6.5l4 4-10 10H3z"/><path d="M13 6.5 16 3.5l4 4-3 3"/><path d="M3 21h18"/></>),
  "color-swatch": (<><rect x="5" y="5" width="14" height="14" rx="2.5"/><path d="M5 12h14"/></>),
  "stroke-width": (<><path d="M4 7h16" strokeWidth="1"/><path d="M4 12h16" strokeWidth="2.1"/><path d="M4 17.5h16" strokeWidth="3.4"/></>),
  "opacity": (<><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor"/></>),
  "font-family": (<><path d="M3.5 18l4-11 4 11M5 14.5h5"/><path d="M21 11.5a2.6 2.6 0 0 0-5 0v1.5a2.5 2.5 0 0 0 5 0V9m0 9v-6.5"/></>),
  "font-size": (<><path d="M3 17l3-9 3 9M3.8 14h4.4"/><path d="M12 17l4.5-12 4.5 12M13.2 13h6.6"/></>),
  "bold": (<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>),
  "italic": (<path d="M10 5h7M7 19h7M14 5l-4 14"/>),
  "underline-text": (<><path d="M7 5v6a5 5 0 0 0 10 0V5"/><path d="M5 20h14"/></>),
  "align-left": (<path d="M4 6h16M4 10.5h10M4 15h16M4 19.5h10"/>),
  "align-center": (<path d="M4 6h16M7 10.5h10M4 15h16M7 19.5h10"/>),
  "align-right": (<path d="M4 6h16M10 10.5h10M4 15h16M10 19.5h10"/>),
  "arrowhead-start": (<><path d="M5 12h15"/><path d="M5 12l5-4M5 12l5 4"/></>),
  "arrowhead-end": (<><path d="M4 12h15"/><path d="M19 12l-5-4M19 12l-5 4"/></>),
  "line-style-solid": (<path d="M4 12h16"/>),
  "line-style-dashed": (<path d="M4 12h3.2M10.4 12h3.2M16.8 12h3.2"/>),
  "delete": (<><path d="M5 7h14M10 7V5h4v2M6.5 7l1 12a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1l1-12"/><path d="M10 11v6M14 11v6"/></>),
  "duplicate": (<><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>),
  "bring-front": (<><rect x="6" y="9" width="9" height="9" rx="1"/><path d="M11 3v8m0-8L8 6m3-3 3 3"/></>),
  "send-back": (<><rect x="6" y="6" width="9" height="9" rx="1"/><path d="M11 21v-8m0 8 3-3m-3 3-3-3"/></>),

  // ── Seiten ───────────────────────────────────────────────────────────────
  "rotate-left": (<><rect x="8" y="8" width="9" height="10" rx="1"/><path d="M8 6a5 5 0 0 0-4.2 4.5"/><path d="M3 6v4h4"/></>),
  "rotate-right": (<><rect x="7" y="8" width="9" height="10" rx="1"/><path d="M16 6a5 5 0 0 1 4.2 4.5"/><path d="M21 6v4h-4"/></>),
  "delete-page": (<><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9.5 13l5 5M14.5 13l-5 5"/></>),
  "duplicate-page": (<><rect x="8" y="7" width="11" height="14" rx="1"/><path d="M15 7V5a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2"/></>),
  "insert-blank": (<><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M11.5 12v5m-2.5-2.5h5"/></>),
  "insert-from-file": (<><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M11.5 10.5v6m0 0-2.2-2.2M11.5 16.5l2.2-2.2"/></>),
  "extract": (<><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M11.5 17v-6m0 0-2.2 2.2M11.5 11l2.2 2.2"/></>),
  "replace": (<><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9 12.5h5l-1.6-1.6M15 15.5h-5l1.6 1.6"/></>),
  "drag-handle": (<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01"/>),
  "crop": (<><path d="M7 3v14a1 1 0 0 0 1 1h14"/><path d="M3 7h14a1 1 0 0 1 1 1v14"/></>),
  "resize": (<><path d="M14 4h6v6"/><path d="M10 20H4v-6"/><path d="M20 4 4 20"/></>),
  "merge": (<><path d="M5 5l5 5M19 5l-5 5M12 10v9"/><path d="M9 16l3 3 3-3"/></>),
  "split": (<><path d="M12 4v5"/><path d="M12 9c0 3-4.5 3-4.5 7m4.5-7c0 3 4.5 3 4.5 7"/><path d="M5.5 18l2 2 2-2M14.5 18l2 2 2-2"/></>),
  "select-all": (<><rect x="4" y="4" width="16" height="16" rx="2" strokeDasharray="3 2.6"/><path d="M8.5 12l2.5 2.5 5-5"/></>),
  "page-checkbox": (<><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8.5 11l2.5 2.5 5-5"/></>),

  // ── Formulare ────────────────────────────────────────────────────────────
  "field-text": (<><rect x="3" y="7" width="18" height="10" rx="1.5"/><path d="M7 10v4M7 12h7"/></>),
  "field-checkbox": (<><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12l2.5 2.5 5-5"/></>),
  "field-radio": (<><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor"/></>),
  "field-dropdown": (<><rect x="3" y="7" width="18" height="10" rx="1.5"/><path d="M6 12h6"/><path d="M15 11l2 2 2-2"/></>),
  "field-listbox": (<><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M6 9h9M6 15h9"/><rect x="4.5" y="10.7" width="15" height="3.6" rx="0.6" fill="currentColor"/></>),
  "field-button": (<><rect x="3" y="8" width="18" height="8" rx="2.5"/><path d="M8 12h8"/></>),
  "field-date": (<><rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 9.5h16M8 3v4M16 3v4"/><path d="M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01"/></>),
  "field-signature": (<><rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M6 13.5c2 0 2-4 3.5-4s1.5 3 3 3 1.5-2 3-2"/><path d="M6 16h11"/></>),
  "detect-fields": (<><rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M8 9h8M8 13h5"/><path d="M16.5 13.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/></>),
  "fill-form": (<><rect x="3" y="6" width="13" height="12" rx="1.5"/><path d="M7 12h5"/><path d="M14 16.5l5-5 2 2-5 5h-2z"/></>),
  "flatten": (<><path d="M12 4.5l8 4-8 4-8-4z"/><path d="M5 12.5l7 3.5 7-3.5"/><path d="M9 20h6"/></>),
  "clear-form": (<><rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M8 9h8"/><path d="M9.5 13.5l5 5M14.5 13.5l-5 5"/></>),
  "highlight-fields": (<><rect x="3" y="6" width="18" height="12" rx="1.5"/><rect x="6" y="9" width="8" height="6" rx="1" fill="currentColor"/><path d="M16 12h2"/></>),

  // ── Sicherheit / Schwärzung ──────────────────────────────────────────────
  "encrypt-lock": (<><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/></>),
  "unlock": (<><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/><path d="M12 15v2"/></>),
  "password": (<><rect x="4" y="10" width="16" height="9" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M9 14.5h.01M12 14.5h.01M15 14.5h.01"/></>),
  "permissions": (<><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><path d="M9.6 15.5l1.6 1.6 3-3"/></>),
  "redaction-mark": (<><path d="M5 6h14M5 18h14M5 21.5h8"/><rect x="4.5" y="9" width="15" height="5.5" rx="1" strokeDasharray="3 2.4"/></>),
  "apply-redaction": (<><rect x="3" y="8" width="13" height="6" rx="1" fill="currentColor"/><path d="M5 18h7"/><path d="M15.5 18.5l2 2 4-4"/></>),
  "sanitize": (<><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M12 8l1 2.5 2.5 1-2.5 1L12 15l-1-2.5-2.5-1 2.5-1z"/></>),
  "remove-metadata": (<><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><circle cx="11.5" cy="14" r="3.2"/><path d="M9.2 16.3l4.6-4.6"/></>),

  // ── Konvertieren / OCR / Optimieren ──────────────────────────────────────
  "export-word": (<><path d="M11 4h6l3 3v12a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M17 4v3h3"/><path d="M5 18v-9m0 0-2 2m2-2 2 2"/><path d="M12.5 11l1 5 1.5-4 1.5 4 1-5"/></>),
  "export-excel": (<><path d="M11 4h6l3 3v12a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M17 4v3h3"/><path d="M5 18v-9m0 0-2 2m2-2 2 2"/><path d="M12.8 11l3.4 5M16.2 11l-3.4 5"/></>),
  "export-powerpoint": (<><path d="M11 4h6l3 3v12a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M17 4v3h3"/><path d="M5 18v-9m0 0-2 2m2-2 2 2"/><path d="M13 16v-5h2.4a1.8 1.8 0 0 1 0 3.6H13"/></>),
  "export-image": (<><path d="M11 4h6l3 3v12a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M17 4v3h3"/><path d="M5 18v-9m0 0-2 2m2-2 2 2"/><circle cx="13.5" cy="12" r="1"/><path d="M11.5 17l2.5-2.5L18 17"/></>),
  "export-html": (<><path d="M11 4h6l3 3v12a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M17 4v3h3"/><path d="M5 18v-9m0 0-2 2m2-2 2 2"/><path d="M14 11l-2 2.5 2 2.5M16.5 11l2 2.5-2 2.5"/></>),
  "export-txt": (<><path d="M11 4h6l3 3v12a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M17 4v3h3"/><path d="M5 18v-9m0 0-2 2m2-2 2 2"/><path d="M12.5 11.5h5M12.5 14h5M12.5 16.5h3"/></>),
  "import-image": (<><path d="M11 20H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6l3 3v4"/><path d="M13 4v3h3"/><path d="M19 19v-9m0 0-2 2m2-2 2 2"/><circle cx="9.5" cy="10" r="1"/><path d="M7 15l2.5-2.5L12 15"/></>),
  "import-office": (<><path d="M11 20H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6l3 3v4"/><path d="M13 4v3h3"/><path d="M19 19v-9m0 0-2 2m2-2 2 2"/><path d="M7 11h6M7 14h6M10 11v6"/></>),
  "import-scanner": (<><rect x="3" y="9" width="18" height="6" rx="1.5"/><path d="M3 12h18"/><path d="M6 6h12M6 18h12"/></>),
  "ocr": (<><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M9 16l3-8 3 8M10 13.5h4"/></>),
  "language": (<><circle cx="12" cy="12" r="8"/><path d="M4 12h16"/><path d="M12 4c2.6 2.4 2.6 13.6 0 16M12 4c-2.6 2.4-2.6 13.6 0 16"/></>),
  "compress": (<><path d="M4 12h6m0 0L7 9m3 3-3 3"/><path d="M20 12h-6m0 0 3-3m-3 3 3 3"/><path d="M4 5v2M20 5v2M4 17v2M20 17v2"/></>),
  "pdf-a": (<><path d="M6 3h8l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/><path d="M8.5 17l2.5-6 2.5 6M9.2 15h3.6"/></>),

  // ── Messen ───────────────────────────────────────────────────────────────
  "measure-distance": (<><path d="M5 6v12M19 6v12M5 12h14m0 0-3-3m3 3-3 3"/></>),
  "measure-area": (<><rect x="4" y="6" width="16" height="12" rx="1"/><path d="M4 14l5.5-8M9.5 18l9-12M14.5 18l5.5-8"/></>),
  "measure-perimeter": (<><rect x="4" y="6" width="16" height="12" rx="1" strokeDasharray="3 2.4"/><circle cx="4" cy="6" r="1.3" fill="currentColor"/><circle cx="20" cy="6" r="1.3" fill="currentColor"/><circle cx="4" cy="18" r="1.3" fill="currentColor"/><circle cx="20" cy="18" r="1.3" fill="currentColor"/></>),
  "calibrate-scale": (<><rect x="3" y="6" width="18" height="6" rx="1"/><path d="M7 6v3M11 6v4M15 6v3M19 6v3"/><path d="M8 16h8m-8 3h8M8 15v5M16 15v5"/></>),

  // ── Lesezeichen / Links / Wasserzeichen ──────────────────────────────────
  "bookmark-add": (<><path d="M6 4h7v16l-3.5-2.5L6 20z"/><path d="M16.5 6.5h5m-2.5-2.5v5"/></>),
  "bookmark-edit": (<><path d="M6 4h7v7"/><path d="M6 4v16l3.5-2.5L13 20v-4"/><path d="M19 9.5l1.8 1.8-4.6 4.6h-1.8v-1.8z"/></>),
  "bookmark-delete": (<><path d="M6 4h7v16l-3.5-2.5L6 20z"/><path d="M16.5 5l5 5m0-5-5 5"/></>),
  "bookmark-indent": (<><path d="M10 6.5h10M10 12h10M10 17.5h10"/><path d="M4 9l3 3-3 3"/></>),
  "link-internal": (<><path d="M9.5 13.5h5"/><path d="M11 9H8a4 4 0 0 0 0 8h3"/><path d="M13 9h3a4 4 0 0 1 0 8h-3"/></>),
  "link-external": (<><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/><path d="M14 4h6v6"/><path d="M20 4l-8.5 8.5"/></>),
  "watermark": (<><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M8.5 17 16 9.5" strokeDasharray="1 2.6"/></>),
  "header-footer": (<><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M5 7.5h14M5 16.5h14"/><path d="M8 11h8M8 13h5"/></>),
  "background": (<><rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 9.5l5.5-5.5M4 15l11-11M4 20.5l16-16M9.5 20l10.5-10.5M15 20l5-5"/></>),
  "page-numbers": (<><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 18h6"/><path d="M11.5 14.5l1.2-1v5.5"/></>),
  "bates": (<><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M6.5 11v3l1-1M10 11h2v3h-2M14.5 11h2v3h-2v-1.5h1.5"/></>),

  // ── Status / Feedback ────────────────────────────────────────────────────
  "dirty-indicator": (<circle cx="12" cy="12" r="5" fill="currentColor"/>),
  "spinner": (<path d="M12 4a8 8 0 1 0 8 8"/>),
  "progress": (<><rect x="3" y="10" width="18" height="4" rx="2"/><path d="M5 12h7" strokeWidth="2.6"/></>),
  "error-banner": (<><path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.5h.01"/></>),
  "confirm-destructive": (<><path d="M5 7h14M10 7V5h4v2M6.5 7l1 12a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1l1-12"/><path d="M12 11v3.5M12 17h.01"/></>),

  // ── App ──────────────────────────────────────────────────────────────────
  "app-logo": (<><path d="M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5"/><path d="M8.5 18v-7h3.2a2.2 2.2 0 0 1 0 4.4H8.5"/></>),
  "about": (<><circle cx="12" cy="12" r="8"/><path d="M12 11.5v4.5M12 8h.01"/></>),
  "settings": (<><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"/></>),
};

export type IconName = keyof typeof ICONS;

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
  name: IconName | string;
  size?: number;
}

/** Standard wrapper — enforces the icon spec. Color follows currentColor. */
export function Icon({ name, size = 18, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {ICONS[name as string] ?? null}
    </svg>
  );
}

export default Icon;
