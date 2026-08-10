export interface DigimonStats {
  attack: number
  defense: number
  speed: number
  hp: number
  // Optional richer stats sourced from digimon_cleaned.json - not every Digimon has these yet, and
  // nothing reads them in combat/growth math until a later migration phase wires them up.
  sp?: number
  int?: number
  spi?: number
}

// Rock-paper-scissors triangle: Vaccine > Virus > Data > Vaccine. Free sits outside the triangle.
// Unknown/Variable/"No Data" are additional values from digimon_cleaned.json, also treated as
// neutral (see digimonAttributes.ts) since the source game doesn't triangle them either.
export type DigimonAttribute = 'Vaccine' | 'Data' | 'Virus' | 'Free' | 'Unknown' | 'Variable' | 'No Data'

// A Digimon's stat target at level 99, sourced from digimon_cleaned.json - calculateDigimonStats
// interpolates between baseStats (the level-1 value) and this across a species' level range.
export interface StatGrowthRange {
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
  type: DigimonAttribute
  basePower: number
  emoji: string
  baseStats: DigimonStats
  drops?: Array<{ itemId: string, chance: number }>
  // Species type from digimon_cleaned.json (e.g. Reptile/Machine) - NOT the same concept as
  // `type` above (which is the Vaccine/Data/Virus/Free attribute). Optional/unused for now.
  speciesType?: string
  // Present only for Digimon sourced from digimon_cleaned.json (see src/data/digimon.ts) - absent
  // for the handful of manually-authored fallback entries that have no JSON match.
  growthStats?: StatGrowthRange
}

// Ailments a status-cure consumable can target - no in-battle status system applies these yet
// (see src/data/consumables.ts), this just gives the item data a real shape to wire up later.
export type StatusAilment = 'poison' | 'panic' | 'paralysis' | 'sleep' | 'sprite' | 'bug' | 'pain' | 'sickness'

// Stats a timed Stat Boost item can raise - accuracy/evasion/critRate have no combat mechanic yet
// (resolveAttack uses fixed miss/crit constants), reserved for when stat-stage combat is built.
export type BoostableStat = 'attack' | 'defense' | 'speed' | 'int' | 'spi' | 'accuracy' | 'evasion' | 'critRate'

// Stats a permanent Augment Chip can raise. Mirrors DigimonStatBonus's fields plus sp/int/spi,
// which DigimonStatBonus doesn't carry yet.
export type AugmentStat = 'hp' | 'sp' | 'attack' | 'defense' | 'int' | 'spi' | 'speed'

// Structured mechanic payload for a consumable item. Nothing in the game reads/applies these yet -
// they exist so the data has real, typed shape ahead of shop/inventory-use/combat wiring.
export type ItemMechanic =
  | { kind: 'stat_recovery', stat: 'hp' | 'sp' | 'hpAndSp', amount?: number, percent?: number }
  | { kind: 'status_recovery', ailment: StatusAilment }
  | { kind: 'cure_stat_drop', scope: 'one_random' | 'all', fullyRestore: boolean }
  | { kind: 'revive', hpPercent: number }
  | { kind: 'stat_boost', stat: BoostableStat, stages: number, durationSeconds: number }
  | { kind: 'exp_gain', amount: number }
  | { kind: 'bond_gain', percent: number }
  | { kind: 'stat_augment', stat: AugmentStat, amount: number }

export type ItemTarget = 'single' | 'all'
export type ItemTargetType = 'ally' | 'enemy'

export interface Item {
  id: string
  name: string
  description: string
  price: number
  effect: string
  // The following three fields are present only for consumables with a real mechanic (see
  // src/data/consumables.ts) - absent for older misc/placeholder items (training-chip, eggs, etc.)
  // that have no wired effect yet.
  target?: ItemTarget
  targetType?: ItemTargetType
  mechanic?: ItemMechanic
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
  // Full chronological log of every form this instance has been in, in the exact order it
  // happened - unlike `history` (the current lineage stack, which shrinks on de-digivolve),
  // this only ever grows, so de-digivolving back down and re-evolving stays on the record
  // (e.g. agumon -> greymon -> agumon -> geogreymon logs all four steps). Each entry's
  // `direction` records how the trainer arrived there (absent for the very first/starting
  // entry) - this is what future choice-based de-digivolution (picking which past form to
  // revert to) will read to know which hops were forward vs backward.
  digivolutionChain: DigivolutionChainEntry[]
}

export interface DigivolutionChainEntry {
  formId: string
  direction?: 'up' | 'down'
}

export interface DigimonStatBonus {
  attack?: number
  defense?: number
  speed?: number
  hp?: number
  sp?: number
  int?: number
  spi?: number
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
  // Item id -> quantity owned. Absent/0 means none owned (no negative or fractional counts).
  inventory: Record<string, number>
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
