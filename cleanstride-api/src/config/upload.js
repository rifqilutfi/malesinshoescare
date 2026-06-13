const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
const servicesDir = path.join(uploadsDir, 'services');
const aiDir = path.join(uploadsDir, 'ai');

[servicesDir, aiDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File filter: images only
const imageFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

// Storage for service images (persistent)
const serviceStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, servicesDir),
  filename: (_req, file, cb) => {
    const unique = `svc-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// Storage for AI shoe images (temporary analysis)
const aiStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, aiDir),
  filename: (_req, file, cb) => {
    const unique = `ai-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const uploadServiceImage = multer({
  storage: serviceStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadShoeImage = multer({
  storage: aiStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { uploadServiceImage, uploadShoeImage };
