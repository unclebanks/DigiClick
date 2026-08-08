import { describe, expect, it } from 'vitest'
import { createInitialDigimonProgression, gainDigimonExperience } from './digimonProgression'

describe('digimon progression', () => {
  it('starts new Digimon at level 5 by default with zero experience', () => {
    const initial = createInitialDigimonProgression()

    expect(initial).toEqual({ level: 5, exp: 0, expToNextLevel: 208 })
  })

  it('supports starting at an explicit level, e.g. level 1 after digivolving', () => {
    const initial = createInitialDigimonProgression(1)

    expect(initial).toEqual({ level: 1, exp: 0, expToNextLevel: 100 })

    const afterGain = gainDigimonExperience(initial, 140)
    expect(afterGain).toEqual({ level: 2, exp: 40, expToNextLevel: 120 })
  })
})
