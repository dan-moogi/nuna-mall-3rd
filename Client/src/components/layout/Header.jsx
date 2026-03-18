import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'
import { debounce } from '../../utils/debounce'

// ─── 네비게이션 데이터 ────────────────────────────────────────────────────────
const NAV_MENUS = [
  { label: 'BEST ITEM',     path: '/products/best',     sub: [] },
  { label: 'NEW SALE',      path: '/products/new',      sub: [] },
  { label: 'OUTER',         path: '/products/outer',    sub: [
    { label: '점퍼/롱패딩/바람막이', path: '/products/outer?sub=jumper' },
    { label: '가죽자켓',            path: '/products/outer?sub=leather' },
    { label: '패딩/베스트',         path: '/products/outer?sub=padding' },
    { label: '코트/더스터/탑코트',  path: '/products/outer?sub=coat' },
    { label: '항공점퍼/야구잠바',   path: '/products/outer?sub=flight' },
    { label: '무스탕',              path: '/products/outer?sub=mustang' },
    { label: '청재킷/청점퍼',       path: '/products/outer?sub=denim_jacket' },
  ]},
  { label: 'TOP',           path: '/products/top',      sub: [
    { label: '반팔티',        path: '/products/top?sub=short_sleeve' },
    { label: '긴팔티/7부티',  path: '/products/top?sub=long_sleeve' },
    { label: '맨투맨',        path: '/products/top?sub=sweatshirt' },
    { label: '후드티',        path: '/products/top?sub=hoodie' },
    { label: '탑',            path: '/products/top?sub=tank' },
    { label: '가디건',        path: '/products/top?sub=cardigan' },
    { label: '민소매티',      path: '/products/top?sub=sleeveless' },
    { label: '블라우스/남방', path: '/products/top?sub=blouse' },
  ]},
  { label: 'SHIRTS',        path: '/products/shirts',   sub: [
    { label: '셔츠/남방류', path: '/products/shirts?sub=plain' },
    { label: '체크/플란넬', path: '/products/shirts?sub=check' },
    { label: '줄무늬/기타', path: '/products/shirts?sub=stripe' },
  ]},
  { label: 'PANTS',         path: '/products/pants',    sub: [
    { label: '데님팬츠',      path: '/products/pants?sub=denim' },
    { label: '면바지',        path: '/products/pants?sub=cotton' },
    { label: '슬랙스',        path: '/products/pants?sub=slacks' },
    { label: '청반바지',      path: '/products/pants?sub=shorts' },
    { label: '반바지/7부',    path: '/products/pants?sub=half' },
    { label: '레깅스/타이즈', path: '/products/pants?sub=leggings' },
  ]},
  { label: 'TRAINING',      path: '/products/training', sub: [
    { label: '트레이닝 세트', path: '/products/training?sub=set' },
    { label: '트레이닝 상의', path: '/products/training?sub=top' },
    { label: '트레이닝 하의', path: '/products/training?sub=bottom' },
  ]},
  { label: 'ACCESSORY',     path: '/products/accessory',sub: [
    { label: '가방/백팩',        path: '/products/accessory?sub=bag' },
    { label: '지갑',             path: '/products/accessory?sub=wallet' },
    { label: '모자/비니/머플러', path: '/products/accessory?sub=hat' },
    { label: '벨트/양말/키링',   path: '/products/accessory?sub=belt' },
    { label: '시계',             path: '/products/accessory?sub=watch' },
    { label: '넥타이/포켓치프',  path: '/products/accessory?sub=necktie' },
    { label: '선글라스/안경',    path: '/products/accessory?sub=sunglasses' },
    { label: '파티',             path: '/products/accessory?sub=party' },
  ]},
  { label: 'BIG SIZE',      path: '/products/bigsize',  sub: [
    { label: 'TOP',    path: '/products/bigsize?sub=big_top' },
    { label: 'BOTTOM', path: '/products/bigsize?sub=big_bottom' },
  ]},
  { label: 'KEYPLACE JEAN', path: '/products/jean',     sub: [] },
]

// ─── 공지 배너 ────────────────────────────────────────────────────────────────
function NoticeBanner() {
  const [visible, setVisible] = useState(
    () => sessionStorage.getItem('noticeClosed') !== 'true'
  )
  if (!visible) return null
  return (
    <div className="relative bg-[#1a1a1a] text-white text-center text-sm py-2 px-8">
      🌸 봄 신상품 출시 기념 10% 할인 이벤트 진행 중!
      <button
        onClick={() => { sessionStorage.setItem('noticeClosed', 'true'); setVisible(false) }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-lg leading-none"
        aria-label="닫기"
      >×</button>
    </div>
  )
}

// ─── 유틸 바 ─────────────────────────────────────────────────────────────────
function UtilBar() {
  return (
    <div className="bg-[#f5f5f5] text-[#666] text-[12px] py-1">
      <div className="max-w-7xl mx-auto px-4 flex justify-end gap-4">
        <a href="#" className="hover:text-black">네이버톡톡</a>
        <a href="#" className="hover:text-black">카카오채널</a>
        <Link to="/mypage" className="hover:text-black">마이페이지</Link>
        <a href="#" className="hover:text-black">배송조회</a>
        <a href="#" className="hover:text-black">오늘본상품</a>
      </div>
    </div>
  )
}

// ─── 검색 폼 ─────────────────────────────────────────────────────────────────
function SearchForm() {
  const [query, setQuery]             = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen]               = useState(false)
  const navigate  = useNavigate()
  const wrapRef   = useRef(null)

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // debounce 자동완성 (2글자 이상, 최대 5개)
  const fetchSuggestions = debounce(async (q) => {
    if (!q || q.trim().length < 2) { setSuggestions([]); setOpen(false); return }
    try {
      const { productApi } = await import('../../api/productApi')
      const { data } = await productApi.search(q.trim(), 1, 5)
      setSuggestions(data.products ?? [])
      setOpen(true)
    } catch {
      setSuggestions([])
    }
  }, 300)

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    fetchSuggestions(val)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    setSuggestions([])
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
  }

  const handleSelect = (product) => {
    setOpen(false)
    setSuggestions([])
    setQuery('')
    navigate(`/products/detail/${product._id}`)
  }

  return (
    <div ref={wrapRef} className="relative w-[280px]">
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="검색어를 입력하세요"
          autoComplete="off"
          className="flex-1 border border-gray-300 text-sm px-3 py-1.5 outline-none focus:border-black"
        />
        <button type="submit" className="bg-black text-white px-3 text-sm hover:bg-gray-800">
          🔍
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-lg z-50">
          {suggestions.map((p) => (
            <li key={p._id}>
              <button
                className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center gap-2"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(p) }}
              >
                <span className="text-[10px] text-gray-400 shrink-0 font-mono">{p.productCode}</span>
                <span className="text-sm text-gray-700 truncate">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── 카트 배지 ────────────────────────────────────────────────────────────────
function CartBadge() {
  const totalCount = useCartStore((s) => s.totalCount)
  return (
    <Link to="/cart" className="relative hover:text-gray-600">
      CART
      {totalCount > 0 && (
        <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
          {totalCount > 99 ? '99+' : totalCount}
        </span>
      )}
    </Link>
  )
}

// ─── 카테고리 네비 ────────────────────────────────────────────────────────────
function CategoryNav({ onNavigate }) {
  const location   = useLocation()
  const [openIdx, setOpenIdx] = useState(null)
  const navRef     = useRef(null)

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setOpenIdx(null) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = (path) => location.pathname.startsWith(path.split('?')[0]) && path !== '/'

  return (
    <nav ref={navRef} className="hidden md:flex h-[44px] items-center justify-center gap-1 text-[13px] font-medium tracking-wide relative">
      {NAV_MENUS.map((menu, idx) => (
        <div
          key={menu.path}
          className="relative h-full flex items-center"
          onMouseEnter={() => menu.sub.length > 0 && setOpenIdx(idx)}
          onMouseLeave={() => setOpenIdx(null)}
        >
          <Link
            to={menu.path}
            onClick={() => { setOpenIdx(null); onNavigate?.() }}
            className={`px-3 h-full flex items-center border-b-2 transition-colors whitespace-nowrap
              ${isActive(menu.path)
                ? 'font-bold border-black text-black'
                : 'border-transparent text-gray-700 hover:text-black hover:border-black'}`}
          >
            {menu.label}
          </Link>

          {/* 드롭다운 */}
          {menu.sub.length > 0 && (
            <div className={`absolute top-full left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-lg z-50 min-w-[160px] py-1
              transition-all duration-200 origin-top
              ${openIdx === idx ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'}`}
            >
              {menu.sub.map((s) => (
                <Link
                  key={s.path}
                  to={s.path}
                  onClick={() => { setOpenIdx(null); onNavigate?.() }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black whitespace-nowrap"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}

// ─── 모바일 드로어 ────────────────────────────────────────────────────────────
function MobileDrawer({ open, onClose }) {
  const [expandIdx, setExpandIdx] = useState(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 md:hidden
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* 드로어 */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 md:hidden overflow-y-auto
        ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center px-4 py-4 border-b">
          <span className="font-bold text-lg">MENU</span>
          <button onClick={onClose} className="text-2xl leading-none">×</button>
        </div>
        <ul>
          {NAV_MENUS.map((menu, idx) => (
            <li key={menu.path} className="border-b">
              <div className="flex items-center justify-between">
                <Link
                  to={menu.path}
                  onClick={menu.sub.length === 0 ? onClose : undefined}
                  className="flex-1 px-4 py-3 text-sm font-medium hover:bg-gray-50"
                >
                  {menu.label}
                </Link>
                {menu.sub.length > 0 && (
                  <button
                    onClick={() => setExpandIdx(expandIdx === idx ? null : idx)}
                    className="px-4 py-3 text-gray-500"
                  >
                    {expandIdx === idx ? '▲' : '▼'}
                  </button>
                )}
              </div>
              {menu.sub.length > 0 && expandIdx === idx && (
                <ul className="bg-gray-50">
                  {menu.sub.map((s) => (
                    <li key={s.path}>
                      <Link
                        to={s.path}
                        onClick={onClose}
                        className="block px-8 py-2.5 text-sm text-gray-600 hover:text-black"
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

// ─── Header 메인 ──────────────────────────────────────────────────────────────
const Header = () => {
  const { isLoggedIn, user, logout } = useAuthStore()
  const [drawerOpen, setDrawerOpen]  = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* 1. 공지 배너 */}
      <NoticeBanner />

      {/* 2. 유틸 바 */}
      <UtilBar />

      {/* 3. 메인 헤더 */}
      <div className="h-[72px] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
          {/* 로고 */}
          <Link to="/" className="font-serif text-[28px] font-bold tracking-widest text-black shrink-0">
            NUNA MALL
          </Link>

          {/* 검색 (데스크톱) */}
          <div className="hidden md:block">
            <SearchForm />
          </div>

          {/* 우측 유틸 링크 (데스크톱) */}
          <nav className="hidden md:flex items-center gap-5 text-[13px] font-medium tracking-wide text-gray-700">
            {isLoggedIn ? (
              <>
                <span className="text-black">{user?.name}님</span>
                <CartBadge />
                <Link to="/mypage" className="hover:text-black">ORDER</Link>
                <button onClick={logout} className="hover:text-black">LOGOUT</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-black">LOGIN</Link>
                <Link to="/join" className="hover:text-black">JOIN</Link>
                <CartBadge />
                <Link to="/mypage" className="hover:text-black">ORDER</Link>
              </>
            )}
          </nav>

          {/* 햄버거 버튼 (모바일) */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setDrawerOpen(true)}
            aria-label="메뉴 열기"
          >
            <span className="block w-6 h-0.5 bg-black" />
            <span className="block w-6 h-0.5 bg-black" />
            <span className="block w-6 h-0.5 bg-black" />
          </button>
        </div>
      </div>

      {/* 4. 카테고리 네비 (데스크톱) */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <CategoryNav />
        </div>
      </div>

      {/* 5. 모바일 드로어 */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  )
}

export default Header
