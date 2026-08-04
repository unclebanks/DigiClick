# DigiClick agent instructions

This repository is a small React + TypeScript + Vite Digimon-inspired clicker game. Keep changes focused, readable, and consistent with the existing structure.

## Project summary
- Frontend stack: React 19, TypeScript, Vite, Zustand, React Router, CSS Modules, Vitest.
- Main goal: provide a simple foundation for future game systems such as battles, party management, evolution, and progression.
- Prefer small, incremental changes over large rewrites.

## Architecture notes
- UI lives in src/pages and src/components.
- Shared game state is managed in src/store/gameStore.ts.
- Domain types are defined in src/types/game.ts.
- Game logic helpers and tests live in src/utils.
- Static content and sample data live in src/data.

## Coding conventions
- Use functional React components and TypeScript types.
- Keep components simple and compose them from smaller building blocks.
- Use CSS Modules for styling instead of global CSS unless the change is truly global.
- Prefer existing helpers and data shapes over introducing new abstractions.
- When adding a feature, update the relevant page/component, store slice, and utility logic together.
- Preserve existing naming patterns and file organization.

## Working style for local AI
- Start by reading the relevant page, store, and utility files before editing.
- Make the smallest change that satisfies the request.
- Avoid introducing new dependencies unless the user explicitly asks.
- Keep prompts and implementation steps concise; this project is meant to stay approachable for a junior developer workflow.
- If the request is ambiguous, ask one clarifying question instead of guessing.

## Verification checklist
Before finishing any task, run:
- npm test
- npm run build
- npm run lint

If a change is primarily logic-related, add or update tests in src/utils before considering the task complete.

## Recommended workflow
1. Understand the requested feature.
2. Find the closest existing implementation or pattern.
3. Implement the change in the smallest possible scope.
4. Verify with tests and build checks.
5. Summarize the change and any follow-up ideas.
