// Returns the value as a positive whole number, or null if it isn't one
function toPositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// True only for real calendar dates in YYYY-MM-DD format (rejects 2026-02-30)
function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
}

module.exports = { toPositiveInt, isValidDate };
