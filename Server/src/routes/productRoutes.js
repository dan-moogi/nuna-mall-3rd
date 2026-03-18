const express = require('express')
const router  = express.Router()
const {
  getAllProducts,
  getProductsByTag,
  getProductById,
  getRelatedProducts,
  searchProducts,
} = require('../controllers/productController')

// 순서 중요: 구체적인 경로 먼저
router.get('/tag/:tag',    getProductsByTag)
router.get('/search',      searchProducts)
router.get('/related/:id', getRelatedProducts)
router.get('/:id',         getProductById)
router.get('/',            getAllProducts)

module.exports = router
