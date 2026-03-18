'use strict'
require('../config/env')   // .env 로드 (반드시 최상단)
const mongoose = require('mongoose')

const LOCAL_URI  = process.env.MONGODB_URI        || 'mongodb://localhost:27017/nuna_mall'
const ATLAS_URI  = process.env.MONGODB_ATLAS_URI

if (!ATLAS_URI) {
  console.error('❌ MONGODB_ATLAS_URI 환경변수가 없습니다. Server/.env에 추가하세요.')
  process.exit(1)
}

async function migrate() {
  // ① 두 연결 생성
  console.log('🔌 로컬 MongoDB 연결 중...')
  const local = await mongoose.createConnection(LOCAL_URI).asPromise()
  console.log('✅ 로컬 연결 완료')

  console.log('🔌 Atlas MongoDB 연결 중...')
  const atlas = await mongoose.createConnection(ATLAS_URI).asPromise()
  console.log('✅ Atlas 연결 완료')

  const COLLECTIONS = ['products', 'users', 'orders', 'carts', 'tokenblacklists']

  for (const name of COLLECTIONS) {
    try {
      // ③ 로컬에서 전체 읽기
      const docs = await local.collection(name).find({}).toArray()
      if (docs.length === 0) {
        console.log(`⏭️  ${name}: 데이터 없음, 스킵`)
        continue
      }

      // ④ Atlas에 upsert (중복 실행 안전)
      const col = atlas.collection(name)
      let inserted = 0
      let skipped  = 0

      for (const doc of docs) {
        try {
          await col.replaceOne({ _id: doc._id }, doc, { upsert: true })
          inserted++
        } catch {
          skipped++
        }
      }

      console.log(`✅ ${name}: ${inserted}개 완료 / ${skipped}개 스킵`)
    } catch (err) {
      console.error(`❌ ${name} 마이그레이션 오류:`, err.message)
    }
  }

  // ⑥ 두 연결 종료
  await local.close()
  await atlas.close()
  console.log('\n🎉 Atlas 마이그레이션 완료!')
}

migrate().catch((err) => {
  console.error('❌ 마이그레이션 실패:', err.message)
  process.exit(1)
})
