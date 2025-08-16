-- Phase 6: Notifications & Templates Consolidation
-- Consolidate task_notifications into notifications and merge template tables
-- Run this script during Phase 6 implementation

USE orthodoxmetrics_db;

-- ========================================
-- NOTIFICATIONS CONSOLIDATION
-- ========================================

-- Step 1: Add task_id column to notifications table
ALTER TABLE notifications 
ADD COLUMN task_id VARCHAR(100) NULL AFTER user_id,
ADD INDEX idx_task_id (task_id);

-- Step 2: Migrate data from task_notifications to notifications
INSERT INTO notifications (
    church_id, 
    user_id, 
    task_id, 
    notification_type_id, 
    title, 
    message, 
    data, 
    priority, 
    is_read, 
    is_dismissed, 
    created_at, 
    updated_at
)
SELECT 
    NULL as church_id,  -- task notifications are not church-specific
    NULL as user_id,    -- task notifications don't have specific users initially
    task_id,
    (SELECT id FROM notification_types WHERE name = 'task_update' LIMIT 1) as notification_type_id,
    CONCAT('Task Update: ', type) as title,
    message,
    JSON_OBJECT(
        'task_id', task_id,
        'type', type,
        'priority', priority,
        'metadata', COALESCE(metadata, '{}')
    ) as data,
    CASE 
        WHEN priority = 'critical' THEN 'urgent'
        WHEN priority = 'high' THEN 'high' 
        WHEN priority = 'medium' THEN 'normal'
        WHEN priority = 'low' THEN 'low'
        ELSE 'normal'
    END as priority,
    CASE WHEN `read` = 1 THEN 1 ELSE 0 END as is_read,
    0 as is_dismissed,
    timestamp as created_at,
    timestamp as updated_at
FROM task_notifications;

-- Step 3: Create backup of task_notifications before dropping
CREATE TABLE task_notifications_backup AS SELECT * FROM task_notifications;

-- Step 4: Drop task_notifications table (commented out for safety)
-- DROP TABLE task_notifications;

-- ========================================
-- TEMPLATES CONSOLIDATION  
-- ========================================

-- Step 1: Create backup tables
CREATE TABLE global_templates_backup AS SELECT * FROM global_templates;
CREATE TABLE omb_templates_backup AS SELECT * FROM omb_templates;

-- Step 2: Add scope column to templates table (if it doesn't exist)
-- Note: This assumes the main templates table is for records, we'll create a new unified table
CREATE TABLE templates_unified (
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    scope ENUM('global', 'church', 'omb', 'record') NOT NULL DEFAULT 'global',
    church_id INT(11) NULL,
    content LONGTEXT DEFAULT NULL,
    template_content LONGTEXT DEFAULT NULL, -- for omb_templates compatibility
    metadata LONGTEXT DEFAULT NULL CHECK (json_valid(metadata)),
    variables LONGTEXT DEFAULT NULL CHECK (json_valid(variables)),
    description TEXT DEFAULT NULL,
    preview_image VARCHAR(500) DEFAULT NULL,
    usage_count INT(11) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_by INT(11) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_scope_type (scope, type),
    KEY idx_church_id (church_id),
    KEY idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Migrate global_templates
INSERT INTO templates_unified (
    name, type, scope, church_id, content, metadata, is_active, created_at, updated_at
)
SELECT 
    name,
    type,
    'global' as scope,
    NULL as church_id,
    content,
    metadata,
    is_active,
    created_at,
    updated_at
FROM global_templates;

-- Step 4: Migrate omb_templates  
INSERT INTO templates_unified (
    name, type, scope, church_id, template_content, variables, description, 
    preview_image, usage_count, is_active, created_by, created_at, updated_at
)
SELECT 
    template_name as name,
    template_type as type,
    CASE 
        WHEN church_id IS NULL THEN 'omb'
        ELSE 'church' 
    END as scope,
    church_id,
    template_content,
    variables,
    description,
    preview_image,
    usage_count,
    is_active,
    created_by,
    created_at,
    updated_at
FROM omb_templates;

-- Step 5: Create view for backward compatibility (global_templates)
CREATE VIEW global_templates_compat AS
SELECT 
    id,
    name,
    type,
    COALESCE(content, template_content) as content,
    metadata,
    is_active,
    created_at,
    updated_at
FROM templates_unified 
WHERE scope = 'global';

-- Step 6: Create view for backward compatibility (omb_templates)
CREATE VIEW omb_templates_compat AS
SELECT 
    id,
    church_id,
    name as template_name,
    type as template_type,
    template_content,
    description,
    variables,
    preview_image,
    usage_count,
    is_active,
    created_by,
    created_at,
    updated_at
FROM templates_unified 
WHERE scope IN ('omb', 'church');

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check notification migration
SELECT 
    'Notifications with task_id' as check_type,
    COUNT(*) as count 
FROM notifications 
WHERE task_id IS NOT NULL;

-- Check template consolidation
SELECT 
    scope,
    COUNT(*) as count
FROM templates_unified 
GROUP BY scope;

-- Verify no data loss
SELECT 
    'Original global_templates' as table_name,
    COUNT(*) as count
FROM global_templates_backup
UNION ALL
SELECT 
    'Original omb_templates' as table_name,
    COUNT(*) as count  
FROM omb_templates_backup
UNION ALL
SELECT 
    'Unified templates' as table_name,
    COUNT(*) as count
FROM templates_unified
UNION ALL
SELECT 
    'Original task_notifications' as table_name,
    COUNT(*) as count
FROM task_notifications_backup;

-- ========================================
-- CLEANUP (run only after verification)
-- ========================================

-- Uncomment these after verifying the migration worked:
-- DROP TABLE global_templates;
-- DROP TABLE omb_templates; 
-- DROP TABLE task_notifications;
-- RENAME TABLE templates_unified TO templates_consolidated;
