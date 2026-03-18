const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')

const { combine, timestamp, printf, colorize, errors } = winston.format

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`
})

const transports = [
  new DailyRotateFile({
    filename:    'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level:       'error',
    maxFiles:    '30d',
    zippedArchive: true,
  }),
  new DailyRotateFile({
    filename:    'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles:    '14d',
    zippedArchive: true,
  }),
]

if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
    })
  )
}

const logger = winston.createLogger({
  level:  process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
  transports,
})

module.exports = logger
