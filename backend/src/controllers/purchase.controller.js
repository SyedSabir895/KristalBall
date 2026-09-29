const db = require('../db');
const { resolveBaseId } = require('../utils/scope');
const { logAudit } = require('../utils/audit');
const { createFilter } = require('../utils/filters');
const { toPositiveInt, isValidDate } = require('../utils/validate');

// POST /api/purchases
// Purchases ADD stock, so no stock check needed
async function createPurchase(req, res) {
  const { base_id, equipment_type_id, quantity, purchase_date, remarks } = req.body;

  // Commander: forced to own base. Others: must send base_id
  const baseId = resolveBaseId(req, base_id);
  const typeId = toPositiveInt(equipment_type_id);
  const qty = toPositiveInt(quantity);

  if (!baseId || !typeId || !quantity) {
    return res.status(400).json({ error: 'base_id, equipment_type_id and quantity are required' });
  }
  if (!qty) return res.status(400).json({ error: 'quantity must be a positive whole number' });
  if (purchase_date && !isValidDate(purchase_date)) {
    return res.status(400).json({ error: 'purchase_date must be YYYY-MM-DD' });
  }

  const { rows } = await db.query(
    `INSERT INTO purchases (base_id, equipment_type_id, quantity, purchase_date, remarks, created_by)
     VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6)
     RETURNING *`,
    [baseId, typeId, qty, purchase_date || null, remarks || null, req.user.id]
  );
  const purchase = rows[0];

  await logAudit(req, 'CREATE_PURCHASE', 'purchases', purchase.id, purchase);

  res.status(201).json(purchase);
}

// GET /api/purchases?base_id=&equipment_type_id=&category=&start_date=&end_date=
async function listPurchases(req, res) {
  const { base_id, equipment_type_id, category, start_date, end_date } = req.query;

  const f = createFilter();
  const baseId = resolveBaseId(req, base_id);
  if (baseId)            f.add('p.base_id = ?', baseId);
  if (equipment_type_id) f.add('p.equipment_type_id = ?', Number(equipment_type_id));
  if (category)          f.add('e.category = ?', category);
  if (start_date)        f.add('p.purchase_date >= ?', start_date);
  if (end_date)          f.add('p.purchase_date <= ?', end_date);

  const { rows } = await db.query(
    `SELECT p.id, p.quantity, p.purchase_date, p.remarks, p.created_at,
            b.id AS base_id, b.name AS base_name,
            e.id AS equipment_type_id, e.name AS equipment_name, e.category, e.unit,
            u.name AS created_by_name
     FROM purchases p
     JOIN bases b           ON b.id = p.base_id
     JOIN equipment_types e ON e.id = p.equipment_type_id
     JOIN users u           ON u.id = p.created_by
     ${f.where}
     ORDER BY p.purchase_date DESC, p.id DESC`,
    f.params
  );

  res.json(rows);
}

module.exports = { createPurchase, listPurchases };
