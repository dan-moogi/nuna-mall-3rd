const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  name:     { type: String, required: true },
  phone:    { type: String },
  role:     { type: String, enum: ['user','admin'], default: 'user' },
  address:  {
    zip:    { type: String },
    street: { type: String },
    detail: { type: String },
  },
  grade:        { type: String, enum: ['일반','우수','VIP'], default: '일반' },
  points:       { type: Number, default: 0 },
  refreshToken: { type: String },
  createdAt:    { type: Date, default: Date.now },
})

// password 변경 시에만 해싱
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

// 비밀번호 검증 메서드
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// JSON 직렬화 시 민감 필드 제거
userSchema.set('toJSON', {
  transform: (_, obj) => {
    delete obj.password
    delete obj.refreshToken
    return obj
  },
})

module.exports = mongoose.model('User', userSchema)
