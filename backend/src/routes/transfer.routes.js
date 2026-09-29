const router = require('express').Router();
const { createTransfer, listTransfers } = require('../controllers/transfer.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

const ALLOWED = ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'];

router.get('/', authorize(...ALLOWED), listTransfers);
router.post('/', authorize(...ALLOWED), createTransfer);

module.exports = router;
