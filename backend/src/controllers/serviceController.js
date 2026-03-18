const prisma = require('../config/db');
const { log, ACTIONS } = require('../services/auditService');

// GET all services (with box count)
const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { boxes: true } },
        boxes: {
          include: { _count: { select: { folders: true } } }
        }
      },
    });
    return res.json(services);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET single service with boxes and folders
const getService = async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        boxes: {
          include: {
            folders: {
              include: { _count: { select: { pdfFiles: true } } }
            },
            _count: { select: { folders: true } }
          },
          orderBy: { name: 'asc' }
        }
      }
    });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    return res.json(service);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST create service (admin only)
const createService = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const existing = await prisma.service.findUnique({ where: { name } });
    if (existing) return res.status(409).json({ message: 'Service already exists' });

    const service = await prisma.service.create({
      data: { name, description, color: color || '#f59e0b' }
    });

    await log({ action: ACTIONS.SERVICE_CREATE, userId: req.user.id, detail: name });
    return res.status(201).json(service);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// PUT update service (admin only)
const updateService = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: { name, description, color }
    });
    return res.json(service);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE service (admin only)
const deleteService = async (req, res) => {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) return res.status(404).json({ message: 'Service not found' });

    await log({ action: ACTIONS.SERVICE_DELETE, userId: req.user.id, detail: service.name });
    await prisma.service.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Service deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getServices, getService, createService, updateService, deleteService };
