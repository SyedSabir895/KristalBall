const router = require('express').Router();
const { createAssignment, listAssignments } = require('../controllers/assignment.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

const ALLOWED = ['ADMIN', 'BASE_COMMANDER'];

router.get('/', authorize(...ALLOWED), listAssignments);
router.post('/', authorize(...ALLOWED), createAssignment);

module.exports = router;
