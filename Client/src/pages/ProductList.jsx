import { useEffect, useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import useProductStore from '../store/productStore'
import ProductCard     from '../components/common/ProductCard'
import SkeletonCard    from '../components/common/SkeletonCard'

// ─── 카테고리 메타 ────────────────────────────────────────────────────────────
const CATEGORY_INFO = {
  outer:     { label: '아우터',    subs: [
    {key:'',label:'전체'},{key:'jumper',label:'점퍼/롱패딩'},{key:'leather',label:'가죽자켓'},
    {key:'padding',label:'패딩/베스트'},{key:'coat',label:'코트'},{key:'mustang',label:'무스탕'},
    {key:'denim_jacket',label:'청재킷'},
  ]},
  top:       { label: '상의',      subs: [
    {key:'',label:'전체'},{key:'short_sleeve',label:'반팔티'},{key:'long_sleeve',label:'긴팔티'},
    {key:'sweatshirt',label:'맨투맨'},{key:'hoodie',label:'후드티'},
    {key:'cardigan',label:'가디건'},{key:'blouse',label:'블라우스'},
  ]},
  shirts:    { label: '셔츠',      subs: [
    {key:'',label:'전체'},{key:'plain',label:'셔츠/남방류'},{key:'check',label:'체크/플란넬'},{key:'stripe',label:'줄무늬/기타'},
  ]},
  pants:     { label: '팬츠',      subs: [
    {key:'',label:'전체'},{key:'denim',label:'데님팬츠'},{key:'cotton',label:'면바지'},
    {key:'slacks',label:'슬랙스'},{key:'shorts',label:'청반바지'},{key:'half',label:'반바지'},{key:'leggings',label:'레깅스'},
  ]},
  training:  { label: '트레이닝',  subs: [
    {key:'',label:'전체'},{key:'set',label:'세트'},{key:'top',label:'상의'},{key:'bottom',label:'하의'},
  ]},
  accessory: { label: '악세서리',  subs: [
    {key:'',label:'전체'},{key:'bag',label:'가방/백팩'},{key:'wallet',label:'지갑'},
    {key:'hat',label:'모자'},{key:'belt',label:'벨트/양말'},{key:'watch',label:'시계'},{key:'sunglasses',label:'선글라스'},
  ]},
  bigsize:   { label: '빅사이즈',  subs: [
    {key:'',label:'전체'},{key:'big_top',label:'TOP'},{key:'big_bottom',label:'BOTTOM'},
  ]},
  jean:      { label: 'KEYPLACE JEAN', subs: [{key:'',label:'전체'}] },
  best:      { label: 'BEST ITEM', subs: [{key:'',label:'전체'}] },
  new:       { label: 'NEW SALE',  subs: [{key:'',label:'전체'}] },
}

const TAG_CATEGORIES = new Set(['best', 'new'])
const SORT_OPTIONS   = [
  { value: 'latest',  label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'low',     label: '낮은 가격순' },
  { value: 'high',    label: '높은 가격순' },
]
const LIMIT = 20

// 페이지네이션 번호 배열 생성 (최대 5개 + 말줄임)
function buildPages(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  let start = Math.max(1, current - 2)
  let end   = Math.min(total, start + 4)
  if (end - start < 4) start = Math.max(1, end - 4)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export default function ProductList() {
  const { category } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const sub  = searchParams.get('sub')  ?? ''
  const sort = searchParams.get('sort') ?? 'latest'
  const page = Number(searchParams.get('page') ?? 1)

  const products      = useProductStore((s) => s.products)
  const total         = useProductStore((s) => s.total)
  const totalPages    = useProductStore((s) => s.totalPages)
  const loading       = useProductStore((s) => s.loading)
  const fetchProducts = useProductStore((s) => s.fetchProducts)

  const isTag = TAG_CATEGORIES.has(category)
  const meta  = CATEGORY_INFO[category] ?? { label: category, subs: [{key:'',label:'전체'}] }

  const apiParams = useMemo(() => {
    const p = { sort, page, limit: LIMIT }
    if (isTag) {
      p.tag = category
    } else {
      p.category = category
      if (sub) p.subCategory = sub
    }
    return p
  }, [category, sub, sort, page, isTag])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    fetchProducts(apiParams)
  }, [apiParams, fetchProducts])

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const pages = buildPages(page, totalPages)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 타이틀 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {meta.label}
          {!loading && (
            <span className="text-sm font-normal text-gray-400 ml-2">({total}개)</span>
          )}
        </h1>
      </div>

      {/* 서브카테고리 탭 */}
      {meta.subs.length > 1 && (
        <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto">
          {meta.subs.map((s) => {
            const active = sub === s.key
            return (
              <button
                key={s.key}
                onClick={() => setParam('sub', s.key)}
                className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors
                  ${active
                    ? 'border-black text-black font-bold'
                    : 'border-transparent text-gray-400 hover:text-gray-700'}`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      )}

      {/* 정렬 */}
      <div className="flex justify-end mb-4">
        <select
          value={sort}
          onChange={(e) => setParam('sort', e.target.value)}
          className="text-sm border border-gray-300 px-3 py-1.5 outline-none focus:border-black"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* 상품 그리드 */}
      {!loading && products.length === 0 ? (
        <div className="py-24 text-center text-gray-400">
          <p className="text-4xl mb-4">🛍️</p>
          <p className="text-lg">상품이 없습니다.</p>
          <Link to="/" className="mt-4 inline-block text-sm underline underline-offset-2 hover:text-black">
            홈으로 돌아가기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((p) => <ProductCard key={p._id} product={p} />)
          }
        </div>
      )}

      {/* 페이지네이션 */}
      {!loading && totalPages > 1 && (
        <div className="mt-10 flex justify-center items-center gap-1">
          <button
            onClick={() => setParam('page', String(page - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border border-gray-300 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed"
          >
            이전
          </button>

          {pages[0] > 1 && (
            <>
              <button onClick={() => setParam('page', '1')}
                className="px-3 py-1.5 text-sm border border-gray-300 hover:border-black">1</button>
              {pages[0] > 2 && <span className="px-1 text-gray-400">…</span>}
            </>
          )}

          {pages.map((n) => (
            <button
              key={n}
              onClick={() => setParam('page', String(n))}
              className={`px-3 py-1.5 text-sm border transition-colors
                ${n === page
                  ? 'bg-black text-white border-black'
                  : 'border-gray-300 hover:border-black'}`}
            >
              {n}
            </button>
          ))}

          {pages[pages.length - 1] < totalPages && (
            <>
              {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
              <button onClick={() => setParam('page', String(totalPages))}
                className="px-3 py-1.5 text-sm border border-gray-300 hover:border-black">{totalPages}</button>
            </>
          )}

          <button
            onClick={() => setParam('page', String(page + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}
