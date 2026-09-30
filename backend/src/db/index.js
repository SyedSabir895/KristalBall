const { Pool, types } = require('pg');
require('dotenv').config();

// Return DATE columns as plain 'YYYY-MM-DD' strings.
// Default converts to a JS Date at local midnight, which shifts a day when sent as UTC JSON.
types.setTypeParser(1082, (value) => value); // 1082 = DATE type id

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Hosted DBs (Render) reached from outside their network require SSL → set DB_SSL=true
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
