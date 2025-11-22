const path = require('path');
const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];

const missing = requiredVars.filter((key) => !process.env[key]);
if (missing.length && process.env.NODE_ENV !== 'test') {
  console.warn(`[env] Missing variables: ${missing.join(', ')}`);
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  accessTokenMinutes: Number(process.env.ACCESS_TOKEN_MINUTES || 15),
  refreshTokenDays: Number(process.env.REFRESH_TOKEN_DAYS || 30),
  corsOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').map((v) => v.trim()).filter(Boolean),
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'schoodle_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT || 30000),
    connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT || 5000)
  }
};

module.exports = config;

