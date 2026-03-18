const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const { getServices, getService, createService, updateService, deleteService } = require('../controllers/serviceController');

router.get('/',      authenticate, getServices);
router.get('/:id',   authenticate, getService);
router.post('/',     requireAdmin, createService);
router.put('/:id',   requireAdmin, updateService);
router.delete('/:id',requireAdmin, deleteService);

module.exports = router;
