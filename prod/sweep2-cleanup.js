#!/usr/bin/env node

/**
 * Sweep 2: Remove backups and duplicate variants
 */

const fs = require('fs');
const path = require('path');

function findFiles(dir, patterns) {
    const files = [];
    
    function scanDirectory(currentDir) {
        if (!fs.existsSync(currentDir)) return;
        
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (!item.match(/^(node_modules|\.git|dist|build|coverage)$/)) {
                    scanDirectory(fullPath);
                }
            } else if (stat.isFile()) {
                for (const pattern of patterns) {
                    if (pattern.test(item) || pattern.test(fullPath)) {
                        files.push(fullPath);
                        break;
                    }
                }
            }
        }
    }
    
    scanDirectory(dir);
    return files;
}

function deleteFiles(files, description) {
    console.log(`\n🗑️  ${description}:`);
    let deletedCount = 0;
    
    files.forEach(file => {
        if (fs.existsSync(file)) {
            try {
                fs.unlinkSync(file);
                console.log(`   ✅ Deleted: ${path.relative(process.cwd(), file)}`);
                deletedCount++;
            } catch (error) {
                console.log(`   ❌ Failed to delete: ${path.relative(process.cwd(), file)} - ${error.message}`);
            }
        }
    });
    
    if (deletedCount === 0) {
        console.log(`   ℹ️  No files found to delete`);
    }
    
    return deletedCount;
}

function main() {
    console.log('🚀 Sweep 2: Remove backups and duplicate variants\n');
    
    const frontendPath = path.resolve('front-end');
    
    // Define backup patterns to delete
    const backupPatterns = [
        /\.backup$/,
        /\.broken\./,
        /\.corrupted\./,
        /_backup\./,
        /-backup\./,
        /\.back\./
    ];
    
    // Find all backup files in frontend
    const backupFiles = findFiles(frontendPath, backupPatterns);
    
    let totalDeleted = 0;
    
    // Delete backup files
    totalDeleted += deleteFiles(backupFiles, 'Removing backup files');
    
    console.log('\n📊 Sweep 2 completed');
    console.log(`Files deleted: ${totalDeleted}`);
}

if (require.main === module) {
    main();
}

module.exports = { findFiles, deleteFiles };
