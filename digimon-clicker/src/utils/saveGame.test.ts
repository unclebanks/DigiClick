import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SAVE_STORAGE_KEY,
  SAVE_VERSION,
  createDefaultPlayerState,
  deleteSaveGame,
  hasSaveGame,
  importSaveFile,
  loadGame,
  sanitizePlayerState,
  saveGame,
  serializeSaveFile,
} from './saveGame'

// Minimal in-memory Storage implementation so these tests can exercise the real
// localStorage-backed code paths without a full DOM/jsdom environment.
class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }
}

let memoryStorage: MemoryStorage

beforeEach(() => {
  memoryStorage = new MemoryStorage()
  vi.stubGlobal('window', { localStorage: memoryStorage })
})

describe('sanitizePlayerState', () => {
  it('returns the default state for non-object input', () => {
    expect(sanitizePlayerState(null)).toEqual(createDefaultPlayerState())
    expect(sanitizePlayerState(undefined)).toEqual(createDefaultPlayerState())
    expect(sanitizePlayerState('broken')).toEqual(createDefaultPlayerState())
    expect(sanitizePlayerState(42)).toEqual(createDefaultPlayerState())
    expect(sanitizePlayerState([])).toEqual(createDefaultPlayerState())
  })

  it('fills in sane defaults for a save missing fields added since it was written', () => {
    const result = sanitizePlayerState({ currency: 500 })

    expect(result.currency).toBe(500)
    expect(result.partyDigimon).toEqual([])
    expect(result.digitalSpace).toHaveLength(30)
    expect(result.statistics).toEqual(createDefaultPlayerState().statistics)
  })

  it('drops fields with the wrong type instead of crashing', () => {
    const result = sanitizePlayerState({
      currency: 'not-a-number',
      partyDigimon: 'not-an-array',
      inventory: 'not-a-record',
      currentArea: 123,
    })

    expect(result.currency).toBe(createDefaultPlayerState().currency)
    expect(result.partyDigimon).toEqual([])
    expect(result.inventory).toEqual(createDefaultPlayerState().inventory)
    expect(result.currentArea).toBe(createDefaultPlayerState().currentArea)
  })

  it('drops non-numeric, non-positive, or fractional inventory counts but keeps valid ones', () => {
    const result = sanitizePlayerState({
      inventory: { 'training-chip': 3, 'healing-herb': 'lots', 'broken-item': -1, 'fractional-item': 2.7 },
    })

    expect(result.inventory).toEqual({ 'training-chip': 3, 'fractional-item': 2 })
  })

  it('clamps party size, scan progress, and negative currency', () => {
    const result = sanitizePlayerState({
      currency: -50,
      partyDigimon: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      scanProgress: { agumon: 999, gabumon: -20 },
    })

    expect(result.currency).toBe(0)
    expect(result.partyDigimon).toHaveLength(6)
    expect(result.scanProgress).toEqual({ agumon: 200, gabumon: 0 })
  })

  it('drops digivolution states missing a currentFormId but keeps valid ones', () => {
    const result = sanitizePlayerState({
      digivolutionStates: {
        agumon: { currentFormId: 'greymon', history: ['agumon', 'greymon'], penaltyCount: 1, penaltyMultiplier: 0.9 },
        broken: { history: ['broken'] },
      },
    })

    expect(result.digivolutionStates.agumon).toEqual({
      currentFormId: 'greymon',
      history: ['agumon', 'greymon'],
      penaltyCount: 1,
      penaltyMultiplier: 0.9,
    })
    expect(result.digivolutionStates.broken).toBeUndefined()
  })

  it('pads a digital space that has fewer environments than the current default', () => {
    const result = sanitizePlayerState({
      digitalSpace: [{ id: 'env-1', name: 'Environment 1', digimonIds: ['agumon'] }],
    })

    expect(result.digitalSpace).toHaveLength(30)
    expect(result.digitalSpace[0]).toEqual({ id: 'env-1', name: 'Environment 1', digimonIds: ['agumon'] })
  })
})

describe('saveGame / loadGame / hasSaveGame / deleteSaveGame', () => {
  it('reports no save file until one is written', () => {
    expect(hasSaveGame()).toBe(false)
    expect(loadGame()).toBeNull()
  })

  it('round-trips a save through save/load', () => {
    const player = { ...createDefaultPlayerState(), currency: 777, partyDigimon: ['agumon'] }

    expect(saveGame(player)).toBe(true)
    expect(hasSaveGame()).toBe(true)

    const loaded = loadGame()
    expect(loaded).not.toBeNull()
    expect(loaded?.player.currency).toBe(777)
    expect(loaded?.player.partyDigimon).toEqual(['agumon'])
    expect(typeof loaded?.savedAt).toBe('number')
  })

  it('stores the current SAVE_VERSION in the raw payload', () => {
    saveGame(createDefaultPlayerState())
    const raw = JSON.parse(memoryStorage.getItem(SAVE_STORAGE_KEY) as string)
    expect(raw.version).toBe(SAVE_VERSION)
  })

  it('treats corrupted JSON as no save instead of throwing', () => {
    memoryStorage.setItem(SAVE_STORAGE_KEY, '{ this is not valid json')

    expect(() => loadGame()).not.toThrow()
    expect(loadGame()).toBeNull()
  })

  it('still loads a bare (unwrapped) player object for maximum backwards compatibility', () => {
    memoryStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify({ currency: 999 }))

    const loaded = loadGame()
    expect(loaded?.player.currency).toBe(999)
  })

  it('deletes the save file', () => {
    saveGame(createDefaultPlayerState())
    expect(hasSaveGame()).toBe(true)

    deleteSaveGame()
    expect(hasSaveGame()).toBe(false)
  })

  it('migrates a v1 array-based inventory into a v2 quantity map', () => {
    memoryStorage.setItem(
      SAVE_STORAGE_KEY,
      JSON.stringify({ version: 1, savedAt: 123, player: { inventory: ['training-chip', 'healing-herb'] } }),
    )

    const loaded = loadGame()
    expect(loaded?.player.inventory).toEqual({ 'training-chip': 1, 'healing-herb': 1 })
  })
})

describe('serializeSaveFile / importSaveFile', () => {
  it('round-trips exactly what serializeSaveFile produces (the "Export Save" -> "Load Game" file flow)', () => {
    const player = { ...createDefaultPlayerState(), currency: 321, partyDigimon: ['gabumon'] }
    const exportedText = serializeSaveFile(player)

    const imported = importSaveFile(exportedText)

    expect(imported).not.toBeNull()
    expect(imported?.player.currency).toBe(321)
    expect(imported?.player.partyDigimon).toEqual(['gabumon'])
  })

  it('sanitizes an imported file the same way a loaded save is sanitized', () => {
    const imported = importSaveFile(JSON.stringify({ version: SAVE_VERSION, player: { currency: 'not-a-number' } }))

    expect(imported?.player.currency).toBe(createDefaultPlayerState().currency)
  })

  it('returns null instead of throwing for a corrupted/non-JSON file', () => {
    expect(() => importSaveFile('not json at all')).not.toThrow()
    expect(importSaveFile('not json at all')).toBeNull()
  })

  it('does not require importing to also write to localStorage', () => {
    importSaveFile(serializeSaveFile(createDefaultPlayerState()))
    expect(hasSaveGame()).toBe(false)
  })
})

