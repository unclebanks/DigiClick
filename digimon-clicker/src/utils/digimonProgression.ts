export interface DigimonProgression {
  level: number
  exp: number
  expToNextLevel: number
}

export function createInitialDigimonProgression(): DigimonProgression {
  return {
    level: 1,
    exp: 0,
    expToNextLevel: 100,
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
    nextExpToNextLevel = Math.round(nextExpToNextLevel * 1.2)
  }

  return {
    level: nextLevel,
    exp: nextExp,
    expToNextLevel: nextExpToNextLevel,
  }
}
