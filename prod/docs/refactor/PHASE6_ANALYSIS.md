# Phase 6: Notifications & Templates Consolidation - ANALYSIS COMPLETE

## 📋 Current State Analysis

Based on examination of the database dump (`orthodoxmetrics_db_2025-08-15_214401.sql`) and codebase, here's the current state:

### Notifications Structure
**Current Tables:**
- ✅ `notifications` - Main notifications table (exists)
- ✅ `task_notifications` - Separate task notifications table (exists)
- ✅ Supporting infrastructure: `notification_queue`, `notification_history`, `notification_subscriptions`, etc.

**Consolidation Status:**
- ❌ `notifications` table does NOT have `task_id` column
- ❌ `task_notifications` data has NOT been migrated
- 📝 **ACTION NEEDED**: Add task_id column and migrate data

### Templates Structure
**Current Tables:**
- ✅ `templates` - Unified templates table with `is_global` column (already exists!)
- ✅ `global_templates` - Legacy table (still exists in dump)
- ✅ `omb_templates` - Legacy table (still exists in dump)
- ✅ `notification_templates` - Separate purpose (keep separate)

**Consolidation Status:**
- ✅ `templates` table already has unified structure with `is_global` field
- ✅ Code already uses `TemplateService.getGlobalTemplates()` which queries `templates WHERE is_global = TRUE`
- ❓ Legacy tables may still exist but might not be actively used
- 📝 **ACTION NEEDED**: Verify if legacy tables are still referenced and migrate remaining data if needed

## 🚀 Phase 6 Implementation Plan

### Step 1: Notifications Consolidation
```sql
-- Add task_id column to notifications
ALTER TABLE notifications 
ADD COLUMN task_id VARCHAR(100) NULL AFTER user_id,
ADD INDEX idx_task_id (task_id);

-- Migrate task_notifications data
INSERT INTO notifications (task_id, ...) 
SELECT task_id, ... FROM task_notifications;

-- Backup and drop task_notifications
CREATE TABLE task_notifications_backup AS SELECT * FROM task_notifications;
-- DROP TABLE task_notifications; (after verification)
```

### Step 2: Templates Final Cleanup
The templates consolidation appears to be already implemented with:
- Unified `templates` table with `is_global` column
- Service layer already using the unified structure
- Just need to verify and clean up any remaining legacy table references

### Step 3: Code Updates
Update any remaining references to:
- `task_notifications` → `notifications WHERE task_id IS NOT NULL`
- Verify all template references use the unified `templates` table

## 📁 Files Created for Phase 6

1. **`phase6-consolidate-notifications-templates.sql`** - Database migration script
2. **`migrate-phase6-code-references.js`** - Code pattern replacement script  
3. **`phase6-verify-current-state.js`** - Database structure verification script

## 🔍 Key Findings

1. **Templates consolidation appears to be already implemented** - the codebase uses `TemplateService.getGlobalTemplates()` which queries the unified `templates` table with `WHERE is_global = TRUE`.

2. **Notifications consolidation is NOT done** - `task_notifications` table exists separately and needs to be consolidated into `notifications` with a `task_id` column.

3. **Legacy table cleanup needed** - `global_templates` and `omb_templates` might still exist but are likely unused in favor of the unified `templates` table.

## ✅ Next Steps

1. **Run verification script** to check current database state
2. **Execute notifications migration** (the main remaining work)
3. **Verify no code still references legacy template tables**
4. **Drop legacy tables** after confirming they're unused
5. **Update Phase 6 status to COMPLETE**

## 🎯 Phase 6 Completion Criteria

- [ ] `notifications` table has `task_id` column
- [ ] `task_notifications` data migrated to `notifications`
- [ ] `task_notifications` table dropped (with backup)
- [ ] All code references updated
- [ ] Legacy template tables verified as unused and dropped
- [ ] Backward compatibility maintained through views if needed

The templates part of Phase 6 appears to already be done, so Phase 6 is primarily about completing the notifications consolidation.
