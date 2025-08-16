const fs = require('fs');
const path = require('path');

// Read the current categorization
const filesToKeep = JSON.parse(fs.readFileSync('files_to_keep.json', 'utf8'));
const filesToReview = JSON.parse(fs.readFileSync('files_to_review.json', 'utf8'));

// Enhanced categorization with more specific patterns
const categories = {
    'server/controllers': [],
    'server/routes': [],
    'server/src/middleware': [],
    'server/models': [],
    'server/services': [],
    'server/utils': [],
    'server/websockets': [],
    'server/jobs': [],
    'server/scrapers': [],
    'server/migrations': [],
    'server/config': [],
    'frontend/src': [],
    'frontend/public': [],
    'frontend/components': [],
    'frontend/pages': [],
    'frontend/views': [],
    'frontend/api': [],
    'frontend/contexts': [],
    'frontend/hooks': [],
    'frontend/utils': [],
    'frontend/styles': [],
    'frontend/assets': [],
    'database/schemas': [],
    'database/migrations': [],
    'database/seeds': [],
    'database/scripts': [],
    'testing': [],
    'docs': [],
    'config': [],
    'scripts/setup': [],
    'scripts/build': [],
    'scripts/deploy': [],
    'scripts/utility': [],
    'data/samples': [],
    'data/fixtures': [],
    'legacy/archive': [],
    'misc/uncategorized': []
};

// Enhanced categorization function
function categorizeFile(filePath) {
    const lowerPath = filePath.toLowerCase();
    const basename = path.basename(filePath);
    const ext = path.extname(filePath);
    
    // Server-side categorization
    if (lowerPath.includes('controller')) {
        return 'server/controllers';
    }
    if (lowerPath.includes('route') || lowerPath.includes('/routes/')) {
        return 'server/routes';
    }
    if (lowerPath.includes('middleware')) {
        return 'server/src/middleware';
    }
    if (lowerPath.includes('model') && !lowerPath.includes('frontend')) {
        return 'server/models';
    }
    if (lowerPath.includes('service') && !lowerPath.includes('frontend') && !lowerPath.includes('front-end')) {
        return 'server/services';
    }
    if (lowerPath.includes('websocket') || lowerPath.includes('socket')) {
        return 'server/websockets';
    }
    if (lowerPath.includes('/jobs/') || lowerPath.includes('worker') || lowerPath.includes('queue')) {
        return 'server/jobs';
    }
    if (lowerPath.includes('scraper') || lowerPath.includes('scraping')) {
        return 'server/scrapers';
    }
    if (lowerPath.includes('server/') && lowerPath.includes('util')) {
        return 'server/utils';
    }
    if (lowerPath.includes('server/') && lowerPath.includes('config')) {
        return 'server/config';
    }
    if (lowerPath.includes('server/') && lowerPath.includes('migration')) {
        return 'server/migrations';
    }
    
    // Frontend categorization
    if (filePath.startsWith('front-end/src/')) {
        if (lowerPath.includes('component')) return 'frontend/components';
        if (lowerPath.includes('page')) return 'frontend/pages';
        if (lowerPath.includes('view')) return 'frontend/views';
        if (lowerPath.includes('/api/')) return 'frontend/api';
        if (lowerPath.includes('context')) return 'frontend/contexts';
        if (lowerPath.includes('hook')) return 'frontend/hooks';
        if (lowerPath.includes('util') || lowerPath.includes('helper')) return 'frontend/utils';
        if (lowerPath.includes('style') || ext === '.css' || ext === '.scss') return 'frontend/styles';
        if (lowerPath.includes('asset') || ['.png', '.jpg', '.svg', '.gif'].includes(ext)) return 'frontend/assets';
        return 'frontend/src';
    }
    if (filePath.startsWith('front-end/public/')) {
        return 'frontend/public';
    }
    if (filePath.startsWith('front-end/')) {
        return 'frontend/src';
    }
    
    // Database categorization
    if (ext === '.sql') {
        if (lowerPath.includes('migration')) return 'database/migrations';
        if (lowerPath.includes('schema')) return 'database/schemas';
        if (lowerPath.includes('seed')) return 'database/seeds';
        return 'database/scripts';
    }
    if (lowerPath.includes('database/') || lowerPath.includes('/db/')) {
        if (lowerPath.includes('migration')) return 'database/migrations';
        return 'database/scripts';
    }
    
    // Documentation
    if (ext === '.md' || lowerPath.includes('/docs/') || lowerPath.includes('readme')) {
        return 'docs';
    }
    
    // Configuration
    if (lowerPath.includes('config') || 
        basename === 'package.json' || 
        basename === 'tsconfig.json' ||
        basename === '.env' ||
        basename.includes('.config.')) {
        return 'config';
    }
    
    // Scripts categorization
    if (lowerPath.includes('script')) {
        if (lowerPath.includes('setup') || lowerPath.includes('install')) return 'scripts/setup';
        if (lowerPath.includes('build') || lowerPath.includes('compile')) return 'scripts/build';
        if (lowerPath.includes('deploy') || lowerPath.includes('release')) return 'scripts/deploy';
        return 'scripts/utility';
    }
    if (ext === '.sh' || lowerPath.includes('/bin/')) {
        return 'scripts/utility';
    }
    
    // Test files
    if (lowerPath.includes('test') || lowerPath.includes('spec') || ext === '.test.js' || ext === '.spec.js') {
        return 'testing';
    }
    
    // Data files
    if (lowerPath.includes('sample') || lowerPath.includes('example') || lowerPath.includes('mock')) {
        return 'data/samples';
    }
    if (lowerPath.includes('fixture') || lowerPath.includes('seed')) {
        return 'data/fixtures';
    }
    
    // Legacy/Archive
    if (lowerPath.includes('legacy') || lowerPath.includes('archive') || lowerPath.includes('old') || lowerPath.includes('deprecated')) {
        return 'legacy/archive';
    }
    
    // Default
    return 'misc/uncategorized';
}

// Categorize all files
const allFiles = [...filesToKeep, ...filesToReview];
allFiles.forEach(file => {
    const category = categorizeFile(file);
    categories[category].push(file);
});

// Generate detailed report
let report = '# Refined Categorization Report\n\n';
report += '## Summary\n';
report += `Total files analyzed: ${allFiles.length}\n\n`;

// Sort categories by file count
const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1].length - a[1].length)
    .filter(([_, files]) => files.length > 0);

report += '## Categories by File Count\n';
sortedCategories.forEach(([category, files]) => {
    report += `- **${category}**: ${files.length} files\n`;
});

report += '\n## Detailed Breakdown\n\n';
sortedCategories.forEach(([category, files]) => {
    if (files.length > 0) {
        report += `### ${category} (${files.length} files)\n`;
        const samples = files.slice(0, 10);
        samples.forEach(file => {
            report += `- ${file}\n`;
        });
        if (files.length > 10) {
            report += `... and ${files.length - 10} more\n`;
        }
        report += '\n';
    }
});

// Write outputs
fs.writeFileSync('refined_categorization.json', JSON.stringify(categories, null, 2));
fs.writeFileSync('refined_report.md', report);

// Generate summary statistics
const stats = {
    totalFiles: allFiles.length,
    categorized: allFiles.length - categories['misc/uncategorized'].length,
    uncategorized: categories['misc/uncategorized'].length,
    percentCategorized: ((allFiles.length - categories['misc/uncategorized'].length) / allFiles.length * 100).toFixed(2)
};

fs.writeFileSync('categorization_stats.json', JSON.stringify(stats, null, 2));

console.log('Refined Categorization Complete!');
console.log(`Total files: ${stats.totalFiles}`);
console.log(`Successfully categorized: ${stats.categorized} (${stats.percentCategorized}%)`);
console.log(`Uncategorized: ${stats.uncategorized}`);
console.log('\nTop categories:');
sortedCategories.slice(0, 10).forEach(([category, files]) => {
    console.log(`  - ${category}: ${files.length} files`);
});
console.log('\nOutputs:');
console.log('  - refined_report.md');
console.log('  - refined_categorization.json');
console.log('  - categorization_stats.json');
