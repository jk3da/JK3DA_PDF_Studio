// Zentraler pdf.js-Einstieg: Worker genau einmal konfigurieren.
// Überall `import { pdfjs } from './pdfjs'` statt pdfjs-dist direkt.
import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
}

export { pdfjs }
