const notFound = (req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
  next();
};

module.exports = notFound;

