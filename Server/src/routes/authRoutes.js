const express    = require('express')
const rateLimit  = require('express-rate-limit')
const { body }   = require('express-validator')
const router     = express.Router()

const auth       = require('../middleware/auth')
const validate   = require('../middleware/validate')
const {
  register, login, refresh, logout, getMe,
} = require('../controllers/authController')

// 로그인 레이트 리미터 (15분에 5회)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: '로그인 시도 횟수를 초과했습니다. 15분 후 다시 시도해주세요.' },
})

// ─── Validation Rules ─────────────────────────────────────────────────────────
const registerRules = [
  body('email')
    .isEmail().withMessage('올바른 이메일 형식이 아닙니다.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('비밀번호는 8자 이상이어야 합니다.')
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/).withMessage('비밀번호는 영문+숫자 조합이어야 합니다.'),
  body('name')
    .notEmpty().withMessage('이름을 입력해주세요.')
    .isLength({ max: 20 }).withMessage('이름은 20자 이하여야 합니다.')
    .trim(),
]

const loginRules = [
  body('email').isEmail().withMessage('올바른 이메일 형식이 아닙니다.').normalizeEmail(),
  body('password').notEmpty().withMessage('비밀번호를 입력해주세요.'),
]

// ─── Routes ───────────────────────────────────────────────────────────────────
router.post('/register', registerRules, validate, register)
router.post('/login',    loginLimiter, loginRules, validate, login)
router.post('/refresh',  refresh)
router.post('/logout',   auth, logout)
router.get('/me',        auth, getMe)

module.exports = router
