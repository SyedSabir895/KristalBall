// Postgres error codes → friendly client errors (instead of a raw 500)
// Full list: https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_ERRORS = {
  '23503': [400, 'Referenced record does not exist (check base / equipment / user ids)'], // foreign key
  '23505': [409, 'Record already exists'],                                               // unique
  '23514': [400, 'Value breaks a data rule'],                                            // CHECK constraint
  '22P02': [400, 'Invalid value (wrong number or enum format)'],                         // e.g. category=weapon
  '22007': [400, 'Invalid date, use YYYY-MM-DD'],
  '22008': [400, 'Date out of range'],
};

// Catches every error thrown in routes (Express 5 forwards async errors here)
function errorHandler(err, req, res, next) {
  if (PG_ERRORS[err.code]) {
    const [status, message] = PG_ERRORS[err.code];
    return res.status(status).json({ error: message });
  }

  // HttpError, or express.json() on a malformed body (status 400)
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }

  // Unknown → log full error on server, send generic message (don't leak internals)
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
