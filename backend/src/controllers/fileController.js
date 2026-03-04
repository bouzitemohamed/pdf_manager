const prisma = require('../config/db');
const { extractPagesFromBuffer } = require('../services/pdfService');
const { log, ACTIONS } = require('../services/auditService');
const { notifyAdmins } = require('../services/socketService');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    const { num_box } = req.body;
    const { pages, totalPages } = await extractPagesFromBuffer(req.file.buffer);

    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        num_box: num_box || null,
        page_count: totalPages,
        userId: req.user.id,
      },
    });

    await prisma.page.createMany({
      data: pages.map((p) => ({ content: p.content, order: p.order, fileId: file.id })),
    });

    // Audit + real-time notification to admins
    await log({ action: ACTIONS.FILE_UPLOAD, userId: req.user.id, fileId: file.id, detail: file.name });
    notifyAdmins('file:uploaded', {
      file: { id: file.id, name: file.name, page_count: totalPages },
      user: { id: req.user.id, email: req.user.email },
    });

    const result = await prisma.file.findUnique({
      where: { id: file.id },
      include: { pages: { orderBy: { order: 'asc' } } },
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error processing PDF', error: err.message });
  }
};

const getFiles = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { num_box: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit),
        select: { id: true, name: true, num_box: true, page_count: true, createdAt: true, updatedAt: true },
      }),
      prisma.file.count({ where }),
    ]);

    return res.json({ files, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const getFile = async (req, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { pages: { orderBy: { order: 'asc' } } },
    });
    if (!file) return res.status(404).json({ message: 'File not found' });
    await log({ action: ACTIONS.FILE_VIEW, userId: req.user.id, fileId: file.id, detail: file.name });
    return res.json(file);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await prisma.file.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!file) return res.status(404).json({ message: 'File not found' });
    await log({ action: ACTIONS.FILE_DELETE, userId: req.user.id, fileId: file.id, detail: file.name });
    await prisma.file.delete({ where: { id: file.id } });
    notifyAdmins('file:deleted', { fileId: file.id, fileName: file.name, user: { email: req.user.email } });
    return res.json({ message: 'File deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const searchContent = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query required' });
    const pages = await prisma.page.findMany({
      where: { content: { contains: q, mode: 'insensitive' }, file: { userId: req.user.id } },
      include: { file: { select: { id: true, name: true } } },
      take: 50,
    });
    return res.json(pages);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { uploadFile, getFiles, getFile, deleteFile, searchContent };
