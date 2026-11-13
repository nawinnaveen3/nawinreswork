const router = require('express').Router();
const c = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const ownerOnly = require('../middleware/ownerMiddleware');

router.get('/', c.list);
router.post('/', protect, ownerOnly, c.create);
router.put('/:id', protect, ownerOnly, c.update);
router.delete('/:id', protect, ownerOnly, c.remove);
module.exports = router;
