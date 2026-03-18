'use strict'
const router     = require('express').Router()
const auth       = require('../middleware/auth')
const adminAuth  = require('../middleware/adminAuth')
const {
  prepare,
  confirm,
  cancelPayment,
  webhook,
  adminRefund,
} = require('../controllers/paymentController')

router.post('/prepare',       auth,              prepare)
router.post('/confirm',       auth,              confirm)
router.post('/cancel',        auth,              cancelPayment)
router.post('/webhook',                          webhook)        // 이니시스 서버 직접 호출 — 인증 없음
router.post('/admin/refund',  [auth, adminAuth], adminRefund)

module.exports = router
