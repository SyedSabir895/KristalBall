const router = require('express').Router();
const { createPurchase, listPurchases } = require('../controllers/purchase.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

const ALLOWED = ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'];

router.get('/', authorize(...ALLOWED), listPurchases);
router.post('/', authorize(...ALLOWED), createPurchase);

module.exports = router;
