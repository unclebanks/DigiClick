import type { Digimon, DigimonAttribute, DigimonStats, StatGrowthRange } from '../types/game'
import { getRawDigimonBySlug, rawDigimonList } from './digimonSource'
import type { RawDigimonWithSlug } from './digimonSource'

// Phase 4 of the JSON migration (see /memories/repo/digimon-json-migration-plan.md): sampleDigimon
// is now generated from digimon_cleaned.json for every species that has a match there. A handful
// of classic baby/in-training forms aren't in that game's roster at all - those stay hand-authored
// (see `manual(...)` entries below) exactly as they were before this migration.
//
// Phase 6: the rest of the 475-species dataset (everything not individually curated below) is
// bulk-imported at the bottom of this file, using generation-based fallbacks for the fields
// digimon_cleaned.json doesn't provide (emoji/basePower/personality) - see `buildBulkDigimon`.

// digimon_cleaned.json's RPG stat numbers (hundreds-to-thousands) are on a much bigger scale than
// this clicker's combat math was tuned around (single/double digits) - getAttackIntervalMs, the
// flat bits/exp reward formulas, etc. would all break if we used the raw numbers directly. This is
// a single tunable knob: scale every stat down by the same divisor so the numbers land back near
// our existing balance, while preserving each species' relative proportions and lv1->lv99 growth.
const JSON_STAT_SCALE_DIVISOR = 20

function scaleStat(value: number): number {
  return Math.max(1, Math.round(value / JSON_STAT_SCALE_DIVISOR))
}

const KNOWN_ATTRIBUTES = new Set<DigimonAttribute>(['Vaccine', 'Data', 'Virus', 'Free', 'Unknown', 'Variable', 'No Data'])

function toDigimonAttribute(attribute: string): DigimonAttribute {
  if (!KNOWN_ATTRIBUTES.has(attribute as DigimonAttribute)) {
    throw new Error(`digimon.ts: unrecognized attribute "${attribute}" from digimon_cleaned.json`)
  }

  return attribute as DigimonAttribute
}

interface SourcedDigimonDescriptor {
  kind: 'sourced'
  id: string
  emoji: string
  basePower: number
  personality: string
  drops?: Digimon['drops']
  // Only needed where our id doesn't match the JSON slug (naming differs between continuities),
  // e.g. our `omegamon` is JSON's `omnimon`, and `imperialdramon` is JSON's `imperialdramon-dm`.
  slug?: string
}

interface ManualDigimonDescriptor {
  kind: 'manual'
  digimon: Digimon
}

type DigimonDescriptor = SourcedDigimonDescriptor | ManualDigimonDescriptor

function sourced(descriptor: Omit<SourcedDigimonDescriptor, 'kind'>): DigimonDescriptor {
  return { kind: 'sourced', ...descriptor }
}

function manual(digimon: Digimon): DigimonDescriptor {
  return { kind: 'manual', digimon }
}

function buildStatsFromRaw(raw: RawDigimonWithSlug): { baseStats: DigimonStats, growthStats: StatGrowthRange } {
  return {
    baseStats: {
      attack: scaleStat(raw.stats.ATK.lv1),
      defense: scaleStat(raw.stats.DEF.lv1),
      speed: scaleStat(raw.stats.SPD.lv1),
      hp: scaleStat(raw.stats.HP.lv1),
      sp: scaleStat(raw.stats.SP.lv1),
      int: scaleStat(raw.stats.INT.lv1),
      spi: scaleStat(raw.stats.SPI.lv1),
    },
    growthStats: {
      attack: scaleStat(raw.stats.ATK.lv99),
      defense: scaleStat(raw.stats.DEF.lv99),
      speed: scaleStat(raw.stats.SPD.lv99),
      hp: scaleStat(raw.stats.HP.lv99),
    },
  }
}

function buildDigimonFromSource(descriptor: SourcedDigimonDescriptor): Digimon {
  const raw = getRawDigimonBySlug(descriptor.slug ?? descriptor.id)

  if (!raw) {
    throw new Error(`digimon.ts: no digimon_cleaned.json entry found for slug "${descriptor.slug ?? descriptor.id}" (id "${descriptor.id}")`)
  }

  return {
    id: descriptor.id,
    name: raw.name,
    stage: raw.generation,
    description: raw.description,
    personality: descriptor.personality,
    type: toDigimonAttribute(raw.attribute),
    basePower: descriptor.basePower,
    emoji: descriptor.emoji,
    speciesType: raw.type,
    ...buildStatsFromRaw(raw),
    drops: descriptor.drops,
  }
}

const digimonDescriptors: DigimonDescriptor[] = [
  sourced({ id: 'botamon', emoji: '🍼', basePower: 8, personality: 'Playful' }),
  sourced({ id: 'koromon', emoji: '🌱', basePower: 12, personality: 'Curious' }),
  sourced({ id: 'agumon', emoji: '🦖', basePower: 18, personality: 'Loyal', drops: [{ itemId: 'healing-herb', chance: 0.2 }] }),
  sourced({ id: 'greymon', emoji: '🦕', basePower: 26, personality: 'Bold' }),
  sourced({ id: 'metalgreymon', emoji: '🤖', basePower: 36, personality: 'Determined' }),
  sourced({ id: 'wargreymon', emoji: '⚔️', basePower: 48, personality: 'Heroic' }),
  sourced({ id: 'guilmon', emoji: '🦖', basePower: 18, personality: 'Curious', drops: [{ itemId: 'dragon-scale', chance: 0.2 }] }),
  sourced({ id: 'growlmon', emoji: '🐉', basePower: 26, personality: 'Aggressive' }),
  sourced({ id: 'wargrowlmon', emoji: '🦾', basePower: 36, personality: 'Resolute' }),
  sourced({ id: 'gallantmon', emoji: '🛡️', basePower: 48, personality: 'Chivalrous' }),
  sourced({ id: 'punimon', emoji: '🔴', basePower: 8, personality: 'Gentle' }),
  sourced({ id: 'tsunomon', emoji: '🦄', basePower: 12, personality: 'Feisty' }),
  sourced({ id: 'gabumon', emoji: '🦊', basePower: 16, personality: 'Protective' }),
  sourced({ id: 'garurumon', emoji: '🐺', basePower: 24, personality: 'Steady' }),
  sourced({ id: 'weregarurumon', emoji: '🥊', basePower: 34, personality: 'Fierce' }),
  sourced({ id: 'metalgarurumon', emoji: '❄️', basePower: 48, personality: 'Resolute' }),
  manual({
    id: 'nyokimon',
    name: 'Nyokimon',
    stage: 'Fresh',
    description: 'A tiny plant sprout fresh out of a Digi-Egg.',
    personality: 'Quiet',
    type: 'Data',
    basePower: 7,
    emoji: '🌱',
    baseStats: { attack: 6, defense: 6, speed: 8, hp: 20 },
  }),
  sourced({ id: 'yokomon', emoji: '🌸', basePower: 11, personality: 'Gentle' }),
  sourced({ id: 'biyomon', emoji: '🕊️', basePower: 15, personality: 'Energetic' }),
  sourced({ id: 'birdramon', emoji: '🔥', basePower: 23, personality: 'Daring' }),
  sourced({ id: 'garudamon', emoji: '🦅', basePower: 33, personality: 'Noble' }),
  sourced({ id: 'phoenixmon', emoji: '👑', basePower: 46, personality: 'Divine' }),
  sourced({ id: 'pabumon', emoji: '🧼', basePower: 8, personality: 'Curious' }),
  sourced({ id: 'motimon', emoji: '🍡', basePower: 12, personality: 'Tolerant' }),
  sourced({ id: 'tentomon', emoji: '🐞', basePower: 16, personality: 'Inquisitive' }),
  sourced({ id: 'kabuterimon', emoji: '⚡', basePower: 25, personality: 'Logical' }),
  sourced({ id: 'megakabuterimon', emoji: '🛡️', basePower: 35, personality: 'Stalwart' }),
  manual({
    id: 'yuramon',
    name: 'Yuramon',
    stage: 'Fresh',
    description: 'A tiny seed covered in soft white hair.',
    personality: 'Calm',
    type: 'Data',
    basePower: 7,
    emoji: '🌾',
    baseStats: { attack: 6, defense: 6, speed: 7, hp: 20 },
  }),
  sourced({ id: 'tanemon', emoji: '🌱', basePower: 11, personality: 'Friendly' }),
  sourced({ id: 'palmon', emoji: '🌿', basePower: 15, personality: 'Sassy' }),
  sourced({ id: 'togemon', emoji: '🌵', basePower: 23, personality: 'Feisty' }),
  sourced({ id: 'lillymon', emoji: '🧚', basePower: 33, personality: 'Graceful' }),
  sourced({ id: 'rosemon', emoji: '🌹', basePower: 46, personality: 'Elegant' }),
  manual({
    id: 'pitimon',
    name: 'Pitimon',
    stage: 'Fresh',
    description: 'A small aquatic hatchling with water bubble moves.',
    personality: 'Playful',
    type: 'Data',
    basePower: 7,
    emoji: '💧',
    baseStats: { attack: 6, defense: 7, speed: 7, hp: 21 },
  }),
  sourced({ id: 'bukamon', emoji: '🫧', basePower: 11, personality: 'Jolly' }),
  sourced({ id: 'gomamon', emoji: '🐬', basePower: 16, personality: 'Loyal' }),
  sourced({ id: 'ikkakumon', emoji: '🦭', basePower: 24, personality: 'Brave' }),
  sourced({ id: 'zudomon', emoji: '🔨', basePower: 35, personality: 'Mighty' }),
  sourced({ id: 'poyomon', emoji: '🫧', basePower: 7, personality: 'Gentle' }),
  sourced({ id: 'tokomon', emoji: '🐹', basePower: 11, personality: 'Cheeky' }),
  sourced({ id: 'patamon', emoji: '🪽', basePower: 15, personality: 'Cheerful' }),
  sourced({ id: 'angemon', emoji: '🕯️', basePower: 26, personality: 'Calm' }),
  sourced({ id: 'magnaangemon', emoji: '👼', basePower: 37, personality: 'Noble' }),
  sourced({ id: 'seraphimon', emoji: '✨', basePower: 49, personality: 'Divine' }),
  manual({
    id: 'snowbotamon',
    name: 'SnowBotamon',
    stage: 'Fresh',
    description: 'A snow-white fresh Digimon that loves cold breezes.',
    personality: 'Pure',
    type: 'Data',
    basePower: 7,
    emoji: '❄️',
    baseStats: { attack: 6, defense: 6, speed: 7, hp: 20 },
  }),
  sourced({ id: 'nyaromon', emoji: '🐱', basePower: 11, personality: 'Playful' }),
  sourced({ id: 'salamon', emoji: '🐶', basePower: 14, personality: 'Timid' }),
  sourced({ id: 'gatomon', emoji: '🐾', basePower: 25, personality: 'Mysterious' }),
  sourced({ id: 'angewomon', emoji: '🏹', basePower: 36, personality: 'Graceful' }),
  sourced({ id: 'magnadramon', emoji: '🐉', basePower: 47, personality: 'Radiant' }),
  sourced({ id: 'devimon', emoji: '😈', basePower: 28, personality: 'Malevolent' }),
  sourced({ id: 'etemon', emoji: '🐒', basePower: 35, personality: 'Arrogant' }),
  sourced({ id: 'myotismon', emoji: '🦇', basePower: 38, personality: 'Ruthless' }),
  sourced({ id: 'metalseadramon', emoji: '🐍', basePower: 46, personality: 'Tyrannical' }),
  sourced({ id: 'puppetmon', emoji: '🪆', basePower: 45, personality: 'Cruel' }),
  sourced({ id: 'machinedramon', emoji: '⚙️', basePower: 48, personality: 'Cold' }),
  sourced({ id: 'piedmon', emoji: '🃏', basePower: 49, personality: 'Cunning' }),
  sourced({ id: 'apocalymon', emoji: '🌀', basePower: 55, personality: 'Desperate' }),
  manual({
    id: 'chibomon',
    name: 'Chibomon',
    stage: 'Fresh',
    description: 'A small blue baby Digimon with endless spirit.',
    personality: 'Energetic',
    type: 'Free',
    basePower: 7,
    emoji: '💧',
    baseStats: { attack: 7, defense: 6, speed: 7, hp: 21 },
  }),
  manual({
    id: 'demiveemon',
    name: 'DemiVeemon',
    stage: 'In-Training',
    description: 'A bouncy dragon-child Digimon full of enthusiasm.',
    personality: 'Excitable',
    type: 'Free',
    basePower: 11,
    emoji: '🐉',
    baseStats: { attack: 11, defense: 8, speed: 10, hp: 27 },
  }),
  sourced({ id: 'veemon', emoji: '🦕', basePower: 17, personality: 'Energetic' }),
  sourced({ id: 'flamedramon', emoji: '🔥', basePower: 27, personality: 'Fiery' }),
  sourced({ id: 'exveemon', emoji: '🦾', basePower: 26, personality: 'Bold' }),
  sourced({ id: 'paildramon', emoji: '🔫', basePower: 37, personality: 'Fierce' }),
  sourced({ id: 'imperialdramon', emoji: '🐲', basePower: 50, personality: 'Majestic', slug: 'imperialdramon-dm' }),
  sourced({ id: 'hawkmon', emoji: '🦅', basePower: 16, personality: 'Polite' }),
  sourced({ id: 'aquilamon', emoji: '🪶', basePower: 24, personality: 'Keen' }),
  sourced({ id: 'armadillomon', emoji: '🛡️', basePower: 16, personality: 'Easygoing' }),
  sourced({ id: 'ankylomon', emoji: '🧱', basePower: 25, personality: 'Sturdy' }),
  sourced({ id: 'wormmon', emoji: '🐛', basePower: 14, personality: 'Timid' }),
  sourced({ id: 'stingmon', emoji: '🐝', basePower: 25, personality: 'Silent' }),
  sourced({ id: 'kimeramon', emoji: '☣️', basePower: 38, personality: 'Wild' }),
  sourced({ id: 'blackwargreymon', emoji: '🖤', basePower: 49, personality: 'Brooding' }),
  sourced({ id: 'malomyotismon', emoji: '👁️', basePower: 52, personality: 'Sinister' }),
  sourced({ id: 'omegamon', emoji: '🛡️', basePower: 52, personality: 'Legendary', slug: 'omnimon' }),
]

const curatedDigimon: Digimon[] = digimonDescriptors.map((descriptor) =>
  descriptor.kind === 'manual' ? descriptor.digimon : buildDigimonFromSource(descriptor),
)

// Phase 6: bulk-import every remaining digimon_cleaned.json species not already curated above.
// digimon_cleaned.json has no emoji/basePower/personality data at all, so these use coarse,
// generation-tier-based placeholders instead of per-species hand authoring (475 species is too
// many to hand-curate individually) - revisit/replace per-species as they get real attention.
const DEFAULT_PERSONALITY = 'Undetermined'

const DEFAULT_EMOJI_BY_GENERATION: Record<string, string> = {
  Fresh: '🥚',
  'In-Training': '🐣',
  Rookie: '🐲',
  Champion: '🐉',
  Armor: '🛡️',
  Hybrid: '🌀',
  Ultimate: '👹',
  Mega: '👑',
  'Mega +': '☠️',
}

const DEFAULT_EMOJI = '❓'

function buildBulkDigimon(raw: RawDigimonWithSlug): Digimon {
  return {
    id: raw.slug,
    name: raw.name,
    stage: raw.generation,
    description: raw.description,
    personality: DEFAULT_PERSONALITY,
    type: toDigimonAttribute(raw.attribute),
    basePower: scaleStat(raw.stats.ATK.lv1),
    emoji: DEFAULT_EMOJI_BY_GENERATION[raw.generation] ?? DEFAULT_EMOJI,
    speciesType: raw.type,
    ...buildStatsFromRaw(raw),
  }
}

const curatedSlugs = new Set(
  digimonDescriptors
    .filter((descriptor): descriptor is SourcedDigimonDescriptor => descriptor.kind === 'sourced')
    .map((descriptor) => descriptor.slug ?? descriptor.id),
)

const bulkDigimon: Digimon[] = rawDigimonList
  .filter((raw) => !curatedSlugs.has(raw.slug))
  .map(buildBulkDigimon)

export const sampleDigimon: Digimon[] = [...curatedDigimon, ...bulkDigimon]

