#!/usr/bin/env node

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
