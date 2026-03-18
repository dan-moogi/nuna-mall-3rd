require('../config/env')
const mongoose = require('mongoose')
const fs       = require('fs')
const path     = require('path')
const connectDB = require('../config/db')
const Product   = require('../models/Product')

// ─── 태그 자동 부여 ──────────────────────────────────────────────────────────
function assignTags(item, indexInCategory) {
  const tags = new Set(item.tags || [])

  if (indexInCategory < 8) {
    tags.add('best')
    tags.add('new')
  }
  if (item.category === 'pants')     tags.add('pants-best')
  if (item.category === 'accessory') tags.add('cody')
  if (item.salePrice < item.originalPrice && item.originalPrice > 0) tags.add('sale')

  return [...tags]
}

// ─── 메인 ────────────────────────────────────────────────────────────────────
async function main() {
  await connectDB()

  const dataDir = path.join(__dirname, 'scraped_data')
  const files   = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'))

  if (files.length === 0) {
    console.log('⚠️  scraped_data/ 에 JSON 파일이 없습니다. 먼저 npm run scrape 를 실행하세요.')
    process.exit(0)
  }

  let totalInsert = 0, totalUpdate = 0

  for (const file of files) {
    const items = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'))
    console.log(`\n📂 ${file} → ${items.length}개 처리 시작`)

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const tags = assignTags(item, i)

      const doc = {
        name:               item.name,
        description:        item.description || '',
        category:           item.category,
        subCategory:        item.subCategory,
        subCategoryLabel:   item.subCategoryLabel,
        cloudinaryUrl:      item.cloudinaryUrl,
        cloudinaryPublicId: item.cloudinaryPublicId,
        colorCount:         item.colorCount  ?? 1,
        originalPrice:      item.originalPrice ?? 0,
        salePrice:          item.salePrice,
        discountRate:       item.discountRate  ?? 0,
        tags,
        sourceUrl:          item.sourceUrl,
        isActive:           true,
      }

      const existing = await Product.findOne({ productCode: item.productCode })

      if (existing) {
        await Product.updateOne({ productCode: item.productCode }, { $set: doc })
        console.log(`🔄 업데이트: ${item.productCode} - ${item.name}`)
        totalUpdate++
      } else {
        await Product.create({ productCode: item.productCode, ...doc })
        console.log(`✅ 삽입: ${item.productCode} - ${item.name}`)
        totalInsert++
      }
    }
  }

  console.log(`\n📊 삽입 ${totalInsert} / 업데이트 ${totalUpdate}`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('💥 오류:', err.message)
  process.exit(1)
})
