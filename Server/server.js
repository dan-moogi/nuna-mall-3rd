require('./src/config/env')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const xssClean = require('xss-clean')
const rateLimit = require('express-rate-limit')
const mongoose = require('mongoose')
const connectDB = require('./src/config/db')
const errorHandler = require('./src/middleware/errorHandler')
const requestLogger = require('./src/middleware/requestLogger')

const app = express()
const PORT = process.env.PORT || 5000

// 전역 Rate Limit (15분에 200회)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  message: { success: false, message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' }
})

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))
app.use(cors({
  origin: (origin, cb) => {
    // 개발: localhost 모든 포트 허용 / 프로덕션: CLIENT_URL만 허용
    const allowed = !origin
      || (process.env.NODE_ENV === 'development' && /^http:\/\/localhost(:\d+)?$/.test(origin))
      || origin === process.env.CLIENT_URL
    cb(null, allowed ? (origin || '*') : false)
  },
  credentials: true,
}))
app.use('/api/', globalLimiter)
app.use(requestLogger)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// express-mongo-sanitize & xss-clean: Express 5에서 req.query가 getter-only라
// body/params만 처리 (query는 읽기 전용이므로 건너뜀)
app.use((req, res, next) => {
  if (req.body)   req.body   = mongoSanitize.sanitize(req.body)
  if (req.params) req.params = mongoSanitize.sanitize(req.params)
  next()
})
app.use(xssClean())

// 헬스 체크 (상세 버전)
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  const health = {
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV,
    version: require('./package.json').version,
    services: {
      database: { status: dbStatus, host: mongoose.connection.host || 'unknown' },
      memory: {
        used:  Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      }
    }
  }
  res.status(dbStatus === 'connected' ? 200 : 503).json(health)
})

// 라우트 (단계별로 주석 해제 예정)
app.use('/api/auth',     require('./src/routes/authRoutes'))
app.use('/api/products', require('./src/routes/productRoutes'))
app.use('/api/cart',     require('./src/routes/cartRoutes'))
app.use('/api/orders',   require('./src/routes/orderRoutes'))
app.use('/api/payment',  require('./src/routes/paymentRoutes'))
// app.use('/api/admin',    require('./src/routes/adminRoutes'))

app.use(errorHandler)

// 프로덕션 환경: 자동 백업 스케줄러
if (process.env.NODE_ENV === 'production') {
  require('./src/scripts/backup')
}

connectDB().then(() => {
  app.listen(PORT, () => console.log('🚀 Server on port ' + PORT))
})
