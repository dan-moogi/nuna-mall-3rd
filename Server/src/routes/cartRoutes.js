const express = require('express')
const router  = express.Router()
const auth    = require('../middleware/auth')
const {
  getCart, addToCart, updateQuantity, removeItem, clearCart,
} = require('../controllers/cartController')

// 모든 장바구니 라우트는 인증 필수
router.use(auth)

router.get('/',           getCart)
router.post('/add',       addToCart)
router.put('/:itemId',    updateQuantity)
router.delete('/:itemId', removeItem)
router.delete('/',        clearCart)

module.exports = router
