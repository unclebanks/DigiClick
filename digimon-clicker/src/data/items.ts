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
  {
    id: 'egg-of-courage',
    name: 'Egg of Courage',
    description: 'A glowing egg that awakens bravery in a young Digimon.',
    price: 90,
    effect: 'Unlocks courage-based evolution',
  },
  {
    id: 'egg-of-friendship',
    name: 'Egg of Friendship',
    description: 'A warm egg that strengthens bonds and trust.',
    price: 85,
    effect: 'Unlocks friendship-based evolution',
  },
  {
    id: 'egg-of-hope',
    name: 'Egg of Hope',
    description: 'A bright egg that inspires growth and optimism.',
    price: 95,
    effect: 'Unlocks hope-based evolution',
  },
]
