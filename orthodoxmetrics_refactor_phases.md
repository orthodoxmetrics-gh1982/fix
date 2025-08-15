# OrthodoxMetrics Refactor Plan

This document outlines a structured, phased approach to cleanly refactor the OrthodoxMetrics codebase from the current production structure into a simplified, deduplicated, and modern layout.

---

## Phase 1: Analyze and Map Directory Structures

**Goal**: Generate a migration plan comparing `prod/` vs `original/`

**Steps**:
- Compare `prod/` vs `original/` directory trees
- Identify:
  - Missing files in either
  - Files with same name but different content
  - Files with same content in different locations
- Output:
  - `phase1_analysis/report.md`
  - `phase1_analysis/duplicate_map.json`
  - `phase1_analysis/file_migration_plan.json`

**Cursor Prompt**:
```
Compare the directory trees between prod and original.
Output:
- files only in prod
- files only in original
- files with same name but different hash
- files with same hash but different paths
Save results in `phase1_analysis/`
```

---

## Phase 2: File Deduplication and Cleanup

**Goal**: Remove exact or near-duplicate files and obsolete paths.

**Steps**:
- Use results from Phase 1
- Retain canonical file in proper new directory structure
- Delete old shell scripts, broken tests, and placeholder files
- Identify `.review.md` notes for ambiguous files

**Cursor Prompt**:
```
Deduplicate files from phase1_analysis.
- Move canonical versions to clean server/src or front-end/src
- Remove unused copies
- Flag unclear choices as `.review.md` files
```

---

## Phase 3: Update Imports and References

**Goal**: Rewrite all references to reflect new canonical locations

**Steps**:
- Update `require()` and `import` paths
- Fix path breakages from file movement
- Apply to all JS/TS files in affected zones

**Cursor Prompt**:
```
Rewrite all file imports and requires to use the new canonical structure.
Ensure no broken paths or missing modules exist.
```

---

## Phase 4: Database Refactor

**Goal**: Remove legacy database references and standardize DB logic.

**Steps**:
- Identify all files connecting to `om_*` or `orthodoxmetrics_church_*`
- Replace dynamic connection logic with:
  - `orthodoxmetrics_db`
  - `orthodoxmetrics_ocr_db`
  - `omai_logging_db`
  - `omai_error_tracking_db`
  - `omai_db`
- Migrate or remove any hydration logic specific to old tenant databases

**Cursor Prompt**:
```
Find all SQL queries or database connections that refer to tenant-specific databases.
Replace them with static connections to the approved DB list.
Rewrite queries to use centralized logic.
```

---

## Phase 5: Consolidate Clean Structure

**Goal**: Create a final clean layout and archive obsolete files.

**Steps**:
- Move all cleaned files into `/orthodoxmetrics_clean/`
- Generate `manifest.json` summarizing file decisions
- Move deprecated and duplicate files to `/orthodoxmetrics_archive/`

**Cursor Prompt**:
```
Move cleaned files to /orthodoxmetrics_clean
Archive deprecated files to /orthodoxmetrics_archive
Create manifest.json and summary.md
```

---

## Phase 6: Final Lint, Build & Smoke Test

**Goal**: Ensure the cleaned repo builds and runs.

**Steps**:
- Run `pnpm build` on front-end
- Run linting tools on both front-end/server
- Test DB routes and logging output

**Cursor Prompt**:
```
Perform final checks:
- Lint entire repo
- Run front-end build
- Confirm all API routes respond
Output issues if found
```

---