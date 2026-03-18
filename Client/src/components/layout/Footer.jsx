import { Link } from 'react-router-dom'

const LINKS = ['Guide', '이용약관', '개인정보처리방침', '고객게시판', '회원탈퇴', '배송조회']

const Footer = () => (
  <footer className="bg-[#f8f8f8] border-t border-gray-200 mt-auto">
    {/* 상단 링크 바 */}
    <div className="border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-500">
        {LINKS.map((l) => (
          <a key={l} href="#" className="hover:text-black">{l}</a>
        ))}
      </div>
    </div>

    {/* 3컬럼 본문 */}
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-600">
      {/* 회사 정보 */}
      <div className="space-y-1.5 leading-relaxed">
        <p className="font-semibold text-gray-800 mb-2">Company Info</p>
        <p><span className="text-gray-400">Company </span>라이프스타일소사이어티(주)</p>
        <p><span className="text-gray-400">CEO </span>주병희</p>
        <p><span className="text-gray-400">Tel </span>1544-3668</p>
        <p><span className="text-gray-400">Address </span>경기도 광주시 오포로 190 오포GC타워 312~314호</p>
        <p><span className="text-gray-400">개인정보보호책임자 </span>주병희 (gerio@gerio.co.kr)</p>
        <p><span className="text-gray-400">사업자 </span>201-86-23653</p>
        <p><span className="text-gray-400">통신판매업 </span>제2023-경기광주-0512호</p>
      </div>

      {/* CS + 은행 */}
      <div className="space-y-5">
        <div>
          <p className="font-semibold text-gray-800 mb-2">CS CENTER</p>
          <p className="text-2xl font-bold text-gray-900">1544-3668</p>
          <p className="text-xs text-gray-400 mt-1">월~금 10:00 ~ 17:00</p>
          <p className="text-xs text-gray-400">점심 13:00 ~ 14:00</p>
          <p className="text-xs text-gray-400">토 · 일 · 공휴일 CLOSE</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">BANK</p>
          <p className="text-xs">신한 100-031-185807</p>
          <p className="text-xs text-gray-400">예금주: 라이프스타일소사이어티</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">RETURN</p>
          <p className="text-xs leading-relaxed">경기도 포천시 가산면 마산동 370-1<br />경기물류단지 라동2층</p>
        </div>
      </div>

      {/* SNS */}
      <div>
        <p className="font-semibold text-gray-800 mb-3">FOLLOW US</p>
        <div className="flex gap-3">
          <a href="#" aria-label="Instagram"
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-pink-500 hover:text-white flex items-center justify-center transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
          <a href="#" aria-label="YouTube"
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
          <a href="#" aria-label="KakaoTalk"
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-yellow-400 flex items-center justify-center transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.674 5.076 4.2 6.48L5.1 21l4.62-2.82c.75.12 1.53.18 2.28.18 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>

    {/* 카피라이트 */}
    <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
      Copyright © 라이프스타일소사이어티(주) All Rights Reserved.
    </div>
  </footer>
)

export default Footer
