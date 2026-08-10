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
- Currency/level are part of `PlayerState` and covered by the explicit save/load system (see section 12); there is no offline-progression system.

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
- src/utils/digimonAttributes.ts
- src/utils/digimonStats.ts
- src/utils/scanning.ts
- src/utils/battleRoutes.ts
- src/data/areas.ts

Current behavior:
- Combat is real-time: the active party Digimon and the wild Digimon each attack automatically on their own speed-derived interval (`getAttackIntervalMs`). Each side's attack loop is a separate `useEffect`/`setInterval` pair that fires an immediate attack as soon as it (re)starts, then repeats on the interval - so entering battle, regrouping, or swapping the active Digimon doesn't leave a dead multi-second gap before the next hit, and a change on one side (e.g. a party swap) doesn't reset the other side's clock.
- A wild encounter's level is locked in at the moment it's rolled (`encounterLevelLock`) instead of being recomputed live from the player's current level - previously the same in-progress wild Digimon could retroactively change level/stats mid-fight if the player leveled up from battle rewards.
- The player can also click an "Attack" button for a manual hit that bypasses defense entirely; its damage (`getManualAttackDamage` in src/utils/combat.ts) starts at 1 and grows as the trainer owns more Digimon (party + Digital Space + digivolution history, via `getOwnedDigimonIds`). It takes a reserved `itemBonus` parameter for upgrade items, which are not implemented yet. **Temporarily removed from BattlePage** (was buggy) - the helper/tests still exist in src/utils/combat.ts for a future re-enable, but there is currently no UI to trigger it.
- Each auto-battle attack can miss, land normally, or crit (`resolveAttack` in src/utils/combat.ts), and damage is scaled by the Vaccine/Data/Virus/Free attribute triangle (src/utils/digimonAttributes.ts).
- Combat stats (attack/defense/speed/hp) are derived from level, digivolution penalty, and any scan-recruit stat bonus via `calculateDigimonStats`.
- If the active party Digimon faints, the next living party member is swapped in automatically; if the whole party faints, battling pauses until the player clicks "Regroup". The player can also manually swap to any living party member at any time via the "Your Team" roster at the bottom of the Battle page (each card shows species/level/HP and a Send Out button; the current combatant is marked Active and fainted members are disabled).
- Defeating a wild Digimon fills its per-species DigiDex "scan" meter by an amount based on its level (`getScanGainFromDefeat` in src/utils/scanning.ts) instead of a catch-with-balls mechanic or damage-based gain. At 100% the Digimon can be recruited (from the Battle page's Recruit button or the DigiDex, see section 11); at 200% there's a chance of a bonus-stat recruit. Recruiting is allowed even if the species is already owned - each recruit gets its own instance id, and the scan meter resets to 0 afterward so another copy has to be earned again.
- Defeating an enemy grants Bits and EXP (`resolveVictoryRewards`), rolls item drops, unlocks a `first-victory` badge and a per-route `cleared-<routeId>` badge, and records statistics in the player store.

Important details:
- Route unlocks are still based on player level only; party size is not enforced beyond route metadata.
- Only one wild Digimon (the route's first encounter id) is fought at a time; multi-encounter rotation is not implemented yet.

## 6. Digimon progression and experience
Implemented in:
- src/utils/digimonProgression.ts
- src/utils/digimonStats.ts
- src/store/gameStore.ts
- src/pages/HomePage.tsx
- src/pages/PartyPage.tsx

Current behavior:
- Each Digimon has its own progression state in the store.
- Gaining EXP increases the Digimon level and adjusts expToNextLevel.
- The current leveling formula is:
  - each level increases the required EXP threshold by 20%
- New Digimon (starter pick, scan recruits) start at level 5 (`createInitialDigimonProgression`'s default), rather than level 1, to compensate for the manual attack button being temporarily removed (see section 5). Digivolving still resets a Digimon back to level 1 for its new form (`resetDigimonProgression` explicitly passes level 1).
- EXP is earned exclusively from defeating wild Digimon in battle (`resolveVictoryRewards`/`gainDigimonExperience` in BattlePage), not from any Home page action.
- Permanent per-instance stat bonuses (`digimonBonuses`, keyed by party/Digital Space instance id) come from two sources that stack additively: the scan-recruit bonus tier (section 11) and Augment Chip items (`applyStatAugment` in gameStore.ts) - using a chip consumes one from `inventory` and adds its flat amount to that instance's `attack`/`defense`/`speed`/`hp`/`sp`/`int`/`spi` bonus. PartyPage lets a player apply any owned Augment Chip to a party member.
- `calculateDigimonStats` (digimonStats.ts) now also accepts `spBonus`/`intBonus`/`spiBonus` alongside the original four. Every page that shows a Digimon's stats (DigimonCard/HomePage, PartyPage, BattlePage) computes both an unboosted `baseStats` and the final bonus-inclusive `stats`, and renders each stat via `formatStatWithBonus(base, boosted)` as `Normal (+Boost)` (or just the plain number when there's no bonus).

Important details:
- Progression is stored per Digimon ID in the game state.
- This is a lightweight progression system rather than a full evolution tree engine.

## 7. Evolution system
Implemented in:
- src/utils/evolution.ts
- src/data/evolutions.ts
- src/pages/HomePage.tsx
- src/store/gameStore.ts
- src/components/digimon/DigimonCard.tsx

Current behavior:
- Each Digimon's digivolution state (`DigivolutionState`) tracks its current form id, full history, and a de-digivolve penalty multiplier, stored per party slot in `digivolutionStates`.
- `sampleEvolutions` (src/data/evolutions.ts) defines evolution edges (`from` -> `to`) with a Bits `cost` and a typed `requires` list, using builder helpers (`levelReq`, `itemReq`, `areaReq`, `badgeReq`, `timeReq`, `statReq`, `multiReq`).
- `getEvolutionOptions` looks up every branch available from a Digimon's current form; `canSatisfyEvolutionRequirements` checks them against the player's level, inventory, current area, and badges.
- DigimonCard lists every available evolution branch with its requirement text, disabling the button until requirements and cost are met; De-Digivolve is disabled once a Digimon is back at its original form.

Important details:
- Evolution costs are deducted from currency in `HomePage`'s evolve handler; requirement data lives entirely in src/data/evolutions.ts rather than on the Digimon entries themselves.
- Time-of-day and stat-threshold requirement types exist in the type system and are supported by `canSatisfyEvolutionRequirements`, even though no sample data uses them yet.

## 8. Sample Digimon data and content foundation
Implemented in:
- src/data/digimon.ts
- src/data/areas.ts
- src/data/items.ts
- src/data/consumables.ts
- src/data/evolutions.ts

Current behavior:
- The project includes a sample set of Digimon entries ranging from Fresh to Mega stages, each with a Vaccine/Data/Virus attribute (`DigimonAttribute`).
- Battle routes are defined with regions, descriptions, required levels, and encounter IDs. Each region (`Region 1`, `Region 2`) has exactly 10 routes, sourced from the curated (non-bulk) roster in `src/data/digimon.ts` and progressing by stage (Region 1: Fresh -> In-Training -> Rookie -> Champion/Armor; Region 2: Ultimate -> Mega -> Mega+), with `requiredPlayerLevel`/`requiredPartySize` climbing route-to-route (party size caps at 6, the game's max). Locked routes show their unmet requirements (trainer level / party size) in the battle log when clicked (`getRouteUnlockRequirements` in `src/utils/battleRoutes.ts`), and the route list also shows a lock icon next to any route not yet unlocked.
- Item and evolution data files exist as content scaffolding; evolutions now carry typed requirements instead of free-text templates.
- `Item` (src/types/game.ts) has optional `target` ('single'/'all'), `targetType` ('ally'/'enemy'), and a typed `mechanic` discriminated union (stat_recovery, status_recovery, cure_stat_drop, revive, stat_boost, exp_gain, bond_gain, stat_augment) - these fields are only present on newer data-driven consumables, not the older misc `sampleItems` entries (training-chip, eggs, etc.).
- `src/data/consumables.ts` holds the first full item category (65 items sourced from `examples/ConsumableTable.csv`: HP/SP recovery, status cures, stat-drop cures, revives, timed stat boosts, EXP items, Bond/Friendship items, and permanent Augment Chips), each with a real `mechanic` payload and a proposed placeholder price. Augment Chips are wired (see section 6 - `applyStatAugment`); the rest (recovery/status/boost/EXP/Bond) are still data only - no shop buy UI or use-item flow, no status-ailment/stat-stage/SP/Bond system in combat.

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

## 10. Player statistics and badges
Implemented in:
- src/types/game.ts (`PlayerStatistics`, `createInitialPlayerStatistics`)
- src/store/gameStore.ts
- src/pages/BattlePage.tsx
- src/pages/HomePage.tsx

Current behavior:
- The player store tracks `statistics` (encountered, defeated, criticalHits, misses, totalDamageDealt/Taken, bitsEarned, totalExpEarned) and a `badges` record.
- `recordBattleEncounter`, `recordCombatEvent`, and `recordVictory` update these counters from the battle loop; `unlockBadge` marks a badge id as earned (e.g. `first-victory`, `cleared-<routeId>`).
- Badges can gate evolution requirements via `badgeReq`.
- HomePage's "Adventure Status" card surfaces encountered/defeated counts and badge count.

Important details:
- There is no dedicated statistics/achievements page yet; the numbers are only surfaced inline on the home page.

## 11. DigiDex
Implemented in:
- src/pages/DigiDexPage.tsx
- src/utils/digidex.ts
- src/utils/scanning.ts

Current behavior:
- The DigiDex lists every species in `sampleDigimon` with a status of `unseen`, `scanned`, `ready`, or `owned` (`getDigidexStatus`).
- A species counts as "seen" once it has been encountered in battle (its id gets seeded into `scanProgress`); `unseen` entries are redacted (name/description hidden, generic icon).
- `getOwnedDigimonIds` treats party members, Digital Space residents, and every form in their digivolution history as owned, so evolved/de-evolved forms show up correctly. Party/Digital Space slots hold instance ids (not species ids), since a species can be owned multiple times; the species itself is always resolved through `digivolutionStates`.
- Each non-unseen entry (including already-`owned` ones) shows its scan percentage via a progress bar, and calls out when a species has reached the 200% bonus-stat tier.
- The DigiDex has its own Recruit button that appears whenever scan progress is at/above 100%, regardless of ownership status, calling the same `recruitFromScan` store action used by the Battle page's Recruit button.

Important details:
- Recruiting is not gated on ownership - trainers can stack multiple copies of the same species, each with independent progression/digivolution/stat-bonus state keyed by its own instance id.

## 12. Save / load system
Implemented in:
- src/utils/saveGame.ts
- src/store/gameStore.ts
- src/pages/SettingsPage.tsx

Current behavior:
- Saves are stored in `localStorage` under the key `digiclick-save`, wrapped as `{ version, savedAt, player }`.
- On app load, the store hydrates synchronously from any existing save (`loadGame()`); if none exists, it falls back to `createDefaultPlayerState()` and no save file is written yet.
- The first time a trainer picks a starter (`selectStarter`), the store bootstraps a save file automatically if one doesn't already exist, so a fresh game always has something on disk from that point on.
- The Settings page exposes explicit "Save Game"/"Load Game"/"Delete Save" buttons (`saveToStorage`/`loadFromStorage` store actions, `deleteSaveGame()` util) - saving/loading otherwise never happens automatically.
- `sanitizePlayerState(raw)` validates and repairs every field of a loaded save (wrong types, missing fields, out-of-range numbers, corrupted entries) against `createDefaultPlayerState()`, so an old, edited, or corrupted save can never crash the app - it always returns a fully valid `PlayerState`. `migrateSaveData`/`MIGRATIONS` in the same file is the extension point for future breaking shape changes (bump `SAVE_VERSION` and add a version-keyed migration step); purely additive field changes don't need a migration since sanitize already defaults them.

Important details:
- `saveGame`/`loadGame`/`hasSaveGame`/`deleteSaveGame` never throw - storage access is wrapped in try/catch and JSON parsing failures are treated as "no save", not an error.
- `GameStore.lastSavedAt` is a runtime-only field (not part of the persisted `PlayerState`) used purely for the Settings page's "last saved" display.

## 13. Current limitations to keep in mind
The project is a foundation, not a complete game. The main gaps are:
- no persistent party state across reloads beyond the explicit save/load flow (no auto-save on every action)
- only one wild Digimon per route is fought at a time (no multi-encounter rotation)
- recruiting via the scan meter only supports species not already owned; there's no release/trade flow yet
- `PlayerState.inventory` is a quantity map (`Record<itemId, count>`, `addInventoryItem(itemId, quantity?)` increments it) rather than a plain id list - evolution's `itemReq` checks now do a `> 0` count lookup instead of `Array.includes`. There's still no in-battle status-ailment/stat-stage/SP system and most consumables (recovery/status/timed-boost/EXP/Bond) have no use-item flow yet, so their typed `mechanic` payloads aren't applied anywhere except Augment Chips (see section 6).
- The Shop (section 14) is deliberately unrestricted (every item purchasable, no stock/level/area gates) for testing - this is not the intended final shop UX.

## 14. Shop
Implemented in:
- src/pages/ShopPage.tsx

Current behavior:
- Lists every item from all three data sources (`sampleItems`, `consumableItems`, `evolutionItems`) in separate sections, each showing its `effect` text, Bits price, and owned quantity (if any).
- Buying deducts Bits via `addCurrency(-item.price)` and adds one to `inventory` via `addInventoryItem` - same pattern HomePage's evolve handler uses, so spending Bits here also affects `playerLevel` (level is derived from currency, see section 3).
- Intentionally unrestricted for testing: every item is purchasable regardless of category, with no stock limit, level gate, or area gate - the Buy button only disables when the player can't afford it.

Important details:
- This is a first pass, not the final shop UX - no confirmation dialogs, categories/tabs beyond the three data-source sections, or item detail view.

## 15. Themes
Implemented in:
- src/index.css
- src/App.css / src/App.tsx
- src/pages/SettingsPage.tsx
- src/store/gameStore.ts / src/utils/saveGame.ts / src/types/game.ts (`ThemeName`, `PlayerState.theme`)

Current behavior:
- Three selectable themes: `light` (default), `dark`, and `dark-high-contrast` (a maximum-contrast black/white/yellow variant for accessibility). Chosen via three buttons in Settings > Themes, backed by the `theme` field on `PlayerState` (persisted through save/load like any other player state, sanitized/defaulted by `sanitizePlayerState` if missing or invalid).
- Every color used across the app's CSS (App.css, pages.module.css, and every component's `.module.css`) is a `var(--color-*)`/`var(--shadow-card)` custom property rather than a literal hex value - the actual palettes live in `index.css` under `:root` (light, the fallback), `:root[data-theme='dark']`, and `:root[data-theme='dark-high-contrast']`.
- `App.tsx` mirrors the store's `theme` onto `document.documentElement.dataset.theme` in a `useEffect`, so the whole document (not just `#root`) responds to the active theme.
- Adding a new themed color anywhere in the app means adding a token to all three `:root` blocks in index.css and referencing `var(--token-name)` in the component's CSS - never a literal color.

## 16. Desktop/mobile platform foundation
Implemented in:
- src/utils/platform.ts

Current behavior:
- This is foundation only - mobile support itself is not implemented yet, this just gives future work a single shared way to know which target it's rendering for.
- `getPlatformTarget(width)` classifies a viewport width as `'desktop'` or `'mobile'` against `MOBILE_BREAKPOINT_PX` (768px); `usePlatformTarget()` is the React hook wrapper (tracks window resize, defaults to `'desktop'` outside a browser environment).
- `App.tsx` uses the hook to (a) put `data-platform="desktop"|"mobile"` on the `.app-shell` root element for future CSS targeting, and (b) show a non-blocking `.desktop-notice` banner ("DigiClick is currently optimized for desktop browsers...") when the viewport is classified as mobile. Nothing is actually hidden or disabled for mobile yet.
- App.css also has an unused-so-far `.desktop-only` utility class (`display: none` under `max-width: 767px`) ready for the first feature that needs to be explicitly desktop-only ahead of real mobile support landing.

## 17. Best mental model for future work
When adding a new feature, think in terms of three layers:
1. UI layer: page or component changes
2. State layer: Zustand store actions and state shape changes
3. Logic layer: utility functions and data helpers

The current codebase is intentionally structured so new systems can be introduced incrementally without a large rewrite.

