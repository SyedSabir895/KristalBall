const router = require('express').Router();
const { getBases, getEquipmentTypes, getStock } = require('../controllers/lookup.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate); // all routes below need login

router.get('/bases', getBases);
router.get('/equipment-types', getEquipmentTypes);
router.get('/stock', getStock);

module.exports = router;
