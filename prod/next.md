You are operating on the entire repo. Apply the following three sweeps as incremental commits with clear messages. Maintain a buildable app. If something looks risky, propose an alternative in the diff, but keep going on the rest.

Context

Frontend lives under front-end/ (React + TS). Many demo/example components, duplicate backups, and parallel layouts remain. The tree shows large demo/marketing assets and example “code” folders that shouldn’t ship. We recently normalized @ path aliases and fixed imports. (See front-end/src and public/images/...).

Aim: keep “product” code, move demos/examples to a dev-only area, remove backups, and put unused marketing/demo assets in a quarantine folder so we don’t break routing or builds.

Sweep 1 – Move example/demo code to dev-only

Create (if missing): front-end/src/dev/examples/.

Move these patterns into front-end/src/dev/examples/ preserving relative subpaths:

front-end/src/components/**/code/**

front-end/src/components/muicharts/**

front-end/src/components/material-ui/**/code/**

front-end/src/components/forms/**/**/code/**

front-end/src/components/tables/code/**

front-end/src/components/widgets/**/code/**

front-end/src/demos/**

Any remaining “example-only” component folders under front-end/src/components/** whose only public usage is within other example/demo pages.

After moving, rewrite imports in any files that reference these modules so they import from @/dev/examples/....

If a runtime route imports a moved file, create a thin, stable wrapper that re-exports the production version (not the demo) — or replace the usage with the production component if it exists.

Do not touch anything under front-end/src/views/** that is clearly product UI, unless it imports a moved demo (then fix the import).

Sweep 2 – Remove backups and dedupe

Delete backup/noisy variants if there is a canonical file with the same base name in the same directory tree:

Glob deletes: **/*.backup, **/*.broken.*, **/*.corrupted.*, **/*_backup.*, **/*-backup.*, **/*.back.*

Specific obvious dupes (keep the plain name unless comments clearly say otherwise):

front-end/src/api/orthodox-metrics.api.ts.backup

front-end/src/context/InvoiceContext/index.tsx.backup

front-end/src/views/admin/SessionManagement.tsx.backup

Under front-end/src/views/admin/ like UserManagement* variants: keep the most complete typed version (UserManagement.tsx or UserManagement_Fixed.tsx if clearly the canonical one) and remove other suffix variants.

Where two files differ (e.g., UserManagement.tsx vs UserManagement_Fixed.tsx), prefer the one referenced by routes or used by more imports; merge improvements from the other if trivial (type fixes, small bugfix), then delete the duplicate.

front-end/src/layouts/full: keep vertical layout as canonical unless an explicit “horizontal” route is still used. If no route toggles activeLayout='horizontal', remove the horizontal/ folder and fix any imports (e.g., navbar pulling SidebarItems from vertical). If you detect active usage, leave it and report in the PR.

Sidebar menus: prefer front-end/src/layouts/full/vertical/sidebar/MenuItems.ts as canonical; remove SSPPOCMenuItems.ts if unused. If both are used, unify into one file and update imports.

Sweep 3 – Quarantine large non-product assets

Create front-end/public/_archive/ and move these folders if they are not referenced by product routes:

front-end/public/images/landingpage/**

front-end/public/images/frontend-pages/**

front-end/public/images/demos/**

Before moving, search for usages. If any file is referenced by a runtime route, leave it in place. Otherwise move it and rewrite imports in any remaining demo/example files now under src/dev/examples/**.

If in doubt, prefer move over delete and leave a README.md in _archive/ explaining it’s not included in product UI.

General editing rules

Keep imports on @/... aliases.

After each sweep, run TypeScript checks and ESLint; fix import paths that break due to moves. If a module is unused after moves, remove it.

If a route still references an archived/moved asset, replace it with a product component or stub with a TODO and leave a comment referencing this cleanup.

Commit after each sweep with messages:

“chore(refactor): move demos/examples to src/dev/examples (imports updated)”

“chore(cleanup): remove backups and duplicate variants; unify layout/menu usage”

“chore(assets): quarantine non-product images to public/_archive (unreferenced only)”

Deliverables

3 commits with the changes above.

A short PR description listing:

Count of files moved/deleted/edited.

Any horizontal layout dependencies you found.

Any components you could not confidently dedupe.

Ensure front-end still builds. If something blocks, push the partial sweep and note blockers.

Use good judgment — if a path differs slightly, apply the intent, not just the literal glob.