import { describe, expect, it } from 'vitest'
import { resolveBattleTurn } from './combat'

describe('resolveBattleTurn', () => {
  it('reduces enemy hp and awards a reward when defeated', () => {
    expect(resolveBattleTurn(4, 24)).toEqual({ enemyHp: 20, defeated: false, reward: 0 })
    expect(resolveBattleTurn(8, 8)).toEqual({ enemyHp: 0, defeated: true, reward: 40 })
  })
})
