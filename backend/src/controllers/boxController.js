const prisma = require('../config/db');
const { log, ACTIONS } = require('../services/auditService');

// GET all boxes (optionally filtered by serviceId)
const getBoxes = async (req, res) => {
  try {
    const { serviceId } = req.query;
    const boxes = await prisma.box.findMany({
      where: serviceId ? { serviceId } : {},
      orderBy: { name: 'asc' },
      include: {
        service: { select: { id: true, name: true, color: true } },
        _count: { select: { folders: true } }
      }
    });
    return res.json(boxes);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET single box with folders
const getBox = async (req, res) => {
  try {
    const box = await prisma.box.findUnique({
      where: { id: req.params.id },
      include: {
        service: { select: { id: true, name: true, color: true } },
        folders: {
          include: {
            createdBy: { select: { email: true } },
            _count: { select: { pdfFiles: true } }
          },
          orderBy: { name: 'asc' }
        }
      }
    });
    if (!box) return res.status(404).json({ message: 'Box not found' });
    return res.json(box);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST create box (admin only)
const createBox = async (req, res) => {
  try {
    const { name, description, serviceId } = req.body;
    if (!name || !serviceId) return res.status(400).json({ message: 'Name and serviceId required' });

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const box = await prisma.box.create({
      data: { name, description, serviceId },
      include: { service: { select: { id: true, name: true, color: true } } }
    });

    await log({ action: ACTIONS.BOX_CREATE, userId: req.user.id, detail: `${service.name} / ${name}` });
    return res.status(201).json(box);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Box name already exists in this service' });
    return res.status(500).json({ message: 'Server error' });
  }
};

// PUT update box (admin only)
const updateBox = async (req, res) => {
  try {
    const { name, description } = req.body;
    const box = await prisma.box.update({
      where: { id: req.params.id },
      data: { name, description },
      include: { service: { select: { id: true, name: true, color: true } } }
    });
    return res.json(box);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE box (admin only)
const deleteBox = async (req, res) => {
  try {
    const box = await prisma.box.findUnique({
      where: { id: req.params.id },
      include: { service: true }
    });
    if (!box) return res.status(404).json({ message: 'Box not found' });

    await log({ action: ACTIONS.BOX_DELETE, userId: req.user.id, detail: `${box.service.name} / ${box.name}` });
    await prisma.box.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Box deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getBoxes, getBox, createBox, updateBox, deleteBox };
