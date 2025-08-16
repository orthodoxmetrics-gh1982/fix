# Import Update Strategy

## Overview
Strategy for updating imports after migrating 2579 files.

## Server Files (914 files)
- JavaScript files: 603
- TypeScript files: 16

### Current Structure Issues
Many server files are currently in:
- `misc/server-archive/` - needs to move to `server/`
- `server/` - already in correct location but may need internal import updates
- Various `misc/` subdirectories

### Import Update Requirements
1. **Update relative imports** between server modules
2. **Update database connection imports** to use centralized config
3. **Update middleware imports** to new locations
4. **Fix service imports** that reference old paths

### Example Transformations
```javascript
// Before (in misc/server-archive/routes/admin.js)
const auth = require('../../../server/middleware/auth');
const db = require('../../../config/db');

// After (in server/routes/admin.js)
const auth = require('../middleware/auth');
const db = require('../../config/db');
```

## Frontend Files (1665 files)
- JavaScript files: 12
- TypeScript files: 150
- JSX files: 24
- TSX files: 1111

### Current Structure Issues
Frontend files are mostly in `front-end/src/` and need to move to `frontend/src/`

### Import Update Requirements
1. **Update @om alias** if used
2. **Update relative imports** between components
3. **Update API imports** to match new structure
4. **Fix asset imports** for images and styles
5. **Update context and hook imports**

### Example Transformations
```typescript
// Before (in front-end/src/components/SomeComponent.tsx)
import { useAuth } from '../context/AuthContext';
import api from '../api/orthodox-metrics.api';
import './styles/component.css';

// After (in frontend/src/components/SomeComponent.tsx)
import { useAuth } from '../contexts/AuthContext';
import api from '../api/orthodox-metrics.api';
import '../styles/component.css';
```

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
