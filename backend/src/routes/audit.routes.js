const router = require('express').Router();
const { listAuditLogs } = require('../controllers/audit.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('ADMIN'));

router.get('/', listAuditLogs);

module.exports = router;
