const db = require('../db');
const { resolveBaseId } = require('../utils/scope');
const { logAudit } = require('../utils/audit');
const { createFilter } = require('../utils/filters');
const { toPositiveInt, isValidDate } = require('../utils/validate');
const { withStockCheck } = require('../services/stock.service');

async function createExpenditure(req, res) {
  const { base_id, equipment_type_id, quantity, reason, expenditure_date } = req.body;

  const baseId = resolveBaseId(req, base_id);
  const typeId = toPositiveInt(equipment_type_id);
  const qty = toPositiveInt(quantity);
  const why = typeof reason === 'string' ? reason.trim() : '';

  if (!baseId || !typeId || !quantity || !why) {
    return res.status(400).json({ error: 'base_id, equipment_type_id, quantity and reason are required' });
  }
  if (!qty) return res.status(400).json({ error: 'quantity must be a positive whole number' });
  if (expenditure_date && !isValidDate(expenditure_date)) {
    return res.status(400).json({ error: 'expenditure_date must be YYYY-MM-DD' });
  }

  const expenditure = await withStockCheck(
    { baseId, equipmentTypeId: typeId, quantity: qty },
    async (client) => {
      const { rows } = await client.query(
        `INSERT INTO expenditures (base_id, equipment_type_id, quantity, reason, expenditure_date, created_by)
         VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE), $6)
         RETURNING *`,
        [baseId, typeId, qty, why, expenditure_date || null, req.user.id]
      );
      await logAudit(req, 'CREATE_EXPENDITURE', 'expenditures', rows[0].id, rows[0], client);
      return rows[0];
    }
  );

  res.status(201).json(expenditure);
}

async function listExpenditures(req, res) {
  const { base_id, equipment_type_id, category, start_date, end_date } = req.query;

  const f = createFilter();
  const baseId = resolveBaseId(req, base_id);
  if (baseId)            f.add('x.base_id = ?', baseId);
  if (equipment_type_id) f.add('x.equipment_type_id = ?', Number(equipment_type_id));
  if (category)          f.add('e.category = ?', category);
  if (start_date)        f.add('x.expenditure_date >= ?', start_date);
  if (end_date)          f.add('x.expenditure_date <= ?', end_date);

  const { rows } = await db.query(
    `SELECT x.id, x.quantity, x.reason, x.expenditure_date, x.created_at,
            b.id AS base_id, b.name AS base_name,
            e.id AS equipment_type_id, e.name AS equipment_name, e.category, e.unit,
            u.name AS created_by_name
     FROM expenditures x
     JOIN bases b           ON b.id = x.base_id
     JOIN equipment_types e ON e.id = x.equipment_type_id
     JOIN users u           ON u.id = x.created_by
     ${f.where}
     ORDER BY x.expenditure_date DESC, x.id DESC`,
    f.params
  );

  res.json(rows);
}

module.exports = { createExpenditure, listExpenditures };
