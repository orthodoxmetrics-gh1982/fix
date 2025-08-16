import mysql from 'mysql2/promise';
import crypto from 'crypto';

type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
type ErrorType = 'frontend' | 'backend' | 'nginx' | 'db' | 'api';

export interface LogOptions {
  source?: string;
  origin?: string;
  component?: string;
  userId?: number | null;
  sessionId?: string | null;
  context?: any;
  errorId?: number | null;
}

export interface ErrorCaptureParams {
  hash: string;
  type: ErrorType;
  source: string;
  message: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  logLevel?: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'SUCCESS';
  origin?: string;
  component?: string;
  userAgent?: string | null;
  sessionId?: string | null;
  context?: any;
}

/**
 * Centralized logging client for the unified om_logging_db
 * Replaces direct SQL writes to legacy log tables
 */
export class LogClient {
  constructor(private pool: mysql.Pool) {}

  /**
   * Log a message to the unified logs table
   */
  async log(level: LogLevel, message: string, opts: LogOptions = {}): Promise<void> {
    try {
      await this.pool.execute(
        `INSERT INTO om_logging_db.logs
         (level, message, source, origin, component, user_id, session_id, context, timestamp, error_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [
          level,
          message,
          opts.source ?? null,
          opts.origin ?? null,
          opts.component ?? null,
          opts.userId ?? null,
          opts.sessionId ?? null,
          opts.context ? JSON.stringify(opts.context) : null,
          opts.errorId ?? null
        ]
      );
    } catch (error) {
      // Fallback to console.error if database logging fails
      console.error('LogClient.log failed:', error, { level, message, opts });
    }
  }

  /**
   * Capture an error with deduplication and event tracking
   */
  async captureError(params: ErrorCaptureParams): Promise<number | null> {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      
      // Insert or update the error record with deduplication
      await conn.execute(
        `INSERT INTO om_logging_db.errors
         (hash, type, source, message, first_seen, last_seen, occurrences, status, severity, log_level, origin, source_component)
         VALUES (?, ?, ?, ?, NOW(), NOW(), 1, 'pending', ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           id = LAST_INSERT_ID(id),
           last_seen = VALUES(last_seen),
           occurrences = occurrences + 1`,
        [
          params.hash,
          params.type,
          params.source,
          params.message,
          params.severity ?? 'medium',
          params.logLevel ?? 'ERROR',
          params.origin ?? null,
          params.component ?? null
        ]
      );

      // Get the error ID
      const [[{ id }]]: any = await conn.query('SELECT LAST_INSERT_ID() AS id');

      // Insert the error event
      await conn.execute(
        `INSERT INTO om_logging_db.error_events
         (error_id, occurred_at, user_agent, session_id, additional_context)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id,
          new Date(),
          params.userAgent ?? null,
          params.sessionId ?? null,
          params.context ? JSON.stringify(params.context) : null
        ]
      );

      await conn.commit();
      return id;
    } catch (error) {
      await conn.rollback();
      console.error('LogClient.captureError failed:', error, params);
      return null;
    } finally {
      conn.release();
    }
  }

  /**
   * Convenience methods for common log levels
   */
  async debug(message: string, opts?: LogOptions): Promise<void> {
    return this.log('DEBUG', message, opts);
  }

  async info(message: string, opts?: LogOptions): Promise<void> {
    return this.log('INFO', message, opts);
  }

  async warn(message: string, opts?: LogOptions): Promise<void> {
    return this.log('WARNING', message, opts);
  }

  async error(message: string, opts?: LogOptions): Promise<void> {
    return this.log('ERROR', message, opts);
  }

  async critical(message: string, opts?: LogOptions): Promise<void> {
    return this.log('CRITICAL', message, opts);
  }

  /**
   * Helper method to create error hash for deduplication
   */
  static createErrorHash(source: string, message: string, component?: string): string {
    const hashContent = `${source}:${component || 'unknown'}:${message}`;
    return crypto.createHash('sha256').update(hashContent).digest('hex').substring(0, 16);
  }
}

/**
 * Factory function to create a LogClient instance
 */
export function createLogClient(pool: mysql.Pool): LogClient {
  return new LogClient(pool);
}
