# AI Coding Agent Instructions for bytebank-mobile

## Purpose
This document helps AI coding agents understand the repository structure and conventions for the React Native Expo app.

## Key facts
- Project type: React Native + Expo + TypeScript.
- Main entry: `App.tsx`.
- Navigation bootstrap: `src/navigation/Routes.tsx`.
- Global state providers live in `src/context`.
- Screen components live in `src/screens`.
- Shared UI components live in `src/components/ui`.
- Firebase setup lives in `src/services/firebase.ts`.
- Theme definitions live in `src/theme/index.ts`.
- There are no custom TypeScript path aliases in `tsconfig.json`; the project extends `expo/tsconfig.base`.

## Import conventions
- Use relative imports everywhere.
- `App.tsx` imports from `./src/...` because it is at repo root.
- Files under `src/` typically import with `../` or `../../` based on the folder depth.
- There are no workspace or tsconfig path aliases to rely on.

## File moves and import updates
When moving a file, always update imports in:
- the moved file itself (its own relative imports)
- any files that reference the moved file

Common examples:
- If a screen is moved from `src/screens/` to `src/components/ui/`, update imports in `src/navigation/Routes.tsx` and any other module that imports that screen.
- If a context provider moves between `src/context/` subfolders, update all imports in screens and components that use it.

## Recommended workflow for refactors
1. Move the file to the new location.
2. Fix relative imports inside the moved file.
3. Search the repo for the moved file name and update import paths in all referencing files.
4. Run `npx expo start` or use the TypeScript language server to verify there are no unresolved imports.

## Important files to inspect for refactors
- `App.tsx` — root providers and main navigation container
- `src/navigation/Routes.tsx` — app routes and screen imports
- `src/context/*` — shared state providers and hooks
- `src/screens/*` — app views and page-level screens
- `src/components/ui/*` — reusable UI components

## Run commands
- `npm install`
- `npm run start` or `npx expo start`
- `npm run android` / `npm run ios` / `npm run web`

## Notes for AI agents
- Keep changes minimal and consistent with existing folder layout.
- Preserve the current React Navigation screen names and context provider patterns.
- Avoid introducing path aliases unless the repo is explicitly reconfigured.
