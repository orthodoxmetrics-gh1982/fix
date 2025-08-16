// Modernized Database Logger using centralized LogClient
// Replaces legacy filesystem-based Winston and direct DB writes
const { LogClient, createLogClient } = require('../src/lib/logger');
const { promisePool } = require('../../config/db');
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

class ModernDatabaseLogger {
  constructor() {
    this.logClient = createLogClient(promisePool);
    this.buffer = [];
    this.bufferSize = 100;
    this.fallbackLogDir = path.join(__dirname, '../logs');
    this.fallbackEnabled = true;
    this.isInitialized = false;
    this.initializeDatabase();
  }

  async initializeDatabase() {
    try {
      // Test connection to om_logging_db
      const [rows] = await promisePool.execute('SELECT 1 FROM om_logging_db.logs LIMIT 1');
      this.isInitialized = true;
      console.log('✅ Modern DatabaseLogger initialized with om_logging_db');
    } catch (error) {
      console.error('❌ Failed to initialize modern DatabaseLogger:', error);
      this.fallbackEnabled = true;
    }
  }

  async log(level, message, meta = {}) {
    try {
      // Use the centralized LogClient instead of direct SQL
      await this.logClient.log(level.toUpperCase(), message, {
        source: meta.source || 'server',
        origin: meta.origin || 'backend',
        component: meta.service || meta.component,
        userId: meta.user_id || meta.userId || null,
        sessionId: meta.session_id || meta.sessionId || null,
        context: {
          ...meta,
          request_id: meta.request_id,
          ip_address: meta.ip_address,
          user_agent: meta.user_agent,
          user_email: meta.user_email
        }
      });
    } catch (error) {
      console.error('ModernDatabaseLogger.log failed:', error);
      if (this.fallbackEnabled) {
        await this.fallbackLog(level, message, meta);
      }
    }
  }

  async captureError(errorData) {
    try {
      const hash = LogClient.createErrorHash(
        errorData.source || 'server',
        errorData.message,
        errorData.component
      );

      return await this.logClient.captureError({
        hash,
        type: errorData.type || 'backend',
        source: errorData.source || 'server',
        message: errorData.message,
        severity: errorData.severity || 'medium',
        logLevel: errorData.logLevel || 'ERROR',
        origin: errorData.origin || 'backend',
        component: errorData.component,
        userAgent: errorData.user_agent || errorData.userAgent,
        sessionId: errorData.session_id || errorData.sessionId,
        context: errorData.context || errorData.meta
      });
    } catch (error) {
      console.error('ModernDatabaseLogger.captureError failed:', error);
      return null;
    }
  }

  async fallbackLog(level, message, meta) {
    try {
      await fs.mkdir(this.fallbackLogDir, { recursive: true });
      const timestamp = new Date().toISOString();
      const logEntry = JSON.stringify({ timestamp, level, message, meta }) + '\n';
      const logFile = path.join(this.fallbackLogDir, `fallback-${new Date().toISOString().split('T')[0]}.log`);
      await fs.appendFile(logFile, logEntry);
    } catch (error) {
      console.error('Fallback logging failed:', error);
    }
  }

  // Legacy compatibility methods
  async info(message, meta = {}) {
    return this.log('INFO', message, meta);
  }

  async error(message, meta = {}) {
    return this.log('ERROR', message, meta);
  }

  async warn(message, meta = {}) {
    return this.log('WARNING', message, meta);
  }

  async debug(message, meta = {}) {
    return this.log('DEBUG', message, meta);
  }

  async critical(message, meta = {}) {
    return this.log('CRITICAL', message, meta);
  }

  // Clean up old logs (now points to om_logging_db)
  async cleanupOldLogs(retentionDays = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const [result] = await promisePool.execute(
        'DELETE FROM om_logging_db.logs WHERE timestamp < ?',
        [cutoffDate]
      );
      
      console.log(`Cleaned up ${result.affectedRows} old log entries`);
      return result.affectedRows;
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
      return 0;
    }
  }
}

// Export singleton instance for backward compatibility
const modernLogger = new ModernDatabaseLogger();
module.exports = modernLogger;

// Also export the class for direct instantiation
module.exports.ModernDatabaseLogger = ModernDatabaseLogger;
