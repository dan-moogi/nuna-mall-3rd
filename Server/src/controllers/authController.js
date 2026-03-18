const jwt            = require('jsonwebtoken')
const User           = require('../models/User')
const TokenBlacklist = require('../models/TokenBlacklist')

const PW_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────
function generateTokens(userId, email) {
  const accessToken = jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
  return { accessToken, refreshToken }
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7일
  })
}

function userPayload(user) {
  return {
    id:     user._id,
    email:  user.email,
    name:   user.name,
    grade:  user.grade,
    points: user.points,
    role:   user.role,
  }
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body

    if (!PW_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: '비밀번호는 영문+숫자 조합 8자 이상이어야 합니다.',
      })
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() })
    if (exists) {
      return res.status(409).json({ success: false, message: '이미 사용 중인 이메일입니다.' })
    }

    const user = await new User({ email, password, name, phone }).save()
    const { accessToken, refreshToken } = generateTokens(user._id, user.email)

    await User.updateOne({ _id: user._id }, { refreshToken })
    setRefreshCookie(res, refreshToken)

    return res.status(201).json({
      success: true,
      user: userPayload(user),
      accessToken,
    })
  } catch (err) { next(err) }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' })
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.email)
    await User.updateOne({ _id: user._id }, { refreshToken })
    setRefreshCookie(res, refreshToken)

    return res.json({
      success: true,
      user: userPayload(user),
      accessToken,
    })
  } catch (err) { next(err) }
}

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) {
      return res.status(401).json({ success: false, message: '리프레시 토큰이 없습니다.' })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    } catch {
      return res.status(401).json({ success: false, message: '만료된 리프레시 토큰입니다.' })
    }

    const user = await User.findById(decoded.id).select('refreshToken email')
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: '유효하지 않은 리프레시 토큰입니다.' })
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    return res.json({ success: true, accessToken })
  } catch (err) { next(err) }
}

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) {
      const token   = header.slice(7)
      const decoded = jwt.decode(token)
      if (decoded?.exp) {
        await TokenBlacklist.create({
          token,
          expiresAt: new Date(decoded.exp * 1000),
        })
      }
    }

    await User.updateOne({ _id: req.user.id }, { refreshToken: null })

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })

    return res.json({ success: true, message: '로그아웃 되었습니다.' })
  } catch (err) { next(err) }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken').lean()
    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' })
    }
    return res.json({ success: true, user })
  } catch (err) { next(err) }
}
