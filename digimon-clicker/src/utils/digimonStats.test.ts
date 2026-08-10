import { describe, expect, it } from 'vitest'
import { calculateDigimonStats, formatStatWithBonus } from './digimonStats'

describe('digimon stat helpers', () => {
  it('applies level growth and experience multipliers', () => {
    const stats = calculateDigimonStats({ attack: 10, defense: 8, speed: 7, hp: 20 }, 3)
    expect(stats.attack).toBe(12)
    expect(stats.hp).toBe(23)
  })

  it('falls back to the flat growth curve when no lv99 target is given', () => {
    const withoutTarget = calculateDigimonStats({ attack: 10, defense: 8, speed: 7, hp: 20 }, 10)
    expect(withoutTarget).toEqual({ attack: 17, defense: 14, speed: 12, hp: 34 })
  })

  it('interpolates linearly toward an lv99 target when one is given', () => {
    const base = { attack: 100, defense: 100, speed: 100, hp: 100 }
    const lv99 = { attack: 1000, defense: 1000, speed: 1000, hp: 1000 }

    expect(calculateDigimonStats(base, 1, {}, lv99)).toEqual({ attack: 100, defense: 100, speed: 100, hp: 100 })
    expect(calculateDigimonStats(base, 99, {}, lv99)).toEqual({ attack: 1000, defense: 1000, speed: 1000, hp: 1000 })
    // Halfway between level 1 and level 99 (level 50) should be halfway between the two targets.
    expect(calculateDigimonStats(base, 50, {}, lv99)).toEqual({ attack: 550, defense: 550, speed: 550, hp: 550 })
  })

  it('clamps interpolated levels above 99 and still applies the statMultiplier/bonuses', () => {
    const base = { attack: 100, defense: 100, speed: 100, hp: 100 }
    const lv99 = { attack: 1000, defense: 1000, speed: 1000, hp: 1000 }

    expect(calculateDigimonStats(base, 150, {}, lv99)).toEqual({ attack: 1000, defense: 1000, speed: 1000, hp: 1000 })
    expect(calculateDigimonStats(base, 99, { statMultiplier: 0.5, attackBonus: 5 }, lv99)).toEqual({
      attack: 505,
      defense: 500,
      speed: 500,
      hp: 500,
    })
  })

  it('applies sp/int/spi bonuses just like the four core stats', () => {
    const stats = calculateDigimonStats(
      { attack: 10, defense: 8, speed: 7, hp: 20, sp: 5, int: 5, spi: 5 },
      1,
      { spBonus: 50, intBonus: 30, spiBonus: 100 },
    )
    expect(stats).toMatchObject({ sp: 55, int: 35, spi: 105 })
  })
})

describe('formatStatWithBonus', () => {
  it('shows just the plain value when there is no bonus', () => {
    expect(formatStatWithBonus(120, 120)).toBe('120')
  })

  it('shows "Normal (+Boost)" when the boosted value is higher', () => {
    expect(formatStatWithBonus(120, 170)).toBe('120 (+50)')
  })
})

