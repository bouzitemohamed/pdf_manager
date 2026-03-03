const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadFile, getFiles, getFile, deleteFile, searchContent } = require('../controllers/fileController');

router.use(authenticate);

router.post('/', upload.single('pdf'), uploadFile);
router.get('/', getFiles);
router.get('/search', searchContent);
router.get('/:id', getFile);
router.delete('/:id', deleteFile);

module.exports = router;
