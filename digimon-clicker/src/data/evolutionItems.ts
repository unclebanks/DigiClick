import type { Item } from '../types/game'

// Evolution-material items sourced from the "Evolution" rows of examples/ItemTable.csv (Digi-Eggs
// carrying a Crest, plus the Human/Beast Spirits). Like src/data/consumables.ts, this is data only -
// no evolution edge in src/data/evolutions.ts references these ids yet (`itemReq` support exists in
// src/utils/evolution.ts, just unused for these). Prices are placeholder, sized to sit alongside
// existing evolution Bits costs (see BASE_EVOLUTION_COST_BY_GENERATION in evolutions.ts).
export const evolutionItems: Item[] = [
  {
    id: 'digi-egg-of-courage',
    name: 'Digi-Egg of Courage',
    description: 'A Digi-Egg engraved with the Crest of Courage.',
    price: 250,
    effect: 'Evolution material - Crest of Courage.',
  },
  {
    id: 'digi-egg-of-friendship',
    name: 'Digi-Egg of Friendship',
    description: 'A Digi-Egg engraved with the Crest of Friendship.',
    price: 250,
    effect: 'Evolution material - Crest of Friendship.',
  },
  {
    id: 'digi-egg-of-love',
    name: 'Digi-Egg of Love',
    description: 'A Digi-Egg engraved with the Crest of Love.',
    price: 250,
    effect: 'Evolution material - Crest of Love.',
  },
  {
    id: 'digi-egg-of-sincerity',
    name: 'Digi-Egg of Sincerity',
    description: 'A Digi-Egg engraved with the Crest of Sincerity.',
    price: 250,
    effect: 'Evolution material - Crest of Sincerity.',
  },
  {
    id: 'digi-egg-of-knowledge',
    name: 'Digi-Egg of Knowledge',
    description: 'A Digi-Egg engraved with the Crest of Knowledge.',
    price: 250,
    effect: 'Evolution material - Crest of Knowledge.',
  },
  {
    id: 'digi-egg-of-reliability',
    name: 'Digi-Egg of Reliability',
    description: 'A Digi-Egg engraved with the Crest of Reliability.',
    price: 250,
    effect: 'Evolution material - Crest of Reliability.',
  },
  {
    id: 'digi-egg-of-hope',
    name: 'Digi-Egg of Hope',
    description: 'A Digi-Egg engraved with the Crest of Hope.',
    price: 250,
    effect: 'Evolution material - Crest of Hope.',
  },
  {
    id: 'digi-egg-of-light',
    name: 'Digi-Egg of Light',
    description: 'A Digi-Egg engraved with the Crest of Light.',
    price: 250,
    effect: 'Evolution material - Crest of Light.',
  },
  {
    id: 'digi-egg-of-miracles',
    name: 'Digi-Egg of Miracles',
    description: 'A Digi-Egg engraved with the Crest of Miracles.',
    price: 300,
    effect: 'Evolution material - Crest of Miracles.',
  },
  {
    id: 'digi-egg-of-destiny',
    name: 'Digi-Egg of Destiny',
    description: 'A Digi-Egg engraved with the Crest of Destiny.',
    price: 300,
    effect: 'Evolution material - Crest of Destiny.',
  },
  {
    id: 'digi-egg-of-kindness',
    name: 'Digi-Egg of Kindness',
    description: 'A Digi-Egg engraved with the Crest of Kindness.',
    price: 250,
    effect: 'Evolution material - Crest of Kindness.',
  },
  {
    id: 'human-spirit-of-flame',
    name: 'Human Spirit of Flame',
    description: 'A human spirit containing the spirit of the Fire Warrior, one of the Ten Legendary Warriors.',
    price: 350,
    effect: 'Evolution material - Human Spirit of Flame.',
  },
  {
    id: 'beast-spirit-of-flame',
    name: 'Beast Spirit of Flame',
    description: 'A beast spirit containing the spirit of the Fire Warrior, one of the Ten Legendary Warriors.',
    price: 400,
    effect: 'Evolution material - Beast Spirit of Flame.',
  },
  {
    id: 'human-spirit-of-light',
    name: 'Human Spirit of Light',
    description: 'A human spirit containing the spirit of the Light Warrior, one of the Ten Legendary Warriors.',
    price: 350,
    effect: 'Evolution material - Human Spirit of Light.',
  },
  {
    id: 'beast-spirit-of-light',
    name: 'Beast Spirit of Light',
    description: 'A beast spirit containing the spirit of the Light Warrior, one of the Ten Legendary Warriors.',
    price: 400,
    effect: 'Evolution material - Beast Spirit of Light.',
  },
]
