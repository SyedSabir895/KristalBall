const db = require('../db');
const HttpError = require('../utils/httpError');

// Available stock = everything in − everything out (all time, one base + one equipment type)
// Takes `client` so it can run inside a transaction
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
  return Number(rows[0].available); // SUM returns bigint → comes as string from pg
}

// Runs insertFn(client) inside a transaction, only if the base has enough stock.
// Used by every operation that takes stock OUT of a base: transfers, assignments, expenditures.
//
// The base row is locked (FOR UPDATE), so two requests spending stock from the same base
// run one after the other: the second one sees the first one's result, never a stale balance.
async function withStockCheck({ baseId, equipmentTypeId, quantity }, insertFn) {
  const client = await db.pool.connect(); // one connection for the whole transaction
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
    await client.query('ROLLBACK'); // undo everything done in this transaction
    throw err;
  } finally {
    client.release(); // always give the connection back to the pool
  }
}

module.exports = { getAvailableStock, withStockCheck };
