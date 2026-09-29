const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { login, me } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// Max 10 login attempts per IP per 15 min → slows down password guessing
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: 'Too many login attempts, try again in 15 minutes' },
});

router.post('/login', loginLimiter, login);
router.get('/me', authenticate, me);

module.exports = router;
