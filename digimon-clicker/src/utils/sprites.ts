// Auto-discovers Digimon battle sprites dropped into src/assets/digimon_set2. Add art for a species
// by dropping exactly 4 frames named "<id>_01.png".."<id>_04.png" (matching the Digimon's `id`, e.g.
// agumon_01.png..agumon_04.png) - no code changes needed for a new species to pick these up.
// Species with no matching files simply have no entry, and callers should fall back to the emoji
// placeholder (see components/digimon/DigimonSprite.tsx). See data/spriteFacing.ts for the
// direction a given species' art faces by default.
const spriteModules = import.meta.glob('../assets/digimon_set2/*.png', { eager: true, import: 'default' }) as Record<string, string>

const FRAME_FILENAME_PATTERN = /^([a-z0-9-]+)_(\d{2})\.png$/i

function buildSpriteFrameMap(): Map<string, string[]> {
  const framesById = new Map<string, Array<{ frame: number, url: string }>>()

  for (const [path, url] of Object.entries(spriteModules)) {
    const fileName = path.split('/').pop() ?? ''
    const match = fileName.match(FRAME_FILENAME_PATTERN)

    if (!match) {
      continue
    }

    const [, id, frameNumber] = match
    const entries = framesById.get(id) ?? []
    entries.push({ frame: Number(frameNumber), url })
    framesById.set(id, entries)
  }

  const result = new Map<string, string[]>()

  for (const [id, entries] of framesById) {
    result.set(id, entries.sort((a, b) => a.frame - b.frame).map((entry) => entry.url))
  }

  return result
}

const spriteFramesById = buildSpriteFrameMap()

// Ordered animation frames for a species' battle sprite, or undefined if no art has been added yet.
export function getDigimonSpriteFrames(speciesId: string): string[] | undefined {
  return spriteFramesById.get(speciesId)
}

export function hasDigimonSprite(speciesId: string): boolean {
  return spriteFramesById.has(speciesId)
}
