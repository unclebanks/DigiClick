import { describe, expect, it } from 'vitest'
import { getLevelProgress } from './game'

describe('getLevelProgress', () => {
  it('returns a capped progress value based on currency and level', () => {
    expect(getLevelProgress(1, 250)).toBe(27)
    expect(getLevelProgress(3, 5000)).toBe(100)
  })
})
