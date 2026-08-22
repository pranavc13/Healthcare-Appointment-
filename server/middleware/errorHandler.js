// Central error handler. Any error passed to next(err) (or thrown inside an
// asyncHandler-wrapped route) lands here instead of leaking a stack trace to the client.
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 11000) {
    return res.status(409).json({ message: 'This resource already exists or conflicts with an existing one.' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for ${err.path}` });
  }

  const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
}

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
