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

// Phase 5 of the JSON migration: sampleEvolutions is generated from digimon_cleaned.json instead
// of hand-typed, so these guard the generator itself rather than any specific hand-authored edge.
describe('sampleEvolutions generation from digimon_cleaned.json', () => {
  it('generates an edge for every evolvesTo reference now the full roster is imported (Phase 6)', () => {
    expect(sampleEvolutions.length).toBe(1120)
  })

  it('includes edges the old hand-typed list never had, e.g. paildramon -> imperialdramon', () => {
    expect(sampleEvolutions.some((evolution) => evolution.from === 'paildramon' && evolution.to === 'imperialdramon')).toBe(true)
  })
})
