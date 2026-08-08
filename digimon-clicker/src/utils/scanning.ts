import type { DigimonStats, DigimonStatBonus } from '../types/game'

export const SCAN_RECRUIT_THRESHOLD = 100
export const SCAN_MAX = 200
export const SCAN_BONUS_CHANCE = 0.4
const BASE_SCAN_GAIN = 15
const SCAN_GAIN_PER_LEVEL = 2

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

export function hasBonusScanTier(progress: number): boolean {
  return progress >= SCAN_MAX
}

// A fully scanned (200%) Digimon has a chance to be recruited with a small stat bonus.
export function rollScanStatBonus(
  baseStats: DigimonStats,
  progress: number,
  rng: () => number = Math.random,
): DigimonStatBonus | undefined {
  if (!hasBonusScanTier(progress) || rng() > SCAN_BONUS_CHANCE) {
    return undefined
  }

  const bonusRatio = 0.1

  return {
    attack: Math.round(baseStats.attack * bonusRatio),
    defense: Math.round(baseStats.defense * bonusRatio),
    speed: Math.round(baseStats.speed * bonusRatio),
    hp: Math.round(baseStats.hp * bonusRatio),
  }
}
