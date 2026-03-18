const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getFolders, getFolder, createFolder, updateFolder, deleteFolder } = require('../controllers/folderController');

router.get('/',       authenticate, getFolders);
router.get('/:id',    authenticate, getFolder);
router.post('/',      authenticate, createFolder);
router.put('/:id',    authenticate, updateFolder);
router.delete('/:id', authenticate, deleteFolder);

module.exports = router;
