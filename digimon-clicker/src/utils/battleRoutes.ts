export interface BattleRoute {
  id: string
  region: string
  routeNumber: number
  name: string
  description: string
  requiredPlayerLevel: number
  requiredPartySize: number
  encounterIds: string[]
  unlockedByDefault?: boolean
}

export function getDefaultBattleRoute(routes: BattleRoute[]) {
  return routes.find((route) => route.unlockedByDefault) ?? routes[0]
}

export function isRouteUnlocked(route: BattleRoute, playerLevel: number) {
  if (route.unlockedByDefault || route.routeNumber === 1) {
    return true
  }

  return playerLevel >= route.requiredPlayerLevel
}
