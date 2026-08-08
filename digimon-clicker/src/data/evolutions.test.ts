import { describe, expect, it } from 'vitest'
import { sampleDigimon } from './digimon'
import { sampleEvolutions } from './evolutions'

// Guards against typos/renames leaving an evolution edge pointing at a species that doesn't
// exist - evolving into one would silently drop that Digimon from every page that renders it.
describe('sampleEvolutions referential integrity', () => {
  const speciesIds = new Set(sampleDigimon.map((digimon) => digimon.id))

  it('only references "from" ids that exist in sampleDigimon', () => {
    const missing = sampleEvolutions
      .map((evolution) => evolution.from)
      .filter((id) => !speciesIds.has(id))

    expect(missing).toEqual([])
  })

  it('only references "to" ids that exist in sampleDigimon', () => {
    const missing = sampleEvolutions
      .map((evolution) => evolution.to)
      .filter((id) => !speciesIds.has(id))

    expect(missing).toEqual([])
  })
})
