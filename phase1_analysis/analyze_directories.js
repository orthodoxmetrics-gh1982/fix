const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Read file lists
const prodFiles = fs.readFileSync('prod_files.txt', 'utf8').split('\n').filter(Boolean);
const originalFiles = fs.readFileSync('original_files.txt', 'utf8').split('\n').filter(Boolean);

// Helper function to get file hash
function getFileHash(filePath) {
    try {
        const content = fs.readFileSync(filePath);
        return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
        return null; // File doesn't exist or can't be read
    }
}

// Helper function to get relative path
function getRelativePath(fullPath) {
    return fullPath.replace(/^prod\//, '').replace(/^original\//, '');
}

// Analysis results
const analysis = {
    filesOnlyInProd: [],
    filesOnlyInOriginal: [],
    sameNameDifferentContent: [],
    sameContentDifferentPaths: [],
    fileHashes: {}
};

// Create sets for comparison
const prodFileSet = new Set(prodFiles);
const originalFileSet = new Set(originalFiles);

// Find files only in prod
analysis.filesOnlyInProd = prodFiles.filter(file => !originalFileSet.has(file.replace(/^prod\//, 'original/')));

// Find files only in original
analysis.filesOnlyInOriginal = originalFiles.filter(file => !prodFileSet.has(file.replace(/^original\//, 'prod/')));

// Find files with same name but potentially different content
const prodBasenames = new Map();
const originalBasenames = new Map();

prodFiles.forEach(file => {
    const basename = path.basename(file);
    if (!prodBasenames.has(basename)) {
        prodBasenames.set(basename, []);
    }
    prodBasenames.get(basename).push(file);
});

originalFiles.forEach(file => {
    const basename = path.basename(file);
    if (!originalBasenames.has(basename)) {
        originalBasenames.set(basename, []);
    }
    originalBasenames.get(basename).push(file);
});

// Check for same name, different content
for (const [basename, prodPaths] of prodBasenames) {
    if (originalBasenames.has(basename)) {
        const originalPaths = originalBasenames.get(basename);
        
        for (const prodPath of prodPaths) {
            for (const originalPath of originalPaths) {
                const prodHash = getFileHash(prodPath);
                const originalHash = getFileHash(originalPath);
                
                if (prodHash && originalHash && prodHash !== originalHash) {
                    analysis.sameNameDifferentContent.push({
                        basename,
                        prodPath: getRelativePath(prodPath),
                        originalPath: getRelativePath(originalPath),
                        prodHash,
                        originalHash
                    });
                }
            }
        }
    }
}

// Build hash map for finding same content in different paths
const hashMap = new Map();

[...prodFiles, ...originalFiles].forEach(file => {
    const hash = getFileHash(file);
    if (hash) {
        if (!hashMap.has(hash)) {
            hashMap.set(hash, []);
        }
        hashMap.get(hash).push(file);
    }
});

// Find files with same content but different paths
for (const [hash, files] of hashMap) {
    if (files.length > 1) {
        const prodFiles = files.filter(f => f.startsWith('prod/'));
        const originalFiles = files.filter(f => f.startsWith('original/'));
        
        if (prodFiles.length > 0 && originalFiles.length > 0) {
            analysis.sameContentDifferentPaths.push({
                hash,
                prodFiles: prodFiles.map(getRelativePath),
                originalFiles: originalFiles.map(getRelativePath)
            });
        }
    }
}

// Generate reports
const report = `# Phase 1 Analysis Report

## Summary
- Total files in prod: ${prodFiles.length}
- Total files in original: ${originalFiles.length}
- Files only in prod: ${analysis.filesOnlyInProd.length}
- Files only in original: ${analysis.filesOnlyInOriginal.length}
- Files with same name but different content: ${analysis.sameNameDifferentContent.length}
- Files with same content but different paths: ${analysis.sameContentDifferentPaths.length}

## Files Only in Prod
${analysis.filesOnlyInProd.map(f => `- ${getRelativePath(f)}`).join('\n')}

## Files Only in Original
${analysis.filesOnlyInOriginal.map(f => `- ${getRelativePath(f)}`).join('\n')}

## Files with Same Name but Different Content
${analysis.sameNameDifferentContent.map(f => `- ${f.basename}:
  - Prod: ${f.prodPath}
  - Original: ${f.originalPath}`).join('\n')}

## Files with Same Content but Different Paths
${analysis.sameContentDifferentPaths.map(f => `- Hash: ${f.hash}
  - Prod: ${f.prodFiles.join(', ')}
  - Original: ${f.originalFiles.join(', ')}`).join('\n')}
`;

// Write reports
fs.writeFileSync('report.md', report);
fs.writeFileSync('duplicate_map.json', JSON.stringify(analysis.sameContentDifferentPaths, null, 2));
fs.writeFileSync('file_migration_plan.json', JSON.stringify({
    filesOnlyInProd: analysis.filesOnlyInProd.map(getRelativePath),
    filesOnlyInOriginal: analysis.filesOnlyInOriginal.map(getRelativePath),
    sameNameDifferentContent: analysis.sameNameDifferentContent,
    sameContentDifferentPaths: analysis.sameContentDifferentPaths
}, null, 2));

console.log('Analysis complete! Check the following files:');
console.log('- report.md');
console.log('- duplicate_map.json');
console.log('- file_migration_plan.json');
