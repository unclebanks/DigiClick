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
const BASE_MANUAL_ATTACK_DAMAGE = 1
const MANUAL_ATTACK_DIGIMON_SCALING = 5

// Higher speed (and item/skill modifiers) shrinks the wait between automatic attacks.
export function getAttackIntervalMs(speed: number, speedModifier = 1): number {
  const interval = (BASE_ATTACK_INTERVAL_MS - speed * 20) / Math.max(0.1, speedModifier)

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

// Manual "attack button" damage, independent of a Digimon's own combat stats: starts at 1 and
// grows as the trainer collects more Digimon. `itemBonus` is a reserved hook for upgrade items,
// which aren't wired up yet.
export function getManualAttackDamage(totalDigimonOwned: number, itemBonus = 0): number {
  const digimonBonus = Math.floor(Math.max(0, totalDigimonOwned - 1) / MANUAL_ATTACK_DIGIMON_SCALING)

  return Math.max(1, BASE_MANUAL_ATTACK_DAMAGE + digimonBonus + itemBonus)
}

export function resolveVictoryRewards(
  defeatedEnemy: CombatantState,
  rng: () => number = Math.random,
): VictoryRewards {
  const bits = Math.floor(defeatedEnemy.level * 4) + 5
  const exp = Math.round(defeatedEnemy.level * 8 + defeatedEnemy.maxHp / 4)
  const droppedItemIds = (defeatedEnemy.drops ?? [])
    .filter((drop) => rng() <= drop.chance)
    .map((drop) => drop.itemId)

  return { bits, exp, droppedItemIds }
}

