# Phase 2 Organization Plan

## New Structure Summary
- **orthodoxmetrics_clean/server**: 569 files
- **orthodoxmetrics_clean/frontend**: 1646 files
- **orthodoxmetrics_clean/database**: 57 files
- **orthodoxmetrics_clean/docs**: 387 files
- **orthodoxmetrics_clean/config**: 15 files
- **orthodoxmetrics_clean/public**: 4 files
- **orthodoxmetrics_clean/scripts**: 2 files
- **orthodoxmetrics_clean/misc**: 6741 files

## Total Files to Migrate: 9421

## Sample Files per Directory

### orthodoxmetrics_clean/server (569 files)
- front-end/src/routes/Router.tsx
- misc/omai/services/integration/analytics-controller.ts
- misc/omai/services/integration/autonomy-controller.ts
- misc/omai/services/integration/nlp-controller.ts
- server/CLEANUP_COMPLETE_SUMMARY.md
... and 564 more

### orthodoxmetrics_clean/frontend (1646 files)
- front-end/.gitignore
- front-end/DEV-SETUP.md
- front-end/MOBILE_AUDIT_LOG.md
- front-end/README.md
- front-end/TASK_144_COMPLETION_SUMMARY.md
... and 1641 more

### orthodoxmetrics_clean/database (57 files)
- db/sql/03_auth_tables.sql
- misc/omai/database/database/create_dev_database.sql
- misc/omai/database/database/migrations/comprehensive_json_to_db_migration.sql
- misc/omai/database/database/migrations/create_component_usage_table.sql
- misc/omai/database/database/migrations/create_omai_learning_sessions_table.sql
... and 52 more

### orthodoxmetrics_clean/docs (387 files)
- audit/tenant_plan.md
- cursor_task_site_survey.md
- docs/BACKEND_AUDIT_REPORT.md
- docs/BROWSER_ERRORS_FIXED.md
- docs/CRITICAL_FIXES.md
... and 382 more

### orthodoxmetrics_clean/config (15 files)
- config/db-root.js
- config/db.js
- config/session.js
- ecosystem.config.js
- misc/build.config.json
... and 10 more

### orthodoxmetrics_clean/public (4 files)
- public/logo-2.png
- public/logo-3.png
- public/logo-4.png
- public/logo.png


### orthodoxmetrics_clean/scripts (2 files)
- bin/run-detached.sh
- bin/run-once.sh


### orthodoxmetrics_clean/misc (6741 files)
- audit/church_id_application_results.json
- audit/tenant_inventory.json
- misc/ai/learning/sample-mappings.json
- misc/api-routes-viewer.tsx
- misc/bigbook/archived-backend/gitOpsService.js
... and 6736 more

## Next Steps
1. Review the migration_plan.json
2. Run the migration script to create directories
3. Copy files to their new locations
4. Update imports and references (Phase 3)
