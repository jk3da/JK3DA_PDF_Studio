/**
 * JK3DA PDF Studio — per-tool cursors.
 *
 * Each value is a ready-to-use CSS `cursor` string (custom SVG data: URI +
 * hotspot + native fallback). Apply to the canvas element per active tool:
 *
 *   canvas.style.cursor = CURSORS[activeTool];
 *
 * Cursors carry their own dark halo + light fill so they read on any page
 * background. They are intentionally NOT part of the strict 24x24 icon spec.
 */

type Hotspot = [number, number];

/** Build a `cursor` value from raw SVG markup. Encodes safely for data: URI. */
const cur = (svg: string, [hx, hy]: Hotspot, fallback = "crosshair"): string =>
  `url("data:image/svg+xml,${encodeURIComponent(svg.trim())}") ${hx} ${hy}, ${fallback}`;

/** 24x24 SVG scaffold with a dark outline + light glyph. */
const glyph = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1b1f24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><g>${inner}</g><g stroke="#ffffff" stroke-width="1.4">${inner}</g></svg>`;

/** Crosshair + small tool badge at lower-right — shared shape tools. */
const crosshair = (badge = "") =>
  glyph(`<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>${badge}`);

export const CURSORS: Record<string, string> = {
  // Pointer / selection
  select: "default",
  "edit-object": "move",

  // Pan
  "hand-pan": "grab",
  "hand-pan-active": "grabbing",

  // Text
  text: "text",
  "field-text": "text",

  // Zoom
  "zoom-in": cur(
    glyph(`<circle cx="10" cy="10" r="6"/><path d="M20 20l-5-5"/><path d="M10 7.5v5M7.5 10h5"/>`),
    [10, 10],
    "zoom-in"
  ),
  "zoom-out": cur(
    glyph(`<circle cx="10" cy="10" r="6"/><path d="M20 20l-5-5"/><path d="M7.5 10h5"/>`),
    [10, 10],
    "zoom-out"
  ),

  // Shape / markup tools — crosshair with a tiny tool hint
  line: cur(crosshair(`<path d="M16 16l5 5"/>`), [12, 12]),
  arrow: cur(crosshair(`<path d="M16 16l5 5M21 21h-3M21 21v-3"/>`), [12, 12]),
  rectangle: cur(crosshair(`<rect x="15" y="15" width="6" height="5" rx="1"/>`), [12, 12]),
  ellipse: cur(crosshair(`<circle cx="18" cy="18" r="3"/>`), [12, 12]),
  polygon: cur(crosshair(`<path d="M18 14l4 3-1.5 4h-5L14 17z"/>`), [12, 12]),
  cloud: cur(crosshair(`<path d="M15 21a2 2 0 0 1 0-4 2.5 2.5 0 0 1 5 0 2 2 0 0 1 0 4z"/>`), [12, 12]),
  callout: cur(crosshair(`<rect x="14" y="14" width="7" height="5" rx="1"/>`), [12, 12]),
  measure: cur(crosshair(`<path d="M15 21h6M18 19v4"/>`), [12, 12]),
  "measure-distance": cur(crosshair(`<path d="M15 21h6M15 19v4M21 19v4"/>`), [12, 12]),
  "measure-area": cur(crosshair(`<rect x="15" y="15" width="6" height="6" rx="1"/>`), [12, 12]),
  "measure-perimeter": cur(crosshair(`<rect x="15" y="15" width="6" height="6" rx="1"/>`), [12, 12]),
  redaction: cur(crosshair(`<rect x="14" y="16" width="8" height="4" rx="1" fill="#1b1f24"/>`), [12, 12]),

  // Drawing
  note: cur(
    glyph(`<path d="M3 3h13v9l-4 4H3z"/><path d="M16 12h-4v4"/>`),
    [3, 3],
    "copy"
  ),
  freehand: cur(
    glyph(`<path d="M4 20l1-4 11-11 3 3-11 11z"/><path d="M14 7l3 3"/>`),
    [4, 20],
    "crosshair"
  ),
  highlight: cur(
    glyph(`<path d="M6 20l-1.5.5.5-1.5 1 1z"/><path d="M5 19l9-9 4 4-9 9z"/><path d="M13 8l4 4"/>`),
    [5, 20],
    "crosshair"
  ),
  signature: cur(
    glyph(`<path d="M3 17c4 0 4-8 6-8s2 6 4 6 2-4 6-4"/><path d="M3 20h17"/>`),
    [3, 20],
    "crosshair"
  ),
  eraser: cur(
    glyph(`<path d="M7 20H4l8-8 5 5-3 3z"/><path d="M9 15l5 5"/>`),
    [6, 20],
    "crosshair"
  ),
  stamp: cur(
    glyph(`<path d="M8 4h6l-1.5 6h-3z"/><path d="M4 11h14M6 14h10"/>`),
    [11, 12],
    "copy"
  ),
  "insert-image": cur(crosshair(`<rect x="14" y="14" width="7" height="6" rx="1"/><circle cx="16.5" cy="16.5" r="0.8"/>`), [12, 12], "copy"),

  // Links
  link: cur(
    glyph(`<path d="M9 13a4 4 0 0 0 6 .5l2-2a4 4 0 0 0-6-6l-1 1M14 11a4 4 0 0 0-6-.5l-2 2a4 4 0 0 0 6 6l1-1"/>`),
    [12, 12],
    "pointer"
  ),
};

export default CURSORS;
