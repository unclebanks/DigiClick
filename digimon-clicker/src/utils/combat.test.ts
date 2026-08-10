import { describe, expect, it } from 'vitest'
import { getAttackIntervalMs, resolveAttack, resolveVictoryRewards } from './combat'

const makeCombatant = (overrides: Partial<Parameters<typeof resolveAttack>[0]> = {}) => ({
  id: 'agumon',
  name: 'Agumon',
  hp: 600,
  maxHp: 600,
  attack: 375,
  defense: 250,
  speed: 205,
  level: 3,
  attribute: 'Vaccine' as const,
  ...overrides,
})

describe('getAttackIntervalMs', () => {
  it('shrinks the interval as speed and modifiers increase', () => {
    expect(getAttackIntervalMs(0)).toBe(2400)
    expect(getAttackIntervalMs(200)).toBe(2200)
    expect(getAttackIntervalMs(200, 2)).toBe(1100)
    expect(getAttackIntervalMs(2000)).toBe(500)
  })
})

describe('resolveAttack', () => {
  it('deals reduced damage against a defended target', () => {
    const attacker = makeCombatant({ attribute: 'Free' })
    const defender = makeCombatant({ id: 'greymon', name: 'Greymon', defense: 200, attribute: 'Free' })

    const outcome = resolveAttack(attacker, defender, { missChance: 0, critChance: 0, rng: () => 0.99 })

    expect(outcome.isMiss).toBe(false)
    expect(outcome.isCritical).toBe(false)
    expect(outcome.attributeMultiplier).toBe(1)
    expect(outcome.damage).toBe(275) // attack 375 - half of defense 200
  })

  it('applies the attribute triangle multiplier to damage', () => {
    const vaccineAttacker = makeCombatant({ attribute: 'Vaccine' })
    const virusDefender = makeCombatant({ attribute: 'Virus', defense: 0 })

    const outcome = resolveAttack(vaccineAttacker, virusDefender, { missChance: 0, critChance: 0, rng: () => 0.99 })

    expect(outcome.attributeMultiplier).toBe(1.5)
    expect(outcome.damage).toBe(563) // round(375 * 1.5)
  })

  it('returns a miss with no damage when the miss roll succeeds', () => {
    const attacker = makeCombatant()
    const defender = makeCombatant({ hp: 400 })

    const outcome = resolveAttack(attacker, defender, { missChance: 1, rng: () => 0 })

    expect(outcome.isMiss).toBe(true)
    expect(outcome.damage).toBe(0)
    expect(outcome.defenderHp).toBe(400)
  })

  it('marks the defender defeated once hp reaches zero', () => {
    const attacker = makeCombatant({ attack: 50 })
    const defender = makeCombatant({ hp: 5, defense: 0 })

    const outcome = resolveAttack(attacker, defender, { missChance: 0, critChance: 0, rng: () => 0.99 })

    expect(outcome.defenderHp).toBe(0)
    expect(outcome.defenderDefeated).toBe(true)
  })
})

describe('resolveVictoryRewards', () => {
  it('scales bits and exp with the defeated enemy level and rolls drops', () => {
    const enemy = makeCombatant({ level: 5, maxHp: 600, drops: [{ itemId: 'training-chip', chance: 0.5 }] })

    const rewards = resolveVictoryRewards(enemy, () => 0.1)

    expect(rewards.bits).toBe(25)
    expect(rewards.exp).toBe(48) // round(5 * 8 + 600 / 80)
    expect(rewards.droppedItemIds).toEqual(['training-chip'])
  })
})
