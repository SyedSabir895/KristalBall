const db = require('../db');
const { resolveBaseId } = require('../utils/scope');
const { toPositiveInt } = require('../utils/validate');
const { getAvailableStock } = require('../services/stock.service');

// All bases for dropdowns. Names aren't sensitive: a commander needs them to pick a
// transfer destination. Data access is still limited by resolveBaseId in every controller.
async function getBases(req, res) {
  const { rows } = await db.query('SELECT id, name, location FROM bases ORDER BY name');
  res.json(rows);
}

async function getEquipmentTypes(req, res) {
  const { rows } = await db.query('SELECT id, name, category, unit FROM equipment_types ORDER BY category, name');
  res.json(rows);
}

// GET /api/lookup/stock?base_id=&equipment_type_id=  → { available }
// Shown in forms before sending stock out of a base
async function getStock(req, res) {
  const baseId = resolveBaseId(req, req.query.base_id);
  const typeId = toPositiveInt(req.query.equipment_type_id);
  if (!baseId || !typeId) {
    return res.status(400).json({ error: 'base_id and equipment_type_id are required' });
  }
  const available = await getAvailableStock(db, baseId, typeId);
  res.json({ base_id: baseId, equipment_type_id: typeId, available });
}

module.exports = { getBases, getEquipmentTypes, getStock };
