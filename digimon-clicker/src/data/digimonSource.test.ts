import { describe, expect, it } from 'vitest'
import { findDanglingEvolutionReferences, getRawDigimonBySlug, rawDigimonList } from './digimonSource'

// Phase 1 of the JSON migration (see /memories/repo/digimon-json-migration-plan.md): this only
// validates the raw source data. Nothing in the app reads from digimonSource.ts yet.
describe('digimonSource (raw digimon_cleaned.json adapter)', () => {
  it('parses every entry in the reference dataset', () => {
    expect(rawDigimonList.length).toBe(475)
  })

  it('gives every entry a slug matching its JSON key, with real stats attached', () => {
    const agumon = getRawDigimonBySlug('agumon')

    expect(agumon?.name).toBe('Agumon')
    expect(agumon?.generation).toBe('Rookie')
    expect(agumon?.stats.HP.lv1).toBeGreaterThan(0)
    expect(agumon?.stats.HP.lv99).toBeGreaterThan(agumon!.stats.HP.lv1)
  })

  it('has no dangling evolvesTo/evolvesFrom references', () => {
    expect(findDanglingEvolutionReferences()).toEqual([])
  })
})
