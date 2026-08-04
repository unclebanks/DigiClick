import type { Evolution } from '../types/game'

export const sampleEvolutions: Evolution[] = [
  { id: 'botamon-koromon', from: 'botamon', to: 'koromon', cost: 25, requirementTemplate: 'Template: requires training level 1.' },
  { id: 'koromon-agumon', from: 'koromon', to: 'agumon', cost: 40, requirementTemplate: 'Template: requires a rookie item and level 2.' },
  { id: 'agumon-greymon', from: 'agumon', to: 'greymon', cost: 80, requirementTemplate: 'Template: requires battle experience and a special item.' },
  { id: 'greymon-metalgreymon', from: 'greymon', to: 'metalgreymon', cost: 140, requirementTemplate: 'Template: requires advanced gear and a high-level party.' },
  { id: 'metalgreymon-warGreymon', from: 'metalgreymon', to: 'warGreymon', cost: 220, requirementTemplate: 'Template: requires a mega-level milestone.' },
  { id: 'gabumon-garurumon', from: 'gabumon', to: 'garurumon', cost: 70, requirementTemplate: 'Template: requires a mid-level party.' },
  { id: 'garurumon-weregarurumon', from: 'garurumon', to: 'weregarurumon', cost: 130, requirementTemplate: 'Template: requires a storm item and high trust.' },
  { id: 'weregarurumon-anzhelomon', from: 'weregarurumon', to: 'anzhelomon', cost: 250, requirementTemplate: 'Template: requires a legendary trial.' },
  { id: 'biyomon-velgemon', from: 'biyomon', to: 'velgemon', cost: 95, requirementTemplate: 'Template: requires a sky item.' },
  { id: 'velgemon-rosemon', from: 'velgemon', to: 'rosemon', cost: 180, requirementTemplate: 'Template: requires a floral relic.' },
  { id: 'gatomon-angewomon', from: 'gatomon', to: 'angewomon', cost: 110, requirementTemplate: 'Template: requires a healing focus.' },
  { id: 'angewomon-magnaangemon', from: 'angewomon', to: 'magnaangemon', cost: 220, requirementTemplate: 'Template: requires a holy item.' },
  { id: 'patamon-gomamon', from: 'patamon', to: 'gomamon', cost: 55, requirementTemplate: 'Template: requires a water affinity item.' },
  { id: 'gomamon-icerimon', from: 'gomamon', to: 'icerimon', cost: 130, requirementTemplate: 'Template: requires a frost relic.' },
  { id: 'icerimon-owgaramon', from: 'icerimon', to: 'owgaramon', cost: 210, requirementTemplate: 'Template: requires a winter trial.' },
  { id: 'palmon-togemon', from: 'palmon', to: 'togemon', cost: 65, requirementTemplate: 'Template: requires a growth item.' },
  { id: 'togemon-lillymon', from: 'togemon', to: 'lillymon', cost: 140, requirementTemplate: 'Template: requires a floral crystal.' },
  { id: 'lillymon-rosemon', from: 'lillymon', to: 'rosemon', cost: 200, requirementTemplate: 'Template: requires a sunlit bloom.' },
  { id: 'gekomon-deramon', from: 'gekomon', to: 'deramon', cost: 90, requirementTemplate: 'Template: requires a sturdiness badge.' },
  { id: 'deramon-cherubimon', from: 'deramon', to: 'cherubimon', cost: 240, requirementTemplate: 'Template: requires a celestial trial.' },
]
