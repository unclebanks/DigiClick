import { describe, expect, it } from 'vitest'
import { dedigivolveDigimonState, evolveDigimonState } from './evolution'

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
})
