import { describe, expect, it } from 'vitest'
import { createInitialDigimonProgression, gainDigimonExperience } from './digimonProgression'

describe('digimon progression', () => {
  it('starts new Digimon at level 1 with zero experience and levels up from earned experience', () => {
    const initial = createInitialDigimonProgression()

    expect(initial).toEqual({ level: 1, exp: 0, expToNextLevel: 100 })

    const afterGain = gainDigimonExperience(initial, 140)
    expect(afterGain).toEqual({ level: 2, exp: 40, expToNextLevel: 120 })
  })
})
