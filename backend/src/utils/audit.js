const db = require('../db');

async function logAudit(req, action, entity, entityId, payload, client = db) {
  await client.query(
    `INSERT INTO audit_logs (user_id, action, entity, entity_id, payload, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [req.user?.id ?? null, action, entity, entityId, payload, req.ip]
  );
}

module.exports = { logAudit };
