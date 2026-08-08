export interface GrowthModifiers {
  attackBonus?: number
  defenseBonus?: number
  speedBonus?: number
  hpBonus?: number
  expMultiplier?: number
  // Applied to the whole level-growth curve, e.g. the de-digivolution penalty.
  statMultiplier?: number
}

export function calculateDigimonStats(
  baseStats: { attack: number; defense: number; speed: number; hp: number },
  level: number,
  modifiers: GrowthModifiers = {},
) {
  const growth = (1 + (level - 1) * 0.08) * (modifiers.statMultiplier ?? 1)

  return {
    attack: Math.round((baseStats.attack * growth) + (modifiers.attackBonus ?? 0)),
    defense: Math.round((baseStats.defense * growth) + (modifiers.defenseBonus ?? 0)),
    speed: Math.round((baseStats.speed * growth) + (modifiers.speedBonus ?? 0)),
    hp: Math.round((baseStats.hp * growth) + (modifiers.hpBonus ?? 0)),
  }
}

export function gainExperience(currentExp: number, amount: number, multiplier = 1) {
  return currentExp + Math.round(amount * multiplier)
}
