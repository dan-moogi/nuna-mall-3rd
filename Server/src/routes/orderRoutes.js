const express = require('express')
const router  = express.Router()
const auth    = require('../middleware/auth')
const {
  createOrder, getMyOrders, getOrderById, cancelOrder,
} = require('../controllers/orderController')

router.post('/',           auth, createOrder)
router.get('/',            auth, getMyOrders)
router.get('/:id',         auth, getOrderById)
router.put('/:id/cancel',  auth, cancelOrder)

module.exports = router
