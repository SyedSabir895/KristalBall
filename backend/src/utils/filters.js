// Builds a parameterized WHERE clause step by step.
// Values never go into the SQL string, only into params -> no SQL injection.
//
//   const f = createFilter();
//   f.add('p.base_id = ?', 1);
//   f.add('p.purchase_date >= ?', '2026-09-01');
//   f.where  -> 'WHERE p.base_id = $1 AND p.purchase_date >= $2'
//   f.params -> [1, '2026-09-01']
function createFilter() {
  const conditions = [];
  const params = [];

  // Register a value, get back its placeholder ($1, $2, ...)
  function param(value) {
    params.push(value);
    return `$${params.length}`;
  }

  // Every '?' in sql is replaced with the same placeholder
  function add(sql, value) {
    conditions.push(sql.replaceAll('?', param(value)));
  }

  return {
    param,
    add,
    params,
    get where() {
      return conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    },
  };
}

module.exports = { createFilter };
