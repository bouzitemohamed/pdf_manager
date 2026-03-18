const prisma = require('../config/db');

const ACTIONS = {
  LOGIN:            'LOGIN',
  LOGOUT:           'LOGOUT',
  REGISTER:         'REGISTER',
  FILE_UPLOAD:      'FILE_UPLOAD',
  FILE_DELETE:      'FILE_DELETE',
  FILE_VIEW:        'FILE_VIEW',
  FILE_EDIT:        'FILE_EDIT',
  FILE_DOWNLOAD:    'FILE_DOWNLOAD',
  FOLDER_CREATE:    'FOLDER_CREATE',
  FOLDER_DELETE:    'FOLDER_DELETE',
  BOX_CREATE:       'BOX_CREATE',
  BOX_DELETE:       'BOX_DELETE',
  SERVICE_CREATE:   'SERVICE_CREATE',
  SERVICE_DELETE:   'SERVICE_DELETE',
  USER_SUSPENDED:   'USER_SUSPENDED',
  USER_UNSUSPENDED: 'USER_UNSUSPENDED',
  USER_DELETED:     'USER_DELETED',
  IMPERSONATE:      'IMPERSONATE',
};

const log = async ({ action, userId, pdfFileId = null, detail = null }) => {
  try {
    await prisma.auditLog.create({
      data: { action, userId, pdfFileId: pdfFileId || null, detail },
    });
  } catch (err) {
    console.error('[AuditLog] Failed to write:', err.message);
  }
};

module.exports = { log, ACTIONS };
