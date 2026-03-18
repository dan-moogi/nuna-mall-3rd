import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const SLIDES = [
  { bg: '#1a1a2e', title: 'SPRING NEW ARRIVAL',  sub: '2024 봄 신상품 컬렉션',         btn: '신상품 보러가기', link: '/products/new' },
  { bg: '#16213e', title: 'BEST JEAN COLLECTION', sub: '가장 사랑받는 데님 라인업',      btn: '청바지 보기',    link: '/products/pants' },
  { bg: '#2d3561', title: 'OUTER SEASON',          sub: '트렌디한 아우터 컬렉션',         btn: '아우터 보기',    link: '/products/outer' },
  { bg: '#533483', title: 'NEW 10% SALE',          sub: '신상품 출시 기념 10% 할인',      btn: '세일 상품 보기', link: '/products/best' },
  { bg: '#2d6a4f', title: 'TRAINING COLLECTION',  sub: '편안하고 스타일리시한 트레이닝', btn: '트레이닝 보기',  link: '/products/training' },
]

const HeroBanner = () => {
  const [idx, setIdx]   = useState(0)
  const navigate        = useNavigate()
  const touchStartX     = useRef(null)
  const intervalRef     = useRef(null)

  const prev = useCallback(() => setIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length), [])
  const next = useCallback(() => setIdx((i) => (i + 1) % SLIDES.length), [])

  // 4초 자동 슬라이드
  useEffect(() => {
    intervalRef.current = setInterval(next, 4000)
    return () => clearInterval(intervalRef.current)
  }, [next])

  // 터치 스와이프
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev() }
    touchStartX.current = null
  }

  const slide = SLIDES[idx]

  return (
    <div
      className="relative h-[280px] md:h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden select-none transition-colors duration-700"
      style={{ backgroundColor: slide.bg }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 텍스트 */}
      <div className="text-center text-white z-10 px-6">
        <p className="text-xs md:text-sm tracking-[0.3em] text-white/60 mb-3 uppercase">{slide.sub}</p>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-widest mb-6">{slide.title}</h2>
        <button
          onClick={() => navigate(slide.link)}
          className="border border-white text-white text-sm px-8 py-2.5 hover:bg-white hover:text-black transition-colors tracking-widest"
        >
          {slide.btn}
        </button>
      </div>

      {/* 화살표 */}
      <button onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-3xl w-10 h-10 flex items-center justify-center">
        ‹
      </button>
      <button onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-3xl w-10 h-10 flex items-center justify-center">
        ›
      </button>

      {/* Dot 인디케이터 */}
      <div className="absolute bottom-5 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === idx ? 'bg-white w-6' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroBanner
