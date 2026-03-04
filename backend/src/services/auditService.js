const prisma = require('../config/db');

// Action constants — use these everywhere for consistency
const ACTIONS = {
  LOGIN:           'LOGIN',
  LOGOUT:          'LOGOUT',
  REGISTER:        'REGISTER',
  FILE_UPLOAD:     'FILE_UPLOAD',
  FILE_DELETE:     'FILE_DELETE',
  FILE_VIEW:       'FILE_VIEW',
  USER_SUSPENDED:  'USER_SUSPENDED',
  USER_UNSUSPENDED:'USER_UNSUSPENDED',
  USER_DELETED:    'USER_DELETED',
  IMPERSONATE:     'IMPERSONATE',
};

/**
 * Record an audit event. Never throws — audit failures should not break the app.
 */
const log = async ({ action, userId, fileId = null, detail = null }) => {
  try {
    await prisma.auditLog.create({
      data: { action, userId, fileId: fileId || null, detail },
    });
  } catch (err) {
    console.error('[AuditLog] Failed to write:', err.message);
  }
};

module.exports = { log, ACTIONS };
