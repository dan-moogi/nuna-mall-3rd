const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productCode:  { type: String },
  productName:  { type: String },
  cloudinaryUrl:{ type: String },
  color:        { type: String },
  size:         { type: String },
  quantity:     { type: Number, min: 1, default: 1 },
  price:        { type: Number },
})

const cartSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  items:      [cartItemSchema],
  totalPrice: { type: Number, default: 0 },
  updatedAt:  { type: Date, default: Date.now },
})

// totalPrice 자동 계산
cartSchema.pre('save', async function () {
  this.totalPrice = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  this.updatedAt  = Date.now()
})

module.exports = mongoose.model('Cart', cartSchema)
