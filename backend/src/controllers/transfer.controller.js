const db = require('../db');
const { resolveBaseId } = require('../utils/scope');
const { logAudit } = require('../utils/audit');
const { createFilter } = require('../utils/filters');
const { toPositiveInt, isValidDate } = require('../utils/validate');
const { withStockCheck } = require('../services/stock.service');

async function createTransfer(req, res) {
  const { from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, remarks } = req.body;

  const fromBaseId = resolveBaseId(req, from_base_id);
  const toBaseId = toPositiveInt(to_base_id);
  const typeId = toPositiveInt(equipment_type_id);
  const qty = toPositiveInt(quantity);

  if (!fromBaseId || !toBaseId || !typeId || !quantity) {
    return res.status(400).json({ error: 'from_base_id, to_base_id, equipment_type_id and quantity are required' });
  }
  if (!qty) return res.status(400).json({ error: 'quantity must be a positive whole number' });
  if (fromBaseId === toBaseId) {
    return res.status(400).json({ error: 'Cannot transfer to the same base' });
  }
  if (transfer_date && !isValidDate(transfer_date)) {
    return res.status(400).json({ error: 'transfer_date must be YYYY-MM-DD' });
  }

  const transfer = await withStockCheck(
    { baseId: fromBaseId, equipmentTypeId: typeId, quantity: qty },
    async (client) => {
      const { rows } = await client.query(
        `INSERT INTO transfers (from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, remarks, created_by)
         VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE), $6, $7)
         RETURNING *`,
        [fromBaseId, toBaseId, typeId, qty, transfer_date || null, remarks || null, req.user.id]
      );
      await logAudit(req, 'CREATE_TRANSFER', 'transfers', rows[0].id, rows[0], client);
      return rows[0];
    }
  );

  res.status(201).json(transfer);
}

async function listTransfers(req, res) {
  const { base_id, direction, equipment_type_id, category, start_date, end_date } = req.query;

  const f = createFilter();
  const baseId = resolveBaseId(req, base_id);
  if (baseId) {
    if (direction === 'in')       f.add('t.to_base_id = ?', baseId);
    else if (direction === 'out') f.add('t.from_base_id = ?', baseId);
    else                          f.add('(t.from_base_id = ? OR t.to_base_id = ?)', baseId);
  }
  if (equipment_type_id) f.add('t.equipment_type_id = ?', Number(equipment_type_id));
  if (category)          f.add('e.category = ?', category);
  if (start_date)        f.add('t.transfer_date >= ?', start_date);
  if (end_date)          f.add('t.transfer_date <= ?', end_date);

  const { rows } = await db.query(
    `SELECT t.id, t.quantity, t.transfer_date, t.remarks, t.created_at,
            fb.id AS from_base_id, fb.name AS from_base_name,
            tb.id AS to_base_id,   tb.name AS to_base_name,
            e.id AS equipment_type_id, e.name AS equipment_name, e.category, e.unit,
            u.name AS created_by_name
     FROM transfers t
     JOIN bases fb           ON fb.id = t.from_base_id
     JOIN bases tb           ON tb.id = t.to_base_id
     JOIN equipment_types e  ON e.id = t.equipment_type_id
     JOIN users u            ON u.id = t.created_by
     ${f.where}
     ORDER BY t.transfer_date DESC, t.id DESC`,
    f.params
  );

  res.json(rows);
}

module.exports = { createTransfer, listTransfers };
