const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const { uploadBuffer } = require('../utils/azureBlob');

// @desc    Upload an image or document (supports local or Azure blob)
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // If multer used memoryStorage (Azure configured), file.buffer will exist
  if (req.file.buffer) {
    try {
      const url = await uploadBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
      return res.json({ message: 'Uploaded to Azure Blob Storage', url });
    } catch (err) {
      console.error('Azure upload failed', err);
      return res.status(500).json({ message: 'Upload failed' });
    }
  }

  // Fallback: local file URL
  const CLIENT_URL = process.env.CLIENT_URL || `http://localhost:${process.env.PORT || 5000}`;
  const base = CLIENT_URL.replace(/\/$/, '');
  const fileUrl = `${base}/uploads/${req.file.filename}`;
  res.json({
    message: 'Uploaded locally',
    url: fileUrl,
  });
});

module.exports = router;
