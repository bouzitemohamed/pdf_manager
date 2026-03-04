const prisma = require('../config/db');
const { log, ACTIONS } = require('../services/auditService');
const { generateAccessToken } = require('../utils/jwt');

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalFiles, totalPages, recentFiles, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.file.count(),
      prisma.page.count(),
      prisma.file.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, role: true, suspended: true, createdAt: true },
      }),
    ]);

    return res.json({ totalUsers, totalFiles, totalPages, recentFiles, recentUsers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── All Users ────────────────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search
      ? { email: { contains: search, mode: 'insensitive' } }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, role: true,
          suspended: true, createdAt: true,
          _count: { select: { files: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({ users, total, page: parseInt(page) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── All Files ────────────────────────────────────────────────────────────────
const getAllFiles = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true } } },
      }),
      prisma.file.count({ where }),
    ]);

    return res.json({ files, total, page: parseInt(page) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── Audit Log ────────────────────────────────────────────────────────────────
const getAuditLog = async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(userId && { userId }),
      ...(action && { action }),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
          file: { select: { name: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return res.json({ logs, total, page: parseInt(page) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── Suspend User ─────────────────────────────────────────────────────────────
const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot suspend your own account' });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.role === 'ADMIN') {
      return res.status(400).json({ message: 'Cannot suspend another admin' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        suspended: true,
        refreshTokens: [], // invalidate all sessions immediately
      },
      select: { id: true, email: true, suspended: true },
    });

    await log({ action: ACTIONS.USER_SUSPENDED, userId: req.user.id, detail: `Suspended user: ${target.email}` });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── Unsuspend User ───────────────────────────────────────────────────────────
const unsuspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.user.update({
      where: { id },
      data: { suspended: false },
      select: { id: true, email: true, suspended: true },
    });

    await log({ action: ACTIONS.USER_UNSUSPENDED, userId: req.user.id, detail: `Unsuspended user: ${updated.email}` });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── Delete User ──────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.role === 'ADMIN') {
      return res.status(400).json({ message: 'Cannot delete another admin' });
    }

    // Delete audit logs referencing this user first
    await prisma.auditLog.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    await log({ action: ACTIONS.USER_DELETED, userId: req.user.id, detail: `Deleted user: ${target.email}` });

    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── Impersonate User ─────────────────────────────────────────────────────────
const impersonateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot impersonate yourself' });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.role === 'ADMIN') {
      return res.status(400).json({ message: 'Cannot impersonate another admin' });
    }

    // Generate a short-lived impersonation token (5 min)
    const impersonationToken = generateAccessToken(target.id, '5m');

    await log({
      action: ACTIONS.IMPERSONATE,
      userId: req.user.id,
      detail: `Admin ${req.user.email} impersonated ${target.email}`,
    });

    return res.json({
      accessToken: impersonationToken,
      impersonating: { id: target.id, email: target.email },
      message: 'Impersonation token valid for 5 minutes',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── Admin Delete Any File ────────────────────────────────────────────────────
const deleteFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ message: 'File not found' });

    await log({ action: ACTIONS.FILE_DELETE, userId: req.user.id, fileId: file.id, detail: `Admin deleted: ${file.name}` });
    await prisma.file.delete({ where: { id: file.id } });

    return res.json({ message: 'File deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStats, getUsers, getAllFiles, getAuditLog,
  suspendUser, unsuspendUser, deleteUser, impersonateUser, deleteFile,
};
