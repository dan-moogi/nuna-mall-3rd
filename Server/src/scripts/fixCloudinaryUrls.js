require('../config/env')
const mongoose  = require('mongoose')
const connectDB = require('../config/db')
const cloudinary = require('../config/cloudinary')
const Product   = require('../models/Product')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  await connectDB()

  const products = await Product.find({ cloudinaryPublicId: { $ne: '' }, cloudinaryUrl: '' })
  console.log(`🔍 URL 복구 대상: ${products.length}개`)

  let success = 0, fail = 0

  for (const p of products) {
    try {
      const res = await cloudinary.api.resource(p.cloudinaryPublicId)
      await Product.updateOne(
        { _id: p._id },
        { $set: { cloudinaryUrl: res.secure_url } }
      )
      console.log(`✅ ${p.productCode} → ${res.secure_url.slice(0, 60)}...`)
      success++
    } catch (err) {
      console.log(`❌ ${p.productCode} (${p.cloudinaryPublicId}) → ${err.message}`)
      fail++
    }
    await sleep(200)
  }

  console.log(`\n📊 완료: 성공 ${success} / 실패 ${fail}`)

  if (fail > 0) {
    console.log('\n🗑️  Cloudinary에도 없는 상품 삭제 중...')
    const deleted = await Product.deleteMany({ cloudinaryPublicId: { $ne: '' }, cloudinaryUrl: '' })
    console.log(`삭제: ${deleted.deletedCount}개`)
  }

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('💥 오류:', err.message)
  process.exit(1)
})
