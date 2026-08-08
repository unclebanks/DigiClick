import { create } from 'zustand'
import type { DigimonStats, DigitalSpaceEnvironment, DigivolutionState, PlayerState } from '../types/game'
import { createInitialPlayerStatistics } from '../types/game'
import { createInitialDigimonProgression, gainDigimonExperience, resolveDigimonProgression } from '../utils/digimonProgression'
import { createInitialDigivolutionState } from '../utils/evolution'
import { addScanProgress, canRecruitFromScan, rollScanStatBonus } from '../utils/scanning'

// This store is intentionally simple and centralized so future systems such as
// save/load, offline progress, and battle state can build on a single source of truth.
interface GameStore extends PlayerState {
  addCurrency: (amount: number) => void
  addInventoryItem: (itemId: string) => void
  setCurrentArea: (area: string) => void
  addPartyDigimon: (digimonId: string) => void
  moveToParty: (digimonId: string) => void
  moveToDigitalSpace: (digimonId: string) => void
  selectStarter: (digimonId: string) => void
  setDigivolutionState: (digimonId: string, state: DigivolutionState) => void
  gainDigimonExperience: (digimonId: string, amount: number) => void
  recordBattleEncounter: (speciesId: string) => void
  recordCombatEvent: (event: { isCritical?: boolean, isMiss?: boolean, damageDealt?: number, damageTaken?: number }) => void
  recordVictory: (rewards: { bits: number, exp: number }) => void
  unlockBadge: (badgeId: string) => void
  gainScanProgress: (speciesId: string, amount: number) => void
  recruitFromScan: (speciesId: string, baseStats: DigimonStats, rng?: () => number) => boolean
}

const createInitialDigitalSpace = (): PlayerState['digitalSpace'] =>
  Array.from({ length: 30 }, (_, index) => ({
    id: `env-${index + 1}`,
    name: `Environment ${index + 1}`,
    digimonIds: [],
  }))

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

const initialState: PlayerState = {
  currency: 120,
  playerLevel: 1,
  partyDigimon: [],
  inventory: ['training-chip'],
  currentArea: 'Digital Forest',
  digitalSpace: createInitialDigitalSpace(),
  digivolutionStates: {
    agumon: createInitialDigivolutionState('agumon'),
  },
  digimonProgression: {},
  statistics: createInitialPlayerStatistics(),
  badges: {},
  scanProgress: {},
  digimonBonuses: {},
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  addCurrency: (amount) =>
    set((state) => {
      const nextCurrency = Math.max(0, state.currency + amount)
      const nextLevel = Math.max(1, Math.floor(nextCurrency / 100) + 1)

      return {
        currency: nextCurrency,
        playerLevel: nextLevel,
      }
    }),
  addInventoryItem: (itemId) =>
    set((state) => ({
      inventory: state.inventory.includes(itemId) ? state.inventory : [...state.inventory, itemId],
    })),
  setCurrentArea: (area) => set({ currentArea: area }),
  addPartyDigimon: (digimonId) =>
    set((state) => {
      const isAlreadyInParty = state.partyDigimon.includes(digimonId)
      const nextPartyDigimon = isAlreadyInParty || state.partyDigimon.length >= 6
        ? state.partyDigimon
        : [...state.partyDigimon, digimonId]

      return {
        partyDigimon: nextPartyDigimon,
        digimonProgression: {
          ...state.digimonProgression,
          [digimonId]: resolveDigimonProgression(state.digimonProgression[digimonId]),
        },
      }
    }),
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
        digimonProgression: {
          ...state.digimonProgression,
          [digimonId]: resolveDigimonProgression(state.digimonProgression[digimonId]),
        },
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
  selectStarter: (digimonId) =>
    set((state) => ({
      partyDigimon: state.partyDigimon.length === 0 ? [digimonId] : state.partyDigimon,
      digimonProgression: {
        ...state.digimonProgression,
        [digimonId]: resolveDigimonProgression(state.digimonProgression[digimonId]),
      },
    })),
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
  recruitFromScan: (speciesId, baseStats, rng = Math.random) => {
    const state = get()
    const alreadyOwned = state.partyDigimon.includes(speciesId)
      || state.digitalSpace.some((environment) => environment.digimonIds.includes(speciesId))
    const progress = state.scanProgress[speciesId] ?? 0

    if (alreadyOwned || !canRecruitFromScan(progress)) {
      return false
    }

    const bonus = rollScanStatBonus(baseStats, progress, rng)
    const hasPartyRoom = state.partyDigimon.length < 6

    set((current) => ({
      partyDigimon: hasPartyRoom ? [...current.partyDigimon, speciesId] : current.partyDigimon,
      digitalSpace: hasPartyRoom ? current.digitalSpace : addToFirstAvailableEnvironment(current.digitalSpace, speciesId),
      digimonProgression: {
        ...current.digimonProgression,
        [speciesId]: createInitialDigimonProgression(),
      },
      digivolutionStates: {
        ...current.digivolutionStates,
        [speciesId]: createInitialDigivolutionState(speciesId),
      },
      digimonBonuses: bonus ? { ...current.digimonBonuses, [speciesId]: bonus } : current.digimonBonuses,
      scanProgress: { ...current.scanProgress, [speciesId]: 0 },
    }))

    return true
  },
}))

