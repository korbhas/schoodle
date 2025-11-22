const jwt = require('jsonwebtoken');
const config = require('../config/env');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (roles.length && !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return next();
};

module.exports = {
  authenticate,
  authorize
};

