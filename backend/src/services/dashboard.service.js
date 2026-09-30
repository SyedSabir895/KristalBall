const db = require('../db');
const { createFilter } = require('../utils/filters');

const LEDGER = `
  SELECT base_id, equipment_type_id, purchase_date AS d, quantity AS qty, 'PURCHASE' AS kind FROM purchases
  UNION ALL
  SELECT to_base_id, equipment_type_id, transfer_date, quantity, 'TRANSFER_IN' FROM transfers
  UNION ALL
  SELECT from_base_id, equipment_type_id, transfer_date, quantity, 'TRANSFER_OUT' FROM transfers
  UNION ALL
  SELECT base_id, equipment_type_id, assignment_date, quantity, 'ASSIGNED' FROM assignments
  UNION ALL
  SELECT base_id, equipment_type_id, expenditure_date, quantity, 'EXPENDED' FROM expenditures
`;

const METRICS = ['opening_balance', 'purchases', 'transfer_in', 'transfer_out', 'assigned', 'expended'];

async function getSummary({ start, end, baseId, typeId, category }) {
  const f = createFilter();
  const s = f.param(start);
  f.add('l.d <= ?', end);
  if (baseId)   f.add('l.base_id = ?', baseId);
  if (typeId)   f.add('l.equipment_type_id = ?', typeId);
  if (category) f.add('e.category = ?', category);

  const { rows } = await db.query(
    `SELECT e.id AS equipment_type_id, e.name AS equipment_name, e.category, e.unit,
       SUM(CASE WHEN l.d < ${s}
                THEN CASE WHEN l.kind IN ('PURCHASE', 'TRANSFER_IN') THEN l.qty ELSE -l.qty END
                ELSE 0 END)                                                        AS opening_balance,
       SUM(CASE WHEN l.d >= ${s} AND l.kind = 'PURCHASE'     THEN l.qty ELSE 0 END) AS purchases,
       SUM(CASE WHEN l.d >= ${s} AND l.kind = 'TRANSFER_IN'  THEN l.qty ELSE 0 END) AS transfer_in,
       SUM(CASE WHEN l.d >= ${s} AND l.kind = 'TRANSFER_OUT' THEN l.qty ELSE 0 END) AS transfer_out,
       SUM(CASE WHEN l.d >= ${s} AND l.kind = 'ASSIGNED'     THEN l.qty ELSE 0 END) AS assigned,
       SUM(CASE WHEN l.d >= ${s} AND l.kind = 'EXPENDED'     THEN l.qty ELSE 0 END) AS expended
     FROM (${LEDGER}) l
     JOIN equipment_types e ON e.id = l.equipment_type_id
     ${f.where}
     GROUP BY e.id
     ORDER BY e.category, e.name`,
    f.params
  );

  const byEquipment = rows.map((r) => {
    const row = { ...r };
    for (const m of METRICS) row[m] = Number(r[m]);
    row.net_movement = row.purchases + row.transfer_in - row.transfer_out;
    row.closing_balance = row.opening_balance + row.net_movement - row.assigned - row.expended;
    return row;
  });

  const totals = {};
  for (const m of [...METRICS, 'net_movement', 'closing_balance']) {
    totals[m] = byEquipment.reduce((sum, r) => sum + r[m], 0);
  }

  return { totals, by_equipment: byEquipment };
}

function addCommonFilters(f, dateCol, { start, end, typeId, category }) {
  f.add(`${dateCol} >= ?`, start);
  f.add(`${dateCol} <= ?`, end);
  if (typeId)   f.add('e.id = ?', typeId);
  if (category) f.add('e.category = ?', category);
}

async function getNetMovementDetails(filters) {
  const { baseId } = filters;

  const pf = createFilter();
  addCommonFilters(pf, 'p.purchase_date', filters);
  if (baseId) pf.add('p.base_id = ?', baseId);
  const purchasesQuery = db.query(
    `SELECT p.id, p.purchase_date AS date, p.quantity, p.remarks,
            b.name AS base_name, e.name AS equipment_name, e.category, e.unit
     FROM purchases p
     JOIN bases b           ON b.id = p.base_id
     JOIN equipment_types e ON e.id = p.equipment_type_id
     ${pf.where}
     ORDER BY p.purchase_date DESC, p.id DESC`,
    pf.params
  );

  const transferQuery = (side) => {
    const tf = createFilter();
    addCommonFilters(tf, 't.transfer_date', filters);
    if (baseId) tf.add(side === 'in' ? 't.to_base_id = ?' : 't.from_base_id = ?', baseId);
    return db.query(
      `SELECT t.id, t.transfer_date AS date, t.quantity, t.remarks,
              fb.name AS from_base_name, tb.name AS to_base_name,
              e.name AS equipment_name, e.category, e.unit
       FROM transfers t
       JOIN bases fb          ON fb.id = t.from_base_id
       JOIN bases tb          ON tb.id = t.to_base_id
       JOIN equipment_types e ON e.id = t.equipment_type_id
       ${tf.where}
       ORDER BY t.transfer_date DESC, t.id DESC`,
      tf.params
    );
  };

  const [purchases, transfersIn, transfersOut] = await Promise.all([
    purchasesQuery,
    transferQuery('in'),
    transferQuery('out'),
  ]);

  return {
    purchases: purchases.rows,
    transfers_in: transfersIn.rows,
    transfers_out: transfersOut.rows,
  };
}

module.exports = { getSummary, getNetMovementDetails };
