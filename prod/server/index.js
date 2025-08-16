// ?? backend/server/index.js
require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');

// 🔧 FIXED: Use the updated session configuration  
const sessionMiddleware = require('./config/session');
const db = require('./config/db');
const { requestLogger, errorLogger } = require('./middleware/logger');
const { requestLogger: dbRequestLogger } = require('./middleware/requestLogger');
// Import client context middleware for multi-tenant support
const { clientContext, clientContextCleanup } = require('./middleware/clientContext');

// --- API ROUTES (CONSOLIDATED) --------------------------------------
// Import consolidated routes from Phase 9 refactor
const consolidatedRoutes = require('./src/routes/index');

// Mount all API routes under /api prefix
app.use('/api', consolidatedRoutes);

// --- 404 HANDLER ----------------------------------------------------
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- STATIC FRONTEND ------------------------------------------------
app.use('/uploads', express.static(path.resolve(__dirname, '../misc/public/uploads')));
app.use('/assets', express.static(path.resolve(__dirname, '../src/assets')));

// Serve dynamic addon components (development & production paths)
const addonsPath = process.env.NODE_ENV === 'production' 
  ? '/var/www/orthodoxmetrics/addons' 
  : path.resolve(__dirname, '../misc/public/addons');
app.use('/addons', express.static(addonsPath));

// Explicit route for manifest.json to fix 403 errors
app.get('/manifest.json', (req, res) => {
  const manifestPath = path.resolve(__dirname, '../front-end/dist/manifest.json');
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(manifestPath);
});

// Explicit route for build.meta.json to fix 403 errors
app.get('/build.meta.json', (req, res) => {
  // Try multiple locations for build.meta.json
  const locations = [
    path.resolve(__dirname, '../front-end/dist/build.meta.json'),
    path.resolve(__dirname, '../front-end/build.meta.json'),
    path.resolve(__dirname, '../front-end/public/build.meta.json')
  ];
  
  for (const buildMetaPath of locations) {
    if (fs.existsSync(buildMetaPath)) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.sendFile(buildMetaPath);
    }
  }
  
  // If file doesn't exist in any location, return a default response
  res.json({
    buildTime: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from the React app build directory
app.use(express.static(path.resolve(__dirname, '../front-end/dist')));

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.resolve(__dirname, '../front-end/dist/index.html');
  res.sendFile(indexPath);
});

// --- EMAIL QUEUE PROCESSING ------------------------------------------
const { notificationService } = require('./routes/notifications');
const cron = require('node-cron');

// Process email queue every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const processedCount = await notificationService.processEmailQueue();
    if (processedCount > 0) {
      console.log(`Processed ${processedCount} emails from notification queue`);
    }
  } catch (error) {
    console.error('Error processing email queue:', error);
  }
});

console.log('Email queue processor started (runs every 5 minutes)');



// --- WEBSOCKET INTEGRATION -----------------------------------------
const websocketService = require('./services/websocketService');

// Initialize JIT WebSocket
if (jitTerminalRouter.setupJITWebSocket) {
  const jitWebSocket = jitTerminalRouter.setupJITWebSocket(server);
  console.log('🔌 JIT Terminal WebSocket initialized');
}

// Initialize OMAI Logger WebSocket
const WebSocket = require('ws');
const omaiLoggerWss = new WebSocket.Server({
  server,
  path: '/ws/omai-logger'
});

omaiLoggerWss.on('connection', (ws, req) => {
  console.log('🔌 OMAI Logger WebSocket connected');
  
  // Store the WebSocket connection for broadcasting
  if (omaiLoggerRouter.ws) {
    omaiLoggerRouter.ws(ws);
  }
  
  ws.on('error', (error) => {
    console.error('❌ OMAI Logger WebSocket error:', error);
  });
  
  ws.on('close', () => {
    console.log('🔌 OMAI Logger WebSocket disconnected');
  });
});

console.log('🔌 OMAI Logger WebSocket initialized on /ws/omai-logger');

// --- START SERVER ---------------------------------------------------
server.listen(PORT, HOST, () => {
  const nodeEnv = process.env.NODE_ENV || 'production';
  console.log(`🚀 Server running in ${nodeEnv.toUpperCase()} mode at http://${HOST}:${PORT}`);
  if (nodeEnv === 'production') {
    console.log('📋 Development mode: Enhanced logging and verbose output enabled');
  } else if (nodeEnv === 'production') {
    console.log('🔧 Production mode: Optimized for performance and reduced logging');
  }
  
  // Initialize WebSocket service after server starts
  websocketService.initialize(server, sessionMiddleware);
  console.log('🔌 WebSocket service initialized');
});

app.get('/api/auth/check', (req,res)=>{
  const u = req.session && req.session.user;
  if (u) return res.json({ authenticated: true, user: u });
  res.status(401).json({ authenticated: false, message: 'Not authenticated' });
});

app.get('/api/user/profile', (req,res)=>{
  const u = req.session && req.session.user;
  if (u) return res.json(u);
  res.status(404).json({ error: 'Not found' });
});
