const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productCode:  { type: String },
  productName:  { type: String },
  cloudinaryUrl:{ type: String },
  color:        { type: String },
  size:         { type: String },
  quantity:     { type: Number },
  price:        { type: Number },
}, { _id: false })

const orderSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },
  items:       [orderItemSchema],
  totalPrice:  { type: Number },
  shippingFee: { type: Number, default: 0 },
  finalPrice:  { type: Number },
  status: {
    type: String,
    enum: ['결제대기','결제완료','배송준비','배송중','배송완료','취소','환불'],
    default: '결제대기',
  },
  payStatus: {
    type: String,
    enum: ['대기','완료','취소','환불','부분환불'],
    default: '대기',
  },
  payment: {
    method:     { type: String },
    pgTid:      { type: String },
    authNo:     { type: String },
    cardName:   { type: String },
    cardNum:    { type: String },
    paidAt:     { type: Date },
    canceledAt: { type: Date },
    refundedAt: { type: Date },
  },
  shippingAddress: {
    name:    { type: String },
    phone:   { type: String },
    zip:     { type: String },
    address: { type: String },
    detail:  { type: String },
  },
  trackingNumber: { type: String },
  createdAt:      { type: Date, default: Date.now },
  updatedAt:      { type: Date, default: Date.now },
})

// orderNumber 자동 생성
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    this.orderNumber =
      'NM' +
      Date.now().toString().slice(-8) +
      Math.random().toString(36).slice(-4).toUpperCase()
  }
  this.updatedAt = Date.now()
})

module.exports = mongoose.model('Order', orderSchema)
