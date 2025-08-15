# Debug Utilities

This folder contains debugging scripts for troubleshooting OrthodMetrics issues.

## Scripts

### `test-session-debug.js`
**Purpose**: Comprehensive session and authentication debugging
**Usage**: `node debug/test-session-debug.js`
**What it checks**:
- Sessions table existence and count
- Active/expired sessions
- Admin user accounts and roles
- Superadmin user verification

### `check-active-sessions.js` 
**Purpose**: Check currently active sessions in the database
**Usage**: `node debug/check-active-sessions.js`
**What it shows**:
- All active (non-expired) sessions
- Session expiration times
- Data length and preview
- Identifies superadmin sessions

### `cleanup-expired-sessions.js`
**Purpose**: Remove all expired sessions from the database
**Usage**: `node debug/cleanup-expired-sessions.js`
**What it does**:
- Shows statistics (total, active, expired sessions)
- Lists sample expired sessions before deletion
- Safely deletes all expired sessions
- Reports final cleanup results

### `session-sync-debug.js`
**Purpose**: Comprehensive session debugging for sync issues
**Usage**: `node debug/session-sync-debug.js`
**What it checks**:
- Session table structure and configuration
- All sessions in database (active and expired)
- Session creation and storage issues
- Common problems and solutions

### `direct-session-check.js`
**Purpose**: Direct MySQL connection to check sessions (bypasses app layer)
**Usage**: `node debug/direct-session-check.js`
**What it does**:
- Direct database connection to sessions table
- Raw session counts and data analysis
- Identifies if sessions are being created vs retrieved
- Provides diagnosis of session middleware issues

### `fix-session-issues.js`
**Purpose**: Diagnose and fix session configuration problems
**Usage**: `node debug/fix-session-issues.js`
**What it does**:
- Cleans up expired sessions
- Tests manual session creation
- Diagnoses session store configuration issues
- Provides specific fix instructions

### `test-actual-login.js`
**Purpose**: Test the actual login process and session creation workflow
**Usage**: `node debug/test-actual-login.js`
**What it does**:
- Analyzes existing sessions for user authentication data
- Checks recent session activity
- Identifies if login is completing successfully
- Provides targeted troubleshooting steps

### `complete-security-scan.js`
**Purpose**: Comprehensive security scan to find authentication bypasses
**Usage**: `node debug/complete-security-scan.js`
**What it does**:
- Scans all JS/TS files for dangerous authentication bypass patterns
- Identifies hardcoded passwords and security vulnerabilities
- Provides severity ratings and line numbers for issues
- Gives specific fix recommendations

## Common Use Cases

**Session authentication issues**: Run `test-session-debug.js` to see if sessions are expired or corrupted.

**Login problems**: Use `check-active-sessions.js` after login to verify session creation.

**Role/permission issues**: Check `test-session-debug.js` output to verify user roles are correct.

## Note
Keep these scripts for future troubleshooting - don't delete them! 