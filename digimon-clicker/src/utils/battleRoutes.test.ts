import { describe, expect, it } from 'vitest'
import { isRouteUnlocked, getDefaultBattleRoute } from './battleRoutes'
import { sampleBattleRoutes } from '../data/areas'

describe('battle route helpers', () => {
  it('keeps route 1 unlocked by default and locks later routes until the player meets their requirements', () => {
    const defaultRoute = getDefaultBattleRoute(sampleBattleRoutes)

    expect(defaultRoute.id).toBe('route-1')
    expect(isRouteUnlocked(sampleBattleRoutes[0], 1)).toBe(true)
    expect(isRouteUnlocked(sampleBattleRoutes[1], 1)).toBe(false)
    expect(isRouteUnlocked(sampleBattleRoutes[1], 3)).toBe(true)
  })
})
