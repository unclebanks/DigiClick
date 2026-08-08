import { describe, expect, it } from 'vitest'
import { sampleDigimon } from '../data/digimon'
import { getAttributeMatchup, getAttributeMultiplier } from './digimonAttributes'

describe('Digimon attributes', () => {
  it('includes personality and type for each sample Digimon', () => {
    for (const digimon of sampleDigimon) {
      expect(digimon.personality).toBeTruthy()
      expect(digimon.type).toBeTruthy()
    }
  })
})

describe('attribute triangle', () => {
  it('resolves the Vaccine > Virus > Data > Vaccine triangle', () => {
    expect(getAttributeMatchup('Vaccine', 'Virus')).toBe('strong')
    expect(getAttributeMatchup('Virus', 'Data')).toBe('strong')
    expect(getAttributeMatchup('Data', 'Vaccine')).toBe('strong')
    expect(getAttributeMatchup('Virus', 'Vaccine')).toBe('weak')
    expect(getAttributeMatchup('Vaccine', 'Vaccine')).toBe('neutral')
  })

  it('treats Free as neutral against everything', () => {
    expect(getAttributeMatchup('Free', 'Vaccine')).toBe('neutral')
    expect(getAttributeMatchup('Virus', 'Free')).toBe('neutral')
  })

  it('treats the digimon_cleaned.json extra attributes as neutral too', () => {
    expect(getAttributeMatchup('Unknown', 'Vaccine')).toBe('neutral')
    expect(getAttributeMatchup('Virus', 'Variable')).toBe('neutral')
    expect(getAttributeMatchup('No Data', 'Data')).toBe('neutral')
  })

  it('maps matchups to damage multipliers', () => {
    expect(getAttributeMultiplier('Vaccine', 'Virus')).toBe(1.5)
    expect(getAttributeMultiplier('Virus', 'Vaccine')).toBe(0.75)
    expect(getAttributeMultiplier('Data', 'Data')).toBe(1)
  })
})
