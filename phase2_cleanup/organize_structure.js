const fs = require('fs');
const path = require('path');

// Read categorized files
const filesToKeep = JSON.parse(fs.readFileSync('files_to_keep.json', 'utf8'));
const filesToReview = JSON.parse(fs.readFileSync('files_to_review.json', 'utf8'));

// Define the new clean structure
const newStructure = {
    'orthodoxmetrics_clean/server': [],
    'orthodoxmetrics_clean/frontend': [],
    'orthodoxmetrics_clean/database': [],
    'orthodoxmetrics_clean/docs': [],
    'orthodoxmetrics_clean/config': [],
    'orthodoxmetrics_clean/public': [],
    'orthodoxmetrics_clean/scripts': [],
    'orthodoxmetrics_clean/misc': []
};

// Function to determine target directory based on file path
function getTargetDir(filePath) {
    // Server files
    if (filePath.startsWith('server/') || 
        filePath.startsWith('services/') ||
        filePath.includes('controller') ||
        filePath.includes('middleware') ||
        filePath.includes('routes/') ||
        filePath.includes('models/')) {
        return 'orthodoxmetrics_clean/server';
    }
    
    // Frontend files
    if (filePath.startsWith('front-end/')) {
        return 'orthodoxmetrics_clean/frontend';
    }
    
    // Database files
    if (filePath.includes('.sql') || 
        filePath.startsWith('database/') ||
        filePath.startsWith('db/')) {
        return 'orthodoxmetrics_clean/database';
    }
    
    // Documentation
    if (filePath.endsWith('.md') || 
        filePath.startsWith('docs/')) {
        return 'orthodoxmetrics_clean/docs';
    }
    
    // Config files
    if (filePath.startsWith('config/') ||
        filePath.includes('config.') ||
        filePath.endsWith('.config.js') ||
        filePath.endsWith('.config.cjs')) {
        return 'orthodoxmetrics_clean/config';
    }
    
    // Public assets
    if (filePath.startsWith('public/')) {
        return 'orthodoxmetrics_clean/public';
    }
    
    // Scripts
    if (filePath.startsWith('scripts/') ||
        filePath.startsWith('bin/')) {
        return 'orthodoxmetrics_clean/scripts';
    }
    
    // Everything else
    return 'orthodoxmetrics_clean/misc';
}

// Organize files
[...filesToKeep, ...filesToReview].forEach(file => {
    const targetDir = getTargetDir(file);
    if (!newStructure[targetDir]) {
        newStructure[targetDir] = [];
    }
    newStructure[targetDir].push(file);
});

// Generate migration plan
const migrationPlan = {
    totalFiles: filesToKeep.length + filesToReview.length,
    structure: {}
};

Object.keys(newStructure).forEach(dir => {
    migrationPlan.structure[dir] = {
        count: newStructure[dir].length,
        files: newStructure[dir].slice(0, 10), // Show first 10 files as sample
        hasMore: newStructure[dir].length > 10
    };
});

// Write migration plan
fs.writeFileSync('migration_plan.json', JSON.stringify(migrationPlan, null, 2));

// Generate migration script
const migrationScript = `#!/bin/bash
# Phase 2 Migration Script
# This script will organize files into the new clean structure

echo "Creating clean directory structure..."
mkdir -p orthodoxmetrics_clean/server
mkdir -p orthodoxmetrics_clean/frontend
mkdir -p orthodoxmetrics_clean/database
mkdir -p orthodoxmetrics_clean/docs
mkdir -p orthodoxmetrics_clean/config
mkdir -p orthodoxmetrics_clean/public
mkdir -p orthodoxmetrics_clean/scripts
mkdir -p orthodoxmetrics_clean/misc

echo "Migration plan created. Total files to migrate: ${migrationPlan.totalFiles}"
echo "Review migration_plan.json before proceeding."
`;

fs.writeFileSync('migrate.sh', migrationScript);
fs.chmodSync('migrate.sh', '755');

// Generate report
const report = `# Phase 2 Organization Plan

## New Structure Summary
${Object.keys(migrationPlan.structure).map(dir => 
    `- **${dir}**: ${migrationPlan.structure[dir].count} files`
).join('\n')}

## Total Files to Migrate: ${migrationPlan.totalFiles}

## Sample Files per Directory

${Object.keys(migrationPlan.structure).map(dir => {
    const info = migrationPlan.structure[dir];
    return `### ${dir} (${info.count} files)
${info.files.slice(0, 5).map(f => `- ${f}`).join('\n')}
${info.hasMore ? `... and ${info.count - 5} more` : ''}`;
}).join('\n\n')}

## Next Steps
1. Review the migration_plan.json
2. Run the migration script to create directories
3. Copy files to their new locations
4. Update imports and references (Phase 3)
`;

fs.writeFileSync('organization_report.md', report);

console.log('Organization plan complete!');
console.log('Check:');
console.log('- organization_report.md');
console.log('- migration_plan.json');
console.log('- migrate.sh');
