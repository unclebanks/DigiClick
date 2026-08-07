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

export function canSatisfyEvolutionRequirements(
  requirements: EvolutionRequirement[] | undefined,
  currentLevel: number,
  inventory: string[],
): boolean {
  if (!requirements?.length) {
    return true
  }

  return requirements.every((requirement) => {
    const meetsLevel = requirement.minLevel === undefined || currentLevel >= requirement.minLevel
    const meetsItem = requirement.requiredItemId === undefined || inventory.includes(requirement.requiredItemId)
    const meetsPartner = requirement.requiredDigimonId === undefined || inventory.includes(requirement.requiredDigimonId)

    return meetsLevel && meetsItem && meetsPartner
  })
}

export function formatEvolutionRequirements(requirements: EvolutionRequirement[] | undefined): string {
  if (!requirements?.length) {
    return 'No special requirements.'
  }

  return requirements
    .map((requirement) => {
      const parts: string[] = []

      if (requirement.minLevel) {
        parts.push(`Level ${requirement.minLevel}`)
      }

      if (requirement.requiredItemId) {
        const itemLabel = requirement.requiredItemId
          .split('-')
          .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join(' ')
        parts.push(itemLabel.replace(/ Of /g, ' of ').replace(/ And /g, ' and '))
      }

      if (requirement.requiredDigimonId) {
        parts.push(`Partner: ${requirement.requiredDigimonId}`)
      }

      return parts.length ? parts.join(' + ') : requirement.notes ?? 'Special evolution requirement'
    })
    .join(' | ')
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
