const db = require('../db');
const { createFilter } = require('../utils/filters');
const { toPositiveInt } = require('../utils/validate');

async function listAuditLogs(req, res) {
  const { user_id, action, entity, start_date, end_date } = req.query;
  const limit = Math.min(toPositiveInt(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) > 0 ? Number(req.query.offset) : 0;

  const f = createFilter();
  if (user_id)    f.add('a.user_id = ?', Number(user_id));
  if (action)     f.add('a.action = ?', action);
  if (entity)     f.add('a.entity = ?', entity);
  if (start_date) f.add('a.created_at >= ?', start_date);
  if (end_date)   f.add("a.created_at < (?::date + INTERVAL '1 day')", end_date);

  const countResult = await db.query(`SELECT COUNT(*) FROM audit_logs a ${f.where}`, f.params);

  const { rows } = await db.query(
    `SELECT a.id, a.action, a.entity, a.entity_id, a.payload, a.ip_address, a.created_at,
            u.id AS user_id, u.name AS user_name, u.role AS user_role
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     ${f.where}
     ORDER BY a.id DESC
     LIMIT ${f.param(limit)} OFFSET ${f.param(offset)}`,
    f.params
  );

  res.json({ total: Number(countResult.rows[0].count), limit, offset, logs: rows });
}

module.exports = { listAuditLogs };
