const express = require('express');
const { createLogClient, LogClient } = require('../lib/logger');
const { promisePool } = require('../../../config/db');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Create centralized log client instance
const logClient = createLogClient(promisePool);

/**
 * POST /api/logger
 * Create a new log entry using centralized om_logging_db
 */
router.post('/', [
  // Validation middleware
  body('log_level').isIn(['INFO', 'WARN', 'ERROR', 'DEBUG', 'SUCCESS', 'WARNING', 'CRITICAL']).withMessage('Invalid log level'),
  body('source').optional().isLength({ max: 64 }).withMessage('Source too long'),
  body('origin').optional().isLength({ max: 64 }).withMessage('Origin too long'),
  body('message').isLength({ min: 1, max: 1000 }).withMessage('Message required and must be under 1000 chars'),
  body('details').optional().isLength({ max: 5000 }).withMessage('Details too long'),
  body('source_component').optional().isLength({ max: 128 }).withMessage('Source component too long'),
  body('session_id').optional().isLength({ max: 128 }).withMessage('Session ID too long'),
  body('user_agent').optional().isLength({ max: 500 }).withMessage('User agent too long')
], async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      log_level = 'INFO',
      source = 'unknown',
      origin = 'api',
      message,
      details,
      source_component,
      session_id,
      user_agent
    } = req.body;

    // Map legacy level names to standardized ones
    const levelMap = {
      'WARN': 'WARNING',
      'SUCCESS': 'INFO' // Map SUCCESS to INFO for now, could be separate if needed
    };
    const normalizedLevel = levelMap[log_level] || log_level;

    // Use centralized LogClient
    await logClient.log(normalizedLevel, message, {
      source,
      origin,
      component: source_component,
      userId: req.user?.id || null,
      sessionId: session_id,
      context: {
        details,
        user_agent,
        ip_address: req.ip,
        request_id: req.headers['x-request-id'],
        endpoint: req.originalUrl
      }
    });

    res.json({
      success: true,
      message: 'Log entry created successfully',
      data: {
        level: normalizedLevel,
        source,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Logger API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while logging',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/logger/error
 * Create error entries with deduplication using centralized error tracking
 */
router.post('/error', [
  body('type').isIn(['frontend', 'backend', 'nginx', 'db', 'api']).withMessage('Invalid error type'),
  body('source').isLength({ min: 1, max: 64 }).withMessage('Source required and max 64 chars'),
  body('message').isLength({ min: 1, max: 1000 }).withMessage('Message required and max 1000 chars'),
  body('severity').optional().isIn(['critical', 'high', 'medium', 'low']).withMessage('Invalid severity'),
  body('log_level').optional().isIn(['ERROR', 'WARN', 'INFO', 'DEBUG']).withMessage('Invalid log level'),
  body('source_component').optional().isLength({ max: 128 }).withMessage('Source component too long'),
  body('session_id').optional().isLength({ max: 128 }).withMessage('Session ID too long'),
  body('user_agent').optional().isLength({ max: 500 }).withMessage('User agent too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      type,
      source,
      message,
      severity = 'medium',
      log_level = 'ERROR',
      source_component,
      session_id,
      user_agent,
      additional_context
    } = req.body;

    // Create error hash for deduplication
    const hash = LogClient.createErrorHash(source, message, source_component);

    // Use centralized error capture
    const errorId = await logClient.captureError({
      hash,
      type,
      source,
      message,
      severity,
      logLevel: log_level,
      origin: 'api',
      component: source_component,
      userAgent: user_agent,
      sessionId: session_id,
      context: {
        additional_context,
        ip_address: req.ip,
        request_id: req.headers['x-request-id'],
        endpoint: req.originalUrl
      }
    });

    res.json({
      success: true,
      message: 'Error logged successfully',
      data: {
        error_id: errorId,
        hash,
        type,
        source,
        severity,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error logger API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while logging error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/logger/health
 * Check logging system health
 */
router.get('/health', async (req, res) => {
  try {
    // Test connection to om_logging_db
    const [logResult] = await promisePool.execute('SELECT COUNT(*) as count FROM om_logging_db.logs LIMIT 1');
    const [errorResult] = await promisePool.execute('SELECT COUNT(*) as count FROM om_logging_db.errors LIMIT 1');

    res.json({
      success: true,
      message: 'Logging system healthy',
      data: {
        database: 'om_logging_db',
        logs_accessible: true,
        errors_accessible: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Logger health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Logging system health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
