// Which way a species' battle sprite (src/assets/digimon_set2) faces by default. Battle UI uses
// this to flip whichever combatant needs it so the two Digimon visually face each other - see
// DigimonSprite.tsx's `facing` prop. Only species with sprite art actually need an entry here;
// anything else just falls back to DEFAULT_SPRITE_FACING (unused until it has real sprite frames).
export type SpriteFacing = 'left' | 'right'

export const DEFAULT_SPRITE_FACING: SpriteFacing = 'right'

const SPRITE_FACING_BY_ID: Record<string, SpriteFacing> = {
  agumon: 'left',
}

export function getSpriteFacing(speciesId: string): SpriteFacing {
  return SPRITE_FACING_BY_ID[speciesId] ?? DEFAULT_SPRITE_FACING
}
