const fs = require('fs');
const path = require('path');

// Read the prod files list
const prodFiles = fs.readFileSync('../phase1_analysis/prod_files.txt', 'utf8')
    .split('\n')
    .filter(Boolean);

// Categories for cleanup
const categories = {
    remove: [],      // Files to delete
    keep: [],        // Core application files
    review: [],      // Files needing manual review
    archive: []      // Files to archive
};

// Patterns for files to remove
const removePatterns = [
    /\.log$/,
    /\.tmp$/,
    /\.bak$/,
    /\.backup$/,
    /\.ps1$/,        // PowerShell (per user rules)
    /\.bat$/,        // Batch files
    /dump-.*\.sql$/, // Database dumps
    /fixthatshit\.txt$/,
    /fixthisshit\.txt$/,
    /\.DS_Store$/,
    /Thumbs\.db$/
];

// Patterns for files to keep
const keepPatterns = [
    /\.(js|ts|jsx|tsx)$/,  // JavaScript/TypeScript
    /\.(json)$/,            // JSON configs
    /\.(css|scss|sass)$/,   // Styles
    /\.(html)$/,            // HTML
    /\.(md)$/,              // Documentation
    /\.(sql)$/,             // Database schemas (not dumps)
    /\.(png|jpg|jpeg|gif|svg)$/, // Images
    /package\.json$/,
    /tsconfig\.json$/,
    /\.gitignore$/,
    /README\.md$/
];

// Categorize files
prodFiles.forEach(file => {
    const relativePath = file.replace(/^prod\//, '');
    
    // Check if should remove
    if (removePatterns.some(pattern => pattern.test(file))) {
        categories.remove.push(relativePath);
        return;
    }
    
    // Check if should keep
    if (keepPatterns.some(pattern => pattern.test(file))) {
        // Skip database dumps even if they match .sql pattern
        if (!/dump-.*\.sql$/.test(file)) {
            categories.keep.push(relativePath);
        } else {
            categories.remove.push(relativePath);
        }
        return;
    }
    
    // Files needing review
    categories.review.push(relativePath);
});

// Generate report
const report = `# Phase 2 Cleanup Report

## Summary
- Total files: ${prodFiles.length}
- Files to remove: ${categories.remove.length}
- Files to keep: ${categories.keep.length}
- Files to review: ${categories.review.length}

## Files to Remove (${categories.remove.length})
${categories.remove.slice(0, 50).map(f => `- ${f}`).join('\n')}
${categories.remove.length > 50 ? `\n... and ${categories.remove.length - 50} more` : ''}

## Files to Keep (${categories.keep.length})
${categories.keep.slice(0, 50).map(f => `- ${f}`).join('\n')}
${categories.keep.length > 50 ? `\n... and ${categories.keep.length - 50} more` : ''}

## Files Needing Review (${categories.review.length})
${categories.review.slice(0, 50).map(f => `- ${f}`).join('\n')}
${categories.review.length > 50 ? `\n... and ${categories.review.length - 50} more` : ''}
`;

// Write outputs
fs.writeFileSync('cleanup_report.md', report);
fs.writeFileSync('files_to_remove.json', JSON.stringify(categories.remove, null, 2));
fs.writeFileSync('files_to_keep.json', JSON.stringify(categories.keep, null, 2));
fs.writeFileSync('files_to_review.json', JSON.stringify(categories.review, null, 2));

console.log('Phase 2 Cleanup Analysis Complete!');
console.log(`- Files to remove: ${categories.remove.length}`);
console.log(`- Files to keep: ${categories.keep.length}`);
console.log(`- Files to review: ${categories.review.length}`);
console.log('\nCheck the following files:');
console.log('- cleanup_report.md');
console.log('- files_to_remove.json');
console.log('- files_to_keep.json');
console.log('- files_to_review.json');
