const router = require('express').Router();
const { createExpenditure, listExpenditures } = require('../controllers/expenditure.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Logistics Officer has no access to expenditures
const ALLOWED = ['ADMIN', 'BASE_COMMANDER'];

router.get('/', authorize(...ALLOWED), listExpenditures);
router.post('/', authorize(...ALLOWED), createExpenditure);

module.exports = router;
