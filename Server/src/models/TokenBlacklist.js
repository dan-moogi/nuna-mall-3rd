const mongoose = require('mongoose')

const tokenBlacklistSchema = new mongoose.Schema({
  token:     { type: String, required: true },
  expiresAt: { type: Date,   required: true },
})

// TTL 인덱스: expiresAt 도달 시 자동 삭제
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema)
