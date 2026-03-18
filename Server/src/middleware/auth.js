const jwt            = require('jsonwebtoken')
const TokenBlacklist = require('../models/TokenBlacklist')

module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '인증이 필요합니다.' })
    }

    const token   = header.slice(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const blacklisted = await TokenBlacklist.findOne({ token })
    if (blacklisted) {
      return res.status(401).json({ success: false, message: '만료된 토큰입니다.' })
    }

    req.user = { id: decoded.id, email: decoded.email }
    next()
  } catch {
    return res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' })
  }
}
