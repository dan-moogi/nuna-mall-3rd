const Cart    = require('../models/Cart')
const Product = require('../models/Product')

// ─── GET /api/cart ────────────────────────────────────────────────────────────
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).lean()
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] })
      cart = cart.toObject()
    }
    res.json({ success: true, cart })
  } catch (err) { next(err) }
}

// ─── POST /api/cart/add ───────────────────────────────────────────────────────
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, color, size, quantity = 1 } = req.body
    if (!productId) {
      return res.status(400).json({ success: false, message: '상품 ID가 필요합니다.' })
    }

    const product = await Product.findById(productId).lean()
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' })
    }

    let cart = await Cart.findOne({ user: req.user.id })
    if (!cart) cart = new Cart({ user: req.user.id, items: [] })

    // 동일 product + color + size 이면 수량 증가
    const existing = cart.items.find(
      (i) => String(i.product) === String(productId) && i.color === color && i.size === size
    )
    if (existing) {
      existing.quantity += Number(quantity)
    } else {
      cart.items.push({
        product:      product._id,
        productCode:  product.productCode,
        productName:  product.name,
        cloudinaryUrl: product.cloudinaryUrl,
        color:        color || '',
        size:         size  || '',
        quantity:     Number(quantity),
        price:        product.salePrice,
      })
    }

    await cart.save()
    res.json({ success: true, cart })
  } catch (err) { next(err) }
}

// ─── PUT /api/cart/:itemId ────────────────────────────────────────────────────
exports.updateQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body
    const qty = Number(quantity)
    if (!qty || qty < 1) {
      return res.status(400).json({ success: false, message: '수량은 1 이상이어야 합니다.' })
    }

    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) return res.status(404).json({ success: false, message: '장바구니가 없습니다.' })

    const item = cart.items.id(req.params.itemId)
    if (!item) return res.status(404).json({ success: false, message: '해당 항목을 찾을 수 없습니다.' })

    item.quantity = qty
    await cart.save()
    res.json({ success: true, cart })
  } catch (err) { next(err) }
}

// ─── DELETE /api/cart/:itemId ─────────────────────────────────────────────────
exports.removeItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) return res.status(404).json({ success: false, message: '장바구니가 없습니다.' })

    cart.items.pull({ _id: req.params.itemId })
    await cart.save()
    res.json({ success: true, cart })
  } catch (err) { next(err) }
}

// ─── DELETE /api/cart ─────────────────────────────────────────────────────────
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) return res.status(404).json({ success: false, message: '장바구니가 없습니다.' })

    cart.items = []
    await cart.save()
    res.json({ success: true, message: '장바구니가 비워졌습니다.' })
  } catch (err) { next(err) }
}
