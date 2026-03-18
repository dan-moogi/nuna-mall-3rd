import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(false)

  // 페이지 이동 시 최상단으로
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  // 300px 이상 스크롤 시 버튼 표시
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="맨 위로"
      className={`fixed bottom-20 right-6 z-50 w-10 h-10 bg-gray-800 text-white rounded-full
        flex items-center justify-center shadow-lg
        transition-opacity duration-300
        ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      ↑
    </button>
  )
}

export default ScrollToTop
