import type { Item } from '../types/game'

// Egg-of-courage/friendship/hope placeholders were removed - superseded by the CSV-sourced
// digi-egg-of-* entries in src/data/evolutionItems.ts.
export const sampleItems: Item[] = [
  {
    id: 'training-chip',
    name: 'Training Chip',
    description: 'A small boost for a quick training session.',
    price: 40,
    effect: '+5 battle power',
  },
  {
    id: 'healing-herb',
    name: 'Healing Herb',
    description: 'Restores a little strength after a tough fight.',
    price: 60,
    effect: 'Recover 20 HP',
  },
  {
    id: 'data-disk',
    name: 'Data Disk',
    description: 'A dense disk of compressed digital code.',
    price: 70,
    effect: 'Unlocks data-based evolution',
  },
]

