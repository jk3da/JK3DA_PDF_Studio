import { describe, it, expect } from 'vitest'
import { createBlankPdf } from './sample'
import { readMetadata, writeMetadata, scrubMetadata } from './metadata'

describe('metadata', () => {
  it('writes then reads back', async () => {
    const out = await writeMetadata(await createBlankPdf(1), { title: 'Titel', author: 'Jonas', keywords: 'a, b' })
    const m = await readMetadata(out)
    expect(m.title).toBe('Titel')
    expect(m.author).toBe('Jonas')
  })

  it('scrub clears title and author', async () => {
    const filled = await writeMetadata(await createBlankPdf(1), { title: 'X', author: 'Y' })
    const m = await readMetadata(await scrubMetadata(filled))
    expect(m.title).toBe('')
    expect(m.author).toBe('')
  })
})
