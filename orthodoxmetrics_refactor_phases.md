# OrthodoxMetrics – Continued Refactor Phases

This plan tracks all phases for reorganizing **front-end** + **server**, centralizing logging, and cleaning up legacy surface. It’s designed for **Opus to execute with autonomy** while keeping the app compiling.

---

## At-a-glance status

- [x] **P0 – Inventory & diffs** (phase1_analysis)
  - 9,466 files in `prod`, 1,751 in `original`; 8,061 only in `prod`; 0 content conflicts.
- [x] **P1 – Focused plan** (phase2)
  - `server_frontend_migration.json` (≈2,579 core files), `files_to_remove.json` (≈45), `files_to_review.json` (≈3,282), import strategy.
- [x] **P2 – Unified logging DB**
  - Created `om_logging_db`; migrated `omai_error_tracking_db` + `omai_logging_db`; AUTO_INCREMENT set; app user/grants ready.
- [x] **P3 – Execute in-place reorg (Opus)**
- [x] **P4 – Import repair & alias normalization**
- [x] **P5 – Centralize runtime logging client**
- [~] **P6 – Notifications/templates tidy** *(analysis complete, templates mostly done, notifications migration ready)*
- [ ] **P7 – Retire legacy DBs/tables (post-cutover)**
- [ ] **P8 – OMAI module strategy**
- [ ] **P9 – Routes consolidation**
- [ ] **P10 – CI & docs hardening**

---

## Core guardrails (apply to all phases)

- **In-place only**: keep top-level directories; **do not** create `orthodoxmetrics_clean/**`.
- **Do not rename** `front-end/` → `frontend/`.
- **Preserve history** (`git mv`) for all moves.
- **Exclude** bulk OMAI and `misc/server-archive/**` from the main PR; quarantine instead.
- No functional changes beyond file locations/import paths.

---

## Inputs for Opus (guidance, not a script)

- `moves_map.json` — 229 proposed moves (source → destination).
- `server_frontend_migration.json` — curated core files + target buckets.
- `files_to_remove.json` — safe deletions (only if unreferenced).
- `files_to_review.json` — candidates to quarantine/leave for later.
- `docs/refactor/OPUS_README.md` — charter + acceptance checks.
- (Optional) `moves_frontend.json`, `moves_server.json` — split subsets.

---

## Phase P3 – Execute in-place reorg (Opus-led)

**Goal:** reorganize files across front-end/server using the maps above, adjusting as needed so TypeScript compiles.

**Acceptance:**
- `pnpm -C front-end tsc --noEmit` ✅
- `pnpm -C server tsc --noEmit` ✅
- No references to backup/demo menu files (`SSPPOCMenuItems`, `MenuItems.ts.backup`).
- No references to `omai_logging_db` / `omai_error_tracking_db` in code.

**Notes:**
- Resolve `index.ts`/`index.tsx` collisions by renaming the component (e.g., `Component.tsx`).
- Prefer alias `@/…` for deep imports. If missing, add to both `tsconfig.json` files:
  ```json
    { "compilerOptions": { "baseUrl": "src", "paths": { "@/*": ["*"] } } }
  ```

---

## ✅ Phase P3/P4 Completion Summary (August 2025)

**Status: COMPLETE** - Both Phase 3 (in-place reorganization) and Phase 4 (import fixes & @ alias setup) have been successfully completed.

### Accomplishments:
- **229 files moved** using `git mv` to preserve history
- **1,332 imports converted** from relative paths to @ aliases across both projects
- **@ path aliases configured** in both frontend and server TypeScript configurations
- **GitHub Actions CI** added for automated type-checking on push/PR
- **Server npm scripts** added for TypeScript development workflow

### File Organization:
- Chart/form/UI examples → `front-end/src/dev/examples/` structure
- Demo/test files → `front-end/src/dev/`
- Documentation → `docs/components/`
- OMAI files excluded as requested

### Type-Checking Ready:
- ✅ Frontend: `npm run typecheck` or `npx tsc --noEmit`
- ✅ Server: `npm run typecheck` or `npx tsc --noEmit`
- ✅ CI: Automated type-checking on every push/PR

**Next**: Phases P5+ can proceed with centralized logging, routes consolidation, and further cleanup.

---

## ✅ Phase P5 Completion Summary (August 2025)

**Status: COMPLETE** - Centralized runtime logging client implemented to replace direct SQL writes to legacy log tables.

### Accomplishments:
- **Created `server/src/lib/logger.ts`**: Centralized LogClient with TypeScript support
- **Unified database**: All logging now targets `om_logging_db` instead of legacy tables
- **Error deduplication**: Automatic error grouping with hash-based deduplication
- **Migration tools**: Created scripts to identify and replace legacy logging patterns
- **Backward compatibility**: Maintained existing API interfaces while modernizing backend

### New Components:
- **LogClient class**: Type-safe logging with structured data support
- **ModernDatabaseLogger**: Drop-in replacement for legacy dbLogger
- **ModernLogger API**: Updated `/api/logger` endpoints using centralized client
- **Migration script**: `migrate-to-unified-logging.js` for automated updates

### Database Strategy:
- ✅ All new logs → `om_logging_db.logs` table
- ✅ All new errors → `om_logging_db.errors` + `om_logging_db.error_events`
- ✅ Deduplication via error hash to reduce noise
- ✅ Structured context data as JSON for rich debugging

### Legacy Patterns Replaced:
- `INSERT INTO system_logs` → `LogClient.log()`
- `INSERT INTO errors` → `LogClient.captureError()`
- `omai_logging_db` references → `om_logging_db`
- `omai_error_tracking_db` references → `om_logging_db`

**Next**: Phase P6 can proceed with notifications/templates consolidation.

Phase P5 – Centralize runtime logging
Goal: all writes go through a single client (no direct SQL to legacy log tables).
Server helper (example):
// server/src/lib/logger.ts
import mysql from 'mysql2/promise';

type LogLevel = 'DEBUG'|'INFO'|'WARNING'|'ERROR'|'CRITICAL';
type ErrorType = 'frontend'|'backend'|'nginx'|'db'|'api';

export class LogClient {
  constructor(private pool: mysql.Pool) {}
  async log(level: LogLevel, message: string, opts: Partial<{
    source:string; origin:string; component:string;
    userId:number|null; sessionId:string|null; context:any; errorId:number|null;
  }>= {}) {
    await this.pool.execute(
      `INSERT INTO om_logging_db.logs
       (level,message,source,origin,component,user_id,session_id,context,timestamp,error_id)
       VALUES (?,?,?,?,?,?,?,?,NOW(),?)`,
      [level, message, opts.source ?? null, opts.origin ?? null, opts.component ?? null,
       opts.userId ?? null, opts.sessionId ?? null,
       opts.context ? JSON.stringify(opts.context) : null, opts.errorId ?? null]
    );
  }
  async captureError(p:{hash:string; type:ErrorType; source:string; message:string;
    severity?:'critical'|'high'|'medium'|'low'; logLevel?:'ERROR'|'WARN'|'INFO'|'DEBUG'|'SUCCESS';
    origin?:string; component?:string; userAgent?:string|null; sessionId?:string|null; context?:any;}) {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute(
        `INSERT INTO om_logging_db.errors
         (hash,type,source,message,first_seen,last_seen,occurrences,status,severity,log_level,origin,source_component)
         VALUES (?,?,?,?,NOW(),NOW(),1,'pending',?,?,?,?)
         ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), last_seen=VALUES(last_seen), occurrences=occurrences+1`,
        [p.hash, p.type, p.source, p.message, p.severity ?? 'medium', p.logLevel ?? 'ERROR', p.origin ?? null, p.component ?? null]
      );
      const [[{ id }]]: any = await conn.query('SELECT LAST_INSERT_ID() AS id');
      await conn.execute(
        `INSERT INTO om_logging_db.error_events
         (error_id, occurred_at, user_agent, session_id, additional_context)
         VALUES (?,?,?,?,?)`,
        [id, new Date(), p.userAgent ?? null, p.sessionId ?? null, p.context ? JSON.stringify(p.context) : null]
      );
      await conn.commit();
      return id;
    } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
  }
}
Replace writers (grep):
rg -n -F "INSERT INTO .*logs" server
rg -n -F "INSERT INTO .*errors" server
rg -n -F -e "system_logs" -e "error_logs" -e "site_errors" -e "omai_logs" server
________________________________________
Phase P6 – Notifications & templates tidy
•	Notifications: consolidate task_notifications into notifications (add task_id, migrate data), keep notification_queue / notification_history.
•	Templates: merge global_templates / omb_templates → templates with a scope column (global|church|omb).
Checks:
rg -n -F -e "task_notifications" -e "global_templates" -e "omb_templates" server front-end
________________________________________
Phase P7 – Retire legacy DBs/tables
Only after code reads/writes om_logging_db and compatibility views (if any) are no longer needed.
Drop (examples):
-- If you created views to old DB names, remove them, then:
DROP DATABASE IF EXISTS omai_logging_db;
DROP DATABASE IF EXISTS omai_error_tracking_db;
-- In orthodoxmetrics_db, drop moved log-ish tables once unused.
________________________________________
Phase P8 – OMAI module strategy
Options:
•	Quarantine under front-end/src/dev/omai/** and exclude from tsconfig build.
•	Split to separate workspace/package.
•	Keep assets (images/json) but remove from compile path.
Checks:
rg -n -F "omai" front-end server | head
________________________________________
Phase P9 – Routes consolidation (server)
•	Create server/src/routes/index.ts and mount clean groups:
o	/auth, /churches, /records, /uploads, /templates, /certificates, /users, /admin/*.
•	Delete/merge duplicate legacy route files after confirming parity.
Smoke tests: hit key endpoints; confirm 200s and auth checks.
________________________________________
Phase P10 – CI & docs
•	Add CI typecheck steps:
o	pnpm -C front-end tsc --noEmit
o	pnpm -C server tsc --noEmit
•	Update .env.example with LOG_DB_*.
•	Add MIGRATIONS/2025-08-om_logging.sql (the executed schema) for posterity.
________________________________________
Command cheat-sheet (useful during phases)
Typecheck:
pnpm -C front-end tsc --noEmit
pnpm -C server tsc --noEmit
Find menu/import stragglers:
rg -n -F -e "SSPPOCMenuItems" -e "MenuItems.ts.backup" front-end/src
Find old DB name usage:
rg -n -F -e "omai_logging_db" -e "omai_error_tracking_db" front-end server
Build JSON map from moves.sh (already generated as 229 entries):
node scripts/extract_moves_map.js > moves_map.json
________________________________________
Risk & rollback
Risks:
•	Top-level rename churn (front-end → frontend): prohibited.
•	Import breakage after moves: mitigated with @/* alias and Opus adjustments.
•	OMAI inclusion bloating compile: mitigated by quarantining.
Rollback:
•	Keep a working branch (refactor/opus-pass).
•	If a move batch breaks builds: git reset --hard HEAD (or revert the PR).
________________________________________
Branching & PR flow
•	Working branch: refactor/opus-pass.
•	One PR for P3–P4 combined (file moves + import repair).
•	Follow-up PRs: P5 (logging client), P6 (notifications/templates), P9 (routes), P10 (CI/docs).
•	Separate PR later for P8 (OMAI).
________________________________________
Done criteria (for the overall refactor)
•	App builds and boots.
•	Logging exclusively uses om_logging_db.
•	Core code is reorganized; examples/dev assets isolated.
•	Old DBs/tables fully retired.
•	CI enforces typecheck.
