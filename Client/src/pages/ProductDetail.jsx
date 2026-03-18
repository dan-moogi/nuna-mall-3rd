import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productApi }   from '../api/productApi'
import { optimizeImage } from '../utils/imageUrl'
import useAuthStore     from '../store/authStore'
import useCartStore     from '../store/cartStore'
import useToastStore    from '../store/toastStore'
import ProductCard      from '../components/common/ProductCard'
import SkeletonCard     from '../components/common/SkeletonCard'

const DUMMY_COLORS = ['베이지','카키','차콜','블랙','화이트','네이비','그레이','브라운','빨강','블루','그린','아이보리']
const SIZES        = ['S', 'M', 'L', 'XL', 'XXL']

// ─── 아코디언 ─────────────────────────────────────────────────────────────────
function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-gray-200">
      <button
        className="w-full flex items-center justify-between py-4 text-sm font-medium text-gray-800 hover:text-black"
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <span className="text-lg leading-none text-gray-400">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="pb-5 text-sm text-gray-600 leading-relaxed">{children}</div>}
    </div>
  )
}

export default function ProductDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const addToCart  = useCartStore((s) => s.addToCart)
  const showToast  = useToastStore((s) => s.showToast)

  const [product,  setProduct]  = useState(null)
  const [related,  setRelated]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize,  setSelectedSize]  = useState(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setLoading(true)
    setSelectedColor(null)
    setSelectedSize(null)
    setQuantity(1)
    window.scrollTo({ top: 0 })

    Promise.all([
      productApi.getById(id),
      productApi.getRelated(id),
    ]).then(([prodRes, relRes]) => {
      setProduct(prodRes.data.product)
      setRelated(relRes.data.products ?? [])
    }).catch(() => {
      navigate('/404', { replace: true })
    }).finally(() => setLoading(false))
  }, [id, navigate])

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/products/detail/${id}` } })
      return
    }
    if (!selectedColor) {
      showToast('색상을 선택해주세요.', 'error')
      return
    }
    if (!selectedSize) {
      showToast('사이즈를 선택해주세요.', 'error')
      return
    }
    addToCart({
      productId:    product._id,
      productCode:  product.productCode,
      productName:  product.name,
      cloudinaryUrl: product.cloudinaryUrl,
      color:        selectedColor,
      size:         selectedSize,
      quantity,
      price:        product.salePrice,
    })
  }

  if (loading) return <ProductDetailSkeleton />

  if (!product) return null

  const colors = DUMMY_COLORS.slice(0, product.colorCount || 1)
  const shippingFree = product.salePrice >= 50000

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* 브레드크럼 */}
      <nav className="text-xs text-gray-400 mb-6">
        <Link to="/" className="hover:text-black">홈</Link>
        <span className="mx-1">/</span>
        <Link to={`/products/${product.category}`} className="hover:text-black capitalize">
          {product.category}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 line-clamp-1">{product.name}</span>
      </nav>

      {/* ── 2컬럼 레이아웃 ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* 이미지 */}
        <div className="md:w-1/2">
          <div className="aspect-square bg-gray-100 overflow-hidden">
            <img
              src={optimizeImage(product.cloudinaryUrl, 600)}
              alt={product.name}
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="md:w-1/2 flex flex-col">
          {/* 코드 */}
          <p className="text-[12px] text-[#999] mb-1">{product.productCode}</p>
          {/* 상품명 */}
          <h1 className="text-[20px] font-bold text-gray-900 leading-snug mb-4">{product.name}</h1>

          <div className="border-t border-gray-200 pt-4 mb-4">
            {/* 가격 */}
            <div className="flex items-baseline gap-3 flex-wrap">
              {product.originalPrice > product.salePrice && (
                <span className="text-sm text-gray-400 line-through">
                  ₩{product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-2xl font-bold text-gray-900">
                ₩{product.salePrice.toLocaleString()}
              </span>
              {product.discountRate > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                  {product.discountRate}%
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-5 flex-1">
            {/* 색상 선택 */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">
                색상{selectedColor && <span className="ml-2 text-black font-semibold">{selectedColor}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 text-xs border transition-colors
                      ${selectedColor === c
                        ? 'border-2 border-black text-black font-semibold'
                        : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 사이즈 선택 */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">사이즈</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-12 py-1.5 text-xs border transition-colors
                      ${selectedSize === s
                        ? 'bg-black text-white border-black'
                        : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* 수량 */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">수량</p>
              <div className="flex items-center border border-gray-300 w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* 배송 안내 */}
            <div className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">배송 </span>
              {shippingFree
                ? <span className="text-blue-500 font-medium">무료배송</span>
                : '₩3,000 (₩50,000 이상 무료)'}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 text-sm font-medium border-2 border-black text-black tracking-widest hover:bg-gray-50 transition-colors"
            >
              장바구니 담기
            </button>
            <button
              onClick={() => alert('준비중입니다.')}
              className="w-full py-3.5 text-sm font-medium bg-black text-white tracking-widest hover:bg-gray-800 transition-colors"
            >
              바로 구매
            </button>
          </div>
        </div>
      </div>

      {/* ── 아코디언 ──────────────────────────────────────────────────────────── */}
      <div className="mt-12 max-w-2xl">
        <Accordion title="상품 상세" defaultOpen={true}>
          <p className="text-gray-500">
            {product.description || '상품 상세 정보가 준비 중입니다.'}
          </p>
          <div className="mt-3 text-xs text-gray-400 space-y-1">
            <p>• 상품코드: {product.productCode}</p>
            <p>• 카테고리: {product.subCategoryLabel || product.category}</p>
            {product.colorCount > 1 && <p>• 컬러: {product.colorCount}가지</p>}
          </div>
        </Accordion>

        <Accordion title="사이즈 가이드">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {['사이즈','어깨','가슴','허리','총장'].map((h) => (
                    <th key={h} className="border border-gray-200 px-3 py-2 text-center font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['S',  '43', '48', '46', '65'],
                  ['M',  '45', '50', '48', '67'],
                  ['L',  '47', '52', '50', '69'],
                  ['XL', '49', '54', '52', '71'],
                  ['XXL','51', '56', '54', '73'],
                ].map(([size, ...vals]) => (
                  <tr key={size} className="text-center">
                    <td className="border border-gray-200 px-3 py-2 font-medium">{size}</td>
                    {vals.map((v, i) => (
                      <td key={i} className="border border-gray-200 px-3 py-2 text-gray-500">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">* 단위: cm / 측정 방법에 따라 1~3cm 오차가 있을 수 있습니다.</p>
        </Accordion>

        <Accordion title="배송/교환/반품 안내">
          <div className="space-y-3 text-xs text-gray-500">
            <div>
              <p className="font-medium text-gray-700 mb-1">배송 안내</p>
              <p>• 오전 12시 이전 결제 완료 시 당일 발송 (주말/공휴일 제외)</p>
              <p>• 배송기간: 결제 완료 후 1~3 영업일</p>
              <p>• 도서산간 지역은 추가 배송비가 발생할 수 있습니다.</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">교환/반품 안내</p>
              <p>• 수령일로부터 7일 이내 교환/반품 가능</p>
              <p>• 착용/세탁/훼손된 상품은 교환/반품 불가</p>
              <p>• 교환/반품 배송비: 고객 부담 ₩5,000</p>
            </div>
          </div>
        </Accordion>
      </div>

      {/* ── 연관 상품 ─────────────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-lg font-bold text-gray-900 mb-4">연관 상품</h2>
          <div className="flex overflow-x-auto gap-4 pb-2 -mx-1 px-1">
            {related.map((p) => (
              <div key={p._id} className="min-w-[180px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── 스켈레톤 ─────────────────────────────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-1/2 aspect-square bg-gray-200" />
        <div className="md:w-1/2 space-y-4">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-8 bg-gray-200 rounded w-1/3 mt-6" />
          <div className="h-4 bg-gray-100 rounded w-full mt-4" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
          <div className="flex gap-2 mt-4">
            {Array.from({length: 4}).map((_, i) => <div key={i} className="h-8 w-16 bg-gray-200 rounded" />)}
          </div>
        </div>
      </div>
    </div>
  )
}
