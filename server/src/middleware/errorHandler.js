// 404 handler for unknown API routes
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler. Registered last in index.js.
// Never exposes stack traces or internal details to the client.
function errorHandler(err, req, res, next) {
  console.error(err);

  // Multer file-upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `File upload error: ${err.message}` });
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'A record with this value already exists.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found.' });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong on our end. Please try again.' : err.message;

  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
