import type { Evolution } from '../types/game'
import { badgeReq, itemReq, levelReq } from '../utils/evolution'

export const sampleEvolutions: Evolution[] = [
  { id: 'botamon-koromon', from: 'botamon', to: 'koromon', cost: 25, requires: [levelReq(2)] },
  { id: 'koromon-agumon', from: 'koromon', to: 'agumon', cost: 40, requires: [levelReq(3), itemReq('training-chip')] },
  { id: 'agumon-greymon', from: 'agumon', to: 'greymon', cost: 80, requires: [levelReq(5)] },
  { id: 'greymon-metalgreymon', from: 'greymon', to: 'metalgreymon', cost: 140, requires: [levelReq(8), itemReq('healing-herb')] },
  { id: 'metalgreymon-warGreymon', from: 'metalgreymon', to: 'warGreymon', cost: 220, requires: [levelReq(10)] },
  { id: 'gabumon-garurumon', from: 'gabumon', to: 'garurumon', cost: 70, requires: [levelReq(4)] },
  { id: 'garurumon-weregarurumon', from: 'garurumon', to: 'weregarurumon', cost: 130, requires: [levelReq(6)] },
  { id: 'weregarurumon-anzhelomon', from: 'weregarurumon', to: 'anzhelomon', cost: 250, requires: [levelReq(10)] },
  { id: 'biyomon-veemon', from: 'biyomon', to: 'veemon', cost: 95, requires: [levelReq(4), itemReq('data-disk')] },
  { id: 'veemon-greymon', from: 'veemon', to: 'greymon', cost: 180, requires: [levelReq(7), badgeReq('first-victory')] },
  { id: 'gatomon-angewomon', from: 'gatomon', to: 'angewomon', cost: 110, requires: [levelReq(5)] },
  { id: 'angewomon-magnaangemon', from: 'angewomon', to: 'magnaangemon', cost: 220, requires: [levelReq(9)] },
  { id: 'patamon-gomamon', from: 'patamon', to: 'gomamon', cost: 55, requires: [levelReq(3)] },
  { id: 'gomamon-icerimon', from: 'gomamon', to: 'icerimon', cost: 130, requires: [levelReq(6)] },
  { id: 'icerimon-owgaramon', from: 'icerimon', to: 'owgaramon', cost: 210, requires: [levelReq(8)] },
  { id: 'palmon-togemon', from: 'palmon', to: 'togemon', cost: 65, requires: [levelReq(3)] },
  { id: 'togemon-lillymon', from: 'togemon', to: 'lillymon', cost: 140, requires: [levelReq(6)] },
  { id: 'lillymon-rosemon', from: 'lillymon', to: 'rosemon', cost: 200, requires: [levelReq(8)] },
  { id: 'gekomon-deramon', from: 'gekomon', to: 'deramon', cost: 90, requires: [levelReq(4), badgeReq('first-victory')] },
  { id: 'deramon-cherubimon', from: 'deramon', to: 'cherubimon', cost: 240, requires: [levelReq(10)] },
  { id: 'agumon-veemon', from: 'agumon', to: 'veemon', cost: 115, requires: [levelReq(4), itemReq('egg-of-courage')] },
  { id: 'gabumon-otamamon', from: 'gabumon', to: 'otamamon', cost: 95, requires: [levelReq(3), itemReq('egg-of-friendship')] },
  { id: 'gatomon-piyomon', from: 'gatomon', to: 'piyomon', cost: 105, requires: [levelReq(4), itemReq('egg-of-hope')] },
]
