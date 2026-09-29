const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./db');

const authRoutes = require('./routes/auth.routes');
const lookupRoutes = require('./routes/lookup.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const transferRoutes = require('./routes/transfer.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const expenditureRoutes = require('./routes/expenditure.routes');
const auditRoutes = require('./routes/audit.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Behind a hosting proxy (Render/Railway) → real client IP comes from X-Forwarded-For
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

app.use(helmet());
// Only the frontend URL may call the API from a browser (falls back to open in dev)
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT NOW() AS time');
    res.json({ status: 'ok', dbTime: rows[0].time });
  } catch (err) {
    res.status(500).json({ status: 'db error', error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/lookup', lookupRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/expenditures', expenditureRoutes);
app.use('/api/audit-logs', auditRoutes);

// Order matters: 404 after all routes, error handler LAST
app.use(notFound);
app.use(errorHandler);

module.exports = app;
