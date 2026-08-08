export interface DigimonStats {
  attack: number
  defense: number
  speed: number
  hp: number
}

// Rock-paper-scissors triangle: Vaccine > Virus > Data > Vaccine. Free sits outside the triangle.
export type DigimonAttribute = 'Vaccine' | 'Data' | 'Virus' | 'Free'

export interface Digimon {
  id: string
  name: string
  stage: string
  description: string
  personality: string
  type: DigimonAttribute
  basePower: number
  emoji: string
  baseStats: DigimonStats
  drops?: Array<{ itemId: string, chance: number }>
}

export interface Item {
  id: string
  name: string
  description: string
  price: number
  effect: string
}

export interface LevelRequirement { type: 'level', level: number }
export interface ItemRequirement { type: 'item', itemId: string }
export interface AreaRequirement { type: 'area', areaId: string }
export interface BadgeRequirement { type: 'badge', badgeId: string }
export interface TimeRequirement { type: 'time', startHour: number, endHour: number }
export interface StatRequirement { type: 'stat', stat: keyof DigimonStats, value: number }

export type BasicEvolutionRequirement =
  | LevelRequirement
  | ItemRequirement
  | AreaRequirement
  | BadgeRequirement
  | TimeRequirement
  | StatRequirement

export interface MultiRequirement {
  type: 'multi'
  requirements: BasicEvolutionRequirement[]
}

export type EvolutionRequirement = BasicEvolutionRequirement | MultiRequirement

export interface Evolution {
  id: string
  from: string
  to: string
  cost: number
  requires: EvolutionRequirement[]
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

export interface DigivolutionState {
  currentFormId: string
  history: string[]
  penaltyCount: number
  penaltyMultiplier: number
}

export interface DigimonStatBonus {
  attack?: number
  defense?: number
  speed?: number
  hp?: number
}

export interface PlayerStatistics {
  encountered: number
  defeated: number
  criticalHits: number
  misses: number
  totalDamageDealt: number
  totalDamageTaken: number
  bitsEarned: number
  totalExpEarned: number
}

export function createInitialPlayerStatistics(): PlayerStatistics {
  return {
    encountered: 0,
    defeated: 0,
    criticalHits: 0,
    misses: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    bitsEarned: 0,
    totalExpEarned: 0,
  }
}

export interface PlayerState {
  currency: number
  playerLevel: number
  partyDigimon: string[]
  inventory: string[]
  currentArea: string
  digitalSpace: DigitalSpaceEnvironment[]
  digivolutionStates: Record<string, DigivolutionState>
  digimonProgression: Record<string, DigimonProgressionState>
  statistics: PlayerStatistics
  badges: Record<string, boolean>
  // Scan percentage per Digimon species id, 0-200. 100 unlocks recruiting, 200 gives a bonus-stat chance.
  scanProgress: Record<string, number>
  digimonBonuses: Record<string, DigimonStatBonus>
}
