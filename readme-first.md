# OPUS – Refactor Charter (OrthodoxMetrics)

This note gives Opus **context + guardrails** for reorganizing `front-end/` and `server/` in-place while keeping the app compiling.

---

## Objectives
- Reorganize **front-end** and **server** into clearer buckets (components/pages/hooks/utils, routes/controllers/services, etc.).
- Centralize logging usage (no direct writes to legacy log tables; use the unified logging client if present).
- Preserve Git history for moved files and keep TypeScript compiling.

## Inputs Opus Should Use (as guidance, not a script)
- `moves_map.json` – 229 suggested file moves (source → destination).
- `server_frontend_migration.json` – curated list of core app files and proposed targets.
- `files_to_remove.json` – safe deletions (only remove if not referenced).
- `files_to_review.json` – candidates to quarantine or leave for later.
- `import_update_strategy.md` – strategy for fixing imports after moves.

> Opus may adjust these maps to reduce churn or fix imports.

## Hard Guardrails
- **In-place refactor only**: keep top-level dirs as-is; **do not** create `orthodoxmetrics_clean/**`.
- **Do not rename** `front-end/` → `frontend/`.
- **Exclude** OMAI bulk and archives from this pass (e.g., `misc/`, `misc/server-archive/`).  
  - If needed, quarantine to `front-end/src/dev/omai/**` or `server/_archive/**`, but don’t wire into builds.
- Use `git mv` (or equivalent) so history is preserved.
- No runtime behavior changes beyond import paths and file locations.

## Degrees of Freedom (Opus can choose)
- Trim/merge move entries when a simpler layout keeps TS compiling.
- Resolve `index.ts` / `index.tsx` collisions by renaming component files (e.g., `Component.tsx`).
- Convert deep relative imports to the alias `@/…`.  
  - If missing, add to **both** `front-end/tsconfig.json` and `server/tsconfig.json`:
    ```json
    { "compilerOptions": { "baseUrl": "src", "paths": { "@/*": ["*"] } } }
    ```

## Acceptance Checks (must pass)
- `pnpm -C front-end tsc --noEmit` ✅
- `pnpm -C server tsc --noEmit` ✅
- No references to backup/demo menu files (e.g., `SSPPOCMenuItems`, `MenuItems.ts.backup`).
- No references to `omai_logging_db` / `omai_error_tracking_db` in code (logging unified).
- App boots locally (same commands as current workflow).

## Deliverables
- One PR that:
  - Applies the reorg (guided by `moves_map.json` / `server_frontend_migration.json`).
  - Fixes imports (favor `@/…`).
  - Includes a short summary (files moved, removed, notable merges/renames).

## Suggested Working Branch
- `refactor/opus-pass`

## Notes
- If a move conflicts because destination exists, Opus may rename to avoid collisions and update imports accordingly.
- Leave OMAI analysis (≈6k files) to a **separate** pass once the core app compiles cleanly.
