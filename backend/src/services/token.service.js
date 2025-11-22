const crypto = require('crypto');
const { query } = require('../db/pool');
const config = require('../config/env');

const createTokenRecord = async (userId, { userAgent = null, ipAddress = null } = {}) => {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + config.refreshTokenDays * 24 * 60 * 60 * 1000);

  const result = await query(
    `INSERT INTO common_app.auth_tokens (user_id, token, expires_at, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, token, expires_at`,
    [userId, token, expiresAt, userAgent, ipAddress]
  );

  return result.rows[0];
};

const findToken = async (token) => {
  const result = await query(
    `SELECT id, user_id, token, expires_at, revoked_at
     FROM common_app.auth_tokens
     WHERE token = $1 LIMIT 1`,
    [token]
  );
  return result.rows[0] || null;
};

const revokeToken = async (token) => {
  await query('UPDATE common_app.auth_tokens SET revoked_at = NOW() WHERE token = $1 AND revoked_at IS NULL', [token]);
};

const revokeAllForUser = async (userId) => {
  await query('UPDATE common_app.auth_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [userId]);
};

module.exports = {
  createTokenRecord,
  findToken,
  revokeToken,
  revokeAllForUser
};

