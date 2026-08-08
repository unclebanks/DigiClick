import type { DigitalSpaceEnvironment, DigivolutionState } from '../types/game'
import { SCAN_RECRUIT_THRESHOLD } from './scanning'

export type DigidexStatus = 'unseen' | 'scanned' | 'ready' | 'owned'

// A Digimon is "owned" if it's an active party slot, resting in the Digital Space, or a form
// reached through digivolution/de-digivolution history on an owned slot.
export function getOwnedDigimonIds(
  partyDigimon: string[],
  digitalSpace: DigitalSpaceEnvironment[],
  digivolutionStates: Record<string, DigivolutionState>,
): Set<string> {
  const owned = new Set<string>()
  const baseIds = [...partyDigimon, ...digitalSpace.flatMap((environment) => environment.digimonIds)]

  for (const baseId of baseIds) {
    owned.add(baseId)
    digivolutionStates[baseId]?.history.forEach((formId) => owned.add(formId))
  }

  return owned
}

export function getDigidexStatus(params: {
  hasBeenSeen: boolean
  isOwned: boolean
  scanProgress: number
}): DigidexStatus {
  if (params.isOwned) {
    return 'owned'
  }

  if (!params.hasBeenSeen) {
    return 'unseen'
  }

  return params.scanProgress >= SCAN_RECRUIT_THRESHOLD ? 'ready' : 'scanned'
}
