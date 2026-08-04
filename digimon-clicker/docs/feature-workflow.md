# Feature implementation workflow

Use this workflow for new features or bug fixes.

## 1. Understand the request
Clarify the intended user-facing result before coding.
- What should the player be able to do?
- What state should change?
- Is this a UI change, a logic change, or both?

## 2. Inspect the closest existing pattern
Look for similar implementations in:
- the relevant page in src/pages
- the store in src/store/gameStore.ts
- the utility module in src/utils
- the data definitions in src/data or src/types/game.ts

## 3. Implement the smallest relevant change
Prefer a narrow change that fits the current architecture.
- Add or update one page/component if it is UI-only.
- Add or update one store action if it changes shared state.
- Add or update one utility if it changes game rules.

## 4. Verify the change
Run:
- npm test
- npm run build
- npm run lint

If the feature adds gameplay logic, add a focused test in src/utils before finishing.

## 5. Keep the change junior-dev friendly
- Avoid huge refactors.
- Avoid new dependencies.
- Keep naming clear and consistent.
- Leave the code easier to read than before.
