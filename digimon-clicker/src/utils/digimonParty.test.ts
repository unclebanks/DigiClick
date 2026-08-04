import { describe, expect, it } from 'vitest'
import type { Digimon } from '../types/game'
import { getPartyDigimonList } from './digimonParty'

const digimonList: Digimon[] = [
  {
    id: 'agumon',
    name: 'Agumon',
    stage: 'Rookie',
    description: 'A brave rookie.',
    personality: 'Loyal',
    type: 'Vaccine',
    emoji: '🦖',
    basePower: 12,
    baseStats: { hp: 100, attack: 20, defense: 15, speed: 18 },
    level: 1,
    exp: 0,
    expToNextLevel: 100,
    evolutionRequirements: [],
  },
  {
    id: 'greymon',
    name: 'Greymon',
    stage: 'Champion',
    description: 'A fierce champion.',
    personality: 'Bold',
    type: 'Virus',
    emoji: '🦕',
    basePower: 24,
    baseStats: { hp: 180, attack: 35, defense: 24, speed: 16 },
    level: 3,
    exp: 0,
    expToNextLevel: 200,
    evolutionRequirements: [],
  },
]

describe('getPartyDigimonList', () => {
  it('returns only Digimon that belong to the current party', () => {
    expect(getPartyDigimonList(digimonList, ['agumon'])).toEqual([digimonList[0]])
    expect(getPartyDigimonList(digimonList, [])).toEqual([])
  })
})
