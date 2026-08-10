import { create } from 'zustand'
import type { DigimonStatBonus, DigimonStats, DigitalSpaceEnvironment, DigivolutionState, PlayerState } from '../types/game'
import { createInitialDigimonProgression, gainDigimonExperience, resolveDigimonProgression } from '../utils/digimonProgression'
import { createInitialDigivolutionState } from '../utils/evolution'
import { addScanProgress, canRecruitFromScan, getScanStatBonus } from '../utils/scanning'
import { consumableItems } from '../data/consumables'
import {
  createDefaultPlayerState,
  hasSaveGame,
  importSaveFile as importSaveFileContents,
  loadGame,
  saveGame,
  serializeSaveFile,
} from '../utils/saveGame'

// This store is intentionally simple and centralized so future systems such as
// save/load, offline progress, and battle state can build on a single source of truth.
interface GameStore extends PlayerState {
  // Timestamp of the last successful save (this session or loaded from disk), for Settings UI
  // feedback only - not itself part of the persisted PlayerState.
  lastSavedAt: number | null
  addCurrency: (amount: number) => void
  addInventoryItem: (itemId: string, quantity?: number) => void
  setCurrentArea: (area: string) => void
  moveToParty: (digimonId: string) => void
  moveToDigitalSpace: (digimonId: string) => void
  selectStarter: (digimonId: string) => void
  setDigivolutionState: (digimonId: string, state: DigivolutionState) => void
  gainDigimonExperience: (digimonId: string, amount: number) => void
  resetDigimonProgression: (digimonId: string) => void
  recordBattleEncounter: (speciesId: string) => void
  recordCombatEvent: (event: { isCritical?: boolean, isMiss?: boolean, damageDealt?: number, damageTaken?: number }) => void
  recordVictory: (rewards: { bits: number, exp: number }) => void
  unlockBadge: (badgeId: string) => void
  gainScanProgress: (speciesId: string, amount: number) => void
  recruitFromScan: (speciesId: string, baseStats: DigimonStats) => boolean
  applyStatAugment: (instanceId: string, itemId: string) => boolean
  // Explicit save/load, driven by the Settings page (and the first-starter-selection bootstrap
  // save in selectStarter). Both return false on failure (no storage, corrupted/missing save)
  // instead of throwing, so callers can surface a message without risking a crash.
  saveToStorage: () => boolean
  loadFromStorage: () => boolean
  // Loads a save from the raw text contents of an exported .json file (see serializeSaveFile),
  // e.g. picked via the Settings page's "Load Game" file input. Also persists it to localStorage
  // on success so the imported progress survives a page refresh, not just the current session.
  importSaveFile: (raw: string) => boolean
  // Serializes the current live state (not just whatever was last saved to localStorage) so the
  // Settings page's "Export Save" button always downloads up-to-date progress.
  exportSaveFile: () => string
}

function addToFirstAvailableEnvironment(
  digitalSpace: DigitalSpaceEnvironment[],
  digimonId: string,
): DigitalSpaceEnvironment[] {
  const availableEnvironment = digitalSpace.find((environment) => environment.digimonIds.length < 30)

  return digitalSpace.map((environment) =>
    environment.id === availableEnvironment?.id
      ? { ...environment, digimonIds: [...environment.digimonIds, digimonId] }
      : environment)
}

// Ensures a party/digital-space slot has progression state the first time it's touched, without
// clobbering any progress it has already made.
function withInitializedProgression(
  progression: PlayerState['digimonProgression'],
  digimonId: string,
): PlayerState['digimonProgression'] {
  return { ...progression, [digimonId]: resolveDigimonProgression(progression[digimonId]) }
}

let recruitInstanceCounter = 0

// Each recruit gets its own instance id (distinct from the species id) so the trainer can own
// multiple copies of the same species without their progression/digivolution state colliding.
function createDigimonInstanceId(speciesId: string): string {
  recruitInstanceCounter += 1

  return `${speciesId}--${Date.now().toString(36)}-${recruitInstanceCounter}`
}

// Picks just the persisted PlayerState fields off the store, dropping actions/lastSavedAt.
function extractPlayerState(state: GameStore): PlayerState {
  return {
    currency: state.currency,
    playerLevel: state.playerLevel,
    partyDigimon: state.partyDigimon,
    inventory: state.inventory,
    currentArea: state.currentArea,
    digitalSpace: state.digitalSpace,
    digivolutionStates: state.digivolutionStates,
    digimonProgression: state.digimonProgression,
    statistics: state.statistics,
    badges: state.badges,
    scanProgress: state.scanProgress,
    digimonBonuses: state.digimonBonuses,
  }
}

// Hydrate synchronously at module load: if a valid save exists it becomes the store's initial
// state, otherwise we fall back to a brand-new trainer's default state (no save file is written
// yet - selectStarter creates it the moment the player picks their first Digimon).
const savedGame = loadGame()
const initialPlayerState: PlayerState = savedGame?.player ?? createDefaultPlayerState()
const initialLastSavedAt: number | null = savedGame?.savedAt ?? null

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialPlayerState,
  lastSavedAt: initialLastSavedAt,
  addCurrency: (amount) =>
    set((state) => {
      const nextCurrency = Math.max(0, state.currency + amount)
      const nextLevel = Math.max(1, Math.floor(nextCurrency / 100) + 1)

      return {
        currency: nextCurrency,
        playerLevel: nextLevel,
      }
    }),
  addInventoryItem: (itemId, quantity = 1) =>
    set((state) => ({
      inventory: { ...state.inventory, [itemId]: (state.inventory[itemId] ?? 0) + quantity },
    })),
  setCurrentArea: (area) => set({ currentArea: area }),
  moveToParty: (digimonId) =>
    set((state) => {
      const nextParty = state.partyDigimon.includes(digimonId)
        ? state.partyDigimon
        : [...state.partyDigimon, digimonId].slice(0, 6)

      return {
        partyDigimon: nextParty,
        digitalSpace: state.digitalSpace.map((environment) => ({
          ...environment,
          digimonIds: environment.digimonIds.filter((id) => id !== digimonId),
        })),
        digimonProgression: withInitializedProgression(state.digimonProgression, digimonId),
      }
    }),
  moveToDigitalSpace: (digimonId) =>
    set((state) => {
      if (!state.partyDigimon.includes(digimonId)) {
        return state
      }

      return {
        partyDigimon: state.partyDigimon.filter((id) => id !== digimonId),
        digitalSpace: addToFirstAvailableEnvironment(state.digitalSpace, digimonId),
      }
    }),
  selectStarter: (digimonId) => {
    set((state) => ({
      partyDigimon: state.partyDigimon.length === 0 ? [digimonId] : state.partyDigimon,
      digimonProgression: withInitializedProgression(state.digimonProgression, digimonId),
    }))

    // First-time bootstrap: a brand-new trainer's very first choice creates their save file, so
    // there's always something on disk for the "check on load" flow to find from now on. Only
    // fires if no save exists yet - later starter-esque actions (there are none today) won't
    // clobber an existing save.
    if (!hasSaveGame()) {
      get().saveToStorage()
    }
  },
  setDigivolutionState: (digimonId, digivolutionState) =>
    set((state) => ({
      digivolutionStates: {
        ...state.digivolutionStates,
        [digimonId]: digivolutionState,
      },
    })),
  gainDigimonExperience: (digimonId, amount) =>
    set((state) => {
      const currentProgression = resolveDigimonProgression(state.digimonProgression[digimonId])
      const nextProgression = gainDigimonExperience(currentProgression, amount)

      return {
        digimonProgression: {
          ...state.digimonProgression,
          [digimonId]: nextProgression,
        },
      }
    }),
  // Digivolving restarts a Digimon's level/exp at 1 for its new form (distinct from the level new
  // Digimon start at, which is level 5 - see createInitialDigimonProgression's default).
  resetDigimonProgression: (digimonId) =>
    set((state) => ({
      digimonProgression: {
        ...state.digimonProgression,
        [digimonId]: createInitialDigimonProgression(1),
      },
    })),
  recordBattleEncounter: (speciesId) =>
    set((state) => ({
      statistics: { ...state.statistics, encountered: state.statistics.encountered + 1 },
      scanProgress: speciesId in state.scanProgress
        ? state.scanProgress
        : { ...state.scanProgress, [speciesId]: 0 },
    })),
  recordCombatEvent: (event) =>
    set((state) => ({
      statistics: {
        ...state.statistics,
        criticalHits: state.statistics.criticalHits + (event.isCritical ? 1 : 0),
        misses: state.statistics.misses + (event.isMiss ? 1 : 0),
        totalDamageDealt: state.statistics.totalDamageDealt + (event.damageDealt ?? 0),
        totalDamageTaken: state.statistics.totalDamageTaken + (event.damageTaken ?? 0),
      },
    })),
  recordVictory: ({ bits, exp }) =>
    set((state) => ({
      statistics: {
        ...state.statistics,
        defeated: state.statistics.defeated + 1,
        bitsEarned: state.statistics.bitsEarned + bits,
        totalExpEarned: state.statistics.totalExpEarned + exp,
      },
    })),
  unlockBadge: (badgeId) =>
    set((state) => (state.badges[badgeId] ? state : { badges: { ...state.badges, [badgeId]: true } })),
  gainScanProgress: (speciesId, amount) =>
    set((state) => ({
      scanProgress: {
        ...state.scanProgress,
        [speciesId]: addScanProgress(state.scanProgress[speciesId] ?? 0, amount),
      },
    })),
  recruitFromScan: (speciesId, baseStats) => {
    const state = get()
    const progress = state.scanProgress[speciesId] ?? 0

    if (!canRecruitFromScan(progress)) {
      return false
    }

    const instanceId = createDigimonInstanceId(speciesId)
    const bonus = getScanStatBonus(baseStats, progress)
    const hasPartyRoom = state.partyDigimon.length < 6

    set((current) => ({
      partyDigimon: hasPartyRoom ? [...current.partyDigimon, instanceId] : current.partyDigimon,
      digitalSpace: hasPartyRoom ? current.digitalSpace : addToFirstAvailableEnvironment(current.digitalSpace, instanceId),
      digimonProgression: {
        ...current.digimonProgression,
        [instanceId]: createInitialDigimonProgression(),
      },
      digivolutionStates: {
        ...current.digivolutionStates,
        [instanceId]: createInitialDigivolutionState(speciesId),
      },
      digimonBonuses: bonus ? { ...current.digimonBonuses, [instanceId]: bonus } : current.digimonBonuses,
      scanProgress: { ...current.scanProgress, [speciesId]: 0 },
    }))

    return true
  },
  // Consumes one Augment Chip from inventory and adds its permanent stat bonus to a party/Digital
  // Space instance's digimonBonuses entry - additive with any existing scan-recruit bonus.
  applyStatAugment: (instanceId, itemId) => {
    const state = get()
    const item = consumableItems.find((entry) => entry.id === itemId)

    if (!item || item.mechanic?.kind !== 'stat_augment' || (state.inventory[itemId] ?? 0) <= 0) {
      return false
    }

    const { stat, amount } = item.mechanic

    set((current) => {
      const existingBonus: DigimonStatBonus = current.digimonBonuses[instanceId] ?? {}

      return {
        inventory: { ...current.inventory, [itemId]: (current.inventory[itemId] ?? 0) - 1 },
        digimonBonuses: {
          ...current.digimonBonuses,
          [instanceId]: { ...existingBonus, [stat]: (existingBonus[stat] ?? 0) + amount },
        },
      }
    })

    return true
  },
  saveToStorage: () => {
    const success = saveGame(extractPlayerState(get()))

    if (success) {
      set({ lastSavedAt: Date.now() })
    }

    return success
  },
  loadFromStorage: () => {
    const loaded = loadGame()

    if (!loaded) {
      return false
    }

    set({ ...loaded.player, lastSavedAt: loaded.savedAt ?? Date.now() })

    return true
  },
  importSaveFile: (raw) => {
    const imported = importSaveFileContents(raw)

    if (!imported) {
      return false
    }

    set({ ...imported.player, lastSavedAt: Date.now() })
    // Persist immediately so the imported save is what's still there after a page refresh.
    saveGame(imported.player)

    return true
  },
  exportSaveFile: () => serializeSaveFile(extractPlayerState(get())),
}))

