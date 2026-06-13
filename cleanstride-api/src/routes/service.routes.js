const { Router } = require('express');
const auth = require('../middleware/auth');
const { uploadServiceImage } = require('../config/upload');
const {
  index,
  adminIndex,
  getCategories,
  store,
  update,
  toggleActive,
  destroy,
} = require('../controllers/service.controller');

const router = Router();

// Public
router.get('/', index);
router.get('/categories', getCategories);

// Admin (protected)
router.get('/admin', auth, adminIndex);
router.post('/', auth, uploadServiceImage.single('image'), store);
router.put('/:id', auth, uploadServiceImage.single('image'), update);
router.patch('/:id/toggle', auth, toggleActive);
router.delete('/:id', auth, destroy);

module.exports = router;
