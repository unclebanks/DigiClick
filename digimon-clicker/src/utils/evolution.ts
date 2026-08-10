import type {
  AreaRequirement,
  BadgeRequirement,
  BasicEvolutionRequirement,
  DigimonStats,
  DigivolutionState,
  Evolution,
  EvolutionRequirement,
  ItemRequirement,
  LevelRequirement,
  StatRequirement,
  TimeRequirement,
} from '../types/game'

export interface EvolutionRequirementContext {
  level: number
  inventory: Record<string, number>
  currentAreaId?: string
  badges?: Record<string, boolean>
  currentHour?: number
  stats?: Partial<DigimonStats>
}

// Builder helpers, mirroring how the reference project composes evolution requirements.
export const levelReq = (level: number): LevelRequirement => ({ type: 'level', level })
export const itemReq = (itemId: string): ItemRequirement => ({ type: 'item', itemId })
export const areaReq = (areaId: string): AreaRequirement => ({ type: 'area', areaId })
export const badgeReq = (badgeId: string): BadgeRequirement => ({ type: 'badge', badgeId })
export const timeReq = (startHour: number, endHour: number): TimeRequirement => ({ type: 'time', startHour, endHour })
export const statReq = (stat: keyof DigimonStats, value: number): StatRequirement => ({ type: 'stat', stat, value })
export const multiReq = (...requirements: BasicEvolutionRequirement[]): EvolutionRequirement => ({ type: 'multi', requirements })

function satisfiesRequirement(requirement: EvolutionRequirement, context: EvolutionRequirementContext): boolean {
  switch (requirement.type) {
    case 'level':
      return context.level >= requirement.level
    case 'item':
      return (context.inventory[requirement.itemId] ?? 0) > 0
    case 'area':
      return context.currentAreaId === requirement.areaId
    case 'badge':
      return Boolean(context.badges?.[requirement.badgeId])
    case 'time': {
      const hour = context.currentHour ?? new Date().getHours()
      const { startHour, endHour } = requirement

      return startHour <= endHour
        ? hour >= startHour && hour < endHour
        : hour >= startHour || hour < endHour
    }
    case 'stat':
      return (context.stats?.[requirement.stat] ?? 0) >= requirement.value
    case 'multi':
      return requirement.requirements.every((nested) => satisfiesRequirement(nested, context))
    default:
      return true
  }
}

export function canSatisfyEvolutionRequirements(
  requirements: EvolutionRequirement[] | undefined,
  context: EvolutionRequirementContext,
): boolean {
  if (!requirements?.length) {
    return true
  }

  return requirements.every((requirement) => satisfiesRequirement(requirement, context))
}

function formatSingleRequirement(requirement: EvolutionRequirement): string {
  switch (requirement.type) {
    case 'level':
      return `Level ${requirement.level}`
    case 'item':
      return `Item: ${formatItemLabel(requirement.itemId)}`
    case 'area':
      return `Area: ${requirement.areaId}`
    case 'badge':
      return `Badge: ${formatItemLabel(requirement.badgeId)}`
    case 'time':
      return `Time: ${requirement.startHour}:00-${requirement.endHour}:00`
    case 'stat':
      return `${requirement.stat.toUpperCase()} ${requirement.value}+`
    case 'multi':
      return requirement.requirements.map(formatSingleRequirement).join(' + ')
    default:
      return 'Special requirement'
  }
}

function formatItemLabel(id: string): string {
  return id
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export function formatEvolutionRequirements(requirements: EvolutionRequirement[] | undefined): string {
  if (!requirements?.length) {
    return 'No special requirements.'
  }

  return requirements.map(formatSingleRequirement).join(' | ')
}

export function getEvolutionOptions(fromFormId: string, evolutions: Evolution[]): Evolution[] {
  return evolutions.filter((evolution) => evolution.from === fromFormId)
}

export function createInitialDigivolutionState(formId: string): DigivolutionState {
  return {
    currentFormId: formId,
    history: [formId],
    penaltyCount: 0,
    penaltyMultiplier: 1,
    digivolutionChain: [{ formId }],
  }
}

export function evolveDigimonState(
  state: DigivolutionState,
  nextFormId: string,
): DigivolutionState {
  if (state.currentFormId === nextFormId) {
    return state
  }

  return {
    ...state,
    currentFormId: nextFormId,
    history: [...state.history, nextFormId],
    digivolutionChain: [...state.digivolutionChain, { formId: nextFormId, direction: 'up' }],
  }
}

export function dedigivolveDigimonState(state: DigivolutionState): DigivolutionState {
  if (state.history.length <= 1) {
    return state
  }

  const previousForm = state.history[state.history.length - 2]

  return {
    currentFormId: previousForm,
    history: state.history.slice(0, -1),
    penaltyCount: state.penaltyCount + 1,
    penaltyMultiplier: Math.max(0.5, Number((state.penaltyMultiplier * 0.85).toFixed(2))),
    digivolutionChain: [...state.digivolutionChain, { formId: previousForm, direction: 'down' }],
  }
}
