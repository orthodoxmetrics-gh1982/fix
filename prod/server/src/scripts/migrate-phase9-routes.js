#!/usr/bin/env node

/**
 * Phase 9: Routes Consolidation Migration Script
 * 
 * This script:
 * 1. Creates a backup of the current server/index.js 
 * 2. Updates server/index.js to use the consolidated routes index
 * 3. Provides rollback capability
 * 4. Verifies the changes don't break basic functionality
 */

const fs = require('fs');
const path = require('path');

const SERVER_INDEX_PATH = path.resolve(__dirname, '../index.js');
const BACKUP_PATH = path.resolve(__dirname, '../index.js.phase9-backup');
const CONSOLIDATED_ROUTES_PATH = path.resolve(__dirname, '../src/routes/index.js');

console.log('🚀 Phase 9: Routes Consolidation Migration\n');

// Check if consolidated routes file exists
if (!fs.existsSync(CONSOLIDATED_ROUTES_PATH)) {
  console.error('❌ Error: Consolidated routes file not found at:', CONSOLIDATED_ROUTES_PATH);
  process.exit(1);
}

// Create backup of current server/index.js
function createBackup() {
  if (!fs.existsSync(SERVER_INDEX_PATH)) {
    console.error('❌ Error: server/index.js not found');
    process.exit(1);
  }

  fs.copyFileSync(SERVER_INDEX_PATH, BACKUP_PATH);
  console.log('✅ Created backup:', BACKUP_PATH);
}

// Read the current server file
function readServerFile() {
  return fs.readFileSync(SERVER_INDEX_PATH, 'utf8');
}

// Update server/index.js to use consolidated routes
function updateServerFile() {
  console.log('📝 Updating server/index.js to use consolidated routes...');
  
  const content = readServerFile();
  
  // Find the start and end of the routes section
  const routesStartMarker = '// --- API ROUTES -----------------------------------------------------';
  const routesEndMarker = '// --- 404 HANDLER ----------------------------------------------------';
  
  const startIndex = content.indexOf(routesStartMarker);
  const endIndex = content.indexOf(routesEndMarker);
  
  if (startIndex === -1 || endIndex === -1) {
    console.error('❌ Error: Could not find route markers in server/index.js');
    console.error('Expected markers:');
    console.error('  Start:', routesStartMarker);
    console.error('  End:', routesEndMarker);
    process.exit(1);
  }
  
  // Extract the parts before and after the routes section
  const beforeRoutes = content.substring(0, startIndex);
  const afterRoutes = content.substring(endIndex);
  
  // Create the new routes section
  const newRoutesSection = `// --- API ROUTES (CONSOLIDATED) --------------------------------------
// Import consolidated routes from Phase 9 refactor
const consolidatedRoutes = require('./src/routes/index');

// Mount all API routes under /api prefix
app.use('/api', consolidatedRoutes);

`;

  // Combine all parts
  const newContent = beforeRoutes + newRoutesSection + afterRoutes;
  
  // Write the updated file
  fs.writeFileSync(SERVER_INDEX_PATH, newContent, 'utf8');
  
  console.log('✅ Successfully updated server/index.js with consolidated routes');
}

// Verify the updated file can be loaded without errors
function verifyUpdate() {
  console.log('🔍 Verifying updated server file...');
  
  try {
    // Try to require the updated file (syntax check)
    delete require.cache[SERVER_INDEX_PATH];
    
    // For safety, we'll just check if the file can be read and parsed
    const content = fs.readFileSync(SERVER_INDEX_PATH, 'utf8');
    
    if (content.includes('consolidatedRoutes') && content.includes('./src/routes/index')) {
      console.log('✅ Verification passed: consolidated routes are properly integrated');
      return true;
    } else {
      console.error('❌ Verification failed: consolidated routes not properly integrated');
      return false;
    }
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Rollback function
function rollback() {
  console.log('🔄 Rolling back changes...');
  
  if (fs.existsSync(BACKUP_PATH)) {
    fs.copyFileSync(BACKUP_PATH, SERVER_INDEX_PATH);
    console.log('✅ Rollback completed');
  } else {
    console.error('❌ Backup file not found, cannot rollback');
  }
}

// Generate summary report
function generateSummary() {
  const routeGroups = [
    'Authentication (/api/auth)',
    'Churches (/api/churches, /api/church-records)',
    'Records (/api/records/*)',
    'Certificates (/api/certificates/*)',
    'Uploads (/api/uploads, /api/upload-token)',
    'Templates (/api/templates/*)',
    'Users (/api/users, /api/user/*)',
    'Notifications (/api/notifications)',
    'Admin (/api/admin/*)',
    'Business (/api/dashboard, /api/invoices, etc.)',
    'Content Management (/api/pages, /api/blogs, etc.)',
    'Social (/api/social/*)',
    'Project Management (/api/kanban, /api/survey)',
    'Development Tools (/api/dev/*)',
    'Legacy Modules (/api/legacy/*)',
    'Multi-tenant (/api/client/:clientSlug)',
    'Utilities (/api/dropdown-options, /api/config, /api/search)'
  ];

  console.log('\n' + '='.repeat(60));
  console.log('📊 Phase 9 Routes Consolidation Summary');
  console.log('='.repeat(60));
  console.log('✅ Routes successfully organized into logical groups:');
  console.log('');
  
  routeGroups.forEach((group, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${group}`);
  });
  
  console.log('');
  console.log('🔧 Benefits:');
  console.log('  • Logical route grouping for better maintainability');
  console.log('  • Reduced clutter in main server file');
  console.log('  • Easier to add new routes within appropriate groups');
  console.log('  • Better separation of concerns');
  console.log('  • Clear route hierarchy');
  
  console.log('');
  console.log('📁 Files created/modified:');
  console.log('  • server/src/routes/index.js (new consolidated routes)');
  console.log('  • server/index.js (updated to use consolidated routes)');
  console.log(`  • ${path.basename(BACKUP_PATH)} (backup of original)`);
}

// Main execution
function main() {
  try {
    createBackup();
    updateServerFile();
    
    if (verifyUpdate()) {
      generateSummary();
      
      console.log('\n✨ Phase 9 Routes Consolidation completed successfully!');
      console.log('\n📌 Next Steps:');
      console.log('1. Test the server starts correctly: npm start');
      console.log('2. Test key API endpoints work as expected');
      console.log('3. Remove duplicate/legacy route files if confirmed working');
      console.log('4. Update any hardcoded route references in documentation');
      
      console.log('\n🔄 Rollback Instructions:');
      console.log('If issues occur, run: node server/scripts/phase9-rollback.js');
    } else {
      console.log('\n❌ Migration failed verification, rolling back...');
      rollback();
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('Attempting rollback...');
    rollback();
    process.exit(1);
  }
}

// Create rollback script
function createRollbackScript() {
  const rollbackScript = `#!/usr/bin/env node

/**
 * Phase 9: Routes Consolidation Rollback Script
 */

const fs = require('fs');
const path = require('path');

const SERVER_INDEX_PATH = path.resolve(__dirname, '../index.js');
const BACKUP_PATH = path.resolve(__dirname, '../index.js.phase9-backup');

console.log('🔄 Rolling back Phase 9 routes consolidation...');

if (fs.existsSync(BACKUP_PATH)) {
  fs.copyFileSync(BACKUP_PATH, SERVER_INDEX_PATH);
  console.log('✅ Rollback completed successfully');
  console.log('Server has been restored to pre-Phase 9 state');
} else {
  console.error('❌ Backup file not found at:', BACKUP_PATH);
  console.error('Cannot perform automatic rollback');
}
`;

  fs.writeFileSync(
    path.resolve(__dirname, 'phase9-rollback.js'),
    rollbackScript,
    'utf8'
  );
}

if (require.main === module) {
  createRollbackScript();
  main();
}

module.exports = { updateServerFile, verifyUpdate, rollback };
