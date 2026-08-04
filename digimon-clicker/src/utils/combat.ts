export interface BattleTurnResult {
  enemyHp: number
  defeated: boolean
  reward: number
}

export function resolveBattleTurn(playerPower: number, enemyHp: number): BattleTurnResult {
  const nextHp = Math.max(0, enemyHp - playerPower)
  const defeated = nextHp === 0

  return {
    enemyHp: nextHp,
    defeated,
    reward: defeated ? 40 : 0,
  }
}
