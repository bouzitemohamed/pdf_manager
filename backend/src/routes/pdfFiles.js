const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const upload  = require('../middleware/upload');
const jwt     = require('jsonwebtoken');
const {
  uploadPdfFile, getPdfFiles, getPdfFile, updatePdfFile,
  downloadPdfFile, viewPdfFile, deletePdfFile,
  getMyFiles, getRecentFiles, searchFiles
} = require('../controllers/pdfFileController');

router.get('/my',      authenticate, getMyFiles);
router.get('/recent',  authenticate, getRecentFiles);
router.get('/search',  authenticate, searchFiles);
router.get('/',        authenticate, getPdfFiles);
router.post('/',       authenticate, upload.single('pdf'), uploadPdfFile);
router.get('/:id',     authenticate, getPdfFile);
router.put('/:id',     authenticate, upload.single('pdf'), updatePdfFile);

// Generate a short-lived view token (used by the iframe)
router.get('/:id/view-token', authenticate, (req, res) => {
  const token = jwt.sign(
    { sub: req.user.id, fileId: req.params.id, purpose: 'view' },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  );
  return res.json({ token });
});

// View PDF inline — accepts token as query param (for iframe)
router.get('/:id/view', (req, res, next) => {
  const token = req.query.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== 'view' || payload.fileId !== req.params.id) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = { id: payload.sub };
    return viewPdfFile(req, res, next);
  } catch {
    return res.status(401).json({ message: 'Token expired or invalid' });
  }
});

router.get('/:id/download', authenticate, downloadPdfFile);
router.delete('/:id',       authenticate, deletePdfFile);

module.exports = router;