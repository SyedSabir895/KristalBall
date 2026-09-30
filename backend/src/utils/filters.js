function createFilter() {
  const conditions = [];
  const params = [];

  function param(value) {
    params.push(value);
    return `$${params.length}`;
  }

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
