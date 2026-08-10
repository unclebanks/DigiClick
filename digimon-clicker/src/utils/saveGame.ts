import type {
  DigimonProgressionState,
  DigimonStatBonus,
  DigitalSpaceEnvironment,
  DigivolutionChainEntry,
  DigivolutionState,
  PlayerState,
  PlayerStatistics,
  ThemeName,
} from '../types/game'
import { createInitialPlayerStatistics } from '../types/game'
import { createInitialDigivolutionState } from './evolution'

export const SAVE_STORAGE_KEY = 'digiclick-save'

// Bump this whenever PlayerState's shape changes in a way that needs an explicit migration step
// (see MIGRATIONS below) - e.g. a field is renamed or its meaning changes. Purely additive fields
// (new optional Record entries, new statistics counters, etc.) don't need a bump since
// sanitizePlayerState already fills in sane defaults for anything missing.
export const SAVE_VERSION = 2

export interface SaveFile {
  version: number
  savedAt: number
  player: PlayerState
}

export interface LoadedSave {
  player: PlayerState
  savedAt: number | null
}

const DIGITAL_SPACE_SIZE = 30
const DIGITAL_SPACE_ENV_CAPACITY = 30
const MAX_PARTY_SIZE = 6
const MAX_SCAN_PROGRESS = 200

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function createInitialDigitalSpace(): DigitalSpaceEnvironment[] {
  return Array.from({ length: DIGITAL_SPACE_SIZE }, (_, index) => ({
    id: `env-${index + 1}`,
    name: `Environment ${index + 1}`,
    digimonIds: [],
  }))
}

// Single source of truth for what a brand-new trainer's state looks like - used both as the
// store's initial state and as the fallback whenever a save is missing/unreadable.
export function createDefaultPlayerState(): PlayerState {
  return {
    currency: 120,
    playerLevel: 1,
    partyDigimon: [],
    inventory: { 'training-chip': 1 },
    currentArea: 'Digital Forest',
    digitalSpace: createInitialDigitalSpace(),
    digivolutionStates: {
      agumon: createInitialDigivolutionState('agumon'),
    },
    digimonProgression: {},
    statistics: createInitialPlayerStatistics(),
    badges: {},
    scanProgress: {},
    digimonBonuses: {},
    theme: 'light',
  }
}

function sanitizeNumber(value: unknown, fallback: number, min = -Infinity, max = Infinity): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

function sanitizeString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

const THEME_NAMES = new Set<ThemeName>(['light', 'dark', 'dark-high-contrast'])

function sanitizeTheme(value: unknown, fallback: ThemeName): ThemeName {
  return typeof value === 'string' && THEME_NAMES.has(value as ThemeName) ? (value as ThemeName) : fallback
}

function sanitizeStringArray(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : fallback
}

// Accepts either the current `{ formId, direction? }[]` shape or a plain `string[]` (this field's
// original shape, before choice-based de-digivolution needed to know each hop's direction too).
function sanitizeDigivolutionChain(value: unknown, fallback: DigivolutionChainEntry[]): DigivolutionChainEntry[] {
  if (!Array.isArray(value)) {
    return fallback
  }

  const result: DigivolutionChainEntry[] = []

  for (const entry of value) {
    if (typeof entry === 'string') {
      result.push({ formId: entry })
    } else if (isRecord(entry) && typeof entry.formId === 'string') {
      result.push(entry.direction === 'up' || entry.direction === 'down'
        ? { formId: entry.formId, direction: entry.direction }
        : { formId: entry.formId })
    }
  }

  return result.length > 0 ? result : fallback
}

// `inventory` is a quantity map (item id -> count owned). Drops non-numeric/non-positive/fractional
// counts rather than crashing - see the v1->v2 MIGRATIONS entry for converting the older
// plain-array inventory shape into this one.
function sanitizeInventory(value: unknown, fallback: Record<string, number>): Record<string, number> {
  if (!isRecord(value)) {
    return fallback
  }

  const result: Record<string, number> = {}

  for (const [itemId, count] of Object.entries(value)) {
    if (typeof count === 'number' && Number.isFinite(count) && count > 0) {
      result[itemId] = Math.floor(count)
    }
  }

  return result
}

function sanitizeDigitalSpace(value: unknown): DigitalSpaceEnvironment[] {
  const defaults = createInitialDigitalSpace()
  const source = Array.isArray(value) ? value : []

  const sanitized = source
    .filter(isRecord)
    .slice(0, defaults.length)
    .map((entry, index): DigitalSpaceEnvironment => ({
      id: sanitizeString(entry.id, defaults[index]?.id ?? `env-${index + 1}`),
      name: sanitizeString(entry.name, defaults[index]?.name ?? `Environment ${index + 1}`),
      digimonIds: sanitizeStringArray(entry.digimonIds, []).slice(0, DIGITAL_SPACE_ENV_CAPACITY),
    }))

  // Pad up to the current default count in case an older/corrupted save had fewer environments.
  while (sanitized.length < defaults.length) {
    sanitized.push(defaults[sanitized.length])
  }

  return sanitized
}

function sanitizeDigivolutionStates(value: unknown): Record<string, DigivolutionState> {
  if (!isRecord(value)) {
    return {}
  }

  const result: Record<string, DigivolutionState> = {}

  for (const [id, entry] of Object.entries(value)) {
    if (!isRecord(entry) || typeof entry.currentFormId !== 'string') {
      continue
    }

    result[id] = {
      currentFormId: entry.currentFormId,
      history: sanitizeStringArray(entry.history, [entry.currentFormId]),
      penaltyCount: sanitizeNumber(entry.penaltyCount, 0, 0),
      penaltyMultiplier: sanitizeNumber(entry.penaltyMultiplier, 1, 0),
      // Falls back to `history` for saves written before this field existed - a reasonable
      // best-effort chain rather than losing the display entirely.
      digivolutionChain: sanitizeDigivolutionChain(
        entry.digivolutionChain,
        sanitizeStringArray(entry.history, [entry.currentFormId]).map((formId) => ({ formId })),
      ),
    }
  }

  return result
}

function sanitizeDigimonProgression(value: unknown): Record<string, DigimonProgressionState> {
  if (!isRecord(value)) {
    return {}
  }

  const result: Record<string, DigimonProgressionState> = {}

  for (const [id, entry] of Object.entries(value)) {
    if (!isRecord(entry)) {
      continue
    }

    result[id] = {
      level: sanitizeNumber(entry.level, 1, 1),
      exp: sanitizeNumber(entry.exp, 0, 0),
      expToNextLevel: sanitizeNumber(entry.expToNextLevel, 100, 1),
    }
  }

  return result
}

function sanitizeStatistics(value: unknown): PlayerStatistics {
  const defaults = createInitialPlayerStatistics()

  if (!isRecord(value)) {
    return defaults
  }

  const result = { ...defaults }

  for (const key of Object.keys(defaults) as Array<keyof PlayerStatistics>) {
    result[key] = sanitizeNumber(value[key], defaults[key], 0)
  }

  return result
}

function sanitizeBadges(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) {
    return {}
  }

  const result: Record<string, boolean> = {}

  for (const [id, entry] of Object.entries(value)) {
    if (typeof entry === 'boolean') {
      result[id] = entry
    }
  }

  return result
}

function sanitizeScanProgress(value: unknown): Record<string, number> {
  if (!isRecord(value)) {
    return {}
  }

  const result: Record<string, number> = {}

  for (const [id, entry] of Object.entries(value)) {
    if (typeof entry === 'number' && Number.isFinite(entry)) {
      result[id] = Math.min(MAX_SCAN_PROGRESS, Math.max(0, entry))
    }
  }

  return result
}

const BONUS_STAT_KEYS = ['attack', 'defense', 'speed', 'hp', 'sp', 'int', 'spi'] as const

function sanitizeDigimonBonuses(value: unknown): Record<string, DigimonStatBonus> {
  if (!isRecord(value)) {
    return {}
  }

  const result: Record<string, DigimonStatBonus> = {}

  for (const [id, entry] of Object.entries(value)) {
    if (!isRecord(entry)) {
      continue
    }

    const bonus: DigimonStatBonus = {}

    for (const stat of BONUS_STAT_KEYS) {
      const statValue = entry[stat]

      if (typeof statValue === 'number' && Number.isFinite(statValue)) {
        bonus[stat] = statValue
      }
    }

    if (Object.keys(bonus).length > 0) {
      result[id] = bonus
    }
  }

  return result
}

// The core "fix broken/outdated saves" entry point. No matter what garbage ends up in
// localStorage - an older save missing fields added since, a newer save from a future rollback,
// hand-edited/corrupted JSON, or wrong types entirely - this always returns a fully valid
// PlayerState so the rest of the app never has to defend against undefined/malformed save data.
export function sanitizePlayerState(raw: unknown): PlayerState {
  const defaults = createDefaultPlayerState()

  if (!isRecord(raw)) {
    return defaults
  }

  return {
    currency: sanitizeNumber(raw.currency, defaults.currency, 0),
    playerLevel: sanitizeNumber(raw.playerLevel, defaults.playerLevel, 1),
    partyDigimon: sanitizeStringArray(raw.partyDigimon, defaults.partyDigimon).slice(0, MAX_PARTY_SIZE),
    inventory: sanitizeInventory(raw.inventory, defaults.inventory),
    currentArea: sanitizeString(raw.currentArea, defaults.currentArea),
    digitalSpace: sanitizeDigitalSpace(raw.digitalSpace),
    digivolutionStates: {
      ...defaults.digivolutionStates,
      ...sanitizeDigivolutionStates(raw.digivolutionStates),
    },
    digimonProgression: sanitizeDigimonProgression(raw.digimonProgression),
    statistics: sanitizeStatistics(raw.statistics),
    badges: sanitizeBadges(raw.badges),
    scanProgress: sanitizeScanProgress(raw.scanProgress),
    digimonBonuses: sanitizeDigimonBonuses(raw.digimonBonuses),
    theme: sanitizeTheme(raw.theme, defaults.theme),
  }
}

type Migration = (data: UnknownRecord) => UnknownRecord

// Version-specific upgrade steps, keyed by the version being migrated FROM. Keep every old
// migration here forever (don't delete old entries) so a save from any past version can still be
// walked forward to the current shape. sanitizePlayerState() already covers purely-additive
// changes (new fields default themselves), so only add an entry here for a genuine breaking
// change - e.g. a rename (`data.inventory = data.items; delete data.items`) or a type change
// (array -> record).
const MIGRATIONS: Record<number, Migration> = {
  // v1 -> v2: `inventory` changed from a de-duplicated item-id array to a quantity map
  // (`Record<itemId, count>`) so consumables can stack. Old entries never had more than one of
  // any id, so each array entry becomes a count of 1 (summed if it somehow appeared twice).
  1: (data) => {
    if (!Array.isArray(data.inventory)) {
      return data
    }

    const inventory: Record<string, number> = {}

    for (const itemId of data.inventory) {
      if (typeof itemId === 'string') {
        inventory[itemId] = (inventory[itemId] ?? 0) + 1
      }
    }

    return { ...data, inventory }
  },
}

function migrateSaveData(raw: UnknownRecord, fromVersion: number): UnknownRecord {
  let data = raw
  let version = Number.isFinite(fromVersion) ? fromVersion : 0

  // Cap iterations defensively so a corrupt/cyclical migration table can never hang the app.
  for (let guard = 0; guard < 100 && MIGRATIONS[version]; guard += 1) {
    data = MIGRATIONS[version](data)
    version += 1
  }

  return data
}

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    // Some environments (privacy modes, disabled storage) throw just accessing localStorage.
    return null
  }
}

// Parses+validates a raw save JSON string (whatever shape/version it was written in). Shared by
// loadGame() (reading from localStorage) and importSaveFile() (reading an exported .json file) so
// both go through the exact same migration/sanitization path. Returns null instead of throwing for
// any parsing/shape failure - corrupted or garbage input is treated as "no usable save".
function parseSaveFileText(raw: string): LoadedSave | null {
  try {
    const parsed: unknown = JSON.parse(raw)

    if (!isRecord(parsed)) {
      return null
    }

    const fromVersion = sanitizeNumber(parsed.version, 0, 0)
    const rawPlayer = isRecord(parsed.player) ? parsed.player : parsed
    const migratedPlayer = migrateSaveData(rawPlayer, fromVersion)
    const savedAt = typeof parsed.savedAt === 'number' && Number.isFinite(parsed.savedAt) ? parsed.savedAt : null

    return { player: sanitizePlayerState(migratedPlayer), savedAt }
  } catch {
    // Corrupted JSON or an unexpected shape - treat as "no save" rather than crashing.
    return null
  }
}

// Reads and validates a save from localStorage. Returns null if there is no save, storage is
// unavailable, the JSON is corrupted, or anything else goes wrong - callers should treat null as
// "no usable save", never let a bad save crash the app.
export function loadGame(): LoadedSave | null {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  try {
    const raw = storage.getItem(SAVE_STORAGE_KEY)

    if (!raw) {
      return null
    }

    return parseSaveFileText(raw)
  } catch {
    // Corrupted JSON or an unexpected shape - treat as "no save" rather than crashing.
    return null
  }
}

// Validates the contents of a save file the player picked via the "Load Game" file picker (e.g.
// one produced by serializeSaveFile()'s "Export Save" download). Goes through the exact same
// migration/sanitization pipeline as loadGame(), so an edited, outdated, or corrupted import can
// never crash the app - it either resolves to a fully valid PlayerState or null.
export function importSaveFile(raw: string): LoadedSave | null {
  return parseSaveFileText(raw)
}

// Writes the current player state to localStorage. Returns false (instead of throwing) if
// storage is unavailable or full, so callers can surface a friendly error.
export function saveGame(player: PlayerState): boolean {
  const storage = getStorage()

  if (!storage) {
    return false
  }

  const saveFile = buildSaveFile(player)

  try {
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveFile))
    return true
  } catch {
    return false
  }
}


// Produces the same JSON shape saveGame() writes to localStorage, for the Settings page's
// "Export Save" button to download as a standalone .json file.
export function serializeSaveFile(player: PlayerState): string {
  return JSON.stringify(buildSaveFile(player), null, 2)
}

function buildSaveFile(player: PlayerState): SaveFile {
  return { version: SAVE_VERSION, savedAt: Date.now(), player }
}

export function hasSaveGame(): boolean {
  const storage = getStorage()

  if (!storage) {
    return false
  }

  try {
    return storage.getItem(SAVE_STORAGE_KEY) !== null
  } catch {
    return false
  }
}

export function deleteSaveGame(): void {
  const storage = getStorage()

  if (!storage) {
    return
  }

  try {
    storage.removeItem(SAVE_STORAGE_KEY)
  } catch {
    // Nothing useful to do if storage access itself fails here.
  }
}
