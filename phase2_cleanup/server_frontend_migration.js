const fs = require('fs');
const path = require('path');

// Read the final structure
const finalStructure = JSON.parse(fs.readFileSync('final_structure.json', 'utf8'));

// Extract only server and frontend categories
const serverCategories = [
    'server/controllers',
    'server/routes', 
    'server/middleware',
    'server/models',
    'server/services',
    'server/utils',
    'server/websockets',
    'server/jobs',
    'server/scrapers'
];

const frontendCategories = [
    'frontend/src/components',
    'frontend/src/pages',
    'frontend/src/views',
    'frontend/src/api',
    'frontend/src/contexts',
    'frontend/src/hooks',
    'frontend/src/utils',
    'frontend/src/styles',
    'frontend/src/assets',
    'frontend/src/core',
    'frontend/public'
];

// Collect server and frontend files
const migrationPlan = {
    server: {},
    frontend: {},
    stats: {
        totalServerFiles: 0,
        totalFrontendFiles: 0,
        totalFiles: 0
    }
};

// Process server files
serverCategories.forEach(category => {
    if (finalStructure[category] && finalStructure[category].length > 0) {
        migrationPlan.server[category] = finalStructure[category];
        migrationPlan.stats.totalServerFiles += finalStructure[category].length;
    }
});

// Process frontend files
frontendCategories.forEach(category => {
    if (finalStructure[category] && finalStructure[category].length > 0) {
        migrationPlan.frontend[category] = finalStructure[category];
        migrationPlan.stats.totalFrontendFiles += finalStructure[category].length;
    }
});

migrationPlan.stats.totalFiles = migrationPlan.stats.totalServerFiles + migrationPlan.stats.totalFrontendFiles;

// Generate detailed report
let report = `# Server & Frontend Migration Plan

## Overview
Focusing on core application files only, excluding OMAI module and other auxiliary files.

## Statistics
- **Total files to migrate**: ${migrationPlan.stats.totalFiles}
- **Server files**: ${migrationPlan.stats.totalServerFiles}
- **Frontend files**: ${migrationPlan.stats.totalFrontendFiles}

## Server Structure (${migrationPlan.stats.totalServerFiles} files)
`;

Object.entries(migrationPlan.server).forEach(([category, files]) => {
    report += `\n### ${category} (${files.length} files)\n`;
    // Show first 5 files as examples
    files.slice(0, 5).forEach(file => {
        report += `- ${file}\n`;
    });
    if (files.length > 5) {
        report += `... and ${files.length - 5} more\n`;
    }
});

report += `\n## Frontend Structure (${migrationPlan.stats.totalFrontendFiles} files)\n`;

Object.entries(migrationPlan.frontend).forEach(([category, files]) => {
    report += `\n### ${category} (${files.length} files)\n`;
    // Show first 5 files as examples
    files.slice(0, 5).forEach(file => {
        report += `- ${file}\n`;
    });
    if (files.length > 5) {
        report += `... and ${files.length - 5} more\n`;
    }
});

// Analyze current file locations
const currentLocations = {
    server: new Set(),
    frontend: new Set()
};

// Get unique source directories
Object.values(migrationPlan.server).flat().forEach(file => {
    const dir = path.dirname(file).split('/')[0];
    currentLocations.server.add(dir);
});

Object.values(migrationPlan.frontend).flat().forEach(file => {
    const dir = path.dirname(file).split('/')[0];
    currentLocations.frontend.add(dir);
});

report += `\n## Current Source Locations\n`;
report += `\n### Server files currently in:\n`;
[...currentLocations.server].forEach(dir => {
    report += `- ${dir}/\n`;
});

report += `\n### Frontend files currently in:\n`;
[...currentLocations.frontend].forEach(dir => {
    report += `- ${dir}/\n`;
});

// Generate migration script
const migrationScript = `#!/bin/bash
# Server & Frontend Migration Script
# Migrates ${migrationPlan.stats.totalFiles} files to new structure

set -e  # Exit on error

echo "Starting Server & Frontend Migration..."
echo "Total files to migrate: ${migrationPlan.stats.totalFiles}"

# Create base directories
echo "Creating directory structure..."
mkdir -p orthodoxmetrics_clean

# Create server directories
mkdir -p orthodoxmetrics_clean/server/controllers
mkdir -p orthodoxmetrics_clean/server/routes
mkdir -p orthodoxmetrics_clean/server/middleware
mkdir -p orthodoxmetrics_clean/server/models
mkdir -p orthodoxmetrics_clean/server/services
mkdir -p orthodoxmetrics_clean/server/utils
mkdir -p orthodoxmetrics_clean/server/websockets
mkdir -p orthodoxmetrics_clean/server/jobs
mkdir -p orthodoxmetrics_clean/server/scrapers

# Create frontend directories
mkdir -p orthodoxmetrics_clean/frontend/src/components
mkdir -p orthodoxmetrics_clean/frontend/src/pages
mkdir -p orthodoxmetrics_clean/frontend/src/views
mkdir -p orthodoxmetrics_clean/frontend/src/api
mkdir -p orthodoxmetrics_clean/frontend/src/contexts
mkdir -p orthodoxmetrics_clean/frontend/src/hooks
mkdir -p orthodoxmetrics_clean/frontend/src/utils
mkdir -p orthodoxmetrics_clean/frontend/src/styles
mkdir -p orthodoxmetrics_clean/frontend/src/assets
mkdir -p orthodoxmetrics_clean/frontend/src/core
mkdir -p orthodoxmetrics_clean/frontend/public

echo "Directory structure created."
echo ""
echo "Ready to migrate files. Run 'node migrate_files.js' to proceed."
`;

// Generate file migration Node.js script
const fileMigrationScript = `const fs = require('fs');
const path = require('path');

const migrationPlan = ${JSON.stringify(migrationPlan, null, 2)};

let successCount = 0;
let errorCount = 0;
const errors = [];

// Function to copy file with directory creation
function copyFile(source, destination) {
    try {
        // Ensure destination directory exists
        const destDir = path.dirname(destination);
        fs.mkdirSync(destDir, { recursive: true });
        
        // Copy the file
        fs.copyFileSync(source, destination);
        successCount++;
        return true;
    } catch (error) {
        errorCount++;
        errors.push({ source, destination, error: error.message });
        return false;
    }
}

console.log('Starting file migration...');
console.log(\`Total files to migrate: \${migrationPlan.stats.totalFiles}\`);

// Migrate server files
console.log('\\nMigrating server files...');
Object.entries(migrationPlan.server).forEach(([category, files]) => {
    console.log(\`  Processing \${category}: \${files.length} files\`);
    files.forEach(file => {
        const source = path.join('../prod', file);
        const destination = path.join('orthodoxmetrics_clean', category, path.basename(file));
        copyFile(source, destination);
    });
});

// Migrate frontend files
console.log('\\nMigrating frontend files...');
Object.entries(migrationPlan.frontend).forEach(([category, files]) => {
    console.log(\`  Processing \${category}: \${files.length} files\`);
    files.forEach(file => {
        const source = path.join('../prod', file);
        const destination = path.join('orthodoxmetrics_clean', category, path.basename(file));
        copyFile(source, destination);
    });
});

// Report results
console.log('\\n=== Migration Complete ===');
console.log(\`Successfully migrated: \${successCount} files\`);
console.log(\`Errors: \${errorCount} files\`);

if (errors.length > 0) {
    console.log('\\nErrors encountered:');
    errors.slice(0, 10).forEach(err => {
        console.log(\`  - \${err.source}: \${err.error}\`);
    });
    if (errors.length > 10) {
        console.log(\`  ... and \${errors.length - 10} more errors\`);
    }
    
    // Save error log
    fs.writeFileSync('migration_errors.json', JSON.stringify(errors, null, 2));
    console.log('\\nFull error log saved to migration_errors.json');
}

// Save migration summary
const summary = {
    timestamp: new Date().toISOString(),
    totalFiles: migrationPlan.stats.totalFiles,
    successCount,
    errorCount,
    successRate: ((successCount / migrationPlan.stats.totalFiles) * 100).toFixed(2) + '%'
};

fs.writeFileSync('migration_summary.json', JSON.stringify(summary, null, 2));
console.log('\\nMigration summary saved to migration_summary.json');
`;

// Write all outputs
fs.writeFileSync('server_frontend_migration.json', JSON.stringify(migrationPlan, null, 2));
fs.writeFileSync('server_frontend_report.md', report);
fs.writeFileSync('create_clean_structure.sh', migrationScript);
fs.writeFileSync('migrate_files.js', fileMigrationScript);

// Make scripts executable
fs.chmodSync('create_clean_structure.sh', '755');

console.log('Server & Frontend Migration Plan Complete!');
console.log('\nStatistics:');
console.log(`  Server files: ${migrationPlan.stats.totalServerFiles}`);
console.log(`  Frontend files: ${migrationPlan.stats.totalFrontendFiles}`);
console.log(`  Total: ${migrationPlan.stats.totalFiles}`);
console.log('\nGenerated files:');
console.log('  - server_frontend_report.md (detailed plan)');
console.log('  - server_frontend_migration.json (migration data)');
console.log('  - create_clean_structure.sh (create directories)');
console.log('  - migrate_files.js (copy files)');
console.log('\nNext steps:');
console.log('  1. Run: ./create_clean_structure.sh');
console.log('  2. Run: node migrate_files.js');
