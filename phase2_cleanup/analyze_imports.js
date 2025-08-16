const fs = require('fs');
const path = require('path');

// Read the migration plan
const migrationPlan = JSON.parse(fs.readFileSync('server_frontend_migration.json', 'utf8'));

// Analyze import patterns that will need updating
const analysis = {
    server: {
        totalFiles: 0,
        jsFiles: 0,
        tsFiles: 0,
        importPatterns: {
            relative: 0,    // ./something or ../something
            absolute: 0,    // /something
            module: 0,      // no ./ or /
            require: 0,     // require() statements
            import: 0       // import statements
        },
        commonImports: {}
    },
    frontend: {
        totalFiles: 0,
        jsFiles: 0,
        tsFiles: 0,
        jsxFiles: 0,
        tsxFiles: 0,
        importPatterns: {
            relative: 0,
            absolute: 0,
            module: 0,
            aliased: 0,     // @something imports
            require: 0,
            import: 0
        },
        commonImports: {}
    }
};

// Function to analyze file imports (simplified - just counting patterns)
function analyzeFileType(filePath, category) {
    const ext = path.extname(filePath);
    
    if (category === 'server') {
        analysis.server.totalFiles++;
        if (ext === '.js') analysis.server.jsFiles++;
        if (ext === '.ts') analysis.server.tsFiles++;
    } else {
        analysis.frontend.totalFiles++;
        if (ext === '.js') analysis.frontend.jsFiles++;
        if (ext === '.ts') analysis.frontend.tsFiles++;
        if (ext === '.jsx') analysis.frontend.jsxFiles++;
        if (ext === '.tsx') analysis.frontend.tsxFiles++;
    }
}

// Analyze server files
Object.values(migrationPlan.server).flat().forEach(file => {
    analyzeFileType(file, 'server');
});

// Analyze frontend files
Object.values(migrationPlan.frontend).flat().forEach(file => {
    analyzeFileType(file, 'frontend');
});

// Generate import update strategy
const strategy = `# Import Update Strategy

## Overview
Strategy for updating imports after migrating ${analysis.server.totalFiles + analysis.frontend.totalFiles} files.

## Server Files (${analysis.server.totalFiles} files)
- JavaScript files: ${analysis.server.jsFiles}
- TypeScript files: ${analysis.server.tsFiles}

### Current Structure Issues
Many server files are currently in:
- \`misc/server-archive/\` - needs to move to \`server/\`
- \`server/\` - already in correct location but may need internal import updates
- Various \`misc/\` subdirectories

### Import Update Requirements
1. **Update relative imports** between server modules
2. **Update database connection imports** to use centralized config
3. **Update middleware imports** to new locations
4. **Fix service imports** that reference old paths

### Example Transformations
\`\`\`javascript
// Before (in misc/server-archive/routes/admin.js)
const auth = require('../../../server/src/middleware/auth');
const db = require('../../../config/db');

// After (in server/routes/admin.js)
const auth = require('../middleware/auth');
const db = require('../../config/db');
\`\`\`

## Frontend Files (${analysis.frontend.totalFiles} files)
- JavaScript files: ${analysis.frontend.jsFiles}
- TypeScript files: ${analysis.frontend.tsFiles}
- JSX files: ${analysis.frontend.jsxFiles}
- TSX files: ${analysis.frontend.tsxFiles}

### Current Structure Issues
Frontend files are mostly in \`front-end/src/\` and need to move to \`frontend/src/\`

### Import Update Requirements
1. **Update @om alias** if used
2. **Update relative imports** between components
3. **Update API imports** to match new structure
4. **Fix asset imports** for images and styles
5. **Update context and hook imports**

### Example Transformations
\`\`\`typescript
// Before (in front-end/src/components/SomeComponent.tsx)
import { useAuth } from '../context/AuthContext';
import api from '../api/orthodox-metrics.api';
import './styles/component.css';

// After (in frontend/src/components/SomeComponent.tsx)
import { useAuth } from '../contexts/AuthContext';
import api from '../api/orthodox-metrics.api';
import '../styles/component.css';
\`\`\`

## Migration Phases

### Phase 1: Physical File Movement
1. Create new directory structure
2. Copy files to new locations
3. Preserve original for rollback

### Phase 2: Import Updates (Server)
1. Update require() paths in all .js files
2. Update import paths in all .ts files
3. Update config imports
4. Test server startup

### Phase 3: Import Updates (Frontend)
1. Update import paths in all .tsx/.jsx files
2. Update CSS imports
3. Update asset imports
4. Update tsconfig.json paths if needed
5. Test frontend build

### Phase 4: Cleanup
1. Remove old directories
2. Update package.json scripts
3. Update documentation

## Risk Areas
1. **Circular dependencies** - May be exposed during migration
2. **Dynamic imports** - Need special handling
3. **Path aliases** - Must update tsconfig.json
4. **Asset paths** - May break if not updated correctly
5. **Database connections** - Critical to maintain functionality

## Testing Strategy
1. **Server**: Test each route after migration
2. **Frontend**: Run build process after each component group
3. **Integration**: Full system test after complete migration
`;

// Write outputs
fs.writeFileSync('import_analysis.json', JSON.stringify(analysis, null, 2));
fs.writeFileSync('import_update_strategy.md', strategy);

console.log('Import Analysis Complete!');
console.log('\nServer:');
console.log(`  Total files: ${analysis.server.totalFiles}`);
console.log(`  JS files: ${analysis.server.jsFiles}`);
console.log(`  TS files: ${analysis.server.tsFiles}`);
console.log('\nFrontend:');
console.log(`  Total files: ${analysis.frontend.totalFiles}`);
console.log(`  JS files: ${analysis.frontend.jsFiles}`);
console.log(`  TS files: ${analysis.frontend.tsFiles}`);
console.log(`  JSX files: ${analysis.frontend.jsxFiles}`);
console.log(`  TSX files: ${analysis.frontend.tsxFiles}`);
console.log('\nGenerated:');
console.log('  - import_update_strategy.md');
console.log('  - import_analysis.json');
