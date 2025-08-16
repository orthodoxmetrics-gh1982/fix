#!/usr/bin/env node

/**
 * Migration utility to replace legacy logging calls with centralized LogClient
 * 
 * Usage: node scripts/migrate-to-unified-logging.js [--dry-run] [--file=path]
 */

const fs = require('fs').promises;
const path = require('path');

// Patterns to find and replace
const LEGACY_PATTERNS = [
  // Direct INSERT INTO system_logs
  {
    pattern: /INSERT INTO system_logs\s*\(/gi,
    replacement: '// MIGRATED: Use LogClient.log() instead of direct INSERT INTO system_logs',
    description: 'Direct system_logs INSERT'
  },
  
  // Direct INSERT INTO errors  
  {
    pattern: /INSERT INTO errors\s*\(/gi,
    replacement: '// MIGRATED: Use LogClient.captureError() instead of direct INSERT INTO errors',
    description: 'Direct errors INSERT'
  },

  // Legacy database references
  {
    pattern: /om_logging_db/g,
    replacement: 'om_logging_db',
    description: 'Legacy om_logging_db reference'
  },
  
  {
    pattern: /om_logging_db/g,
    replacement: 'om_logging_db',
    description: 'Legacy om_logging_db reference'
  },

  // Legacy logger imports (example)
  {
    pattern: /require\(['"`]\.\.\/utils\/dbLogger['"`]\)/g,
    replacement: "require('../utils/modernDbLogger')",
    description: 'Legacy dbLogger import'
  }
];

async function findJSFiles(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and other excluded directories
      if (!['node_modules', 'dist', '.git', 'logs'].includes(entry.name)) {
        await findJSFiles(fullPath, files);
      }
    } else if (entry.isFile()) {
      // Include JS and TS files
      if (/\.(js|ts)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

async function migrateFile(filePath, dryRun = false) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    let modifiedContent = content;
    let hasChanges = false;
    const changes = [];

    // Apply each pattern
    for (const { pattern, replacement, description } of LEGACY_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        modifiedContent = modifiedContent.replace(pattern, replacement);
        hasChanges = true;
        changes.push({
          description,
          count: matches.length,
          pattern: pattern.toString()
        });
      }
    }

    if (hasChanges) {
      if (!dryRun) {
        await fs.writeFile(filePath, modifiedContent);
      }
      
      console.log(`${dryRun ? '[DRY RUN] ' : ''}MODIFIED: ${path.relative(process.cwd(), filePath)}`);
      changes.forEach(change => {
        console.log(`  - ${change.description}: ${change.count} occurrence(s)`);
      });
      
      return { modified: true, changes };
    }

    return { modified: false, changes: [] };
  } catch (error) {
    console.error(`ERROR processing ${filePath}:`, error.message);
    return { modified: false, changes: [], error: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const fileArg = args.find(arg => arg.startsWith('--file='));
  const specificFile = fileArg ? fileArg.split('=')[1] : null;

  console.log('🔄 Legacy Logging Migration Utility');
  console.log('=====================================');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified');
  }
  
  if (specificFile) {
    console.log(`📁 Processing specific file: ${specificFile}`);
  } else {
    console.log('📁 Scanning server directory for JS/TS files...');
  }
  
  console.log('');

  try {
    let filesToProcess;
    
    if (specificFile) {
      filesToProcess = [path.resolve(specificFile)];
    } else {
      // Default to current server directory
      const serverDir = path.join(__dirname, '..');
      filesToProcess = await findJSFiles(serverDir);
    }

    console.log(`Found ${filesToProcess.length} files to scan`);
    console.log('');

    let totalModified = 0;
    let totalChanges = 0;
    
    for (const file of filesToProcess) {
      const result = await migrateFile(file, dryRun);
      if (result.modified) {
        totalModified++;
        totalChanges += result.changes.reduce((sum, change) => sum + change.count, 0);
      }
    }

    console.log('');
    console.log('📊 MIGRATION SUMMARY');
    console.log('===================');
    console.log(`Files scanned: ${filesToProcess.length}`);
    console.log(`Files ${dryRun ? 'would be ' : ''}modified: ${totalModified}`);
    console.log(`Total changes ${dryRun ? 'would be ' : ''}made: ${totalChanges}`);
    
    if (dryRun && totalModified > 0) {
      console.log('');
      console.log('💡 Run without --dry-run to apply changes');
    }
    
    if (totalModified > 0 && !dryRun) {
      console.log('');
      console.log('⚠️  IMPORTANT: After migration, you should:');
      console.log('   1. Test the application thoroughly');
      console.log('   2. Update route imports to use modernLogger.js');
      console.log('   3. Install new dependencies: npm install');
      console.log('   4. Run TypeScript type check: npm run typecheck');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateFile, LEGACY_PATTERNS };
