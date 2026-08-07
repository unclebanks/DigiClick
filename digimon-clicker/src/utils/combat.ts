export interface BattleDrop {
  itemId: string
  chance: number
}

export interface BattleTurnResult {
  enemyHp: number
  defeated: boolean
  reward: number
  droppedItemIds: string[]
}

export function resolveBattleTurn(
  playerPower: number,
  enemyHp: number,
  drops: BattleDrop[] = [],
  randomFn: () => number = Math.random,
): BattleTurnResult {
  const nextHp = Math.max(0, enemyHp - playerPower)
  const defeated = nextHp === 0

  const droppedItemIds = defeated
    ? drops.filter((drop) => randomFn() <= drop.chance).map((drop) => drop.itemId)
    : []

  return {
    enemyHp: nextHp,
    defeated,
    reward: defeated ? 40 : 0,
    droppedItemIds,
  }
}
