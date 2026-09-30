const { resolveBaseId } = require('../utils/scope');
const { isValidDate, toPositiveInt } = require('../utils/validate');
const HttpError = require('../utils/httpError');
const { getSummary, getNetMovementDetails } = require('../services/dashboard.service');

function parseFilters(req) {
  const { start_date, end_date, base_id, equipment_type_id, category } = req.query;

  const today = new Date().toISOString().slice(0, 10);
  const start = start_date || today.slice(0, 8) + '01';
  const end = end_date || today;

  if (!isValidDate(start) || !isValidDate(end)) throw new HttpError(400, 'Dates must be YYYY-MM-DD');
  if (start > end) throw new HttpError(400, 'start_date cannot be after end_date');

  return {
    start,
    end,
    baseId: resolveBaseId(req, base_id),
    typeId: equipment_type_id ? toPositiveInt(equipment_type_id) : null,
    category: category || null,
  };
}

async function summary(req, res) {
  const filters = parseFilters(req);
  const data = await getSummary(filters);
  res.json({ filters, ...data });
}

async function netMovementDetails(req, res) {
  const filters = parseFilters(req);
  const data = await getNetMovementDetails(filters);
  res.json({ filters, ...data });
}

module.exports = { summary, netMovementDetails };
