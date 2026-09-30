const PG_ERRORS = {
  '23503': [400, 'Referenced record does not exist (check base / equipment / user ids)'],
  '23505': [409, 'Record already exists'],
  '23514': [400, 'Value breaks a data rule'],
  '22P02': [400, 'Invalid value (wrong number or enum format)'],
  '22007': [400, 'Invalid date, use YYYY-MM-DD'],
  '22008': [400, 'Date out of range'],
};

function errorHandler(err, req, res, next) {
  if (PG_ERRORS[err.code]) {
    const [status, message] = PG_ERRORS[err.code];
    return res.status(status).json({ error: message });
  }

  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
