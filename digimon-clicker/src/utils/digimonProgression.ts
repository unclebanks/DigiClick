import type { DigimonProgressionState } from '../types/game'

// Re-exported so existing call sites can keep using the shorter name.
export type DigimonProgression = DigimonProgressionState

const BASE_EXP_TO_NEXT_LEVEL = 100
const EXP_GROWTH_RATE = 1.2
// Digimon now start pre-leveled (compensating for the removed manual-attack damage) rather than at level 1.
const STARTING_DIGIMON_LEVEL = 5

export function createInitialDigimonProgression(level = STARTING_DIGIMON_LEVEL): DigimonProgression {
  let expToNextLevel = BASE_EXP_TO_NEXT_LEVEL

  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    expToNextLevel = Math.round(expToNextLevel * EXP_GROWTH_RATE)
  }

  return {
    level,
    exp: 0,
    expToNextLevel,
  }
}

export function resolveDigimonProgression(progression?: DigimonProgression | null): DigimonProgression {
  return progression ?? createInitialDigimonProgression()
}

export function gainDigimonExperience(
  progression: DigimonProgression,
  gainedExp: number,
): DigimonProgression {
  let nextLevel = progression.level
  let nextExp = progression.exp + gainedExp
  let nextExpToNextLevel = progression.expToNextLevel

  while (nextExp >= nextExpToNextLevel) {
    nextExp -= nextExpToNextLevel
    nextLevel += 1
    nextExpToNextLevel = Math.round(nextExpToNextLevel * EXP_GROWTH_RATE)
  }

  return {
    level: nextLevel,
    exp: nextExp,
    expToNextLevel: nextExpToNextLevel,
  }
}
