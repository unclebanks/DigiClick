import type { Item } from '../types/game'

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
]
