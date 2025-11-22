const validate = (schema) => (req, res, next) => {
  // Convert empty strings in query params to undefined so defaults apply
  const cleanedQuery = {};
  Object.keys(req.query).forEach((key) => {
    const val = req.query[key];
    cleanedQuery[key] = val === '' ? undefined : val;
  });

  // For GET/HEAD/DELETE requests, completely ignore body validation
  // These methods shouldn't have a body, and we don't want to validate it
  const isBodylessMethod = ['GET', 'HEAD', 'DELETE'].includes(req.method.toUpperCase());
  
  // Clear any body data for bodyless methods to prevent validation issues
  if (isBodylessMethod) {
    req.body = {};
  }

  const payload = {
    body: req.body,
    params: req.params,
    query: cleanedQuery
  };

  const { error, value } = schema.validate(payload, { 
    abortEarly: false, 
    allowUnknown: true,
    stripUnknown: false,
    // For bodyless methods, skip body validation errors
    skipFunctions: false,
    context: { isBodylessMethod }
  });

  // Filter out body-related errors for bodyless methods
  let filteredError = error;
  if (error && isBodylessMethod) {
    const bodyErrors = error.details.filter(detail => detail.path[0] === 'body');
    if (bodyErrors.length > 0) {
      const nonBodyErrors = error.details.filter(detail => detail.path[0] !== 'body');
      if (nonBodyErrors.length === 0) {
        // Only body errors, ignore them
        filteredError = null;
      } else {
        // Mix of body and non-body errors, only report non-body errors
        filteredError = { ...error, details: nonBodyErrors };
      }
    }
  }

  if (filteredError) {
    console.error('[validate] Validation error:', filteredError.details);
    console.error('[validate] Request method:', req.method);
    console.error('[validate] Request body:', req.body);
    console.error('[validate] Request URL:', req.url);
    return res.status(400).json({
      error: 'Validation failed',
      details: filteredError.details.map((detail) => detail.message)
    });
  }

  req.body = value.body || {};
  req.params = value.params;
  req.query = value.query;

  return next();
};

module.exports = validate;

