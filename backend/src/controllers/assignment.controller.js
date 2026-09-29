const db = require('../db');
const { resolveBaseId } = require('../utils/scope');
const { logAudit } = require('../utils/audit');
const { createFilter } = require('../utils/filters');
const { toPositiveInt, isValidDate } = require('../utils/validate');
const { withStockCheck } = require('../services/stock.service');

// POST /api/assignments
// Assigning to personnel takes stock out of the base's available pool
async function createAssignment(req, res) {
  const { base_id, equipment_type_id, quantity, personnel_name, personnel_id, assignment_date } = req.body;

  const baseId = resolveBaseId(req, base_id);
  const typeId = toPositiveInt(equipment_type_id);
  const qty = toPositiveInt(quantity);
  const name = typeof personnel_name === 'string' ? personnel_name.trim() : '';

  if (!baseId || !typeId || !quantity || !name) {
    return res.status(400).json({ error: 'base_id, equipment_type_id, quantity and personnel_name are required' });
  }
  if (!qty) return res.status(400).json({ error: 'quantity must be a positive whole number' });
  if (assignment_date && !isValidDate(assignment_date)) {
    return res.status(400).json({ error: 'assignment_date must be YYYY-MM-DD' });
  }

  const assignment = await withStockCheck(
    { baseId, equipmentTypeId: typeId, quantity: qty },
    async (client) => {
      const { rows } = await client.query(
        `INSERT INTO assignments (base_id, equipment_type_id, quantity, personnel_name, personnel_id, assignment_date, created_by)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE), $7)
         RETURNING *`,
        [baseId, typeId, qty, name, personnel_id || null, assignment_date || null, req.user.id]
      );
      await logAudit(req, 'CREATE_ASSIGNMENT', 'assignments', rows[0].id, rows[0], client);
      return rows[0];
    }
  );

  res.status(201).json(assignment);
}

// GET /api/assignments?base_id=&equipment_type_id=&category=&personnel=&start_date=&end_date=
async function listAssignments(req, res) {
  const { base_id, equipment_type_id, category, personnel, start_date, end_date } = req.query;

  const f = createFilter();
  const baseId = resolveBaseId(req, base_id);
  if (baseId)            f.add('a.base_id = ?', baseId);
  if (equipment_type_id) f.add('a.equipment_type_id = ?', Number(equipment_type_id));
  if (category)          f.add('e.category = ?', category);
  if (personnel)         f.add('(a.personnel_name ILIKE ? OR a.personnel_id ILIKE ?)', `%${personnel}%`); // partial, case-insensitive
  if (start_date)        f.add('a.assignment_date >= ?', start_date);
  if (end_date)          f.add('a.assignment_date <= ?', end_date);

  const { rows } = await db.query(
    `SELECT a.id, a.quantity, a.personnel_name, a.personnel_id, a.assignment_date, a.created_at,
            b.id AS base_id, b.name AS base_name,
            e.id AS equipment_type_id, e.name AS equipment_name, e.category, e.unit,
            u.name AS created_by_name
     FROM assignments a
     JOIN bases b           ON b.id = a.base_id
     JOIN equipment_types e ON e.id = a.equipment_type_id
     JOIN users u           ON u.id = a.created_by
     ${f.where}
     ORDER BY a.assignment_date DESC, a.id DESC`,
    f.params
  );

  res.json(rows);
}

module.exports = { createAssignment, listAssignments };
