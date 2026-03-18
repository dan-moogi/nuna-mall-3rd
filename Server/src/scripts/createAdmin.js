require('../config/env')
const mongoose  = require('mongoose')
const connectDB = require('../config/db')
const User      = require('../models/User')

async function main() {
  await connectDB()

  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
    console.error('❌ .env에 ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME 을 설정하세요.')
    process.exit(1)
  }

  const existing = await User.findOne({ email: ADMIN_EMAIL })

  if (existing) {
    existing.role = 'admin'
    existing.name = ADMIN_NAME
    await existing.save()
    console.log(`✅ 관리자 계정 준비 완료 (업데이트): ${ADMIN_EMAIL}`)
  } else {
    await User.create({
      email:    ADMIN_EMAIL,
      password: ADMIN_PASSWORD,   // pre-save hook이 자동 해시
      name:     ADMIN_NAME,
      role:     'admin',
    })
    console.log(`✅ 관리자 계정 준비 완료 (신규 생성): ${ADMIN_EMAIL}`)
  }

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('💥 오류:', err.message)
  process.exit(1)
})
