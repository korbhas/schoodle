const errorHandler = (err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error('[error]', err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  const details = err.details || undefined;

  return res.status(status).json({
    error: message,
    details
  });
};

module.exports = errorHandler;

