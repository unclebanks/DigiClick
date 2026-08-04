import type { Digimon } from '../types/game'

export function getPartyDigimonList(allDigimon: Digimon[], partyIds: string[]): Digimon[] {
  const partySet = new Set(partyIds)

  return allDigimon.filter((digimon) => partySet.has(digimon.id))
}
