const User = require('../models/User')

module.exports = async function adminAuth(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('role')
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '관리자 권한이 필요합니다.' })
    }
    req.admin = user
    next()
  } catch {
    return res.status(403).json({ success: false, message: '권한 확인 중 오류가 발생했습니다.' })
  }
}
