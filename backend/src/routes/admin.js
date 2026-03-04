const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');
const {
  getStats, getUsers, getAllFiles, getAuditLog,
  suspendUser, unsuspendUser, deleteUser, impersonateUser, deleteFile,
} = require('../controllers/adminController');

// All routes below require a valid JWT + ADMIN role
router.use(requireAdmin);

// Dashboard
router.get('/stats', getStats);

// Users
router.get('/users', getUsers);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/unsuspend', unsuspendUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/impersonate', impersonateUser);

// Files
router.get('/files', getAllFiles);
router.delete('/files/:id', deleteFile);

// Audit log
router.get('/audit', getAuditLog);

module.exports = router;
