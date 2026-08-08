import { describe, expect, it } from 'vitest'
import { getDefaultBattleRoute, getEncounterLevel, isRouteUnlocked, pickRandomEncounterId } from './battleRoutes'
import { battleRoutesByRegion, sampleBattleRoutes } from '../data/areas'

describe('battle route helpers', () => {
  it('keeps route 1 unlocked by default and locks later routes until the player meets their requirements', () => {
    const defaultRoute = getDefaultBattleRoute(sampleBattleRoutes)

    expect(defaultRoute.id).toBe('route-1')
    expect(isRouteUnlocked(sampleBattleRoutes[0], 1, 1)).toBe(true)
    expect(isRouteUnlocked(sampleBattleRoutes[1], 1, 2)).toBe(false)
    expect(isRouteUnlocked(sampleBattleRoutes[1], 3, 2)).toBe(true)
  })

  it('also gates a route behind its required party size, even once the level requirement is met', () => {
    expect(isRouteUnlocked(sampleBattleRoutes[1], 3, 1)).toBe(false)
  })

  it('exposes region-based battle routes with Region 2 entries', () => {
    expect(Array.isArray(battleRoutesByRegion['Region 1'])).toBe(true)
    expect(battleRoutesByRegion['Region 2']?.some((route) => route.id === 'route-6')).toBe(true)
    expect(sampleBattleRoutes.some((route) => route.region === 'Region 2')).toBe(true)
  })

  it('resolves encounter levels from the route level range', () => {
    const route = sampleBattleRoutes[1]

    expect(getEncounterLevel(route, 2)).toBe(2)
    expect(getEncounterLevel(route, 5)).toBe(3)
  })

  it('picks a random encounter id from the route pool instead of always the first entry', () => {
    const route = sampleBattleRoutes[0]

    expect(pickRandomEncounterId(route, () => 0)).toBe(route.encounterIds[0])
    expect(pickRandomEncounterId(route, () => 0.999)).toBe(route.encounterIds[route.encounterIds.length - 1])
    expect(pickRandomEncounterId({ ...route, encounterIds: [] }, () => 0)).toBeUndefined()
  })
})
