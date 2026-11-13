const router = require('express').Router();
const c = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const ownerOnly = require('../middleware/ownerMiddleware');

router.post('/', c.create);
router.get('/', protect, ownerOnly, c.list);
module.exports = router;
