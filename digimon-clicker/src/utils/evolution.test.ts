import { describe, expect, it } from 'vitest'
import { canSatisfyEvolutionRequirements, dedigivolveDigimonState, evolveDigimonState, formatEvolutionRequirements } from './evolution'

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
    const levelOnly = [{ minLevel: 3, notes: 'Requires level 3.' }]
    expect(canSatisfyEvolutionRequirements(levelOnly, 3, [])).toBe(true)
    expect(canSatisfyEvolutionRequirements(levelOnly, 2, [])).toBe(false)

    const itemRequirement = [{ minLevel: 4, requiredItemId: 'egg-of-courage', notes: 'Requires level 4 and the Egg of Courage.' }]
    expect(canSatisfyEvolutionRequirements(itemRequirement, 4, ['egg-of-courage'])).toBe(true)
    expect(canSatisfyEvolutionRequirements(itemRequirement, 4, [])).toBe(false)

    const formatted = formatEvolutionRequirements(itemRequirement)
    expect(formatted).toContain('Level 4')
    expect(formatted).toContain('Egg of Courage')
  })
})
