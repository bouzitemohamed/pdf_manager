const prisma = require('../config/db');
const { log, ACTIONS } = require('../services/auditService');

// GET folders (optionally by boxId)
const getFolders = async (req, res) => {
  try {
    const { boxId } = req.query;
    const folders = await prisma.folder.findMany({
      where: boxId ? { boxId } : {},
      orderBy: { name: 'asc' },
      include: {
        box: {
          include: { service: { select: { id: true, name: true, color: true } } }
        },
        createdBy: { select: { email: true } },
        _count: { select: { pdfFiles: true } }
      }
    });
    return res.json(folders);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET single folder with files
const getFolder = async (req, res) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: req.params.id },
      include: {
        box: {
          include: { service: { select: { id: true, name: true, color: true } } }
        },
        createdBy: { select: { email: true } },
        pdfFiles: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploadedBy: { select: { email: true } },
            _count: { select: { pages: true } }
          }
        }
      }
    });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });
    return res.json(folder);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST create folder (admin or user)
const createFolder = async (req, res) => {
  try {
    const { name, description, boxId } = req.body;
    if (!name || !boxId) return res.status(400).json({ message: 'Name and boxId required' });

    const box = await prisma.box.findUnique({
      where: { id: boxId },
      include: { service: true }
    });
    if (!box) return res.status(404).json({ message: 'Box not found' });

    const folder = await prisma.folder.create({
      data: { name, description, boxId, createdById: req.user.id },
      include: {
        box: { include: { service: { select: { id: true, name: true, color: true } } } },
        createdBy: { select: { email: true } },
        _count: { select: { pdfFiles: true } }
      }
    });

    await log({
      action: ACTIONS.FOLDER_CREATE,
      userId: req.user.id,
      detail: `${box.service.name} / ${box.name} / ${name}`
    });

    return res.status(201).json(folder);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Folder name already exists in this box' });
    return res.status(500).json({ message: 'Server error' });
  }
};

// PUT update folder
const updateFolder = async (req, res) => {
  try {
    const { name, description } = req.body;
    const folder = await prisma.folder.findUnique({ where: { id: req.params.id } });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    // Only creator or admin can update
    if (folder.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await prisma.folder.update({
      where: { id: req.params.id },
      data: { name, description }
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE folder
const deleteFolder = async (req, res) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: req.params.id },
      include: { box: { include: { service: true } } }
    });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    if (folder.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await log({
      action: ACTIONS.FOLDER_DELETE,
      userId: req.user.id,
      detail: `${folder.box.service.name} / ${folder.box.name} / ${folder.name}`
    });

    await prisma.folder.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Folder deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getFolders, getFolder, createFolder, updateFolder, deleteFolder };
