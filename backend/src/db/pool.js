const { Pool } = require('pg');
const config = require('../config/env');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  max: config.db.max,
  idleTimeoutMillis: config.db.idleTimeoutMillis,
  connectionTimeoutMillis: config.db.connectionTimeoutMillis
});

pool.on('connect', () => {
  console.info('[db] Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[db] Unexpected error', err);
  // Don't exit process on connection errors - let the server continue
  // Individual queries will handle their own errors
  // Only exit on critical errors that prevent the server from functioning
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    console.error('[db] Critical connection error - server may not function correctly');
  }
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query
};

