import { describe, expect, it } from 'vitest'
import { getAttackIntervalMs, getManualAttackDamage, resolveAttack, resolveVictoryRewards } from './combat'

const makeCombatant = (overrides: Partial<Parameters<typeof resolveAttack>[0]> = {}) => ({
  id: 'agumon',
  name: 'Agumon',
  hp: 30,
  maxHp: 30,
  attack: 16,
  defense: 4,
  speed: 10,
  level: 3,
  attribute: 'Vaccine' as const,
  ...overrides,
})

describe('getAttackIntervalMs', () => {
  it('shrinks the interval as speed and modifiers increase', () => {
    expect(getAttackIntervalMs(0)).toBe(2400)
    expect(getAttackIntervalMs(50)).toBe(1400)
    expect(getAttackIntervalMs(50, 2)).toBe(700)
    expect(getAttackIntervalMs(1000)).toBe(500)
  })
})

describe('resolveAttack', () => {
  it('deals reduced damage against a defended target', () => {
    const attacker = makeCombatant({ attribute: 'Free' })
    const defender = makeCombatant({ id: 'greymon', name: 'Greymon', defense: 8, attribute: 'Free' })

    const outcome = resolveAttack(attacker, defender, { missChance: 0, critChance: 0, rng: () => 0.99 })

    expect(outcome.isMiss).toBe(false)
    expect(outcome.isCritical).toBe(false)
    expect(outcome.attributeMultiplier).toBe(1)
    expect(outcome.damage).toBe(12) // attack 16 - half of defense 8
  })

  it('applies the attribute triangle multiplier to damage', () => {
    const vaccineAttacker = makeCombatant({ attribute: 'Vaccine' })
    const virusDefender = makeCombatant({ attribute: 'Virus', defense: 0 })

    const outcome = resolveAttack(vaccineAttacker, virusDefender, { missChance: 0, critChance: 0, rng: () => 0.99 })

    expect(outcome.attributeMultiplier).toBe(1.5)
    expect(outcome.damage).toBe(24)
  })

  it('returns a miss with no damage when the miss roll succeeds', () => {
    const attacker = makeCombatant()
    const defender = makeCombatant({ hp: 20 })

    const outcome = resolveAttack(attacker, defender, { missChance: 1, rng: () => 0 })

    expect(outcome.isMiss).toBe(true)
    expect(outcome.damage).toBe(0)
    expect(outcome.defenderHp).toBe(20)
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
    const enemy = makeCombatant({ level: 5, maxHp: 40, drops: [{ itemId: 'training-chip', chance: 0.5 }] })

    const rewards = resolveVictoryRewards(enemy, () => 0.1)

    expect(rewards.bits).toBe(25)
    expect(rewards.exp).toBe(50)
    expect(rewards.droppedItemIds).toEqual(['training-chip'])
  })
})

describe('getManualAttackDamage', () => {
  it('deals 1 damage by default with only a single Digimon owned', () => {
    expect(getManualAttackDamage(1)).toBe(1)
    expect(getManualAttackDamage(0)).toBe(1)
  })

  it('scales up with every 5 additional Digimon owned', () => {
    expect(getManualAttackDamage(6)).toBe(2)
    expect(getManualAttackDamage(11)).toBe(3)
  })

  it('adds a reserved item bonus on top of the digimon scaling', () => {
    expect(getManualAttackDamage(1, 3)).toBe(4)
  })
})
