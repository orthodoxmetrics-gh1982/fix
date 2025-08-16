#!/usr/bin/env node

/**
 * Sweep 1: Update imports after moving demo/example code to dev/examples
 */

const fs = require('fs');
const path = require('path');

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
        return files;
    }
    
    function scanDirectory(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (!item.match(/^(node_modules|\.git|dist|build|coverage)$/)) {
                    scanDirectory(fullPath);
                }
            } else if (stat.isFile()) {
                const ext = path.extname(fullPath);
                if (extensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    }
    
    scanDirectory(dir);
    return files;
}

function updateImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let updated = content;
    let hasChanges = false;
    
    // Patterns to update
    const patterns = [
        // src/components/.../code/... -> @/dev/examples/components/.../code/...
        {
            search: /from ['"]src\/components\/(.+\/code\/.+)['"]/g,
            replace: "from '@/dev/examples/components/$1'"
        },
        // @/components/.../code/... -> @/dev/examples/components/.../code/...
        {
            search: /from ['"]@\/components\/(.+\/code\/.+)['"]/g,
            replace: "from '@/dev/examples/components/$1'"
        },
        // src/components/muicharts/... -> @/dev/examples/components/muicharts/...
        {
            search: /from ['"]src\/components\/muicharts\/(.+)['"]/g,
            replace: "from '@/dev/examples/components/muicharts/$1'"
        },
        // @/components/muicharts/... -> @/dev/examples/components/muicharts/...
        {
            search: /from ['"]@\/components\/muicharts\/(.+)['"]/g,
            replace: "from '@/dev/examples/components/muicharts/$1'"
        },
        // src/demos/... -> @/dev/examples/...
        {
            search: /from ['"]src\/demos\/(.+)['"]/g,
            replace: "from '@/dev/examples/$1'"
        },
        // @/demos/... -> @/dev/examples/...
        {
            search: /from ['"]@\/demos\/(.+)['"]/g,
            replace: "from '@/dev/examples/$1'"
        },
        // import statements without from
        {
            search: /import (.+) from ['"]src\/components\/(.+\/code\/.+)['"]/g,
            replace: "import $1 from '@/dev/examples/components/$2'"
        }
    ];
    
    patterns.forEach(pattern => {
        const matches = updated.match(pattern.search);
        if (matches) {
            updated = updated.replace(pattern.search, pattern.replace);
            hasChanges = true;
        }
    });
    
    if (hasChanges) {
        fs.writeFileSync(filePath, updated, 'utf8');
        return true;
    }
    
    return false;
}

function main() {
    console.log('🔄 Updating imports after moving demo/example code to dev/examples...\n');
    
    const frontendSrcPath = path.resolve('front-end/src');
    const files = findFiles(frontendSrcPath);
    
    let updatedCount = 0;
    const updatedFiles = [];
    
    files.forEach(file => {
        if (updateImports(file)) {
            updatedCount++;
            const relativePath = path.relative(process.cwd(), file);
            updatedFiles.push(relativePath);
            console.log(`✅ Updated: ${relativePath}`);
        }
    });
    
    console.log(`\n📊 Updated ${updatedCount} files with new import paths`);
    
    if (updatedFiles.length > 0) {
        console.log('\nUpdated files:');
        updatedFiles.forEach(file => console.log(`  • ${file}`));
    }
}

if (require.main === module) {
    main();
}

module.exports = { updateImports };
