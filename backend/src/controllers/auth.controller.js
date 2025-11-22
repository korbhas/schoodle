const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const userService = require('../services/user.service');
const tokenService = require('../services/token.service');

const buildAccessToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: `${config.accessTokenMinutes}m`
  });

const attachTokens = async (user, req) => {
  const accessToken = buildAccessToken(user);
  const refreshRecord = await tokenService.createTokenRecord(user.id, {
    userAgent: req.headers['user-agent'] || null,
    ipAddress: req.ip
  });

  const profile = await userService.getUserProfile(user.id);

  return {
    accessToken,
    refreshToken: refreshRecord.token,
    expiresIn: config.accessTokenMinutes * 60,
    refreshExpiresAt: refreshRecord.expires_at,
    user: profile
  };
};

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.getUserByEmail(email);

  if (!user || !user.is_active) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  await userService.updateLastLogin(user.id);
  const payload = await attachTokens(user, req);
  return success(res, payload);
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const stored = await tokenService.findToken(refreshToken);

  if (!stored || stored.revoked_at) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  if (new Date(stored.expires_at) < new Date()) {
    await tokenService.revokeToken(refreshToken);
    return res.status(401).json({ error: 'Refresh token expired' });
  }

  const user = await userService.getUserById(stored.user_id);
  if (!user || !user.is_active) {
    await tokenService.revokeToken(refreshToken);
    return res.status(401).json({ error: 'User unavailable' });
  }

  await tokenService.revokeToken(refreshToken);
  const payload = await attachTokens(user, req);
  return success(res, payload);
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await tokenService.revokeToken(refreshToken);
  return success(res, { message: 'Logged out' });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await userService.getUserWithPasswordById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const match = await bcrypt.compare(currentPassword, user.password_hash);
  if (!match) {
    return res.status(400).json({ error: 'Current password incorrect' });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await userService.updatePassword(user.id, hash);
  await tokenService.revokeAllForUser(user.id);

  return success(res, { message: 'Password updated' });
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await userService.getUserByEmail(email);

  if (user) {
    console.info(`[auth] Password reset requested for user ${user.id}`);
  }

  return res.status(202).json({
    message: 'If the account exists, a reset link will be sent'
  });
});

const confirmPasswordReset = asyncHandler(async (req, res) => {
  return res.status(202).json({
    message: 'Password reset confirmation endpoint is not yet implemented'
  });
});

const register = asyncHandler(async (req, res) => {
  const { email, password, full_name: fullName, phone } = req.body;

  const existingUser = await userService.getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const user = await userService.createUser({
    email,
    password,
    full_name: fullName,
    role: 'student',
    phone_number: phone || null
  });

  await userService.updateLastLogin(user.id);
  const payload = await attachTokens(user, req);
  return created(res, payload);
});

module.exports = {
  login,
  refresh,
  logout,
  changePassword,
  requestPasswordReset,
  confirmPasswordReset,
  register
};

