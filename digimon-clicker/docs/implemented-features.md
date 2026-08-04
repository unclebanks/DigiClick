# Implemented features reference

This document captures the game systems that are already implemented in the current codebase. It is meant to serve as a high-level reference for a local coding model, so it does not need to infer behavior from the source every time.

## 1. App shell and navigation
Implemented in:
- src/App.tsx

Current behavior:
- The app uses React Router with a top-level navigation bar.
- Main routes include Home, Battle, DigiDex, Party, Shop, and Settings.
- The shell is intentionally lightweight so each page can focus on its own feature area.

Important details:
- Navigation is driven by a simple array of route definitions.
- The route structure is centralized in the root app component.

## 2. Starter selection flow
Implemented in:
- src/components/party/StarterSelection.tsx
- src/pages/HomePage.tsx
- src/store/gameStore.ts

Current behavior:
- If the player has no party Digimon, the home screen shows a starter selection UI.
- The starter choices are sourced from the Fresh-stage Digimon entries.
- Selecting a starter adds that Digimon to the party.

Important details:
- The starter selection is a one-time onboarding-style experience.
- It is currently simple and does not enforce additional progression conditions.

## 3. Currency and player progression
Implemented in:
- src/store/gameStore.ts
- src/pages/HomePage.tsx
- src/utils/game.ts

Current behavior:
- The player starts with 120 Bits.
- The home page has a button that grants 10 Bits and 20 EXP to the first party member.
- The player level is derived from currency using the formula:
  - current level = max(1, floor(currency / 100) + 1)
- The player level is stored in the Zustand game store.

Important details:
- Currency and level are simple, immediately visible systems.
- The current implementation is not tied to a save system or offline progression.

## 4. Party management and digital space
Implemented in:
- src/pages/PartyPage.tsx
- src/store/gameStore.ts

Current behavior:
- The player can have up to 6 Digimon in the active party.
- Digimon can be moved between the party and the Digital Space.
- The Digital Space starts with 30 environments, and each environment can hold up to 30 Digimon IDs.

Important details:
- The system is array-based and uses the Zustand store as the source of truth.
- There is no persistence yet, so the state resets on reload.
- The current logic is simple and does not include full party AI, battle formations, or detailed sorting.

## 5. Battle system
Implemented in:
- src/pages/BattlePage.tsx
- src/utils/combat.ts
- src/utils/battleRoutes.ts
- src/data/areas.ts

Current behavior:
- The battle page lets the player choose from several battle routes.
- Each route has a required player level and a required party size.
- The enemy HP starts at 24 and is reduced by the player’s attack power.
- Defeating the enemy awards Bits and resets the enemy HP.
- The battle UI shows the selected route, encounter, enemy HP, and a battle log.

Important details:
- Attack power is currently calculated as 4 + playerLevel.
- The battle system is highly simplified and does not yet include:
  - enemy actions
  - Digimon-specific combat stats
  - turn order
  - party-based battle commands
- Route unlocks are based on player level only; party size is not enforced by the current logic beyond route metadata.

## 6. Digimon progression and experience
Implemented in:
- src/utils/digimonProgression.ts
- src/store/gameStore.ts
- src/pages/HomePage.tsx

Current behavior:
- Each Digimon has its own progression state in the store.
- Gaining EXP increases the Digimon level and adjusts expToNextLevel.
- The current leveling formula is:
  - each level increases the required EXP threshold by 20%
- The home page gives EXP to the first party Digimon when the player collects currency.

Important details:
- Progression is stored per Digimon ID in the game state.
- This is a lightweight progression system rather than a full evolution tree engine.

## 7. Evolution UI and digivolution state
Implemented in:
- src/pages/HomePage.tsx
- src/store/gameStore.ts
- src/components/digimon/DigimonCard.tsx

Current behavior:
- Digimon cards show a Digivolve and De-Digivolve button.
- The current form is tracked in the Zustand store using a digivolutionStates map.
- The existing implementation supports a simple Agumon -> Greymon toggle in the home page handler.

Important details:
- Evolution is currently a UI-state placeholder rather than a fully data-driven evolution engine.
- The requirements shown on Digimon cards are still placeholder text.
- There is no real condition-checking for evolution costs or requirements yet.

## 8. Sample Digimon data and content foundation
Implemented in:
- src/data/digimon.ts
- src/data/areas.ts
- src/data/items.ts
- src/data/evolutions.ts

Current behavior:
- The project includes a sample set of Digimon entries ranging from Fresh to Mega stages.
- Battle routes are defined with regions, descriptions, required levels, and encounter IDs.
- Item and evolution data files exist as content scaffolding.

Important details:
- The data is intentionally sample-based and designed to be expanded later.
- Most of the gameplay systems currently rely on this content as placeholders rather than a fully authored game database.

## 9. Reusable UI components
Implemented in:
- src/components/common/Button.tsx
- src/components/common/Card.tsx
- src/components/common/ProgressBar.tsx
- src/components/digimon/DigimonCard.tsx
- src/components/party/StarterSelection.tsx

Current behavior:
- The UI uses shared components for buttons, cards, progress indicators, and Digimon cards.
- Styling is handled through CSS Modules.

Important details:
- Components are simple and composable.
- The current UI is more of a foundation layer than a polished game interface.

## 10. Current limitations to keep in mind
The project is a foundation, not a complete game. The main gaps are:
- no save/load system
- no real combat AI or enemy actions
- no shop implementation
- no DigiDex progression tracking
- no settings persistence
- no full evolution rules engine
- no persistent party state across reloads

## 11. Best mental model for future work
When adding a new feature, think in terms of three layers:
1. UI layer: page or component changes
2. State layer: Zustand store actions and state shape changes
3. Logic layer: utility functions and data helpers

The current codebase is intentionally structured so new systems can be introduced incrementally without a large rewrite.
