import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useProductStore from '../store/productStore'
import HeroBanner  from '../components/common/HeroBanner'
import ProductCard from '../components/common/ProductCard'
import SkeletonCard from '../components/common/SkeletonCard'

const SECTIONS = [
  {
    key:      'best',
    title:    'Best Item',
    sub:      '지리아 베스트상품을 소개합니다!',
    link:     '/products/best',
    linkTag:  'tag/best',
  },
  {
    key:      'newSale',
    title:    'New Item Sale',
    sub:      '최신상품! 특가가격을 놓치지마세요.',
    link:     '/products/new',
    linkTag:  'tag/new',
  },
  {
    key:      'pantsBest',
    title:    'Pants Best',
    sub:      '유행을 앞서라! 지리아 팬츠 베스트 상품입니다.',
    link:     '/products/pants',
    linkTag:  'tag/pants-best',
  },
  {
    key:      'cody',
    title:    'Cody Item',
    sub:      '지리아 코디 아이템!',
    link:     '/products/accessory',
    linkTag:  'tag/cody',
  },
]

// 섹션 컴포넌트
function ProductSection({ title, sub, link, products, loading }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{sub}</p>
      </div>

      {/* 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : products.map((p) => <ProductCard key={p._id} product={p} />)
        }
      </div>

      {/* 더보기 */}
      <div className="mt-8 text-center">
        <Link
          to={link}
          className="inline-block border border-gray-800 text-gray-800 text-sm px-8 py-2.5 hover:bg-gray-800 hover:text-white transition-colors tracking-widest"
        >
          더보기 →
        </Link>
      </div>
    </section>
  )
}

export default function Home() {
  const homeData     = useProductStore((s) => s.homeData)
  const loading      = useProductStore((s) => s.loading)
  const fetchHomeData = useProductStore((s) => s.fetchHomeData)

  useEffect(() => { fetchHomeData() }, [fetchHomeData])

  return (
    <div>
      {/* 히어로 배너 */}
      <HeroBanner />

      {/* 구분선 */}
      <div className="border-t border-gray-100" />

      {/* 4개 섹션 */}
      {SECTIONS.map((s, i) => (
        <div key={s.key}>
          <ProductSection
            title={s.title}
            sub={s.sub}
            link={s.link}
            products={homeData[s.key]}
            loading={loading}
          />
          {i < SECTIONS.length - 1 && <div className="border-t border-gray-100 max-w-7xl mx-auto" />}
        </div>
      ))}
    </div>
  )
}
