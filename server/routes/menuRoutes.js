const router = require('express').Router();
const c = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const ownerOnly = require('../middleware/ownerMiddleware');
const upload = require('../middleware/upload');

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', protect, ownerOnly, upload.single('image'), c.create);
router.put('/:id', protect, ownerOnly, upload.single('image'), c.update);
router.delete('/:id', protect, ownerOnly, c.remove);
module.exports = router;
