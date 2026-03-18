const logger = require('../config/logger')

const requestLogger = (req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const msg = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`

    if (res.statusCode >= 400) {
      logger.warn(msg)
    } else {
      logger.info(msg)
    }
  })

  next()
}

module.exports = requestLogger
