import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { optimizeImage }  from '../utils/imageUrl'
import { orderApi }       from '../api/orderApi'
import useAuthStore       from '../store/authStore'
import useCartStore       from '../store/cartStore'
import useToastStore      from '../store/toastStore'
import usePayment         from '../hooks/usePayment'
import AddressModal       from '../components/common/AddressModal'

const SHIPPING_FREE_THRESHOLD = 50000

const EMPTY_ADDRESS = { name: '', phone: '', zip: '', address: '', detail: '' }

export default function Cart() {
  const navigate   = useNavigate()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const user       = useAuthStore((s) => s.user)

  const items          = useCartStore((s) => s.items)
  const totalPrice     = useCartStore((s) => s.totalPrice)
  const totalCount     = useCartStore((s) => s.totalCount)
  const loading        = useCartStore((s) => s.loading)
  const fetchCart      = useCartStore((s) => s.fetchCart)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem     = useCartStore((s) => s.removeItem)

  const showToast      = useToastStore((s) => s.showToast)
  const { requestPayment } = usePayment()

  const [modalOpen, setModalOpen]     = useState(false)
  const [address, setAddress]         = useState(EMPTY_ADDRESS)
  const [orderLoading, setOrderLoading] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // 로그인한 유저 정보로 배송지 기본값 설정
  useEffect(() => {
    if (user) {
      setAddress((a) => ({
        ...a,
        name:  a.name  || user.name  || '',
        phone: a.phone || user.phone || '',
      }))
    }
  }, [user])

  const shippingFee  = totalPrice >= SHIPPING_FREE_THRESHOLD ? 0 : 3000
  const finalPrice   = totalPrice + shippingFee

  const handleAddressChange = (e) => {
    setAddress((a) => ({ ...a, [e.target.name]: e.target.value }))
  }

  const handleOrder = () => {
    if (items.length === 0) return
    setModalOpen(true)
  }

  const handlePayment = async () => {
    if (!address.name || !address.phone || !address.address) {
      showToast('받는분, 연락처, 주소를 모두 입력해주세요.', 'error')
      return
    }
    setOrderLoading(true)
    try {
      const { data } = await orderApi.create({ shippingAddress: address })
      setModalOpen(false)
      await requestPayment(data.order._id)
    } catch (err) {
      showToast(err.response?.data?.message || '주문 생성에 실패했습니다.', 'error')
    } finally {
      setOrderLoading(false)
    }
  }

  // ── 비로그인 ────────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-500">
        <p className="text-5xl">🛒</p>
        <p className="text-lg font-medium">로그인 후 이용 가능합니다.</p>
        <button
          onClick={() => navigate('/login', { state: { from: '/cart' } })}
          className="mt-2 bg-black text-white px-8 py-2.5 text-sm hover:bg-gray-800 transition-colors"
        >
          로그인하기
        </button>
      </div>
    )
  }

  // ── 빈 카트 ─────────────────────────────────────────────────────────────────
  if (!loading && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-500">
        <p className="text-5xl">🛍️</p>
        <p className="text-lg font-medium">장바구니가 비어 있습니다.</p>
        <Link
          to="/products/best"
          className="mt-2 border border-gray-800 text-gray-800 px-8 py-2.5 text-sm hover:bg-gray-800 hover:text-white transition-colors"
        >
          쇼핑 계속하기
        </Link>
      </div>
    )
  }

  // ── 장바구니 ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        장바구니
        <span className="text-base font-normal text-gray-400 ml-2">({totalCount}개)</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 상품 목록 */}
        <div className="flex-1 min-w-0">
          <div className="border-t border-gray-900">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4 py-5 border-b border-gray-100 animate-pulse">
                    <div className="w-[60px] h-[80px] bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))
              : items.map((item) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    onUpdateQty={updateQuantity}
                    onRemove={removeItem}
                  />
                ))
            }
          </div>

          <div className="mt-6 flex justify-between items-center">
            <Link
              to="/products/best"
              className="text-sm text-gray-500 underline underline-offset-2 hover:text-black"
            >
              ← 쇼핑 계속하기
            </Link>
          </div>
        </div>

        {/* 결제 요약 */}
        <div className="lg:w-72 shrink-0">
          <div className="border border-gray-200 p-6 sticky top-24">
            <h2 className="text-base font-bold mb-4">결제 정보</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">총 상품금액</span>
                <span>₩{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">배송비</span>
                <span>
                  {shippingFee === 0
                    ? <span className="text-blue-500">무료</span>
                    : `₩${shippingFee.toLocaleString()}`
                  }
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-gray-400">
                  ₩{(SHIPPING_FREE_THRESHOLD - totalPrice).toLocaleString()} 더 구매 시 무료배송
                </p>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>결제예정금액</span>
                <span className="text-black">₩{finalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleOrder}
              disabled={items.length === 0}
              className="w-full mt-6 bg-black text-white py-3.5 text-sm font-medium tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              주문하기
            </button>
          </div>
        </div>
      </div>

      {/* 배송지 모달 */}
      <AddressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        address={address}
        onChange={handleAddressChange}
        onConfirm={handlePayment}
        loading={orderLoading}
      />
    </div>
  )
}

// ── 장바구니 아이템 행 ─────────────────────────────────────────────────────────
function CartItem({ item, onUpdateQty, onRemove }) {
  const [qty, setQty] = useState(item.quantity)

  const handleQty = (next) => {
    if (next < 1) return
    setQty(next)
    onUpdateQty(item._id, next)
  }

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100">
      {/* 이미지 */}
      <div className="w-[60px] h-[80px] bg-gray-100 shrink-0 overflow-hidden">
        <img
          src={optimizeImage(item.cloudinaryUrl, 120)}
          alt={item.productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug line-clamp-2">{item.productName}</p>
        <p className="text-xs text-gray-400 mt-1">
          {[item.color, item.size].filter(Boolean).join(' / ')}
        </p>

        <div className="flex items-center justify-between mt-3">
          {/* 수량 조절 */}
          <div className="flex items-center border border-gray-300">
            <button
              onClick={() => handleQty(qty - 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg leading-none"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{qty}</span>
            <button
              onClick={() => handleQty(qty + 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg leading-none"
            >
              +
            </button>
          </div>

          {/* 가격 */}
          <span className="text-sm font-semibold text-gray-900">
            ₩{(item.price * qty).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 삭제 */}
      <button
        onClick={() => onRemove(item._id)}
        className="self-start text-gray-300 hover:text-gray-600 text-xl leading-none mt-0.5"
        aria-label="삭제"
      >
        ×
      </button>
    </div>
  )
}
