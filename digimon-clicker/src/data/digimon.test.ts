import { describe, expect, it } from 'vitest'
import { sampleDigimon } from './digimon'

// Phase 6 of the JSON migration: sampleDigimon now includes the full digimon_cleaned.json roster
// (curated species with hand-picked flavor + everything else bulk-imported), so this guards the
// two things that are easy to break when mixing a curated list with a generated bulk-import: no id
// collisions, and every entry still has the fields the UI unconditionally renders.
describe('sampleDigimon (full digimon_cleaned.json roster)', () => {
  it('has a unique id for every species', () => {
    const ids = sampleDigimon.map((digimon) => digimon.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes the full digimon_cleaned.json dataset plus the manual-fallback species it lacks', () => {
    // 475 from digimon_cleaned.json + 6 hand-authored species with no match there (see digimon.ts).
    expect(sampleDigimon.length).toBe(481)
  })

  it('gives every entry the fields pages/components render unconditionally', () => {
    for (const digimon of sampleDigimon) {
      expect(digimon.name).toBeTruthy()
      expect(digimon.emoji).toBeTruthy()
      expect(digimon.stage).toBeTruthy()
      expect(digimon.personality).toBeTruthy()
    }
  })
})
