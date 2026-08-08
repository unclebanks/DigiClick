import type { DigitalSpaceEnvironment, DigivolutionState } from '../types/game'
import { createInitialDigivolutionState } from './evolution'
import { SCAN_RECRUIT_THRESHOLD } from './scanning'

export type DigidexStatus = 'unseen' | 'scanned' | 'ready' | 'owned'

// A Digimon is "owned" if it's an active party slot, resting in the Digital Space, or a form
// reached through digivolution/de-digivolution history on an owned slot. Party/Digital Space
// entries are instance ids (not necessarily species ids, since a species can be owned more than
// once), so the species id always comes from the digivolution history rather than the slot id itself.
export function getOwnedDigimonIds(
  partyDigimon: string[],
  digitalSpace: DigitalSpaceEnvironment[],
  digivolutionStates: Record<string, DigivolutionState>,
): Set<string> {
  const owned = new Set<string>()
  const baseIds = [...partyDigimon, ...digitalSpace.flatMap((environment) => environment.digimonIds)]

  for (const baseId of baseIds) {
    const digivolutionState = digivolutionStates[baseId] ?? createInitialDigivolutionState(baseId)
    digivolutionState.history.forEach((formId) => owned.add(formId))
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
