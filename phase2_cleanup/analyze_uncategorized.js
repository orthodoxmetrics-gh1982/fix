const fs = require('fs');
const path = require('path');

// Read the refined categorization
const categories = JSON.parse(fs.readFileSync('refined_categorization.json', 'utf8'));
const uncategorized = categories['misc/uncategorized'];

// Analyze uncategorized files
const analysis = {
    byExtension: {},
    byDirectory: {},
    byPattern: {
        jsonFiles: [],
        jsFiles: [],
        htmlFiles: [],
        imageFiles: [],
        dataFiles: [],
        miscOmai: [],
        miscDaily: [],
        miscServerArchive: [],
        auditFiles: [],
        opsFiles: []
    }
};

// Analyze each uncategorized file
uncategorized.forEach(file => {
    // By extension
    const ext = path.extname(file);
    if (!analysis.byExtension[ext]) {
        analysis.byExtension[ext] = 0;
    }
    analysis.byExtension[ext]++;
    
    // By top-level directory
    const parts = file.split('/');
    const topDir = parts[0];
    if (!analysis.byDirectory[topDir]) {
        analysis.byDirectory[topDir] = 0;
    }
    analysis.byDirectory[topDir]++;
    
    // By pattern
    if (ext === '.json') analysis.byPattern.jsonFiles.push(file);
    if (ext === '.js' || ext === '.cjs' || ext === '.mjs') analysis.byPattern.jsFiles.push(file);
    if (ext === '.html') analysis.byPattern.htmlFiles.push(file);
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'].includes(ext)) analysis.byPattern.imageFiles.push(file);
    if (file.includes('data/') || file.includes('sample')) analysis.byPattern.dataFiles.push(file);
    if (file.startsWith('misc/omai/')) analysis.byPattern.miscOmai.push(file);
    if (file.startsWith('misc/daily/')) analysis.byPattern.miscDaily.push(file);
    if (file.startsWith('misc/server-archive/')) analysis.byPattern.miscServerArchive.push(file);
    if (file.startsWith('audit/')) analysis.byPattern.auditFiles.push(file);
    if (file.startsWith('ops/')) analysis.byPattern.opsFiles.push(file);
});

// Generate report
let report = '# Uncategorized Files Analysis\n\n';
report += `## Total Uncategorized: ${uncategorized.length} files\n\n`;

report += '## By Extension\n';
const sortedExtensions = Object.entries(analysis.byExtension)
    .sort((a, b) => b[1] - a[1]);
sortedExtensions.forEach(([ext, count]) => {
    report += `- **${ext || 'no extension'}**: ${count} files\n`;
});

report += '\n## By Top Directory\n';
const sortedDirs = Object.entries(analysis.byDirectory)
    .sort((a, b) => b[1] - a[1]);
sortedDirs.forEach(([dir, count]) => {
    report += `- **${dir}**: ${count} files\n`;
});

report += '\n## Pattern Analysis\n';
report += `- JSON files: ${analysis.byPattern.jsonFiles.length}\n`;
report += `- JavaScript files: ${analysis.byPattern.jsFiles.length}\n`;
report += `- HTML files: ${analysis.byPattern.htmlFiles.length}\n`;
report += `- Image files: ${analysis.byPattern.imageFiles.length}\n`;
report += `- Data/Sample files: ${analysis.byPattern.dataFiles.length}\n`;
report += `- misc/omai/ files: ${analysis.byPattern.miscOmai.length}\n`;
report += `- misc/daily/ files: ${analysis.byPattern.miscDaily.length}\n`;
report += `- misc/server-archive/ files: ${analysis.byPattern.miscServerArchive.length}\n`;
report += `- audit/ files: ${analysis.byPattern.auditFiles.length}\n`;
report += `- ops/ files: ${analysis.byPattern.opsFiles.length}\n`;

// Recommendations
report += '\n## Recommendations for Better Categorization\n';
report += '1. **misc/omai/** (${analysis.byPattern.miscOmai.length} files) - These appear to be OMAI-related modules\n';
report += '2. **misc/daily/** (${analysis.byPattern.miscDaily.length} files) - These are maintenance and utility scripts\n';
report += '3. **misc/server-archive/** (${analysis.byPattern.miscServerArchive.length} files) - These are archived/legacy files\n';
report += '4. **audit/** files should go to a dedicated audit/monitoring category\n';
report += '5. **ops/** files should go to operations/deployment category\n';
report += '6. Many .js files in misc/ are utility scripts that need proper categorization\n';

fs.writeFileSync('uncategorized_analysis.md', report);
fs.writeFileSync('uncategorized_details.json', JSON.stringify(analysis, null, 2));

console.log('Uncategorized Analysis Complete!');
console.log(`Total uncategorized: ${uncategorized.length}`);
console.log('\nTop extensions:');
sortedExtensions.slice(0, 5).forEach(([ext, count]) => {
    console.log(`  - ${ext || 'no extension'}: ${count} files`);
});
console.log('\nTop directories:');
sortedDirs.slice(0, 5).forEach(([dir, count]) => {
    console.log(`  - ${dir}: ${count} files`);
});
console.log('\nCheck uncategorized_analysis.md for detailed recommendations');
