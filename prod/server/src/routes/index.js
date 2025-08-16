// server/src/routes/index.js
// Phase 9: Consolidated routes index for clean organization
// This file centralizes all route mounting to create clean route groups

const express = require('express');
const router = express.Router();

// Import middleware that might be needed globally
const { clientContext, clientContextCleanup } = require('../../middleware/clientContext');

// ========================================
// AUTHENTICATION ROUTES (No auth required)
// ========================================
const authRoutes = require('../../routes/auth');
router.use('/auth', authRoutes);

// ========================================
// CHURCH ROUTES (Church context required)
// ========================================
const churchesRouter = require('../../routes/churches');
const recordsRouter = require('../../routes/records');
const baptismRouter = require('../../routes/baptism');
const marriageRouter = require('../../routes/marriage');
const funeralRouter = require('../../routes/funeral');
const certificatesRouter = require('../../routes/certificates');
const baptismCertificatesRouter = require('../../routes/baptismCertificates');
const marriageCertificatesRouter = require('../../routes/marriageCertificates');
const funeralCertificatesRouter = require('../../routes/funeralCertificates');
const calendarRouter = require('../../routes/calendar');
const orthodoxCalendarRouter = require('../../routes/orthodoxCalendar');

router.use('/churches', churchesRouter);
router.use('/church-records', recordsRouter); 
router.use('/records/baptism', baptismRouter);
router.use('/records/marriage', marriageRouter);
router.use('/records/funeral', funeralRouter);
router.use('/certificates', certificatesRouter);
router.use('/certificates/baptism', baptismCertificatesRouter);
router.use('/certificates/marriage', marriageCertificatesRouter);
router.use('/certificates/funeral', funeralCertificatesRouter);
router.use('/calendar', calendarRouter);
router.use('/orthodox-calendar', orthodoxCalendarRouter);

// ========================================
// RECORD MANAGEMENT
// ========================================
const importRecordsRouter = require('../../routes/records-import');
const uniqueValuesRouter = require('../../routes/unique-values');
const dropdownOptionsRouter = require('../../routes/dropdownOptions');

router.use('/records/import', importRecordsRouter);
router.use('/records/unique-values', uniqueValuesRouter);
router.use('/records/dropdown-options', dropdownOptionsRouter);

// ========================================
// UPLOADS & MEDIA
// ========================================
const uploadsRouter = require('../../routes/uploads');
const uploadTokenRouter = require('../../routes/uploadToken');

router.use('/uploads', uploadsRouter);
router.use('/upload-token', uploadTokenRouter);

// ========================================
// TEMPLATES
// ========================================
const templatesRouter = require('../../routes/templates');
const globalTemplatesRouter = require('../../routes/globalTemplates');

router.use('/templates', templatesRouter);
router.use('/templates/global', globalTemplatesRouter);

// ========================================
// USER MANAGEMENT
// ========================================
const userRouter = require('../../routes/user');
const userProfileRouter = require('../../routes/user-profile');

router.use('/users', userRouter);
router.use('/user/profile', userProfileRouter);

// ========================================
// NOTIFICATIONS & MESSAGING
// ========================================
const { router: notificationRouter } = require('../../routes/notifications');

router.use('/notifications', notificationRouter);

// ========================================
// ADMIN ROUTES (Admin auth required)
// ========================================
const adminRoutes = require('../../routes/admin');
const adminSystemRouter = require('../../routes/adminSystem');
const churchAdminRouter = require('../../routes/admin/church');
const churchesManagementRouter = require('../../routes/admin/churches');
const usersRouter = require('../../routes/admin/users');
const activityLogsRouter = require('../../routes/admin/activity-logs');
const churchUsersRouter = require('../../routes/admin/church-users');
const churchDatabaseRouter = require('../../routes/admin/church-database');
const { router: logsRouter } = require('../../routes/logs');
const globalImagesRouter = require('../../routes/admin/globalImages');
const servicesRouter = require('../../routes/admin/services');
const componentsRouter = require('../../routes/admin/components');
const backupRouter = require('../../routes/admin/backups');
const nfsBackupRouter = require('../../routes/admin/nfs-backup');

// Group all admin routes under /admin
const adminGroup = express.Router();
adminGroup.use('/', adminRoutes); // Core admin functionality
adminGroup.use('/system', adminSystemRouter);
adminGroup.use('/church', churchAdminRouter);
adminGroup.use('/churches', churchesManagementRouter);
adminGroup.use('/users', usersRouter);
adminGroup.use('/activity-logs', activityLogsRouter);
adminGroup.use('/church-users', churchUsersRouter);
adminGroup.use('/church-database', churchDatabaseRouter);
adminGroup.use('/logs', logsRouter);
adminGroup.use('/global-images', globalImagesRouter);
adminGroup.use('/services', servicesRouter);
adminGroup.use('/components', componentsRouter);
adminGroup.use('/backups', backupRouter);
adminGroup.use('/nfs-backup', nfsBackupRouter);

router.use('/admin', adminGroup);

// ========================================
// BUSINESS & OPERATIONS
// ========================================
const dashboardRouter = require('../../routes/dashboard');
const invoicesRouter = require('../../routes/invoices');
const invoicesMultilingualRouter = require('../../routes/invoicesMultilingual');
const enhancedInvoicesRouter = require('../../routes/enhancedInvoices');
const billingRouter = require('../../routes/billing');
const provisionRouter = require('../../routes/provision');
const ecommerceRouter = require('../../routes/ecommerce');
const metricsRouter = require('../../routes/metrics');
const settingsRouter = require('../../routes/settings');

router.use('/dashboard', dashboardRouter);
router.use('/invoices', invoicesRouter);
router.use('/invoices/enhanced', enhancedInvoicesRouter);
router.use('/invoices/multilingual', invoicesMultilingualRouter);
router.use('/billing', billingRouter);
router.use('/provision', provisionRouter);
router.use('/ecommerce', ecommerceRouter);
router.use('/metrics', metricsRouter);
router.use('/settings', settingsRouter);

// ========================================
// CONTENT MANAGEMENT
// ========================================
const pagesRouter = require('../../routes/pages');
const blogsRouter = require('../../routes/blogs');
const menuManagementRoutes = require('../../routes/menuManagement');
const menuPermissionsRoutes = require('../../routes/menuPermissions');
const menuPermissionsApiRouter = require('../../routes/menuPermissionsApi');
const notesRoutes = require('../../routes/notes');

router.use('/pages', pagesRouter);
router.use('/blogs', blogsRouter);
router.use('/menu/management', menuManagementRoutes);
router.use('/menu/permissions', menuPermissionsRoutes);
router.use('/menu/permissions-api', menuPermissionsApiRouter);
router.use('/notes', notesRoutes);

// ========================================
// SOCIAL FEATURES
// ========================================
const socialBlogRouter = require('../../routes/social/blog');
const socialFriendsRouter = require('../../routes/social/friends');
const socialChatRouter = require('../../routes/social/chat');
const socialNotificationsRouter = require('../../routes/social/notifications');

const socialGroup = express.Router();
socialGroup.use('/blog', socialBlogRouter);
socialGroup.use('/friends', socialFriendsRouter);
socialGroup.use('/chat', socialChatRouter);
socialGroup.use('/notifications', socialNotificationsRouter);

router.use('/social', socialGroup);

// ========================================
// PROJECT MANAGEMENT
// ========================================
const kanbanRouter = require('../../routes/kanban');
const surveyRouter = require('../../routes/survey');

router.use('/kanban', kanbanRouter);
router.use('/survey', surveyRouter);

// ========================================
// DEVELOPMENT & TOOLS
// ========================================
const debugRoutes = require('../../routes/debug');
const loggerRouter = require('../../routes/logger');
const omaiLoggerRouter = require('../../routes/omaiLogger');
const githubIssuesRouter = require('../../routes/github-issues');
const jitTerminalRouter = require('../../routes/jit-terminal');
const backendDiagnosticsRouter = require('../../routes/backend_diagnostics');
const aiRouter = require('../../routes/ai');
const buildRouter = require('../../routes/build');
const runScriptRouter = require('../../routes/runScript');

const devGroup = express.Router();
devGroup.use('/debug', debugRoutes);
devGroup.use('/logger', loggerRouter);
devGroup.use('/omai-logger', omaiLoggerRouter);
devGroup.use('/github-issues', githubIssuesRouter);
devGroup.use('/jit', jitTerminalRouter);
devGroup.use('/diagnostics', backendDiagnosticsRouter);
devGroup.use('/ai', aiRouter);
devGroup.use('/build', buildRouter);
devGroup.use('/scripts', runScriptRouter);

router.use('/dev', devGroup);

// ========================================
// LEGACY & SPECIAL MODULES
// ========================================
const omaiRouter = require('../../routes/omai');
const omaiMemoriesRouter = require('../../routes/omai/memories');
const globalOmaiRouter = require('../../routes/globalOmai');
const ombRouter = require('../../routes/omb');
const bigBookRouter = require('../../routes/bigbook');
const originalBackupRouter = require('../../routes/backup');

const legacyGroup = express.Router();
legacyGroup.use('/omai', omaiRouter);
legacyGroup.use('/omai/memories', omaiMemoriesRouter);
legacyGroup.use('/omai/global', globalOmaiRouter);
legacyGroup.use('/omb', ombRouter);
legacyGroup.use('/bigbook', bigBookRouter);
legacyGroup.use('/backup-legacy', originalBackupRouter);

router.use('/legacy', legacyGroup);

// ========================================
// MULTI-TENANT CLIENT ROUTES
// ========================================
const clientApiRouter = require('../../routes/clientApi');

// Client routes with context middleware
router.use('/client/:clientSlug', clientContext, clientApiRouter, clientContextCleanup);

// ========================================
// UTILITY ENDPOINTS
// ========================================

// Dropdown options endpoint
router.get('/dropdown-options', (req, res) => {
  res.json({
    countries: ['United States', 'Canada', 'Greece', 'Romania', 'Russia'],
    states: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA'],
    languages: ['en', 'gr', 'ru', 'ro'],
    roles: ['admin', 'priest', 'supervisor', 'volunteer', 'viewer', 'church'],
    recordTypes: ['baptism', 'marriage', 'funeral']
  });
});

// App configuration endpoint
router.get('/config', (req, res) => {
  res.json({
    appName: 'OrthodoxMetrics',
    version: '1.0.0',
    supportedLanguages: ['en', 'gr', 'ru', 'ro'],
    features: {
      certificates: true,
      invoices: true,
      calendar: true,
      social: true,
      kanban: true
    }
  });
});

// Basic search endpoint
router.get('/search', (req, res) => {
  const { q, type } = req.query;
  
  // Placeholder for search functionality
  res.json({
    query: q,
    type: type,
    results: [],
    message: 'Search functionality to be implemented'
  });
});

module.exports = router;
