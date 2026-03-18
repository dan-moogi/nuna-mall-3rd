const mongoose = require('mongoose')
const Order    = require('../models/Order')
const Cart     = require('../models/Cart')

const CANCELABLE = ['결제대기', '결제완료']

// ─── POST /api/orders ─────────────────────────────────────────────────────────
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, directItems } = req.body

    if (!shippingAddress?.name || !shippingAddress?.address || !shippingAddress?.phone) {
      return res.status(400).json({ success: false, message: '배송 정보를 입력해주세요.' })
    }

    let items, totalPrice, cart

    if (directItems && directItems.length > 0) {
      // 바로 구매: 요청 body의 아이템 사용
      items = directItems.map((i) => ({
        product:       i.productId,
        productCode:   i.productCode,
        productName:   i.productName,
        cloudinaryUrl: i.cloudinaryUrl,
        color:         i.color,
        size:          i.size,
        quantity:      i.quantity,
        price:         i.price,
      }))
      totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    } else {
      // 장바구니에서 주문
      cart = await Cart.findOne({ user: req.user.id })
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: '장바구니가 비어있습니다.' })
      }
      items = cart.items.map((i) => ({
        product:       i.product,
        productCode:   i.productCode,
        productName:   i.productName,
        cloudinaryUrl: i.cloudinaryUrl,
        color:         i.color,
        size:          i.size,
        quantity:      i.quantity,
        price:         i.price,
      }))
      totalPrice = cart.totalPrice
    }

    const shippingFee = totalPrice >= 50000 ? 0 : 3000
    const finalPrice  = totalPrice + shippingFee

    const order = await new Order({
      user: req.user.id,
      items,
      totalPrice,
      shippingFee,
      finalPrice,
      shippingAddress,
    }).save()

    // 장바구니 기반 주문이면 장바구니 비우기
    if (cart) {
      cart.items = []
      await cart.save()
    }

    res.status(201).json({ success: true, order })
  } catch (err) { next(err) }
}

// ─── GET /api/orders ──────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean()
    res.json({ success: true, orders })
  } catch (err) { next(err) }
}

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
exports.getOrderById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' })
    }

    const order = await Order.findById(req.params.id).lean()
    if (!order) {
      return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' })
    }
    if (String(order.user) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
    }

    res.json({ success: true, order })
  } catch (err) { next(err) }
}

// ─── PUT /api/orders/:id/cancel ───────────────────────────────────────────────
exports.cancelOrder = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' })
    }
    if (String(order.user) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
    }
    if (!CANCELABLE.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `${order.status} 상태에서는 취소할 수 없습니다.`,
      })
    }

    order.status    = '취소'
    order.payStatus = '취소'
    await order.save()

    res.json({ success: true, order })
  } catch (err) { next(err) }
}
