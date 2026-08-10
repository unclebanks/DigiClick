import type { DigimonAttribute } from '../types/game'
import { getAttributeMultiplier } from './digimonAttributes'

export interface BattleDrop {
  itemId: string
  chance: number
}

export interface CombatantState {
  id: string
  name: string
  hp: number
  maxHp: number
  attack: number
  defense: number
  speed: number
  level: number
  attribute: DigimonAttribute
  drops?: BattleDrop[]
}

export interface AttackOptions {
  missChance?: number
  critChance?: number
  speedModifier?: number
  rng?: () => number
}

export interface AttackOutcome {
  damage: number
  isCritical: boolean
  isMiss: boolean
  attributeMultiplier: number
  defenderHp: number
  defenderDefeated: boolean
}

export interface VictoryRewards {
  bits: number
  exp: number
  droppedItemIds: string[]
}

const BASE_ATTACK_INTERVAL_MS = 2400
const MIN_ATTACK_INTERVAL_MS = 500
const DEFAULT_MISS_CHANCE = 0.1
const DEFAULT_CRIT_CHANCE = 0.2
// Digimon.baseStats/growthStats are digimon_cleaned.json's raw hundreds-to-thousands scale (see
// digimon.ts) - previously that was divided down by 20 before reaching combat math, so this factor
// is the old tuned value (20) divided by that same 20 to land back on the original pacing/balance
// now that speed itself is ~20x bigger.
const SPEED_TO_MS_FACTOR = 1

// Higher speed (and item/skill modifiers) shrinks the wait between automatic attacks.
export function getAttackIntervalMs(speed: number, speedModifier = 1): number {
  const interval = (BASE_ATTACK_INTERVAL_MS - speed * SPEED_TO_MS_FACTOR) / Math.max(0.1, speedModifier)

  return Math.max(MIN_ATTACK_INTERVAL_MS, Math.round(interval))
}

export function resolveAttack(
  attacker: CombatantState,
  defender: CombatantState,
  options: AttackOptions = {},
): AttackOutcome {
  const { missChance = DEFAULT_MISS_CHANCE, critChance = DEFAULT_CRIT_CHANCE, rng = Math.random } = options

  if (rng() < missChance) {
    return {
      damage: 0,
      isCritical: false,
      isMiss: true,
      attributeMultiplier: 1,
      defenderHp: defender.hp,
      defenderDefeated: defender.hp <= 0,
    }
  }

  const isCritical = rng() < critChance
  const criticalMultiplier = isCritical ? 1 + attacker.level / 100 : 1
  const attributeMultiplier = getAttributeMultiplier(attacker.attribute, defender.attribute)
  const rawDamage = Math.max(1, attacker.attack - defender.defense / 2)
  const damage = Math.max(1, Math.round(rawDamage * criticalMultiplier * attributeMultiplier))
  const defenderHp = Math.max(0, defender.hp - damage)

  return {
    damage,
    isCritical,
    isMiss: false,
    attributeMultiplier,
    defenderHp,
    defenderDefeated: defenderHp === 0,
  }
}

export function resolveVictoryRewards(
  defeatedEnemy: CombatantState,
  rng: () => number = Math.random,
): VictoryRewards {
  const bits = Math.floor(defeatedEnemy.level * 4) + 5
  // maxHp is the raw (unscaled) JSON stat now - divide by the old divisor (20) times the old
  // flat constant (4) to keep this reward at the same original pacing/balance as before.
  const exp = Math.round(defeatedEnemy.level * 8 + defeatedEnemy.maxHp / 80)
  const droppedItemIds = (defeatedEnemy.drops ?? [])
    .filter((drop) => rng() <= drop.chance)
    .map((drop) => drop.itemId)

  return { bits, exp, droppedItemIds }
}

