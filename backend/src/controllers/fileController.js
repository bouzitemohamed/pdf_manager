const prisma = require('../config/db');
const { extractPagesFromBuffer } = require('../services/pdfService');

// ─── Upload PDF ───────────────────────────────────────────────────────────────
const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    const { num_box } = req.body;
    const buffer = req.file.buffer;
    const originalName = req.file.originalname;

    // Extract pages
    const { pages, totalPages } = await extractPagesFromBuffer(buffer);

    // Save file record
    const file = await prisma.file.create({
      data: {
        name: originalName,
        num_box: num_box || null,
        page_count: totalPages,
        userId: req.user.id,
      },
    });

    // Bulk insert pages
    await prisma.page.createMany({
      data: pages.map((p) => ({
        content: p.content,
        order: p.order,
        fileId: file.id,
      })),
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

// ─── Get All Files ────────────────────────────────────────────────────────────
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
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          num_box: true,
          page_count: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { pages: true } },
        },
      }),
      prisma.file.count({ where }),
    ]);

    return res.json({ files, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── Get Single File with Pages ───────────────────────────────────────────────
const getFile = async (req, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { pages: { orderBy: { order: 'asc' } } },
    });

    if (!file) return res.status(404).json({ message: 'File not found' });
    return res.json(file);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── Delete File ──────────────────────────────────────────────────────────────
const deleteFile = async (req, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!file) return res.status(404).json({ message: 'File not found' });

    await prisma.file.delete({ where: { id: file.id } }); // pages cascade-deleted
    return res.json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── Search Page Content ──────────────────────────────────────────────────────
const searchContent = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query required' });

    const pages = await prisma.page.findMany({
      where: {
        content: { contains: q, mode: 'insensitive' },
        file: { userId: req.user.id },
      },
      include: { file: { select: { id: true, name: true } } },
      take: 50,
    });

    return res.json(pages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { uploadFile, getFiles, getFile, deleteFile, searchContent };
