#!/usr/bin/env node

/**
 * Phase 6: Update code references for consolidated notifications and templates
 * 
 * This script:
 * 1. Updates task_notifications table references to use notifications with task_id
 * 2. Updates global_templates and omb_templates references to use unified templates
 * 3. Provides compatibility patterns for gradual migration
 */

const fs = require('fs');
const path = require('path');

// Files to scan for updates
const TARGET_DIRECTORIES = [
    'server/src',
    'server/routes', 
    'server/api',
    'server/utils',
    '../front-end/src'
];

// Code patterns to replace
const NOTIFICATION_PATTERNS = [
    // Task notifications table references
    {
        search: /INSERT\s+INTO\s+task_notifications/gi,
        replace: 'INSERT INTO notifications',
        description: 'Replace task_notifications INSERT with notifications'
    },
    {
        search: /SELECT\s+.*\s+FROM\s+task_notifications/gi,
        replace: match => match.replace(/task_notifications/gi, 'notifications WHERE task_id IS NOT NULL'),
        description: 'Replace task_notifications SELECT with filtered notifications'
    },
    {
        search: /UPDATE\s+task_notifications/gi,
        replace: 'UPDATE notifications',
        description: 'Replace task_notifications UPDATE with notifications'
    },
    {
        search: /DELETE\s+FROM\s+task_notifications/gi,
        replace: 'DELETE FROM notifications',
        description: 'Replace task_notifications DELETE with notifications'
    }
];

const TEMPLATE_PATTERNS = [
    // Global templates references
    {
        search: /INSERT\s+INTO\s+global_templates/gi,
        replace: 'INSERT INTO templates_unified',
        description: 'Replace global_templates INSERT with templates_unified'
    },
    {
        search: /SELECT\s+.*\s+FROM\s+global_templates/gi,
        replace: match => match.replace(/global_templates/gi, "templates_unified WHERE scope = 'global'"),
        description: 'Replace global_templates SELECT with filtered templates_unified'
    },
    {
        search: /UPDATE\s+global_templates/gi,
        replace: 'UPDATE templates_unified',
        description: 'Replace global_templates UPDATE with templates_unified'
    },
    
    // OMB templates references
    {
        search: /INSERT\s+INTO\s+omb_templates/gi,
        replace: 'INSERT INTO templates_unified',
        description: 'Replace omb_templates INSERT with templates_unified'
    },
    {
        search: /SELECT\s+.*\s+FROM\s+omb_templates/gi,
        replace: match => match.replace(/omb_templates/gi, "templates_unified WHERE scope IN ('omb', 'church')"),
        description: 'Replace omb_templates SELECT with filtered templates_unified'
    },
    {
        search: /UPDATE\s+omb_templates/gi,
        replace: 'UPDATE templates_unified',
        description: 'Replace omb_templates UPDATE with templates_unified'
    }
];

// Column mapping for INSERT statements
const COLUMN_MAPPINGS = {
    task_notifications: {
        task_id: 'task_id',
        type: 'notification_type_id', // will need lookup
        message: 'message',
        timestamp: 'created_at',
        read: 'is_read',
        priority: 'priority',
        metadata: 'data'
    },
    global_templates: {
        name: 'name',
        type: 'type',
        content: 'content',
        metadata: 'metadata',
        is_active: 'is_active',
        created_at: 'created_at',
        updated_at: 'updated_at'
    },
    omb_templates: {
        template_name: 'name',
        template_type: 'type', 
        template_content: 'template_content',
        church_id: 'church_id',
        variables: 'variables',
        description: 'description',
        preview_image: 'preview_image',
        usage_count: 'usage_count',
        created_by: 'created_by',
        is_active: 'is_active',
        created_at: 'created_at',
        updated_at: 'updated_at'
    }
};

function findFiles(dir, extensions = ['.js', '.ts', '.jsx', '.tsx', '.sql']) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
        return files;
    }
    
    function scanDirectory(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // Skip node_modules and other common exclude directories
                if (!item.match(/^(node_modules|\.git|dist|build|coverage)$/)) {
                    scanDirectory(fullPath);
                }
            } else if (stat.isFile()) {
                const ext = path.extname(fullPath);
                if (extensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    }
    
    scanDirectory(dir);
    return files;
}

function updateFile(filePath, patterns) {
    if (!fs.existsSync(filePath)) {
        return { updated: false, changes: [] };
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const changes = [];
    
    for (const pattern of patterns) {
        let matches = 0;
        
        if (typeof pattern.replace === 'function') {
            content = content.replace(pattern.search, (match) => {
                matches++;
                return pattern.replace(match);
            });
        } else {
            content = content.replace(pattern.search, (match) => {
                matches++;
                return pattern.replace;
            });
        }
        
        if (matches > 0) {
            changes.push({
                description: pattern.description,
                matches: matches
            });
        }
    }
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        return { updated: true, changes };
    }
    
    return { updated: false, changes: [] };
}

function main() {
    console.log('🚀 Phase 6: Updating code references for consolidated notifications and templates\n');
    
    const allPatterns = [...NOTIFICATION_PATTERNS, ...TEMPLATE_PATTERNS];
    const allFiles = [];
    
    // Collect all files to process
    for (const dir of TARGET_DIRECTORIES) {
        const dirPath = path.resolve(dir);
        const files = findFiles(dirPath);
        allFiles.push(...files);
        console.log(`📂 Found ${files.length} files in ${dir}`);
    }
    
    console.log(`\n📝 Processing ${allFiles.length} total files...\n`);
    
    let totalUpdated = 0;
    let totalChanges = 0;
    const updateSummary = [];
    
    for (const filePath of allFiles) {
        const result = updateFile(filePath, allPatterns);
        
        if (result.updated) {
            totalUpdated++;
            const changeCount = result.changes.reduce((sum, change) => sum + change.matches, 0);
            totalChanges += changeCount;
            
            const relativePath = path.relative(process.cwd(), filePath);
            updateSummary.push({
                file: relativePath,
                changes: result.changes,
                totalChanges: changeCount
            });
            
            console.log(`✅ ${relativePath} (${changeCount} changes)`);
            for (const change of result.changes) {
                console.log(`   • ${change.description} (${change.matches} matches)`);
            }
        }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Phase 6 Migration Summary');
    console.log('='.repeat(60));
    console.log(`Files processed: ${allFiles.length}`);
    console.log(`Files updated: ${totalUpdated}`);
    console.log(`Total changes: ${totalChanges}`);
    
    if (updateSummary.length > 0) {
        console.log('\n📋 Updated Files:');
        for (const summary of updateSummary) {
            console.log(`\n${summary.file}:`);
            for (const change of summary.changes) {
                console.log(`  • ${change.description} (${change.matches}x)`);
            }
        }
    }
    
    console.log('\n✨ Phase 6 code updates complete!');
    console.log('\n📌 Next Steps:');
    console.log('1. Run the SQL migration script: phase6-consolidate-notifications-templates.sql');
    console.log('2. Test notification functionality with task_id support');
    console.log('3. Test template functionality with unified templates');
    console.log('4. Verify backward compatibility views work correctly');
    console.log('5. Update any remaining hardcoded references manually');
    
    // Write summary to file
    const summaryData = {
        timestamp: new Date().toISOString(),
        filesProcessed: allFiles.length,
        filesUpdated: totalUpdated,
        totalChanges: totalChanges,
        updates: updateSummary
    };
    
    fs.writeFileSync(
        'phase6-migration-summary.json',
        JSON.stringify(summaryData, null, 2),
        'utf8'
    );
    
    console.log('\n💾 Summary saved to: phase6-migration-summary.json');
}

if (require.main === module) {
    main();
}

module.exports = { updateFile, NOTIFICATION_PATTERNS, TEMPLATE_PATTERNS };
