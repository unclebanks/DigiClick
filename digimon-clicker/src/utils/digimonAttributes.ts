import type { DigimonAttribute } from '../types/game'

export const ATTRIBUTE_ADVANTAGE_MULTIPLIER = 1.5
export const ATTRIBUTE_DISADVANTAGE_MULTIPLIER = 0.75

// Each attribute is strong against the one it maps to here. Free is neutral to everything.
const STRONG_AGAINST: Record<DigimonAttribute, DigimonAttribute | null> = {
  Vaccine: 'Virus',
  Virus: 'Data',
  Data: 'Vaccine',
  Free: null,
}

export type AttributeMatchup = 'strong' | 'weak' | 'neutral'

export function getAttributeMatchup(attacker: DigimonAttribute, defender: DigimonAttribute): AttributeMatchup {
  if (attacker === 'Free' || defender === 'Free') {
    return 'neutral'
  }

  if (STRONG_AGAINST[attacker] === defender) {
    return 'strong'
  }

  if (STRONG_AGAINST[defender] === attacker) {
    return 'weak'
  }

  return 'neutral'
}

export function getAttributeMultiplier(attacker: DigimonAttribute, defender: DigimonAttribute): number {
  const matchup = getAttributeMatchup(attacker, defender)

  if (matchup === 'strong') {
    return ATTRIBUTE_ADVANTAGE_MULTIPLIER
  }

  if (matchup === 'weak') {
    return ATTRIBUTE_DISADVANTAGE_MULTIPLIER
  }

  return 1
}

export function describeAttributeMatchup(attacker: DigimonAttribute, defender: DigimonAttribute): string {
  const matchup = getAttributeMatchup(attacker, defender)

  if (matchup === 'strong') {
    return "It's super effective!"
  }

  if (matchup === 'weak') {
    return "It's not very effective..."
  }

  return ''
}
