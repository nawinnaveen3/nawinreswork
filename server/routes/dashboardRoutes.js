const router = require('express').Router();
const c = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const ownerOnly = require('../middleware/ownerMiddleware');

router.use(protect, ownerOnly);
router.get('/statistics', c.statistics);
router.get('/sales', c.sales);
router.get('/popular-items', c.popularItems);
module.exports = router;
