import { create } from 'zustand'
import type { PlayerState } from '../types/game'

// This store is intentionally simple and centralized so future systems such as
// save/load, offline progress, and battle state can build on a single source of truth.
interface GameStore extends PlayerState {
  addCurrency: (amount: number) => void
  setCurrentArea: (area: string) => void
  addPartyDigimon: (digimonId: string) => void
  moveToParty: (digimonId: string) => void
  moveToDigitalSpace: (digimonId: string) => void
  selectStarter: (digimonId: string) => void
  setDigivolutionState: (digimonId: string, formId: string) => void
}

const createInitialDigitalSpace = (): PlayerState['digitalSpace'] =>
  Array.from({ length: 30 }, (_, index) => ({
    id: `env-${index + 1}`,
    name: `Environment ${index + 1}`,
    digimonIds: [],
  }))

const initialState: PlayerState = {
  currency: 120,
  playerLevel: 1,
  partyDigimon: ['agumon'],
  inventory: ['training-chip'],
  currentArea: 'Digital Forest',
  digitalSpace: createInitialDigitalSpace(),
  digivolutionStates: {
    agumon: 'agumon',
  },
}

export const useGameStore = create<GameStore>((set) => ({
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
  setCurrentArea: (area) => set({ currentArea: area }),
  addPartyDigimon: (digimonId) =>
    set((state) => ({
      partyDigimon:
        state.partyDigimon.includes(digimonId) || state.partyDigimon.length >= 6
          ? state.partyDigimon
          : [...state.partyDigimon, digimonId],
    })),
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
      }
    }),
  moveToDigitalSpace: (digimonId) =>
    set((state) => {
      if (!state.partyDigimon.includes(digimonId)) {
        return state
      }

      const availableEnvironment = state.digitalSpace.find((environment) => environment.digimonIds.length < 30)

      return {
        partyDigimon: state.partyDigimon.filter((id) => id !== digimonId),
        digitalSpace: state.digitalSpace.map((environment) => {
          if (environment.id === availableEnvironment?.id) {
            return {
              ...environment,
              digimonIds: [...environment.digimonIds, digimonId],
            }
          }

          return environment
        }),
      }
    }),
  selectStarter: (digimonId) =>
    set((state) => ({
      partyDigimon: state.partyDigimon.length === 0 ? [digimonId] : state.partyDigimon,
    })),
  setDigivolutionState: (digimonId, formId) =>
    set((state) => ({
      digivolutionStates: {
        ...state.digivolutionStates,
        [digimonId]: formId,
      },
    })),
}))
