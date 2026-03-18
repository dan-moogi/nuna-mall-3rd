import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore  from '../store/authStore'
import useCartStore  from '../store/cartStore'
import useToastStore from '../store/toastStore'
import { orderApi }  from '../api/orderApi'

const GRADE_COLOR = {
  일반: 'bg-gray-100 text-gray-600',
  우수: 'bg-blue-100 text-blue-600',
  VIP:  'bg-yellow-100 text-yellow-700',
}

const TABS = [
  { key: 'orders', label: '주문 내역' },
  { key: 'info',   label: '회원 정보' },
]

const STATUS_COLOR = {
  결제대기: 'text-yellow-600',
  결제완료: 'text-blue-600',
  배송준비: 'text-blue-600',
  배송중:   'text-indigo-600',
  배송완료: 'text-green-600',
  취소:     'text-gray-400',
  환불:     'text-red-500',
}

export default function Mypage() {
  const navigate    = useNavigate()
  const user        = useAuthStore((s) => s.user)
  const logout      = useAuthStore((s) => s.logout)
  const clearCart   = useCartStore((s) => s.clearCart)
  const showToast   = useToastStore((s) => s.showToast)

  const [tab, setTab]       = useState('orders')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const { data } = await orderApi.getAll()
      setOrders(data.orders || [])
    } catch {
      showToast('주문 내역을 불러오지 못했습니다.', 'error')
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'orders') fetchOrders()
  }, [tab])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await logout()
    clearCart()
    navigate('/')
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('주문을 취소하시겠습니까?')) return
    try {
      await orderApi.cancel(orderId)
      showToast('주문이 취소되었습니다.', 'success')
      fetchOrders()
    } catch (err) {
      showToast(err.response?.data?.message || '취소에 실패했습니다.', 'error')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <p>사용자 정보를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
        <button
          onClick={handleLogout}
          className="text-sm border border-gray-300 px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          로그아웃
        </button>
      </div>

      {/* 유저 요약 카드 */}
      <div className="bg-white border border-gray-100 shadow-sm p-6 mb-8 flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold shrink-0">
          {user.name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-gray-900">{user.name}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${GRADE_COLOR[user.grade] || GRADE_COLOR['일반']}`}>
              {user.grade || '일반'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-400 mb-0.5">보유 포인트</p>
          <p className="text-xl font-bold text-black">{(user.points || 0).toLocaleString()}P</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors
              ${tab === t.key ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 주문 내역 탭 */}
      {tab === 'orders' && (
        ordersLoading ? (
          <div className="py-16 text-center text-gray-400">불러오는 중...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-base font-medium text-gray-500">주문 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white border border-gray-100 shadow-sm p-5">
                {/* 주문 헤더 */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('ko-KR')}</span>
                    <span className="mx-2 text-gray-200">|</span>
                    <span className="text-xs font-medium text-gray-600">{order.orderNumber}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${STATUS_COLOR[order.status] || 'text-gray-600'}`}>
                      {order.status}
                    </span>
                    {['결제완료', '배송준비'].includes(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="text-xs border border-gray-300 px-3 py-1 text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        주문 취소
                      </button>
                    )}
                  </div>
                </div>

                {/* 상품 목록 */}
                <div className="space-y-2 mb-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.cloudinaryUrl ? (
                        <img src={item.cloudinaryUrl} alt={item.productName} className="w-14 h-14 object-cover bg-gray-100 shrink-0" />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{item.productName}</p>
                        <p className="text-xs text-gray-400">{item.color} / {item.size} / {item.quantity}개</p>
                      </div>
                      <p className="text-sm font-medium text-gray-800 shrink-0">
                        ₩{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 결제 요약 */}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    배송비 {order.shippingFee === 0 ? '무료' : `₩${order.shippingFee?.toLocaleString()}`}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    총 ₩{order.finalPrice?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* 회원 정보 탭 */}
      {tab === 'info' && (
        <div className="bg-white border border-gray-100 shadow-sm">
          {[
            { label: '이름',     value: user.name },
            { label: '이메일',   value: user.email },
            { label: '전화번호', value: user.phone || '-' },
            { label: '등급',     value: user.grade || '일반' },
            { label: '포인트',   value: `${(user.points || 0).toLocaleString()}P` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center border-b border-gray-50 last:border-0 px-6 py-4">
              <span className="w-24 text-sm text-gray-400 shrink-0">{label}</span>
              <span className="text-sm text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
