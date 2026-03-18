const mongoose = require('mongoose')
const Product  = require('../models/Product')
const cache    = require('../config/cache')

const SORT_MAP = {
  latest:  { createdAt: -1 },
  popular: { createdAt: -1 },
  low:     { salePrice:  1 },
  high:    { salePrice: -1 },
}

// ─── GET /api/products ────────────────────────────────────────────────────────
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, subCategory, sort = 'latest', page = 1, limit = 20 } = req.query

    const cacheKey = `products:${JSON.stringify(req.query)}`
    const cached   = cache.get(cacheKey)
    if (cached) return res.json(cached)

    const filter = { isActive: true }
    if (category)    filter.category    = category
    if (subCategory) filter.subCategory = subCategory
    if (req.query.tag) filter.tags      = req.query.tag

    const sortObj  = SORT_MAP[sort] || SORT_MAP.latest
    const skip     = (Number(page) - 1) * Number(limit)

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit)).lean(),
      Product.countDocuments(filter),
    ])

    const result = {
      success: true,
      products,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    }
    cache.set(cacheKey, result)
    res.json(result)
  } catch (err) { next(err) }
}

// ─── GET /api/products/tag/:tag ───────────────────────────────────────────────
exports.getProductsByTag = async (req, res, next) => {
  try {
    const { tag }         = req.params
    const limit           = Number(req.query.limit) || 8
    const cacheKey        = `products:tag:${tag}:${limit}`
    const cached          = cache.get(cacheKey)
    if (cached) return res.json(cached)

    const products = await Product.find({ tags: tag, isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    const result = { success: true, products }
    cache.set(cacheKey, result)
    res.json(result)
  } catch (err) { next(err) }
}

// ─── GET /api/products/:id ────────────────────────────────────────────────────
exports.getProductById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' })
    }
    const product = await Product.findById(req.params.id).lean()
    if (!product) return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' })
    res.json({ success: true, product })
  } catch (err) { next(err) }
}

// ─── GET /api/products/related/:id ───────────────────────────────────────────
exports.getRelatedProducts = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' })
    }
    const product = await Product.findById(req.params.id).lean()
    if (!product) return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' })

    const products = await Product.aggregate([
      { $match: { category: product.category, _id: { $ne: product._id }, isActive: true } },
      { $sample: { size: 6 } },
    ])
    res.json({ success: true, products })
  } catch (err) { next(err) }
}

// ─── GET /api/products/search?q= ─────────────────────────────────────────────
exports.searchProducts = async (req, res, next) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query
    if (!q.trim()) return res.json({ success: true, products: [], total: 0, page: 1, totalPages: 0 })

    const regex  = new RegExp(q.trim(), 'i')
    const filter = { isActive: true, $or: [{ name: regex }, { productCode: regex }] }
    const skip   = (Number(page) - 1) * Number(limit)

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Product.countDocuments(filter),
    ])

    res.json({
      success: true,
      products,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    })
  } catch (err) { next(err) }
}
