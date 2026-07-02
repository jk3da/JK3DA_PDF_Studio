import { describe, it, expect } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { readFields, applyValues, flattenForm } from './forms'

async function makeForm(): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([300, 300])
  const form = doc.getForm()
  form.createTextField('name').addToPage(page, { x: 10, y: 200, width: 120, height: 20 })
  form.createCheckBox('agree').addToPage(page, { x: 10, y: 150, width: 15, height: 15 })
  const dd = form.createDropdown('color')
  dd.addOptions(['rot', 'blau'])
  dd.addToPage(page, { x: 10, y: 100, width: 80, height: 20 })
  return doc.save()
}

describe('forms', () => {
  it('detects field names and kinds', async () => {
    const fields = await readFields(await makeForm())
    expect(fields.map((f) => f.name).sort()).toEqual(['agree', 'color', 'name'])
    expect(fields.find((f) => f.name === 'name')?.kind).toBe('text')
    expect(fields.find((f) => f.name === 'agree')?.kind).toBe('checkbox')
    expect(fields.find((f) => f.name === 'color')?.kind).toBe('dropdown')
  })

  it('applyValues fills fields', async () => {
    const out = await applyValues(await makeForm(), { name: 'Jonas', agree: true, color: 'blau' })
    const fields = await readFields(out)
    expect(fields.find((f) => f.name === 'name')?.value).toBe('Jonas')
    expect(fields.find((f) => f.name === 'agree')?.value).toBe(true)
    expect(fields.find((f) => f.name === 'color')?.value).toBe('blau')
  })

  it('flattenForm removes the fields', async () => {
    expect(await readFields(await flattenForm(await makeForm()))).toHaveLength(0)
  })
})
