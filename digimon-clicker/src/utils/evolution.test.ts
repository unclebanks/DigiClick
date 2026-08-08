import { describe, expect, it } from 'vitest'
import {
  canSatisfyEvolutionRequirements,
  dedigivolveDigimonState,
  evolveDigimonState,
  formatEvolutionRequirements,
  getEvolutionOptions,
  itemReq,
  levelReq,
  multiReq,
} from './evolution'

describe('evolution helpers', () => {
  it('tracks permanent evolution and de-digivolution with a penalty', () => {
    const evolved = evolveDigimonState(
      {
        currentFormId: 'agumon',
        history: ['agumon'],
        penaltyCount: 0,
        penaltyMultiplier: 1,
      },
      'greymon',
    )

    expect(evolved.currentFormId).toBe('greymon')
    expect(evolved.history).toEqual(['agumon', 'greymon'])

    const dedigivolved = dedigivolveDigimonState(evolved)

    expect(dedigivolved.currentFormId).toBe('agumon')
    expect(dedigivolved.penaltyCount).toBe(1)
    expect(dedigivolved.penaltyMultiplier).toBeCloseTo(0.85)
  })

  it('supports level-only and item-based evolution requirements', () => {
    const levelOnly = [levelReq(3)]
    expect(canSatisfyEvolutionRequirements(levelOnly, { level: 3, inventory: [] })).toBe(true)
    expect(canSatisfyEvolutionRequirements(levelOnly, { level: 2, inventory: [] })).toBe(false)

    const itemRequirement = [levelReq(4), itemReq('egg-of-courage')]
    expect(canSatisfyEvolutionRequirements(itemRequirement, { level: 4, inventory: ['egg-of-courage'] })).toBe(true)
    expect(canSatisfyEvolutionRequirements(itemRequirement, { level: 4, inventory: [] })).toBe(false)

    const formatted = formatEvolutionRequirements(itemRequirement)
    expect(formatted).toContain('Level 4')
    expect(formatted).toContain('Egg Of Courage')
  })

  it('supports combined multi requirements and badge gating', () => {
    const combo = [multiReq(levelReq(5), itemReq('training-chip'))]
    expect(canSatisfyEvolutionRequirements(combo, { level: 5, inventory: ['training-chip'] })).toBe(true)
    expect(canSatisfyEvolutionRequirements(combo, { level: 5, inventory: [] })).toBe(false)
  })

  it('filters evolution edges by their current form id', () => {
    const evolutions = [
      { id: 'a', from: 'agumon', to: 'greymon', cost: 10, requires: [] },
      { id: 'b', from: 'gabumon', to: 'garurumon', cost: 10, requires: [] },
    ]

    expect(getEvolutionOptions('agumon', evolutions)).toEqual([evolutions[0]])
  })
})
