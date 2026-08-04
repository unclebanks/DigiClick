export interface DigimonStats {
  attack: number
  defense: number
  speed: number
  hp: number
}

export interface Digimon {
  id: string
  name: string
  stage: string
  description: string
  personality: string
  type: string
  basePower: number
  emoji: string
  baseStats: DigimonStats
  level: number
  exp: number
  expToNextLevel: number
  evolutionRequirements?: EvolutionRequirement[]
}

export interface Item {
  id: string
  name: string
  description: string
  price: number
  effect: string
}

export interface Evolution {
  id: string
  from: string
  to: string
  cost: number
  requirementTemplate?: string
}

export interface EvolutionRequirement {
  minLevel?: number
  requiredItemId?: string
  requiredDigimonId?: string
  notes?: string
}

export interface DigitalSpaceEnvironment {
  id: string
  name: string
  digimonIds: string[]
}

export interface DigimonProgressionState {
  level: number
  exp: number
  expToNextLevel: number
}

export interface PlayerState {
  currency: number
  playerLevel: number
  partyDigimon: string[]
  inventory: string[]
  currentArea: string
  digitalSpace: DigitalSpaceEnvironment[]
  digivolutionStates: Record<string, string>
  digimonProgression: Record<string, DigimonProgressionState>
}
