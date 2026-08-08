import { describe, expect, it } from 'vitest'
import {
  addScanProgress,
  canRecruitFromScan,
  getScanBonusRatio,
  getScanGainFromDefeat,
  getScanStatBonus,
  hasBonusScanTier,
} from './scanning'

describe('scanning helpers', () => {
  it('gains more scan progress from defeating higher level Digimon', () => {
    expect(getScanGainFromDefeat(1)).toBe(17)
    expect(getScanGainFromDefeat(5)).toBe(25)
    expect(getScanGainFromDefeat(10)).toBe(35)
    expect(getScanGainFromDefeat(0)).toBe(15)
    expect(getScanGainFromDefeat(-5)).toBe(15)
  })

  it('clamps accumulated scan progress between 0 and 200', () => {
    expect(addScanProgress(90, 25)).toBe(115)
    expect(addScanProgress(190, 50)).toBe(200)
    expect(addScanProgress(5, -20)).toBe(0)
  })

  it('unlocks recruiting at 100 percent and the bonus tier as soon as it is exceeded', () => {
    expect(canRecruitFromScan(99)).toBe(false)
    expect(canRecruitFromScan(100)).toBe(true)
    expect(hasBonusScanTier(100)).toBe(false)
    expect(hasBonusScanTier(101)).toBe(true)
    expect(hasBonusScanTier(200)).toBe(true)
  })

  it('scales the bonus ratio linearly from 0% at 100 progress to 10% at 200 progress', () => {
    expect(getScanBonusRatio(100)).toBe(0)
    expect(getScanBonusRatio(150)).toBeCloseTo(0.05)
    expect(getScanBonusRatio(200)).toBeCloseTo(0.1)
    expect(getScanBonusRatio(250)).toBeCloseTo(0.1)
  })

  it('grants a proportional stat bonus once scan progress passes 100 percent', () => {
    const baseStats = { attack: 20, defense: 10, speed: 10, hp: 40 }

    expect(getScanStatBonus(baseStats, 100)).toBeUndefined()
    expect(getScanStatBonus(baseStats, 150)).toEqual({ attack: 1, defense: 1, speed: 1, hp: 2 })
    expect(getScanStatBonus(baseStats, 200)).toEqual({ attack: 2, defense: 1, speed: 1, hp: 4 })
  })
})
