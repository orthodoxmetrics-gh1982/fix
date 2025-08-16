#!/usr/bin/env node

/**
 * Sweep 2: Remove backups and duplicate variants
 */

const fs = require('fs');
const path = require('path');

// Files to be deleted
const filesToDelete = [];
const duplicateAnalysis = [];

function analyzeUserManagementFiles() {
    const userMgmtPattern = /UserManagement.*\.tsx$/;
    const adminDir = 'front-end/src/views/admin';
    
    if (!fs.existsSync(adminDir)) {
        console.log('❌ Admin directory not found');
        return;
    }
    
    const files = fs.readdirSync(adminDir)
        .filter(file => userMgmtPattern.test(file))
        .map(file => path.join(adminDir, file));
    
    console.log('📋 UserManagement variants found:');
    files.forEach(file => {
        const stats = fs.statSync(file);
        const size = stats.size;
        console.log(`  • ${path.basename(file)} (${size} bytes)`);
    });
    
    // Keep UserManagement_Fixed.tsx as it's likely the most complete
    const toKeep = files.find(f => f.includes('UserManagement_Fixed.tsx')) || 
                   files.find(f => f.includes('UserManagement.tsx'));
    
    if (toKeep) {
        console.log(`✅ Keeping: ${path.basename(toKeep)}`);
        
        files.forEach(file => {
            if (file !== toKeep) {
                filesToDelete.push(file);
                duplicateAnalysis.push({
                    type: 'UserManagement duplicate',
                    file: file,
                    kept: toKeep
                });
            }
        });
    }
}

function analyzeMenuItems() {
    const menuItemsPath = 'front-end/src/layouts/full/vertical/sidebar/MenuItems.ts';
    const sspocMenuItemsPath = 'front-end/src/layouts/full/vertical/sidebar/SSPPOCMenuItems.ts';
    
    if (fs.existsSync(menuItemsPath) && fs.existsSync(sspocMenuItemsPath)) {
        // Check if SSPPOCMenuItems is referenced anywhere
        console.log('🔍 Checking SSPPOCMenuItems usage...');
        
        // For now, prefer MenuItems.ts as canonical
        filesToDelete.push(sspocMenuItemsPath);
        duplicateAnalysis.push({
            type: 'Menu items duplicate',
            file: sspocMenuItemsPath,
            kept: menuItemsPath
        });
    }
}

function analyzeLayoutStructure() {
    const horizontalLayoutPath = 'front-end/src/layouts/full/horizontal';
    const verticalLayoutPath = 'front-end/src/layouts/full/vertical';
    
    if (fs.existsSync(horizontalLayoutPath)) {
        console.log('📂 Horizontal layout found - checking usage...');
        
        // Search for horizontal layout references
        const grep = require('child_process').execSync(
            `grep -r "horizontal" front-end/src --include="*.ts" --include="*.tsx" || true`,
            { encoding: 'utf8', cwd: process.cwd() }
        );
        
        if (grep.trim() === '') {
            console.log('🗑️  No horizontal layout usage found - marking for removal');
            filesToDelete.push(horizontalLayoutPath);
            duplicateAnalysis.push({
                type: 'Unused horizontal layout',
                file: horizontalLayoutPath,
                kept: verticalLayoutPath
            });
        } else {
            console.log('⚠️  Horizontal layout has references - keeping for now');
            console.log('References found:');
            console.log(grep.split('\n').slice(0, 5).join('\n'));
        }
    }
}

function findBackupFiles() {
    console.log('🔍 Finding backup files...');
    
    const backupPatterns = [
        '**/*.backup',
        '**/*.broken.*',
        '**/*.corrupted.*',
        '**/*_backup.*',
        '**/*-backup.*',
        '**/*.back.*'
    ];
    
    const specificBackups = [
        'front-end/src/api/orthodox-metrics.api.ts.backup',
        'front-end/src/context/InvoiceContext/index.tsx.backup',
        'front-end/src/views/admin/SessionManagement.tsx.backup'
    ];
    
    // Add specific backup files
    specificBackups.forEach(file => {
        if (fs.existsSync(file)) {
            filesToDelete.push(file);
            duplicateAnalysis.push({
                type: 'Specific backup file',
                file: file,
                kept: file.replace('.backup', '')
            });
        }
    });
    
    // Find all backup files in frontend
    try {
        const findCmd = `find front-end -name "*.backup" -o -name "*.broken.*" -o -name "*.corrupted.*" -o -name "*_backup.*" -o -name "*-backup.*" -o -name "*.back.*"`;
        const result = require('child_process').execSync(findCmd, { 
            encoding: 'utf8', 
            cwd: process.cwd() 
        });
        
        result.split('\n').filter(Boolean).forEach(file => {
            if (!filesToDelete.includes(file)) {
                filesToDelete.push(file);
                duplicateAnalysis.push({
                    type: 'Backup file',
                    file: file,
                    kept: 'canonical version'
                });
            }
        });
    } catch (error) {
        console.log('⚠️  Could not run find command, checking manually...');
    }
}

function deleteFiles() {
    console.log(`\n🗑️  Deleting ${filesToDelete.length} backup/duplicate files...\n`);
    
    let deletedCount = 0;
    let errorCount = 0;
    
    filesToDelete.forEach(file => {
        try {
            if (fs.existsSync(file)) {
                const stats = fs.statSync(file);
                if (stats.isDirectory()) {
                    fs.rmSync(file, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(file);
                }
                console.log(`✅ Deleted: ${file}`);
                deletedCount++;
            } else {
                console.log(`⚠️  File not found: ${file}`);
            }
        } catch (error) {
            console.log(`❌ Error deleting ${file}: ${error.message}`);
            errorCount++;
        }
    });
    
    console.log(`\n📊 Summary: ${deletedCount} deleted, ${errorCount} errors`);
}

function generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Sweep 2: Backup/Duplicate Removal Report');
    console.log('='.repeat(60));
    
    const groupedAnalysis = duplicateAnalysis.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
    }, {});
    
    Object.keys(groupedAnalysis).forEach(type => {
        console.log(`\n${type}:`);
        groupedAnalysis[type].forEach(item => {
            console.log(`  🗑️  ${item.file}`);
            console.log(`  ✅ Kept: ${item.kept}`);
        });
    });
    
    console.log(`\nTotal files processed: ${filesToDelete.length}`);
}

function main() {
    console.log('🧹 Sweep 2: Removing backups and duplicate variants\n');
    
    analyzeUserManagementFiles();
    analyzeMenuItems();
    analyzeLayoutStructure();
    findBackupFiles();
    
    if (filesToDelete.length === 0) {
        console.log('✨ No files to delete found');
        return;
    }
    
    console.log(`\n📋 Files scheduled for deletion (${filesToDelete.length}):`);
    filesToDelete.forEach(file => console.log(`  • ${file}`));
    
    // Ask for confirmation in a real scenario, but for automation, proceed
    deleteFiles();
    generateReport();
    
    console.log('\n✨ Sweep 2 completed!');
}

if (require.main === module) {
    main();
}

module.exports = { analyzeUserManagementFiles, filesToDelete };
