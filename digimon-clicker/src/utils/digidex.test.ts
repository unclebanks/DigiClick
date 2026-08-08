import { describe, expect, it } from 'vitest'
import { getDigidexStatus, getOwnedDigimonIds } from './digidex'

describe('getOwnedDigimonIds', () => {
  it('includes party members, digital space residents, and their digivolution history', () => {
    const owned = getOwnedDigimonIds(
      ['agumon'],
      [{ id: 'env-1', name: 'Environment 1', digimonIds: ['gabumon'] }],
      { agumon: { currentFormId: 'greymon', history: ['agumon', 'greymon'], penaltyCount: 0, penaltyMultiplier: 1 } },
    )

    expect(owned.has('agumon')).toBe(true)
    expect(owned.has('greymon')).toBe(true)
    expect(owned.has('gabumon')).toBe(true)
    expect(owned.has('patamon')).toBe(false)
  })
})

describe('getDigidexStatus', () => {
  it('prioritizes owned over scan progress', () => {
    expect(getDigidexStatus({ hasBeenSeen: true, isOwned: true, scanProgress: 0 })).toBe('owned')
  })

  it('reports unseen when the species has never been encountered', () => {
    expect(getDigidexStatus({ hasBeenSeen: false, isOwned: false, scanProgress: 0 })).toBe('unseen')
  })

  it('reports scanned until the recruit threshold, then ready', () => {
    expect(getDigidexStatus({ hasBeenSeen: true, isOwned: false, scanProgress: 40 })).toBe('scanned')
    expect(getDigidexStatus({ hasBeenSeen: true, isOwned: false, scanProgress: 100 })).toBe('ready')
  })
})
