# Server & Frontend Migration Plan

## Overview
Focusing on core application files only, excluding OMAI module and other auxiliary files.

## Statistics
- **Total files to migrate**: 2579
- **Server files**: 914
- **Frontend files**: 1665

## Server Structure (914 files)

### server/controllers (7 files)
- server/controllers/OcrAdminTestController.js
- server/controllers/admin/componentsController.js
- server/controllers/analyticsController.js
- server/controllers/churchAdminController.js
- server/controllers/churchOcrController.js
... and 2 more

### server/routes (107 files)
- misc/docs/server-route-analysis.md
- misc/server-archive/scripts/add-activity-logs-route.js
- misc/server-archive/testing/test-api-routes.js
- misc/server-archive/testing/test-ocr-router.js
- server/middleware/databaseRouter.js
... and 102 more

### server/middleware (28 files)
- server/middleware/auditLogger.js
- server/middleware/auth.js
- server/middleware/churchSecurity.js
- server/middleware/clientContext.js
- server/middleware/logger.js
... and 23 more

### server/models (2 files)
- server/models/kanbanBoard.js
- server/models/kanbanTask.js

### server/services (617 files)
- misc/server-archive/REFACTOR_SUMMARY.md
- misc/server-archive/automation/cron/fetch-headlines.js
- misc/server-archive/credentials/README.md
- misc/server-archive/credentials/google-vision-credentials.json
- misc/server-archive/debug/add-blog-to-my-menu.sql
... and 612 more

### server/utils (108 files)
- misc/server-archive/legacy/phase1-create-db-utilities.js
- misc/server-archive/testing/test-db-utilities.ts
- server/src/utils/OMAIRequest.js
- server/src/utils/add-church.js
- server/src/utils/add-test-dev-user.js
... and 103 more

### server/websockets (1 files)
- server/websockets/logStream.js

### server/jobs (3 files)
- misc/server-archive/jobs/auto-learning-runner.js
- misc/server-archive/legacy/phase0-retry-failed-jobs.js
- misc/server-archive/testing/test-ocr-jobs-api.js

### server/scrapers (41 files)
- misc/server-archive/scrapers/README.md
- misc/server-archive/scrapers/cli.js
- misc/server-archive/scrapers/database/church-database.js
- misc/server-archive/scrapers/debug-html-structure.js
- misc/server-archive/scrapers/debug-scrapers.js
... and 36 more

## Frontend Structure (1665 files)

### frontend/src/components (836 files)
- front-end/src/@om/components/MIGRATION_LOG.md
- front-end/src/@om/components/README.md
- front-end/src/@om/components/features/auth/UserFormModal.tsx
- front-end/src/@om/components/features/auth/index.ts
- front-end/src/@om/components/features/index.ts
... and 831 more

### frontend/src/pages (190 files)
- front-end/src/assets/images/frontend-pages/contact/map.jpg
- front-end/src/assets/images/frontend-pages/contact/shape1.png
- front-end/src/assets/images/frontend-pages/homepage/accordian1.jpg
- front-end/src/assets/images/frontend-pages/homepage/banner-top-left.svg
- front-end/src/assets/images/frontend-pages/homepage/banner-top-left2.svg
... and 185 more

### frontend/src/views (164 files)
- front-end/src/records/CertificatePreviewer.tsx
- front-end/src/tools/steps/ReviewStep.jsx
- front-end/src/views/AdvancedRecordsDemo.tsx
- front-end/src/views/admin/AccessControlDashboard.tsx
- front-end/src/views/admin/ActivityLogs.tsx
... and 159 more

### frontend/src/api (27 files)
- front-end/src/api/admin.api.ts
- front-end/src/api/blog/blogData.ts
- front-end/src/api/calendar.api.ts
- front-end/src/api/chat/Chatdata.ts
- front-end/src/api/church-records.api.ts
... and 22 more

### frontend/src/contexts (24 files)
- front-end/src/context/AuthContext.tsx
- front-end/src/context/BlogContext/index.tsx
- front-end/src/context/ChatContext/index.tsx
- front-end/src/context/ChurchRecordsContext.tsx
- front-end/src/context/ChurchRecordsProvider.tsx
... and 19 more

### frontend/src/hooks (14 files)
- front-end/src/hooks/useClientManagement.ts
- front-end/src/hooks/useDynamicMenuPermissions.ts
- front-end/src/hooks/useFilteredMenuItems.ts
- front-end/src/hooks/useGlobalErrorStore.tsx
- front-end/src/hooks/useInspectorState.ts
... and 9 more

### frontend/src/utils (21 files)
- front-end/src/ai/vrt/exportUtils.ts
- front-end/src/helpers/httpClient.ts
- front-end/src/tools/utils/FileParser.ts
- front-end/src/utils/arrayUtils.ts
- front-end/src/utils/authErrorHandler.ts
... and 16 more

### frontend/src/styles (13 files)
- front-end/scripts/useTableStyleStore.ts
- front-end/src/App.css
- front-end/src/index.css
- front-end/src/store/useTableStyleStore.ts
- front-end/src/store/useTableStyleStore_new.ts
... and 8 more

### frontend/src/assets (122 files)
- front-end/src/assets/images/backgrounds/bronze.png
- front-end/src/assets/images/backgrounds/errorimg.svg
- front-end/src/assets/images/backgrounds/gold.png
- front-end/src/assets/images/backgrounds/login-bg.svg
- front-end/src/assets/images/backgrounds/maintenance.svg
... and 117 more

### frontend/src/core (188 files)
- front-end/.gitignore
- front-end/DEV-SETUP.md
- front-end/MOBILE_AUDIT_LOG.md
- front-end/README.md
- front-end/TASK_144_COMPLETION_SUMMARY.md
... and 183 more

### frontend/public (66 files)
- front-end/public/assets/avatars/orthodox-priest-1.png
- front-end/public/assets/avatars/orthodox-priest-1.svg
- front-end/public/build.meta.json
- front-end/public/images/ChatGPT Image Jul 22, 2025, 11_35_37 AM.png
- front-end/public/images/README.md
... and 61 more

## Current Source Locations

### Server files currently in:
- server/
- misc/
- services/

### Frontend files currently in:
- front-end/
- misc/
- public/
