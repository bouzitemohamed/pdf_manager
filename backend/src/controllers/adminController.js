const prisma = require('../config/db');
const { log, ACTIONS } = require('../services/auditService');
const { generateAccessToken } = require('../utils/jwt');

const getStats = async (req, res) => {
  try {
    const [totalUsers, totalFiles, totalPages, totalServices, totalBoxes, totalFolders, recentFiles, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.pdfFile.count(),
      prisma.page.count(),
      prisma.service.count(),
      prisma.box.count(),
      prisma.folder.count(),
      prisma.pdfFile.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: { select: { email: true } },
          folder: { include: { box: { include: { service: { select: { name: true } } } } } }
        }
      }),
      prisma.user.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, role: true, suspended: true, createdAt: true }
      })
    ]);
    return res.json({ totalUsers, totalFiles, totalPages, totalServices, totalBoxes, totalFolders, recentFiles, recentUsers });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = search ? { email: { contains: search, mode: 'insensitive' } } : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, role: true, suspended: true, createdAt: true, _count: { select: { pdfFiles: true } } }
      }),
      prisma.user.count({ where })
    ]);
    return res.json({ users, total, page: parseInt(page) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const getAllFiles = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { uploadedBy: { email: { contains: search, mode: 'insensitive' } } }
      ]
    } : {};
    const [files, total] = await Promise.all([
      prisma.pdfFile.findMany({
        where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: { select: { id: true, email: true } },
          folder: { include: { box: { include: { service: { select: { name: true, color: true } } } } } }
        }
      }),
      prisma.pdfFile.count({ where })
    ]);
    return res.json({ files, total, page: parseInt(page) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const getAuditLog = async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { ...(userId && { userId }), ...(action && { action }) };
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
          pdfFile: { select: { title: true } }
        }
      }),
      prisma.auditLog.count({ where })
    ]);
    return res.json({ logs, total, page: parseInt(page) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ message: 'Cannot suspend yourself' });
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.role === 'ADMIN') return res.status(400).json({ message: 'Cannot suspend another admin' });
    const updated = await prisma.user.update({ where: { id }, data: { suspended: true, refreshTokens: [] }, select: { id: true, email: true, suspended: true } });
    await log({ action: ACTIONS.USER_SUSPENDED, userId: req.user.id, detail: `Suspended: ${target.email}` });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const unsuspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.user.update({ where: { id }, data: { suspended: false }, select: { id: true, email: true, suspended: true } });
    await log({ action: ACTIONS.USER_UNSUSPENDED, userId: req.user.id, detail: `Unsuspended: ${updated.email}` });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ message: 'Cannot delete yourself' });
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.role === 'ADMIN') return res.status(400).json({ message: 'Cannot delete another admin' });
    await prisma.auditLog.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    await log({ action: ACTIONS.USER_DELETED, userId: req.user.id, detail: `Deleted: ${target.email}` });
    return res.json({ message: 'User deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const impersonateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ message: 'Cannot impersonate yourself' });
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.role === 'ADMIN') return res.status(400).json({ message: 'Cannot impersonate another admin' });
    const impersonationToken = generateAccessToken(target.id, '5m');
    await log({ action: ACTIONS.IMPERSONATE, userId: req.user.id, detail: `${req.user.email} → ${target.email}` });
    return res.json({ accessToken: impersonationToken, impersonating: { id: target.id, email: target.email } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await prisma.pdfFile.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ message: 'File not found' });
    await log({ action: ACTIONS.FILE_DELETE, userId: req.user.id, pdfFileId: file.id, detail: `Admin deleted: ${file.title}` });
    await prisma.pdfFile.delete({ where: { id: file.id } });
    return res.json({ message: 'File deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStats, getUsers, getAllFiles, getAuditLog, suspendUser, unsuspendUser, deleteUser, impersonateUser, deleteFile };
