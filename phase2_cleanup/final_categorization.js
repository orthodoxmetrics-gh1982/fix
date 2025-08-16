const fs = require('fs');
const path = require('path');

// Read all files
const filesToKeep = JSON.parse(fs.readFileSync('files_to_keep.json', 'utf8'));
const filesToReview = JSON.parse(fs.readFileSync('files_to_review.json', 'utf8'));
const filesToRemove = JSON.parse(fs.readFileSync('files_to_remove.json', 'utf8'));

// Final comprehensive categorization
const finalStructure = {
    // Server-side code
    'server/controllers': [],
    'server/routes': [],
    'server/middleware': [],
    'server/models': [],
    'server/services': [],
    'server/utils': [],
    'server/websockets': [],
    'server/jobs': [],
    'server/scrapers': [],
    
    // Frontend code
    'frontend/src/components': [],
    'frontend/src/pages': [],
    'frontend/src/views': [],
    'frontend/src/api': [],
    'frontend/src/contexts': [],
    'frontend/src/hooks': [],
    'frontend/src/utils': [],
    'frontend/src/styles': [],
    'frontend/src/assets': [],
    'frontend/src/core': [],
    'frontend/public': [],
    
    // Database
    'database/schemas': [],
    'database/migrations': [],
    'database/scripts': [],
    
    // OMAI System (separate module)
    'omai/services': [],
    'omai/components': [],
    'omai/database': [],
    'omai/bigbook': [],
    'omai/core': [],
    
    // Operations & DevOps
    'ops/scripts': [],
    'ops/monitoring': [],
    'ops/deployment': [],
    'ops/audit': [],
    
    // Configuration
    'config/app': [],
    'config/build': [],
    'config/deploy': [],
    
    // Documentation
    'docs/guides': [],
    'docs/api': [],
    'docs/development': [],
    
    // Testing
    'tests/unit': [],
    'tests/integration': [],
    'tests/fixtures': [],
    
    // Data & Samples
    'data/samples': [],
    'data/fixtures': [],
    'data/migrations': [],
    
    // Scripts & Tools
    'scripts/maintenance': [],
    'scripts/setup': [],
    'scripts/build': [],
    'scripts/utility': [],
    
    // Legacy/Archive (to be reviewed later)
    'archive/legacy': [],
    'archive/backups': [],
    
    // Files to be removed
    'remove': []
};

// Comprehensive categorization function
function categorizeFinal(filePath) {
    const lowerPath = filePath.toLowerCase();
    const basename = path.basename(filePath);
    const ext = path.extname(filePath);
    
    // OMAI-specific files (high priority)
    if (filePath.includes('misc/omai/') || filePath.includes('omai')) {
        if (lowerPath.includes('service')) return 'omai/services';
        if (lowerPath.includes('component')) return 'omai/components';
        if (lowerPath.includes('database') || lowerPath.includes('/db/')) return 'omai/database';
        if (lowerPath.includes('bigbook')) return 'omai/bigbook';
        return 'omai/core';
    }
    
    // Server-side categorization
    if (filePath.startsWith('server/') || filePath.includes('server-')) {
        if (lowerPath.includes('controller')) return 'server/controllers';
        if (lowerPath.includes('route')) return 'server/routes';
        if (lowerPath.includes('middleware')) return 'server/middleware';
        if (lowerPath.includes('model')) return 'server/models';
        if (lowerPath.includes('service')) return 'server/services';
        if (lowerPath.includes('websocket') || lowerPath.includes('socket')) return 'server/websockets';
        if (lowerPath.includes('job') || lowerPath.includes('worker')) return 'server/jobs';
        if (lowerPath.includes('scraper')) return 'server/scrapers';
        if (lowerPath.includes('util')) return 'server/utils';
        return 'server/services'; // default for server files
    }
    
    // Frontend categorization
    if (filePath.startsWith('front-end/')) {
        if (filePath.includes('/public/')) return 'frontend/public';
        if (lowerPath.includes('component')) return 'frontend/src/components';
        if (lowerPath.includes('page')) return 'frontend/src/pages';
        if (lowerPath.includes('view')) return 'frontend/src/views';
        if (lowerPath.includes('/api/')) return 'frontend/src/api';
        if (lowerPath.includes('context')) return 'frontend/src/contexts';
        if (lowerPath.includes('hook')) return 'frontend/src/hooks';
        if (lowerPath.includes('util') || lowerPath.includes('helper')) return 'frontend/src/utils';
        if (lowerPath.includes('style') || ext === '.css' || ext === '.scss') return 'frontend/src/styles';
        if (['.png', '.jpg', '.svg', '.gif', '.ico'].includes(ext)) return 'frontend/src/assets';
        return 'frontend/src/core';
    }
    
    // Operations & Audit
    if (filePath.startsWith('ops/')) {
        if (lowerPath.includes('audit')) return 'ops/audit';
        if (lowerPath.includes('monitor')) return 'ops/monitoring';
        if (lowerPath.includes('deploy')) return 'ops/deployment';
        return 'ops/scripts';
    }
    if (filePath.startsWith('audit/')) return 'ops/audit';
    
    // Database files
    if (ext === '.sql' || filePath.includes('database/') || filePath.includes('/db/')) {
        if (lowerPath.includes('migration')) return 'database/migrations';
        if (lowerPath.includes('schema')) return 'database/schemas';
        return 'database/scripts';
    }
    
    // Documentation
    if (ext === '.md' || filePath.includes('/docs/')) {
        if (lowerPath.includes('guide')) return 'docs/guides';
        if (lowerPath.includes('api')) return 'docs/api';
        return 'docs/development';
    }
    
    // Configuration files
    if (lowerPath.includes('config') || 
        ['package.json', 'tsconfig.json', '.env', 'ecosystem.config.js'].includes(basename)) {
        if (lowerPath.includes('build')) return 'config/build';
        if (lowerPath.includes('deploy')) return 'config/deploy';
        return 'config/app';
    }
    
    // Scripts and maintenance
    if (filePath.includes('misc/daily/')) return 'scripts/maintenance';
    if (filePath.includes('scripts/')) {
        if (lowerPath.includes('setup')) return 'scripts/setup';
        if (lowerPath.includes('build')) return 'scripts/build';
        return 'scripts/utility';
    }
    if (ext === '.sh') return 'scripts/utility';
    
    // Testing
    if (lowerPath.includes('test') || lowerPath.includes('spec')) {
        if (lowerPath.includes('fixture')) return 'tests/fixtures';
        if (lowerPath.includes('integration')) return 'tests/integration';
        return 'tests/unit';
    }
    
    // Data files
    if (lowerPath.includes('sample') || lowerPath.includes('mock')) return 'data/samples';
    if (lowerPath.includes('fixture') || lowerPath.includes('seed')) return 'data/fixtures';
    if (ext === '.json' && filePath.includes('data/')) return 'data/fixtures';
    
    // Archive/Legacy
    if (lowerPath.includes('archive') || lowerPath.includes('legacy') || 
        lowerPath.includes('backup') || lowerPath.includes('old')) {
        if (lowerPath.includes('backup')) return 'archive/backups';
        return 'archive/legacy';
    }
    
    // Special case for .ref files and other data
    if (ext === '.ref') return 'data/fixtures';
    if (ext === '.gz') return 'archive/backups';
    
    // Images and assets
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'].includes(ext)) {
        return 'frontend/src/assets';
    }
    
    // Default based on extension
    if (ext === '.js' || ext === '.ts') return 'server/utils';
    if (ext === '.json') return 'config/app';
    if (ext === '.html') return 'frontend/public';
    
    // Anything else goes to archive for review
    return 'archive/legacy';
}

// Process all files
const allFiles = [...filesToKeep, ...filesToReview];

// Add files to remove
filesToRemove.forEach(file => {
    finalStructure.remove.push(file);
});

// Categorize kept files
allFiles.forEach(file => {
    const category = categorizeFinal(file);
    if (!finalStructure[category]) {
        console.log(`Warning: Unknown category ${category} for file ${file}`);
        finalStructure['archive/legacy'].push(file);
    } else {
        finalStructure[category].push(file);
    }
});

// Generate final report
let report = '# Final Categorization Report\n\n';
report += '## Summary\n';
report += `- Total files to organize: ${allFiles.length}\n`;
report += `- Files to remove: ${filesToRemove.length}\n`;
report += `- Total files processed: ${allFiles.length + filesToRemove.length}\n\n`;

report += '## Final Structure\n';
const sortedCategories = Object.entries(finalStructure)
    .filter(([_, files]) => files.length > 0)
    .sort((a, b) => b[1].length - a[1].length);

sortedCategories.forEach(([category, files]) => {
    report += `- **${category}**: ${files.length} files\n`;
});

report += '\n## Clean Structure Overview\n\n';
const mainCategories = {
    'Server': ['server/controllers', 'server/routes', 'server/middleware', 'server/models', 'server/services', 'server/utils', 'server/websockets', 'server/jobs', 'server/scrapers'],
    'Frontend': ['frontend/src/components', 'frontend/src/pages', 'frontend/src/views', 'frontend/src/api', 'frontend/src/contexts', 'frontend/src/hooks', 'frontend/src/utils', 'frontend/src/styles', 'frontend/src/assets', 'frontend/src/core', 'frontend/public'],
    'OMAI Module': ['omai/services', 'omai/components', 'omai/database', 'omai/bigbook', 'omai/core'],
    'Database': ['database/schemas', 'database/migrations', 'database/scripts'],
    'Operations': ['ops/scripts', 'ops/monitoring', 'ops/deployment', 'ops/audit'],
    'Configuration': ['config/app', 'config/build', 'config/deploy'],
    'Documentation': ['docs/guides', 'docs/api', 'docs/development'],
    'Testing': ['tests/unit', 'tests/integration', 'tests/fixtures'],
    'Scripts': ['scripts/maintenance', 'scripts/setup', 'scripts/build', 'scripts/utility'],
    'Data': ['data/samples', 'data/fixtures', 'data/migrations'],
    'Archive': ['archive/legacy', 'archive/backups']
};

Object.entries(mainCategories).forEach(([main, subs]) => {
    const total = subs.reduce((sum, cat) => sum + (finalStructure[cat]?.length || 0), 0);
    report += `### ${main} (${total} files total)\n`;
    subs.forEach(cat => {
        if (finalStructure[cat] && finalStructure[cat].length > 0) {
            report += `  - ${cat}: ${finalStructure[cat].length} files\n`;
        }
    });
    report += '\n';
});

// Write outputs
fs.writeFileSync('final_structure.json', JSON.stringify(finalStructure, null, 2));
fs.writeFileSync('final_categorization_report.md', report);

// Create migration commands script
let migrationScript = `#!/bin/bash
# Final Migration Script - Phase 2
# This script creates the new directory structure

echo "Creating OrthodoxMetrics Clean Structure..."

# Create main directories
mkdir -p orthodoxmetrics_clean

# Server directories
mkdir -p orthodoxmetrics_clean/server/{controllers,routes,middleware,models,services,utils,websockets,jobs,scrapers}

# Frontend directories  
mkdir -p orthodoxmetrics_clean/frontend/src/{components,pages,views,api,contexts,hooks,utils,styles,assets,core}
mkdir -p orthodoxmetrics_clean/frontend/public

# OMAI module
mkdir -p orthodoxmetrics_clean/omai/{services,components,database,bigbook,core}

# Database
mkdir -p orthodoxmetrics_clean/database/{schemas,migrations,scripts}

# Operations
mkdir -p orthodoxmetrics_clean/ops/{scripts,monitoring,deployment,audit}

# Configuration
mkdir -p orthodoxmetrics_clean/config/{app,build,deploy}

# Documentation
mkdir -p orthodoxmetrics_clean/docs/{guides,api,development}

# Testing
mkdir -p orthodoxmetrics_clean/tests/{unit,integration,fixtures}

# Scripts
mkdir -p orthodoxmetrics_clean/scripts/{maintenance,setup,build,utility}

# Data
mkdir -p orthodoxmetrics_clean/data/{samples,fixtures,migrations}

# Archive
mkdir -p orthodoxmetrics_clean/archive/{legacy,backups}

echo "Directory structure created successfully!"
echo "Ready for file migration."
`;

fs.writeFileSync('create_structure.sh', migrationScript);
fs.chmodSync('create_structure.sh', '755');

// Summary statistics
const stats = {
    totalFiles: allFiles.length + filesToRemove.length,
    toOrganize: allFiles.length,
    toRemove: filesToRemove.length,
    serverFiles: sortedCategories.filter(([cat]) => cat.startsWith('server/')).reduce((sum, [_, files]) => sum + files.length, 0),
    frontendFiles: sortedCategories.filter(([cat]) => cat.startsWith('frontend/')).reduce((sum, [_, files]) => sum + files.length, 0),
    omaiFiles: sortedCategories.filter(([cat]) => cat.startsWith('omai/')).reduce((sum, [_, files]) => sum + files.length, 0),
    databaseFiles: sortedCategories.filter(([cat]) => cat.startsWith('database/')).reduce((sum, [_, files]) => sum + files.length, 0),
    archiveFiles: sortedCategories.filter(([cat]) => cat.startsWith('archive/')).reduce((sum, [_, files]) => sum + files.length, 0)
};

fs.writeFileSync('final_stats.json', JSON.stringify(stats, null, 2));

console.log('Final Categorization Complete!');
console.log('\nStatistics:');
console.log(`  Total files: ${stats.totalFiles}`);
console.log(`  To organize: ${stats.toOrganize}`);
console.log(`  To remove: ${stats.toRemove}`);
console.log('\nBy category:');
console.log(`  Server: ${stats.serverFiles} files`);
console.log(`  Frontend: ${stats.frontendFiles} files`);
console.log(`  OMAI: ${stats.omaiFiles} files`);
console.log(`  Database: ${stats.databaseFiles} files`);
console.log(`  Archive: ${stats.archiveFiles} files`);
console.log('\nOutputs:');
console.log('  - final_categorization_report.md');
console.log('  - final_structure.json');
console.log('  - create_structure.sh');
console.log('  - final_stats.json');
