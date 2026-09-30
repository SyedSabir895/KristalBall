const db = require('../db');
const HttpError = require('../utils/httpError');

async function getAvailableStock(client, baseId, equipmentTypeId) {
  const { rows } = await client.query(
    `SELECT
        COALESCE((SELECT SUM(quantity) FROM purchases    WHERE base_id = $1      AND equipment_type_id = $2), 0)
      + COALESCE((SELECT SUM(quantity) FROM transfers    WHERE to_base_id = $1   AND equipment_type_id = $2), 0)
      - COALESCE((SELECT SUM(quantity) FROM transfers    WHERE from_base_id = $1 AND equipment_type_id = $2), 0)
      - COALESCE((SELECT SUM(quantity) FROM assignments  WHERE base_id = $1      AND equipment_type_id = $2), 0)
      - COALESCE((SELECT SUM(quantity) FROM expenditures WHERE base_id = $1      AND equipment_type_id = $2), 0)
      AS available`,
    [baseId, equipmentTypeId]
  );
  return Number(rows[0].available);
}

async function withStockCheck({ baseId, equipmentTypeId, quantity }, insertFn) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const base = await client.query('SELECT id FROM bases WHERE id = $1 FOR UPDATE', [baseId]);
    if (!base.rowCount) throw new HttpError(404, 'Base not found');

    const available = await getAvailableStock(client, baseId, equipmentTypeId);
    if (available < quantity) {
      throw new HttpError(400, `Insufficient stock. Available: ${available}, requested: ${quantity}`);
    }

    const result = await insertFn(client);

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getAvailableStock, withStockCheck };
