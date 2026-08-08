import { describe, expect, it } from 'vitest'
import {
  addScanProgress,
  canRecruitFromScan,
  getScanGainFromDefeat,
  hasBonusScanTier,
  rollScanStatBonus,
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

  it('unlocks recruiting at 100 percent and the bonus tier at 200 percent', () => {
    expect(canRecruitFromScan(99)).toBe(false)
    expect(canRecruitFromScan(100)).toBe(true)
    expect(hasBonusScanTier(150)).toBe(false)
    expect(hasBonusScanTier(200)).toBe(true)
  })

  it('only rolls a stat bonus once the bonus tier is reached', () => {
    const baseStats = { attack: 20, defense: 10, speed: 10, hp: 40 }

    expect(rollScanStatBonus(baseStats, 150, () => 0)).toBeUndefined()
    expect(rollScanStatBonus(baseStats, 200, () => 0.99)).toBeUndefined()
    expect(rollScanStatBonus(baseStats, 200, () => 0)).toEqual({ attack: 2, defense: 1, speed: 1, hp: 4 })
  })
})
