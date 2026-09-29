const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { logAudit } = require('../utils/audit');

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.base_id, b.name AS base_name
     FROM users u LEFT JOIN bases b ON b.id = u.base_id
     WHERE u.email = $1`,
    [email]
  );
  const user = rows[0];

  // Same message for wrong email or wrong password: don't reveal which
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    // Record failed attempts too: useful to spot password guessing
    await logAudit(req, 'LOGIN_FAILED', 'users', user?.id ?? null, { email });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, base_id: user.base_id },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  req.user = user; // so audit log has user id
  await logAudit(req, 'LOGIN', 'users', user.id, { email });

  delete user.password_hash; 
    res.json({ token, user });
}

async function me(req, res) {
  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email, u.role, u.base_id, b.name AS base_name
     FROM users u LEFT JOIN bases b ON b.id = u.base_id WHERE u.id = $1`,
    [req.user.id]
  );
  res.json(rows[0]);
}

module.exports = { login, me };
