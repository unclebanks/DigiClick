export interface DigivolutionState {
  currentFormId: string
  history: string[]
  penaltyCount: number
  penaltyMultiplier: number
}

export interface EvolutionRequirement {
  minLevel?: number
  requiredItemId?: string
  requiredDigimonId?: string
  notes?: string
}

export function evolveDigimonState(
  state: DigivolutionState,
  nextFormId: string,
): DigivolutionState {
  if (state.history.includes(nextFormId)) {
    return state
  }

  return {
    currentFormId: nextFormId,
    history: [...state.history, nextFormId],
    penaltyCount: state.penaltyCount,
    penaltyMultiplier: state.penaltyMultiplier,
  }
}

export function dedigivolveDigimonState(state: DigivolutionState): DigivolutionState {
  const previousForm = state.history[state.history.length - 2] ?? state.currentFormId

  return {
    currentFormId: previousForm,
    history: state.history,
    penaltyCount: state.penaltyCount + 1,
    penaltyMultiplier: Math.max(0.5, Number((state.penaltyMultiplier * 0.85).toFixed(2))),
  }
}
