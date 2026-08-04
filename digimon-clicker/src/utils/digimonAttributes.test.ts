import { describe, expect, it } from 'vitest'
import { sampleDigimon } from '../data/digimon'

describe('Digimon attributes', () => {
  it('includes personality and type for each sample Digimon', () => {
    for (const digimon of sampleDigimon) {
      expect(digimon.personality).toBeTruthy()
      expect(digimon.type).toBeTruthy()
    }
  })
})
