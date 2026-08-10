import type { DigimonStats, Evolution, EvolutionRequirement } from '../types/game'
import { statReq } from '../utils/evolution'
import { sampleDigimon } from './digimon'
import { getRawDigimonBySlug } from './digimonSource'
import type { RawStatKey } from './digimonSource'

// Phase 5 of the JSON migration (see /memories/repo/digimon-json-migration-plan.md): sampleEvolutions
// is generated from digimon_cleaned.json's evolvesTo + evolutionCondition, kept to edges where both
// ends are in our current sampleDigimon roster. digimon_cleaned.json has no bits-cost concept, so
// cost is derived from the target's generation (see BASE_EVOLUTION_COST_BY_GENERATION).
//
// Stat-condition thresholds are used AS-IS from the source data. baseStats/growthStats in
// digimon.ts are also unscaled now (JSON_STAT_SCALE_DIVISOR was removed - see the migration plan
// doc's Phase 8), so both sides of a statReq check are finally on the same raw JSON scale.
//
// Each evolvesTo target can now have its own condition via digimon_cleaned.json's per-target
// `evolutionConditions` map (falls back to the shared `evolutionCondition` if a target has no
// entry there) - e.g. agumon's edges to geogreymon vs greymon now require different HP thresholds
// instead of sharing one. Current values are placeholders (scaled off the old shared condition),
// not researched/balanced - see the migration plan doc.
//
// requiredItem/jogressPartners/talent/agentSkills evolutionConditions have no equivalent in our
// evolution model yet and are silently dropped from `requires` (the edge stays reachable via
// whichever stat/level/cost gates it also has) - only `paildramon -> imperialdramon` in our current
// roster has a jogress condition (needs ExVeemon + Stingmon as partners in the source game).

const BASE_EVOLUTION_COST_BY_GENERATION: Record<string, number> = {
  Fresh: 15,
  'In-Training': 25,
  Rookie: 40,
  Champion: 80,
  Armor: 90,
  Hybrid: 90,
  Ultimate: 140,
  Mega: 220,
  'Mega +': 300,
}

const DEFAULT_EVOLUTION_COST = 100

const STAT_KEY_MAP: Record<RawStatKey, keyof DigimonStats> = {
  HP: 'hp',
  ATK: 'attack',
  DEF: 'defense',
  SPD: 'speed',
  SP: 'sp',
  INT: 'int',
  SPI: 'spi',
}

// Our id doesn't always match the JSON slug (naming differs between game continuities) - mirrors
// the same overrides used in digimon.ts.
const SLUG_OVERRIDES: Record<string, string> = {
  omegamon: 'omnimon',
  imperialdramon: 'imperialdramon-dm',
}

const digimonIds = new Set(sampleDigimon.map((digimon) => digimon.id))

const idBySlug: Record<string, string> = {}

for (const id of digimonIds) {
  idBySlug[SLUG_OVERRIDES[id] ?? id] = id
}

function buildRequirements(stats: Record<string, { op: string, value: number }> | undefined): EvolutionRequirement[] {
  if (!stats) {
    return []
  }

  return Object.entries(stats).map(([statKey, condition]) => statReq(STAT_KEY_MAP[statKey as RawStatKey], condition.value))
}

function costForGeneration(generation: string): number {
  return BASE_EVOLUTION_COST_BY_GENERATION[generation] ?? DEFAULT_EVOLUTION_COST
}

const generatedEvolutions: Evolution[] = []

for (const id of digimonIds) {
  const raw = getRawDigimonBySlug(SLUG_OVERRIDES[id] ?? id)

  if (!raw) {
    continue // manual-fallback species (no digimon_cleaned.json match) have no evolution data to source
  }

  for (const targetSlug of raw.evolvesTo) {
    const targetId = idBySlug[targetSlug]

    if (!targetId) {
      continue // target isn't in our current curated roster yet (see Phase 6)
    }

    const targetSpecies = sampleDigimon.find((digimon) => digimon.id === targetId)
    // Per-target condition (Phase 8 follow-up: distinct requirements per evolvesTo target)
    // falls back to the shared evolutionCondition if this target has no entry of its own.
    const condition = raw.evolutionConditions?.[targetSlug] ?? raw.evolutionCondition

    generatedEvolutions.push({
      id: `${id}-${targetId}`,
      from: id,
      to: targetId,
      cost: costForGeneration(targetSpecies?.stage ?? ''),
      requires: buildRequirements(condition.stats),
    })
  }
}

export const sampleEvolutions: Evolution[] = generatedEvolutions

