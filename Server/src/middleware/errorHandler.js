const logger = require('../config/logger')

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500
  const isDev = process.env.NODE_ENV === 'development'

  logger.error(`${req.method} ${req.originalUrl} → ${statusCode}: ${err.message}`, { stack: err.stack })

  res.status(statusCode).json({
    success: false,
    message: err.message || '서버 오류가 발생했습니다.',
    ...(isDev && { stack: err.stack }),
  })
}

module.exports = errorHandler
