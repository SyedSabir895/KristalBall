const router = require('express').Router();
const { summary, netMovementDetails } = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Read-only for everyone; commander data is scoped to own base inside the controller
const ALLOWED = ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'];

router.get('/', authorize(...ALLOWED), summary);
router.get('/net-movement', authorize(...ALLOWED), netMovementDetails);

module.exports = router;
