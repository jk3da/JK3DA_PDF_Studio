import {
  PDFDocument,
  PDFTextField,
  PDFCheckBox,
  PDFDropdown,
  PDFRadioGroup,
  PDFOptionList
} from 'pdf-lib'

export type FieldKind = 'text' | 'checkbox' | 'dropdown' | 'radio' | 'optionlist' | 'other'

export interface FormFieldInfo {
  name: string
  kind: FieldKind
  value: string | boolean | string[]
  options?: string[]
}

export type FieldValue = string | boolean | string[]

/** Liest alle Formularfelder samt aktuellem Wert aus. */
export async function readFields(bytes: Uint8Array): Promise<FormFieldInfo[]> {
  const doc = await PDFDocument.load(bytes)
  const form = doc.getForm()
  return form.getFields().map((f): FormFieldInfo => {
    const name = f.getName()
    if (f instanceof PDFTextField) return { name, kind: 'text', value: f.getText() ?? '' }
    if (f instanceof PDFCheckBox) return { name, kind: 'checkbox', value: f.isChecked() }
    if (f instanceof PDFDropdown)
      return { name, kind: 'dropdown', value: f.getSelected()[0] ?? '', options: f.getOptions() }
    if (f instanceof PDFRadioGroup)
      return { name, kind: 'radio', value: f.getSelected() ?? '', options: f.getOptions() }
    if (f instanceof PDFOptionList)
      return { name, kind: 'optionlist', value: f.getSelected(), options: f.getOptions() }
    return { name, kind: 'other', value: '' }
  })
}

/** Schreibt Werte in die Felder und gibt neue Bytes zurück. */
export async function applyValues(
  bytes: Uint8Array,
  values: Record<string, FieldValue>
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const form = doc.getForm()
  for (const f of form.getFields()) {
    const name = f.getName()
    if (!(name in values)) continue
    const v = values[name]
    if (f instanceof PDFTextField && typeof v === 'string') f.setText(v)
    else if (f instanceof PDFCheckBox) (v ? f.check() : f.uncheck())
    else if (f instanceof PDFDropdown && typeof v === 'string') {
      if (v) f.select(v)
    } else if (f instanceof PDFRadioGroup && typeof v === 'string') {
      if (v) f.select(v)
    } else if (f instanceof PDFOptionList && Array.isArray(v)) {
      if (v.length) f.select(v)
    }
  }
  return doc.save()
}

/** Brennt das Formular fest (Felder werden zu statischem Inhalt). */
export async function flattenForm(bytes: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  doc.getForm().flatten()
  return doc.save()
}
