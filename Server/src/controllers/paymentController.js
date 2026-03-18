'use strict'
const crypto  = require('crypto')
const axios   = require('axios')
const qs      = require('qs')
const Order   = require('../models/Order')
const Cart    = require('../models/Cart')
const logger  = require('../config/logger')

const MID      = process.env.INICIS_MID
const SIGNKEY  = process.env.INICIS_SIGNKEY
const API_URL  = process.env.INICIS_API_URL   // https://iniapi.inicis.com/api/v1/refund
const AUTH_URL = process.env.INICIS_AUTH_URL  // https://iniapi.inicis.com/api/v1/transaction

const sha256 = (str) => crypto.createHash('sha256').update(str).digest('hex')

/* ─── 내부 함수: 이니시스 취소 요청 ─── */
async function requestCancel(pgTid, price, reason = '고객 요청') {
  const timestamp = Date.now().toString()
  const signature = sha256(MID + pgTid + price + timestamp)

  const { data } = await axios.post(API_URL, qs.stringify({
    type:      'cancel',
    mid:       MID,
    tid:       pgTid,
    msg:       reason,
    timestamp,
    signature,
    price,
  }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })

  if (data.resultCode === '00') return { success: true }
  return { success: false, message: data.resultMsg || '취소 실패' }
}

/* ─── POST /api/payment/prepare ─── */
exports.prepare = async (req, res, next) => {
  try {
    const { orderId } = req.body
    const order = await Order.findOne({ _id: orderId, user: req.user.id, payStatus: '대기' })
    if (!order) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' })

    const timestamp  = Date.now().toString()
    const oid        = order.orderNumber
    const price      = order.finalPrice.toString()
    const signature  = sha256(`${SIGNKEY}|${timestamp}|${MID}|${oid}|${price}`)
    const verification = sha256(`${SIGNKEY}|${price}`)

    res.json({
      success: true,
      payInfo: {
        mid:          MID,
        oid,
        price,
        timestamp,
        signature,
        verification,
        goodname:     order.items[0]?.productName || '상품',
        buyername:    order.shippingAddress?.name || '',
        buyertel:     order.shippingAddress?.phone || '',
      },
    })
  } catch (err) { next(err) }
}

/* ─── POST /api/payment/confirm ─── */
exports.confirm = async (req, res, next) => {
  try {
    const {
      resultCode, resultMsg,
      orderNumber, TotPrice,
      AUTHD, authNo, cardName, cardNum,
      payMethod, applDate, applTime,
      signature,
    } = req.body

    // 1. 결제 실패
    if (resultCode !== '00') {
      return res.status(400).json({ success: false, message: resultMsg || '결제 실패' })
    }

    // 2. 서명 검증
    const expected = sha256(`${SIGNKEY}|${TotPrice}|${AUTHD}`)
    if (expected !== signature) {
      await requestCancel(AUTHD, TotPrice, '서명 불일치')
      return res.status(400).json({ success: false, message: '결제 검증 실패' })
    }

    // 3. 주문 조회 + 금액 검증
    const order = await Order.findOne({ orderNumber })
    if (!order) {
      await requestCancel(AUTHD, TotPrice, '주문 없음')
      return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' })
    }
    if (order.finalPrice !== parseInt(TotPrice)) {
      await requestCancel(AUTHD, TotPrice, '금액 불일치')
      return res.status(400).json({ success: false, message: '결제 금액 불일치' })
    }

    // 4. 주문 상태 업데이트
    const paidAt = new Date(
      `${applDate.slice(0,4)}-${applDate.slice(4,6)}-${applDate.slice(6,8)}T${applTime.slice(0,2)}:${applTime.slice(2,4)}:${applTime.slice(4,6)}`
    )
    order.status    = '결제완료'
    order.payStatus = '완료'
    order.payment   = { method: payMethod, pgTid: AUTHD, authNo, cardName, cardNum, paidAt }
    await order.save()

    // 5. 장바구니 비우기
    await Cart.findOneAndUpdate({ user: order.user }, { items: [] })

    res.json({
      success: true,
      order: {
        id:          order._id,
        orderNumber: order.orderNumber,
        finalPrice:  order.finalPrice,
        status:      order.status,
        paidAt,
      },
    })
  } catch (err) { next(err) }
}

/* ─── POST /api/payment/cancel ─── */
exports.cancelPayment = async (req, res, next) => {
  try {
    const { orderId, reason = '고객 요청' } = req.body
    const order = await Order.findOne({ _id: orderId, user: req.user.id })
    if (!order) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' })

    if (!['결제완료', '배송준비'].includes(order.status)) {
      return res.status(400).json({ success: false, message: '취소 가능한 상태가 아닙니다.' })
    }

    const result = await requestCancel(order.payment.pgTid, order.finalPrice.toString(), reason)
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    order.status              = '취소'
    order.payStatus           = '취소'
    order.payment.canceledAt  = new Date()
    await order.save()

    res.json({ success: true, message: '취소가 완료되었습니다.' })
  } catch (err) { next(err) }
}

/* ─── POST /api/payment/webhook ─── (이니시스 서버 → 우리 서버) ─── */
exports.webhook = async (req, res) => {
  try {
    const { orderNumber, TotPrice, AUTHD, resultCode, signature } = req.body

    if (resultCode !== '00') return res.send('이니페이')

    const order = await Order.findOne({ orderNumber })
    if (!order) {
      await requestCancel(AUTHD, TotPrice, '주문 없음')
      return res.send('이니페이')
    }

    // idempotent: 이미 처리된 주문
    if (order.payStatus === '완료') return res.send('이니페이')

    // 서명 검증
    const expected = sha256(`${SIGNKEY}|${TotPrice}|${AUTHD}`)
    if (expected !== signature) {
      await requestCancel(AUTHD, TotPrice, '서명 불일치')
      return res.send('이니페이')
    }

    // 금액 검증
    if (order.finalPrice !== parseInt(TotPrice)) {
      await requestCancel(AUTHD, TotPrice, '금액 불일치')
      return res.send('이니페이')
    }

    order.status    = '결제완료'
    order.payStatus = '완료'
    order.payment   = { ...order.payment, pgTid: AUTHD, paidAt: new Date() }
    await order.save()
    await Cart.findOneAndUpdate({ user: order.user }, { items: [] })

    logger.info(`[webhook] 결제 완료: ${orderNumber}`)
  } catch (err) {
    logger.error('[webhook] 오류:', err.message)
  }
  res.send('이니페이')
}

/* ─── POST /api/payment/admin/refund ─── */
exports.adminRefund = async (req, res, next) => {
  try {
    const { orderId, reason = '관리자 환불' } = req.body
    const order = await Order.findById(orderId)
    if (!order) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' })

    if (order.payStatus !== '완료') {
      return res.status(400).json({ success: false, message: '환불 가능한 상태가 아닙니다.' })
    }

    const result = await requestCancel(order.payment.pgTid, order.finalPrice.toString(), reason)
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    order.status               = '환불'
    order.payStatus            = '환불'
    order.payment.refundedAt   = new Date()
    await order.save()

    res.json({ success: true, message: '환불이 완료되었습니다.' })
  } catch (err) { next(err) }
}
