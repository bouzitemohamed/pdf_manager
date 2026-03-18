const prisma = require('../config/db');
const path = require('path');
const fs = require('fs');
const { extractPagesFromBuffer } = require('../services/pdfService');
const { log, ACTIONS } = require('../services/auditService');
const { notifyAdmins } = require('../services/socketService');

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ── Upload PDF ────────────────────────────────────────────────────────────────
const uploadPdfFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    const { title, folderId, dateCreated } = req.body;
    if (!title || !folderId) return res.status(400).json({ message: 'Title and folderId required' });

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { box: { include: { service: true } } }
    });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    // 1. Extract text pages from buffer
    const { pages, totalPages } = await extractPagesFromBuffer(req.file.buffer);

    // 2. Save binary to disk
    const uniqueName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);
    fs.writeFileSync(filePath, req.file.buffer);

    // 3. Create PdfFile record
    const pdfFile = await prisma.pdfFile.create({
      data: {
        title,
        dateCreated: dateCreated ? new Date(dateCreated) : new Date(),
        folderId,
        uploadedById: req.user.id,
        pageCount: totalPages,
        filePath: uniqueName,    // store only the filename, not full path
        fileName: req.file.originalname,
        fileSize: req.file.size,
      }
    });

    // 4. Save extracted pages
    if (pages.length > 0) {
      await prisma.page.createMany({
        data: pages.map(p => ({
          content: p.content,
          order: p.order,
          pdfFileId: pdfFile.id
        }))
      });
    }

    // 5. Audit + notify admins
    await log({
      action: ACTIONS.FILE_UPLOAD,
      userId: req.user.id,
      pdfFileId: pdfFile.id,
      detail: `${folder.box.service.name} / ${folder.box.name} / ${folder.name} / ${title}`
    });

    notifyAdmins('file:uploaded', {
      file: { id: pdfFile.id, title, pageCount: totalPages, fileName: req.file.originalname },
      user: { id: req.user.id, email: req.user.email },
      location: `${folder.box.service.name} > ${folder.box.name} > ${folder.name}`
    });

    // Return with relations
    const result = await prisma.pdfFile.findUnique({
      where: { id: pdfFile.id },
      include: {
        folder: { include: { box: { include: { service: true } } } },
        uploadedBy: { select: { email: true } },
        pages: { orderBy: { order: 'asc' } }
      }
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error processing PDF', error: err.message });
  }
};

// ── Get files (with optional folderId filter) ─────────────────────────────────
const getPdfFiles = async (req, res) => {
  try {
    const { folderId, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(folderId && { folderId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { fileName: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [files, total] = await Promise.all([
      prisma.pdfFile.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          folder: { include: { box: { include: { service: { select: { id: true, name: true, color: true } } } } } },
          uploadedBy: { select: { email: true } },
          _count: { select: { pages: true } }
        }
      }),
      prisma.pdfFile.count({ where })
    ]);

    return res.json({ files, total, page: parseInt(page) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// ── Get single file with pages ────────────────────────────────────────────────
const getPdfFile = async (req, res) => {
  try {
    const file = await prisma.pdfFile.findUnique({
      where: { id: req.params.id },
      include: {
        folder: { include: { box: { include: { service: true } } } },
        uploadedBy: { select: { email: true } },
        pages: { orderBy: { order: 'asc' } }
      }
    });
    if (!file) return res.status(404).json({ message: 'File not found' });

    await log({ action: ACTIONS.FILE_VIEW, userId: req.user.id, pdfFileId: file.id, detail: file.title });
    return res.json(file);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// ── Edit file (title, dateCreated, page content, replace PDF) ─────────────────
const updatePdfFile = async (req, res) => {
  try {
    const file = await prisma.pdfFile.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ message: 'File not found' });

    if (file.uploadedById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, dateCreated, pages } = req.body;

    // If a new PDF is uploaded, replace the binary and re-extract text
    let updateData = {
      ...(title && { title }),
      ...(dateCreated && { dateCreated: new Date(dateCreated) })
    };

    if (req.file) {
      // Delete old file from disk
      if (file.filePath) {
        const oldPath = path.join(UPLOADS_DIR, file.filePath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // Save new file
      const uniqueName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
      const newFilePath = path.join(UPLOADS_DIR, uniqueName);
      fs.writeFileSync(newFilePath, req.file.buffer);

      // Re-extract pages
      const { pages: newPages, totalPages } = await extractPagesFromBuffer(req.file.buffer);

      updateData = {
        ...updateData,
        filePath: uniqueName,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        pageCount: totalPages
      };

      // Delete old pages and insert new ones
      await prisma.page.deleteMany({ where: { pdfFileId: file.id } });
      if (newPages.length > 0) {
        await prisma.page.createMany({
          data: newPages.map(p => ({ content: p.content, order: p.order, pdfFileId: file.id }))
        });
      }
    }

    // If user edited text content of specific pages
    if (pages && Array.isArray(pages) && !req.file) {
      for (const p of pages) {
        await prisma.page.updateMany({
          where: { pdfFileId: file.id, order: p.order },
          data: { content: p.content }
        });
      }
    }

    const updated = await prisma.pdfFile.update({
      where: { id: file.id },
      data: updateData,
      include: {
        folder: { include: { box: { include: { service: true } } } },
        uploadedBy: { select: { email: true } },
        pages: { orderBy: { order: 'asc' } }
      }
    });

    await log({ action: ACTIONS.FILE_EDIT, userId: req.user.id, pdfFileId: file.id, detail: title || file.title });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ── Download original PDF ─────────────────────────────────────────────────────
const downloadPdfFile = async (req, res) => {
  try {
    const file = await prisma.pdfFile.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (!file.filePath) return res.status(404).json({ message: 'No binary file stored' });

    const fullPath = path.join(UPLOADS_DIR, file.filePath);
    if (!fs.existsSync(fullPath)) return res.status(404).json({ message: 'File not found on disk' });

    await log({ action: ACTIONS.FILE_DOWNLOAD, userId: req.user.id, pdfFileId: file.id, detail: file.title });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    return res.sendFile(fullPath);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// ── View PDF inline (stream) ──────────────────────────────────────────────────
const viewPdfFile = async (req, res) => {
  try {
    const file = await prisma.pdfFile.findUnique({ where: { id: req.params.id } });
    if (!file || !file.filePath) return res.status(404).json({ message: 'File not found' });

    const fullPath = path.join(UPLOADS_DIR, file.filePath);
    if (!fs.existsSync(fullPath)) return res.status(404).json({ message: 'File not found on disk' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
    return res.sendFile(fullPath);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// ── Delete PDF ────────────────────────────────────────────────────────────────
const deletePdfFile = async (req, res) => {
  try {
    const file = await prisma.pdfFile.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ message: 'File not found' });

    if (file.uploadedById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete from disk
    if (file.filePath) {
      const fullPath = path.join(UPLOADS_DIR, file.filePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await log({ action: ACTIONS.FILE_DELETE, userId: req.user.id, pdfFileId: file.id, detail: file.title });
    await prisma.pdfFile.delete({ where: { id: file.id } });

    notifyAdmins('file:deleted', { fileId: file.id, title: file.title, user: { email: req.user.email } });
    return res.json({ message: 'File deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// ── My files (current user) ───────────────────────────────────────────────────
const getMyFiles = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      uploadedById: req.user.id,
      ...(search && { title: { contains: search, mode: 'insensitive' } })
    };

    const [files, total] = await Promise.all([
      prisma.pdfFile.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          folder: { include: { box: { include: { service: { select: { id: true, name: true, color: true } } } } } },
          _count: { select: { pages: true } }
        }
      }),
      prisma.pdfFile.count({ where })
    ]);

    return res.json({ files, total, page: parseInt(page) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// ── Recent activity (last 20 files across all users) ─────────────────────────
const getRecentFiles = async (req, res) => {
  try {
    const files = await prisma.pdfFile.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        folder: { include: { box: { include: { service: { select: { id: true, name: true, color: true } } } } } },
        uploadedBy: { select: { email: true } },
        _count: { select: { pages: true } }
      }
    });
    return res.json(files);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// ── Global search ─────────────────────────────────────────────────────────────
const searchFiles = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query required' });

    const [files, pages] = await Promise.all([
      prisma.pdfFile.findMany({
        where: { title: { contains: q, mode: 'insensitive' } },
        take: 10,
        include: {
          folder: { include: { box: { include: { service: { select: { id: true, name: true, color: true } } } } } },
          uploadedBy: { select: { email: true } }
        }
      }),
      prisma.page.findMany({
        where: { content: { contains: q, mode: 'insensitive' } },
        take: 20,
        include: {
          pdfFile: {
            include: {
              folder: { include: { box: { include: { service: { select: { id: true, name: true, color: true } } } } } }
            }
          }
        }
      })
    ]);

    return res.json({ files, pages, query: q });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadPdfFile, getPdfFiles, getPdfFile, updatePdfFile,
  downloadPdfFile, viewPdfFile, deletePdfFile,
  getMyFiles, getRecentFiles, searchFiles
};
