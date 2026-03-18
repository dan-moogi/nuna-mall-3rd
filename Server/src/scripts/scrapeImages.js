require('../config/env')
const axios      = require('axios')
const iconv      = require('iconv-lite')
const cheerio    = require('cheerio')
const cloudinary = require('../config/cloudinary')
const fs         = require('fs')
const path       = require('path')

// ─── 카테고리 데이터 ─────────────────────────────────────────────────────────
const CATEGORIES = {
  outer: {
    label: '아우터',
    subCategories: {
      jumper:       { label: '점퍼/롱패딩/바람막이', url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=046&mcode=006' },
      leather:      { label: '가죽자켓',             url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=046&mcode=001' },
      padding:      { label: '패딩/베스트',          url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=046&mcode=003' },
      coat:         { label: '코트/더스터/탑코트',   url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=046&mcode=005' },
      flight:       { label: '항공점퍼/야구잠바',    url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=046&mcode=007' },
      mustang:      { label: '무스탕',               url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=046&mcode=004' },
      denim_jacket: { label: '청재킷/청점퍼',        url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=046&mcode=002' },
    },
  },
  top: {
    label: '상의',
    subCategories: {
      short_sleeve: { label: '반팔티',        url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=048&mcode=001' },
      long_sleeve:  { label: '긴팔티/7부티',  url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=048&mcode=008' },
      sweatshirt:   { label: '맨투맨',        url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=048&mcode=002' },
      hoodie:       { label: '후드티',        url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=048&mcode=003' },
      tank:         { label: '탑',            url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=048&mcode=005' },
      cardigan:     { label: '가디건',        url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=048&mcode=007' },
      sleeveless:   { label: '민소매티',      url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=048&mcode=010' },
      blouse:       { label: '블라우스/남방', url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=048&mcode=004' },
    },
  },
  shirts: {
    label: '셔츠',
    subCategories: {
      plain:  { label: '셔츠/남방류',  url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=047&mcode=001' },
      check:  { label: '체크/플란넬', url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=047&mcode=002' },
      stripe: { label: '줄무늬/기타', url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=047&mcode=004' },
    },
  },
  pants: {
    label: '팬츠',
    subCategories: {
      denim:    { label: '데님팬츠',       url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=045&mcode=007' },
      cotton:   { label: '면바지',         url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=045&mcode=002' },
      slacks:   { label: '슬랙스',        url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=045&mcode=006' },
      shorts:   { label: '청반바지',      url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=045&mcode=003' },
      half:     { label: '반바지/7부',    url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=045&mcode=001' },
      leggings: { label: '레깅스/타이즈', url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=045&mcode=004' },
    },
  },
  training: {
    label: '트레이닝',
    subCategories: {
      set:    { label: '트레이닝 세트', url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=050&mcode=001' },
      top:    { label: '트레이닝 상의', url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=050&mcode=004' },
      bottom: { label: '트레이닝 하의', url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=050&mcode=005' },
    },
  },
  accessory: {
    label: '악세서리',
    subCategories: {
      bag:        { label: '가방/백팩',        url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=044&mcode=002' },
      wallet:     { label: '지갑',             url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=044&mcode=007' },
      hat:        { label: '모자/비니/머플러', url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=044&mcode=010' },
      belt:       { label: '벨트/양말/키링',  url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=044&mcode=001' },
      watch:      { label: '시계',             url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=044&mcode=003' },
      necktie:    { label: '넥타이/포켓치프', url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=044&mcode=004' },
      sunglasses: { label: '선글라스/안경',   url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=044&mcode=008' },
      party:      { label: '파티',            url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=044&mcode=009' },
    },
  },
  bigsize: {
    label: '빅사이즈',
    subCategories: {
      big_top:    { label: 'TOP',    url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=063&mcode=004' },
      big_bottom: { label: 'BOTTOM', url: 'https://gerio.co.kr/shop/shopbrand.html?type=N&xcode=063&mcode=003' },
    },
  },
}

// ─── 유틸 ────────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** 지수 백오프 재시도 (최대 3회: 1s → 2s → 4s) */
async function fetchWithRetry(url, options = {}, attempt = 1) {
  try {
    return await axios.get(url, { timeout: 15000, ...options })
  } catch (err) {
    if (attempt >= 3) throw err
    await sleep(1000 * 2 ** (attempt - 1))
    return fetchWithRetry(url, options, attempt + 1)
  }
}

/** Cloudinary에 해당 public_id가 이미 존재하는지 확인 */
async function existsOnCloudinary(publicId) {
  try {
    await cloudinary.api.resource(publicId)
    return true
  } catch {
    return false
  }
}

// ─── 페이지 파싱 ─────────────────────────────────────────────────────────────
// 실제 gerio.co.kr HTML 구조 기준:
//   ul.item-list > li > div.item-box
//     div.item-thumb > a[href] > img.MS_prod_img_s[src]
//     div.item-info
//       p.item-name      : "[LAI.10] 상품명..."
//       p.item-subname   : "[ 12color ]"
//       p.item-consumer  : "₩34,000"  (정가)
//       p.item-price     : "₩27,900 (18%할)"  (판매가)
function parseProducts($, baseUrl) {
  const products = []
  const toNum    = (txt) => parseInt((txt || '').replace(/[^\d]/g, ''), 10) || 0

  $('ul.item-list li').each((_, el) => {
    const $el = $(el)

    // 상품명 + 코드
    const rawName   = $el.find('p.item-name').text().trim()
    if (!rawName) return

    const codeMatch = rawName.match(/\[([A-Z0-9]+\.[A-Z0-9]+(?:\.[A-Z0-9]+)*)\]/i)
    if (!codeMatch) return
    const productCode = codeMatch[1].toUpperCase()
    const name        = rawName.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim()

    // 이미지
    const rawImg = $el.find('div.item-thumb img').attr('src') || ''
    if (!rawImg) {
      console.log(`❌ ${productCode} → 이미지 없음`)
      return
    }
    const imgUrl = rawImg.startsWith('http') ? rawImg : `https://gerio.co.kr${rawImg}`

    // 가격: item-consumer=정가, item-price에서 숫자만 추출=판매가
    const originalPrice = toNum($el.find('p.item-consumer').text())
    // item-price 텍스트에서 span(할인율) 제거 후 첫 숫자
    const priceText     = $el.find('p.item-price').clone().find('span').remove().end().text()
    const salePrice     = toNum(priceText) || originalPrice
    const discountRate  = originalPrice > salePrice
      ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
      : 0

    // 컬러 수: "[ 12color ]"
    const subName    = $el.find('p.item-subname').text()
    const colorMatch = subName.match(/(\d+)\s*color/i)
    const colorCount = colorMatch ? parseInt(colorMatch[1], 10) : 1

    // 상세 URL
    const href      = $el.find('div.item-thumb a').attr('href') || ''
    const sourceUrl = href.startsWith('http') ? href : href ? `https://gerio.co.kr${href}` : baseUrl

    products.push({ name, productCode, imgUrl, originalPrice, salePrice, discountRate, colorCount, sourceUrl })
  })

  return products
}

// ─── 레코드 빌더 ─────────────────────────────────────────────────────────────
function buildRecord(p, category, subCategory, subCategoryLabel, publicId, cloudinaryUrl) {
  return {
    productCode:        p.productCode,
    name:               p.name,
    category,
    subCategory,
    subCategoryLabel,
    cloudinaryUrl:      cloudinaryUrl || '',
    cloudinaryPublicId: publicId,
    originalPrice:      p.originalPrice,
    salePrice:          p.salePrice,
    discountRate:       p.discountRate,
    colorCount:         p.colorCount,
    tags:               [],
    sourceUrl:          p.sourceUrl,
  }
}

// ─── JSON 저장 (기존 파일과 병합, productCode 기준 dedup) ────────────────────
function saveJson(category, data) {
  const dir  = path.join(__dirname, 'scraped_data')
  const file = path.join(dir, `${category}.json`)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  let existing = []
  if (fs.existsSync(file)) {
    try { existing = JSON.parse(fs.readFileSync(file, 'utf-8')) } catch { existing = [] }
  }

  const map = new Map(existing.map((r) => [r.productCode, r]))
  data.forEach((r) => map.set(r.productCode, r))

  fs.writeFileSync(file, JSON.stringify([...map.values()], null, 2), 'utf-8')
  console.log(`💾 ${category}.json 저장 완료 (총 ${map.size}개)`)
}

// ─── 서브카테고리 스크래핑 ───────────────────────────────────────────────────
async function scrapeSubCategory(category, subCategory, subCategoryLabel, pageUrl) {
  console.log(`\n📂 [${category}/${subCategory}] 스크래핑 시작...`)

  let html
  try {
    const res = await fetchWithRetry(pageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        Referer: 'https://gerio.co.kr',
      },
    })
    html = iconv.decode(Buffer.from(res.data), 'EUC-KR')
  } catch (err) {
    console.error(`❌ [${category}/${subCategory}] 페이지 fetch 실패: ${err.message}`)
    return { results: [], success: 0, skip: 0, fail: 0 }
  }

  const $        = cheerio.load(html)
  const products = parseProducts($, pageUrl)

  const results = []
  let success = 0, skip = 0, fail = 0

  for (const p of products) {
    const publicId = `nuna_mall/${category}/${subCategory}/${p.productCode.replace(/\./g, '')}`

    try {
      // 이미 존재하면 skip
      if (await existsOnCloudinary(publicId)) {
        console.log(`⏭️  ${p.productCode} → skip`)
        results.push(buildRecord(p, category, subCategory, subCategoryLabel, publicId, null))
        skip++
        await sleep(300)
        continue
      }

      // Cloudinary 업로드
      const uploaded = await cloudinary.uploader.upload(p.imgUrl, {
        folder:         `nuna_mall/${category}/${subCategory}`,
        public_id:      p.productCode.replace(/\./g, ''),
        transformation: [{ width: 600, quality: 'auto', fetch_format: 'auto' }],
        overwrite:      false,
      })

      console.log(`✅ ${p.productCode} → 업로드 완료`)
      results.push(buildRecord(p, category, subCategory, subCategoryLabel, uploaded.public_id, uploaded.secure_url))
      success++
    } catch (err) {
      console.error(`❌ ${p.productCode} → 업로드 실패: ${err.message}`)
      fail++
    }

    await sleep(1500)
  }

  console.log(`📊 ${category}/${subCategory} 완료: 성공 ${success} / skip ${skip} / 실패 ${fail}`)
  return { results, success, skip, fail }
}

// ─── 메인 ────────────────────────────────────────────────────────────────────
async function main() {
  let totalSuccess = 0, totalSkip = 0, totalFail = 0

  for (const [category, catData] of Object.entries(CATEGORIES)) {
    const categoryResults = []

    for (const [subCategory, subData] of Object.entries(catData.subCategories)) {
      const { results, success, skip, fail } = await scrapeSubCategory(
        category, subCategory, subData.label, subData.url
      )
      categoryResults.push(...results)
      totalSuccess += success
      totalSkip    += skip
      totalFail    += fail

      await sleep(1500)
    }

    saveJson(category, categoryResults)
  }

  console.log(`\n🎉 전체 완료! 총 성공: ${totalSuccess} / skip: ${totalSkip} / 실패: ${totalFail}`)
}

main().catch((err) => {
  console.error('💥 스크립트 오류:', err)
  process.exit(1)
})
