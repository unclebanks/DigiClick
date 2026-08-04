# Codebase map

## Project purpose
DigiClick is a React + TypeScript starter project for a Digimon-inspired clicker RPG. The codebase is intentionally simple so it can be expanded into a fuller game loop without introducing too much complexity up front.

## Main folders
- src/components: reusable UI pieces such as buttons, cards, and Digimon display components.
- src/pages: route-level screens such as Home, Battle, Party, Shop, and Settings.
- src/store: Zustand store for shared game state.
- src/types: TypeScript interfaces for the game domain.
- src/utils: pure logic helpers and tests. This is the best place for combat, progression, and party logic.
- src/data: sample Digimon, items, areas, and evolution information.
- src/styles: shared CSS module styling for page layouts.

## Key files
- src/App.tsx: router setup and top-level navigation.
- src/store/gameStore.ts: main game state, actions, and progression updates.
- src/types/game.ts: central type definitions for Digimon, items, progression, and player state.
- src/pages/HomePage.tsx: starter selection, currency collection, and basic party display.
- src/utils/combat.ts: battle resolution helpers.
- src/utils/digimonProgression.ts: level and evolution progression helpers.
- src/utils/digimonParty.ts: party-related selection and formatting logic.

## Implementation pattern
When adding a feature:
- If it changes UI, update the relevant page or component.
- If it changes shared game state, update the Zustand store.
- If it changes rules or calculations, add or update a utility in src/utils.
- If it affects data shape, check src/types/game.ts and the relevant data files.

## Good default behavior
- Keep code readable and explicit.
- Reuse existing helpers instead of duplicating logic.
- Add tests in src/utils for new gameplay rules.
- Avoid over-engineering the architecture.
