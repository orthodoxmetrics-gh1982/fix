#!/usr/bin/env node

/**
 * Phase 6: Verification Script
 * 
 * This script checks the current state of notifications and templates 
 * to understand what consolidation work is needed.
 */

const mysql = require('mysql2/promise');

async function checkDatabaseStructure() {
    console.log('🔍 Phase 6: Checking current database structure...\n');
    
    try {
        // Database connection (using environment variables)
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: 'orthodoxmetrics_db'
        });

        console.log('✅ Connected to orthodoxmetrics_db\n');

        // Check what tables exist
        console.log('📋 Checking existing tables...');
        const [tables] = await connection.query(
            "SHOW TABLES LIKE '%notification%' OR SHOW TABLES LIKE '%template%'"
        );
        
        console.log('Tables found:');
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            console.log(`  • ${tableName}`);
        }
        console.log();

        // Check notifications table structure
        console.log('🔍 Checking notifications table structure...');
        try {
            const [notificationsSchema] = await connection.query('DESCRIBE notifications');
            console.log('notifications table columns:');
            for (const column of notificationsSchema) {
                console.log(`  • ${column.Field} (${column.Type})`);
            }
            
            // Check if task_id column exists
            const hasTaskId = notificationsSchema.some(col => col.Field === 'task_id');
            console.log(`\n📌 task_id column exists: ${hasTaskId ? '✅ YES' : '❌ NO'}`);
        } catch (error) {
            console.log('❌ notifications table not found or accessible');
        }
        console.log();

        // Check templates table structure
        console.log('🔍 Checking templates table structure...');
        try {
            const [templatesSchema] = await connection.query('DESCRIBE templates');
            console.log('templates table columns:');
            for (const column of templatesSchema) {
                console.log(`  • ${column.Field} (${column.Type})`);
            }
            
            // Check if is_global and scope columns exist
            const hasIsGlobal = templatesSchema.some(col => col.Field === 'is_global');
            const hasScope = templatesSchema.some(col => col.Field === 'scope');
            console.log(`\n📌 is_global column exists: ${hasIsGlobal ? '✅ YES' : '❌ NO'}`);
            console.log(`📌 scope column exists: ${hasScope ? '✅ YES' : '❌ NO'}`);
        } catch (error) {
            console.log('❌ templates table not found or accessible');
        }
        console.log();

        // Check if legacy tables still exist
        const legacyTables = ['task_notifications', 'global_templates', 'omb_templates'];
        console.log('🔍 Checking for legacy tables...');
        for (const tableName of legacyTables) {
            try {
                const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName} LIMIT 1`);
                console.log(`📋 ${tableName}: ✅ EXISTS (${rows[0].count} rows)`);
            } catch (error) {
                console.log(`📋 ${tableName}: ❌ DOES NOT EXIST or not accessible`);
            }
        }
        console.log();

        // Check for data that needs migration
        console.log('🔍 Checking for data migration needs...');
        
        // Check task_notifications data
        try {
            const [taskNotifications] = await connection.query(
                'SELECT COUNT(*) as count FROM task_notifications'
            );
            console.log(`📊 task_notifications records: ${taskNotifications[0].count}`);
        } catch (error) {
            console.log('📊 task_notifications: table not found');
        }

        // Check notifications with task_id
        try {
            const [notificationsWithTasks] = await connection.query(
                'SELECT COUNT(*) as count FROM notifications WHERE task_id IS NOT NULL'
            );
            console.log(`📊 notifications with task_id: ${notificationsWithTasks[0].count}`);
        } catch (error) {
            console.log('📊 Cannot check notifications with task_id (column may not exist)');
        }

        // Check global templates
        try {
            const [globalTemplates] = await connection.query(
                'SELECT COUNT(*) as count FROM templates WHERE is_global = TRUE'
            );
            console.log(`📊 global templates (unified): ${globalTemplates[0].count}`);
        } catch (error) {
            console.log('📊 Cannot check global templates in unified table');
        }

        await connection.end();
        
        console.log('\n' + '='.repeat(60));
        console.log('📋 Phase 6 Status Assessment');
        console.log('='.repeat(60));
        console.log('Based on the above analysis:');
        console.log('1. If task_id column exists in notifications → notifications consolidation done');
        console.log('2. If is_global column exists in templates → template consolidation started');
        console.log('3. If legacy tables exist with data → migration needed');
        console.log('4. If legacy tables don\'t exist → consolidation already complete');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('\n💡 Make sure your database connection is configured correctly.');
        console.log('   Set environment variables: DB_HOST, DB_USER, DB_PASSWORD');
    }
}

if (require.main === module) {
    checkDatabaseStructure();
}

module.exports = { checkDatabaseStructure };
