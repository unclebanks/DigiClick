import type { DigimonStats, DigimonStatBonus } from '../types/game'

export const SCAN_RECRUIT_THRESHOLD = 100
export const SCAN_MAX = 200
const BASE_SCAN_GAIN = 15
const SCAN_GAIN_PER_LEVEL = 2
const MAX_SCAN_BONUS_RATIO = 0.1

// DigiDex research data is only gathered by defeating a Digimon, not by damage dealt mid-fight.
// Tougher (higher level) Digimon yield more data per defeat, so they scan faster per encounter.
export function getScanGainFromDefeat(level: number): number {
  return Math.max(1, Math.round(BASE_SCAN_GAIN + Math.max(0, level) * SCAN_GAIN_PER_LEVEL))
}

export function addScanProgress(currentProgress: number, gain: number): number {
  return Math.min(SCAN_MAX, Math.max(0, currentProgress + gain))
}

export function canRecruitFromScan(progress: number): boolean {
  return progress >= SCAN_RECRUIT_THRESHOLD
}

// True once scan progress has gone past 100% and is earning a stat bonus.
export function hasBonusScanTier(progress: number): boolean {
  return progress > SCAN_RECRUIT_THRESHOLD
}

// Scan progress past 100% (up to the 200% cap) grants a proportional stat bonus - e.g. scanning
// halfway between 100% and 200% grants half of the max +10% bonus.
export function getScanBonusRatio(progress: number): number {
  const overflow = Math.min(SCAN_MAX, Math.max(0, progress)) - SCAN_RECRUIT_THRESHOLD

  if (overflow <= 0) {
    return 0
  }

  return (overflow / (SCAN_MAX - SCAN_RECRUIT_THRESHOLD)) * MAX_SCAN_BONUS_RATIO
}

export function getScanStatBonus(baseStats: DigimonStats, progress: number): DigimonStatBonus | undefined {
  const bonusRatio = getScanBonusRatio(progress)

  if (bonusRatio <= 0) {
    return undefined
  }

  return {
    attack: Math.round(baseStats.attack * bonusRatio),
    defense: Math.round(baseStats.defense * bonusRatio),
    speed: Math.round(baseStats.speed * bonusRatio),
    hp: Math.round(baseStats.hp * bonusRatio),
  }
}
