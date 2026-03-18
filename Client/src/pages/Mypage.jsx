import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore  from '../store/authStore'
import useCartStore  from '../store/cartStore'

const GRADE_COLOR = { 일반: 'bg-gray-100 text-gray-600', 우수: 'bg-blue-100 text-blue-600', VIP: 'bg-yellow-100 text-yellow-700' }

const TABS = [
  { key: 'orders',   label: '주문 내역' },
  { key: 'info',     label: '회원 정보' },
]

export default function Mypage() {
  const navigate   = useNavigate()
  const user       = useAuthStore((s) => s.user)
  const logout     = useAuthStore((s) => s.logout)
  const clearCart  = useCartStore((s) => s.clearCart)
  const [tab, setTab] = useState('orders')

  const handleLogout = async () => {
    await logout()
    clearCart()
    navigate('/')
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
        {/* 아바타 */}
        <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold shrink-0">
          {user.name?.charAt(0) || 'U'}
        </div>
        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-gray-900">{user.name}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${GRADE_COLOR[user.grade] || GRADE_COLOR['일반']}`}>
              {user.grade || '일반'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
        </div>
        {/* 포인트 */}
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
        <div className="py-16 text-center text-gray-400">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-base font-medium text-gray-500">주문 내역이 없습니다.</p>
          <p className="text-sm mt-1">주문 기능은 Phase 6에서 구현됩니다.</p>
        </div>
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

          <div className="px-6 py-4 bg-gray-50">
            <p className="text-xs text-gray-400">
              회원 정보 수정 기능은 Phase 6에서 구현됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
