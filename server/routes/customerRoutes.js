const router = require('express').Router();
const c = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const ownerOnly = require('../middleware/ownerMiddleware');

router.use(protect);
router.get('/', ownerOnly, c.list);
router.get('/:id', c.getOne);
router.put('/:id', c.update);
module.exports = router;
