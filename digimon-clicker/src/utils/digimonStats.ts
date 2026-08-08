import type { StatGrowthRange } from '../types/game'

// Re-exported so existing call sites can keep importing it from here.
export type { StatGrowthRange }

export interface GrowthModifiers {
  attackBonus?: number
  defenseBonus?: number
  speedBonus?: number
  hpBonus?: number
  // Applied to the whole level-growth curve, e.g. the de-digivolution penalty.
  statMultiplier?: number
}

const FLAT_GROWTH_PER_LEVEL = 0.08
const MAX_INTERPOLATED_LEVEL = 99

// Interpolates linearly between a stat's level-1 value and its level-99 target - the same scale
// digimon_cleaned.json provides. When no lv99 target is given for a Digimon, falls back to the
// original flat growth curve so un-migrated data keeps behaving exactly as before.
function scaleStat(base: number, level: number, lv99: number | undefined, statMultiplier: number): number {
  if (lv99 === undefined) {
    return base * (1 + (level - 1) * FLAT_GROWTH_PER_LEVEL) * statMultiplier
  }

  const clampedLevel = Math.max(1, Math.min(MAX_INTERPOLATED_LEVEL, level))
  const progress = (clampedLevel - 1) / (MAX_INTERPOLATED_LEVEL - 1)

  return (base + (lv99 - base) * progress) * statMultiplier
}

export function calculateDigimonStats(
  baseStats: { attack: number; defense: number; speed: number; hp: number; sp?: number; int?: number; spi?: number },
  level: number,
  modifiers: GrowthModifiers = {},
  lv99Stats?: StatGrowthRange,
) {
  const statMultiplier = modifiers.statMultiplier ?? 1

  // sp/int/spi have no lv99 growth target (see StatGrowthRange) - only the 4 core combat stats do -
  // so they always use the flat growth curve, just like un-migrated Digimon do for every stat.
  return {
    attack: Math.round(scaleStat(baseStats.attack, level, lv99Stats?.attack, statMultiplier) + (modifiers.attackBonus ?? 0)),
    defense: Math.round(scaleStat(baseStats.defense, level, lv99Stats?.defense, statMultiplier) + (modifiers.defenseBonus ?? 0)),
    speed: Math.round(scaleStat(baseStats.speed, level, lv99Stats?.speed, statMultiplier) + (modifiers.speedBonus ?? 0)),
    hp: Math.round(scaleStat(baseStats.hp, level, lv99Stats?.hp, statMultiplier) + (modifiers.hpBonus ?? 0)),
    ...(baseStats.sp === undefined ? {} : { sp: Math.round(scaleStat(baseStats.sp, level, undefined, statMultiplier)) }),
    ...(baseStats.int === undefined ? {} : { int: Math.round(scaleStat(baseStats.int, level, undefined, statMultiplier)) }),
    ...(baseStats.spi === undefined ? {} : { spi: Math.round(scaleStat(baseStats.spi, level, undefined, statMultiplier)) }),
  }
}


