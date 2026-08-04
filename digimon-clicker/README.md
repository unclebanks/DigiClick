# DigiClick

A simple React + TypeScript + Vite starter for a Digimon-inspired clicker RPG. The project favors readability and maintainability so it can serve as a frontend refresher while growing into a larger game.

## Included foundation

- React, TypeScript, and Vite
- Zustand for global game state
- React Router for page navigation
- CSS Modules for component styling
- ESLint and Prettier setup
- Vitest example test
- Sample Digimon, item, and area data

## Folder guide

- src/assets: static assets such as images, audio, and fonts
- src/components: reusable UI and game components
- src/data: sample data for Digimon, items, and areas
- src/hooks: custom hooks for future logic
- src/pages: route-level screens
- src/services: future API or persistence helpers
- src/store: Zustand state management
- src/styles: shared layout and page style modules
- src/types: TypeScript models for domain data
- src/utils: helper functions and tests

## Run locally

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run build
npm run lint
npm run test
```
