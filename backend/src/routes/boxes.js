const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const { getBoxes, getBox, createBox, updateBox, deleteBox } = require('../controllers/boxController');

router.get('/',      authenticate, getBoxes);
router.get('/:id',   authenticate, getBox);
router.post('/',     requireAdmin, createBox);
router.put('/:id',   requireAdmin, updateBox);
router.delete('/:id',requireAdmin, deleteBox);

module.exports = router;
