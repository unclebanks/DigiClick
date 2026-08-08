import { describe, expect, it } from 'vitest'
import { calculateDigimonStats } from './digimonStats'

describe('digimon stat helpers', () => {
  it('applies level growth and experience multipliers', () => {
    const stats = calculateDigimonStats({ attack: 10, defense: 8, speed: 7, hp: 20 }, 3)
    expect(stats.attack).toBe(12)
    expect(stats.hp).toBe(23)
  })
})
