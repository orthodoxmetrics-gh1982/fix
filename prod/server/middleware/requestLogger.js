// Express Middleware for API Request Logging
// Replaces manual route logging with automatic database logging

const { info, error } = require('../src/utils/dbLogger');
const { v4: uuidv4 } = require('uuid');

function createRequestLogger(options = {}) {
  const {
    logRequests = true,
    logResponses = true,
    logErrors = true,
    logHeaders = false,
    logBody = false,
    skipRoutes = ['/health', '/api/health'],
    skipMethods = ['OPTIONS'],
    maxBodySize = 1024 // Max body size to log in bytes
  } = options;

  return (req, res, next) => {
    // Skip logging for certain routes
    if (skipRoutes.includes(req.path) || skipMethods.includes(req.method)) {
      return next();
    }

    // Generate unique request ID
    const requestId = uuidv4();
    req.requestId = requestId;

    // Extract user context
    const user = req.user || req.session?.user;
    const sessionId = req.sessionID || req.session?.id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const context = {
      requestId,
      sessionId,
      ipAddress,
      userAgent
    };

    // Log incoming request
    if (logRequests) {
      const requestMeta = {
        method: req.method,
        url: req.originalUrl,
        query: req.query,
        params: req.params
      };

      if (logHeaders) {
        requestMeta.headers = req.headers;
      }

      if (logBody && req.body && JSON.stringify(req.body).length <= maxBodySize) {
        // Don't log sensitive fields
        const bodyToLog = { ...req.body };
        delete bodyToLog.password;
        delete bodyToLog.token;
        delete bodyToLog.secret;
        requestMeta.body = bodyToLog;
      }

      info(
        'API Request',
        `${req.method} ${req.originalUrl}`,
        requestMeta,
        user,
        'express-api',
        context
      ).catch(err => console.error('Failed to log request:', err));
    }

    // Capture response details
    const startTime = Date.now();
    const originalSend = res.send;
    const originalJson = res.json;

    // Override res.send to capture response
    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      if (logResponses) {
        const responseMeta = {
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          contentLength: data ? data.length : 0
        };

        // Log response body for errors or if explicitly enabled
        if (res.statusCode >= 400 || (logBody && data && data.length <= maxBodySize)) {
          try {
            responseMeta.body = typeof data === 'string' ? JSON.parse(data) : data;
          } catch (e) {
            responseMeta.body = data;
          }
        }

        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
        const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;

        const logFunc = logLevel === 'warn' ? require('../utils/dbLogger').warn : info;
        logFunc(
          'API Response',
          logMessage,
          responseMeta,
          user,
          'express-api',
          context
        ).catch(err => console.error('Failed to log response:', err));
      }

      return originalSend.call(this, data);
    };

    // Override res.json to capture JSON responses
    res.json = function(data) {
      const duration = Date.now() - startTime;
      
      if (logResponses) {
        const responseMeta = {
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          dataType: 'json'
        };

        // Log response data for errors or if explicitly enabled
        if (res.statusCode >= 400 || logBody) {
          responseMeta.data = data;
        }

        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
        const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;

        const logFunc = logLevel === 'warn' ? require('../utils/dbLogger').warn : info;
        logFunc(
          'API Response',
          logMessage,
          responseMeta,
          user,
          'express-api',
          context
        ).catch(err => console.error('Failed to log response:', err));
      }

      return originalJson.call(this, data);
    };

    // Handle errors
    const originalNextError = next;
    next = function(err) {
      if (err && logErrors) {
        const duration = Date.now() - startTime;
        
        error(
          'API Error',
          `${req.method} ${req.originalUrl} - Error: ${err.message}`,
          {
            error: err.message,
            stack: err.stack,
            statusCode: err.statusCode || 500,
            duration: `${duration}ms`
          },
          user,
          'express-api',
          context
        ).catch(logErr => console.error('Failed to log error:', logErr));
      }
      
      return originalNextError(err);
    };

    next();
  };
}

// Pre-configured middleware instances
const requestLogger = createRequestLogger();

const detailedRequestLogger = createRequestLogger({
  logHeaders: true,
  logBody: true,
  maxBodySize: 2048
});

const minimalRequestLogger = createRequestLogger({
  logRequests: true,
  logResponses: false,
  logHeaders: false,
  logBody: false
});

module.exports = {
  createRequestLogger,
  requestLogger,
  detailedRequestLogger,
  minimalRequestLogger
};