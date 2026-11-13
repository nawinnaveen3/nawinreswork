const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const ownerOnly = require('../middleware/ownerMiddleware');

router.use(protect);
router.post('/', c.create);
router.get('/', c.list);
router.get('/:id', c.getOne);
router.put('/:id/status', ownerOnly, c.updateStatus);
module.exports = router;
