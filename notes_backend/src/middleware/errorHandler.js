function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('[error]', err);

  const status = err.status || 500;
  const code = err.code || (status >= 500 ? 'internal_error' : 'request_error');

  res.status(status).json({
    status: 'error',
    code,
    message: err.message || 'Internal Server Error'
  });
}

module.exports = errorHandler;
