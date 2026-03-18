const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  productCode:      { type: String, required: true, unique: true },
  name:             { type: String, required: true },
  description:      { type: String, default: '' },
  category:         {
    type: String, required: true,
    enum: ['outer','top','shirts','pants','training','accessory','bigsize','jean'],
  },
  subCategory:      { type: String },
  subCategoryLabel: { type: String },
  cloudinaryUrl:    { type: String },
  cloudinaryPublicId: { type: String },
  colorCount:       { type: Number, default: 1 },
  originalPrice:    { type: Number, default: 0 },
  salePrice:        { type: Number, required: true },
  discountRate:     { type: Number, default: 0 },
  tags:             [{ type: String, enum: ['best','new','sale','pants-best','cody'] }],
  stock:            { type: Number, default: 100 },
  isActive:         { type: Boolean, default: true },
  sourceUrl:        { type: String },
  createdAt:        { type: Date, default: Date.now },
})

productSchema.index({ category: 1, subCategory: 1, isActive: 1 })
productSchema.index({ tags: 1, isActive: 1 })
productSchema.index({ salePrice: 1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ name: 'text', productCode: 'text' })

module.exports = mongoose.model('Product', productSchema)
