export interface BattleRoute {
  id: string
  region: string
  routeNumber: number
  name: string
  description: string
  requiredPlayerLevel: number
  requiredPartySize: number
  encounterIds: string[]
  encounterLevelRange?: [number, number]
  unlockedByDefault?: boolean
}

export function getDefaultBattleRoute(routes: BattleRoute[]) {
  return routes.find((route) => route.unlockedByDefault) ?? routes[0]
}

export function isRouteUnlocked(route: BattleRoute, playerLevel: number, partySize: number): boolean {
  if (route.unlockedByDefault || route.routeNumber === 1) {
    return true
  }

  return playerLevel >= route.requiredPlayerLevel && partySize >= route.requiredPartySize
}

// Describes whichever of a locked route's requirements aren't yet met, so the UI can tell the
// player exactly what's missing instead of a generic "still locked" message. Returns [] once the
// route is unlocked.
export function getRouteUnlockRequirements(route: BattleRoute, playerLevel: number, partySize: number): string[] {
  if (isRouteUnlocked(route, playerLevel, partySize)) {
    return []
  }

  const requirements: string[] = []

  if (playerLevel < route.requiredPlayerLevel) {
    requirements.push(`Trainer Level ${route.requiredPlayerLevel} (currently ${playerLevel})`)
  }

  if (partySize < route.requiredPartySize) {
    requirements.push(`a party of ${route.requiredPartySize} Digimon (currently ${partySize})`)
  }

  return requirements
}

export function getEncounterLevel(route: BattleRoute, playerLevel: number) {
  const [minLevel, maxLevel] = route.encounterLevelRange ?? [route.requiredPlayerLevel, route.requiredPlayerLevel]
  const clampedLevel = Math.max(minLevel, Math.min(maxLevel, playerLevel))

  return Math.max(1, clampedLevel)
}

// Picks a random Digimon id from the route's encounter pool instead of always the first entry.
export function pickRandomEncounterId(route: BattleRoute, rng: () => number = Math.random): string | undefined {
  if (!route.encounterIds.length) {
    return undefined
  }

  const index = Math.floor(rng() * route.encounterIds.length)

  return route.encounterIds[Math.min(index, route.encounterIds.length - 1)]
}
