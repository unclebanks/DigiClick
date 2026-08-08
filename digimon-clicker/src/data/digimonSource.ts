import rawFile from './digimon_cleaned.json'

// Types describing digimon_cleaned.json as scraped, NOT our app's Digimon shape - kept separate
// until later phases translate the fields we want into src/types/game.ts. Note `type` here means
// the species type (Reptile/Machine/...), which is a different concept from our `Digimon.type`
// (which is actually the Vaccine/Data/Virus/Free attribute) - don't conflate the two when mapping.
export interface RawStatRange {
  lv1: number
  lv99: number
}

export interface RawDigimonStats {
  HP: RawStatRange
  SP: RawStatRange
  ATK: RawStatRange
  DEF: RawStatRange
  INT: RawStatRange
  SPI: RawStatRange
  SPD: RawStatRange
}

export type RawStatKey = keyof RawDigimonStats

export interface RawStatCondition {
  op: string
  value: number
}

export interface RawJogressPartner {
  slug: string
  name: string
  personality: string
}

// Every field is optional and, per the current dataset, effectively independent conditions
// (a real entry may combine e.g. `stats` with `requiredItem`). `agentSkills`/`talent` don't have
// any equivalent in our game yet - only `stats` and `requiredItem` currently map to something.
export interface RawEvolutionCondition {
  stats?: Partial<Record<RawStatKey, RawStatCondition>>
  requiredItem?: string
  jogressPartners?: RawJogressPartner[]
  talent?: unknown
  agentSkills?: unknown
}

export interface RawDigimonEntry {
  number: number
  name: string
  generation: string
  attribute: string
  type: string
  description: string
  stats: RawDigimonStats
  attributeResistances: Record<string, number>
  elementalResistances: Record<string, number>
  evolutionCondition: RawEvolutionCondition
  evolvesTo: string[]
  evolvesFrom: string[]
  devolvesFrom: string[]
}

export interface RawDigimonWithSlug extends RawDigimonEntry {
  slug: string
}

interface RawDigimonFile {
  digimon: Record<string, RawDigimonEntry>
}

const typedRawFile = rawFile as RawDigimonFile

export const rawDigimonBySlug: Record<string, RawDigimonEntry> = typedRawFile.digimon

export const rawDigimonList: RawDigimonWithSlug[] = Object.entries(rawDigimonBySlug).map(
  ([slug, entry]) => ({ slug, ...entry }),
)

export function getRawDigimonBySlug(slug: string): RawDigimonWithSlug | undefined {
  const entry = rawDigimonBySlug[slug]

  return entry ? { slug, ...entry } : undefined
}

export interface DanglingEvolutionReference {
  slug: string
  missingId: string
  direction: 'evolvesTo' | 'evolvesFrom'
}

// Confirms the source data is internally consistent before anything in the app relies on it -
// a dangling reference here means digimon_cleaned.json itself is broken, not our own data entry.
export function findDanglingEvolutionReferences(): DanglingEvolutionReference[] {
  const dangling: DanglingEvolutionReference[] = []

  for (const entry of rawDigimonList) {
    for (const targetId of entry.evolvesTo) {
      if (!(targetId in rawDigimonBySlug)) {
        dangling.push({ slug: entry.slug, missingId: targetId, direction: 'evolvesTo' })
      }
    }

    for (const sourceId of entry.evolvesFrom) {
      if (!(sourceId in rawDigimonBySlug)) {
        dangling.push({ slug: entry.slug, missingId: sourceId, direction: 'evolvesFrom' })
      }
    }
  }

  return dangling
}
