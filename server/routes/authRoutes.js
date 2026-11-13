const router = require('express').Router();
const c = require('../controllers/authController');
router.post('/register', c.register);
router.post('/customer-login', c.customerLogin);
router.post('/owner-login', c.ownerLogin);
router.post('/logout', c.logout);
module.exports = router;
