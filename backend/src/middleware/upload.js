const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists for local development
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// When Azure Storage is configured, use memory storage so we can upload buffers
const useAzure = !!process.env.AZURE_STORAGE_CONNECTION_STRING;

const storage = useAzure ? multer.memoryStorage() : multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  // Check extension
  const allowedExts = /\.(jpg|jpeg|png|webp|pdf|mp4|mkv)$/i;
  const extOk = allowedExts.test(path.extname(file.originalname));

  // Check MIME — handle both bare 'image/jpeg' and 'video/mp4' forms
  const allowedMimes = /^(image\/(jpeg|jpg|png|webp)|application\/pdf|video\/(mp4|x-matroska|mkv|webm)|application\/octet-stream)$/i;
  const mimeOk = allowedMimes.test(file.mimetype);

  if (extOk || mimeOk) {
    return cb(null, true);
  } else {
    cb(new Error('Images, PDFs, and Videos (MP4/MKV/WEBM) only!'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit for large video uploads
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
