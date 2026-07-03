import { applyToDocument } from './applyOp'
import { addWatermark, addPageNumbers, addHeaderFooter } from './decorate'

export const docTools = {
  watermark: (opts: { text: string; opacity: number; fontSize: number }): Promise<void> =>
    applyToDocument('Wasserzeichen', (b) => addWatermark(b, opts)),
  pageNumbers: (): Promise<void> => applyToDocument('Seitenzahlen', (b) => addPageNumbers(b)),
  headerFooter: (opts: { header: string; footer: string }): Promise<void> =>
    applyToDocument('Kopf-/Fußzeile', (b) => addHeaderFooter(b, opts))
}
