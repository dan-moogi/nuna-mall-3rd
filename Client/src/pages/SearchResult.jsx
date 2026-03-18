import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { productApi }  from '../api/productApi'
import ProductCard     from '../components/common/ProductCard'
import SkeletonCard    from '../components/common/SkeletonCard'

const LIMIT = 20

function buildPages(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  let start = Math.max(1, current - 2)
  let end   = Math.min(total, start + 4)
  if (end - start < 4) start = Math.max(1, end - 4)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export default function SearchResult() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q    = searchParams.get('q')    ?? ''
  const page = Number(searchParams.get('page') ?? 1)

  const [products,   setProducts]   = useState([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading,    setLoading]    = useState(false)

  const fetchResults = useCallback(async () => {
    if (!q.trim()) { setProducts([]); setTotal(0); return }
    setLoading(true)
    try {
      const { data } = await productApi.search(q.trim(), page, LIMIT)
      setProducts(data.products   ?? [])
      setTotal(data.total         ?? 0)
      setTotalPages(data.totalPages ?? 0)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [q, page])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    fetchResults()
  }, [fetchResults])

  const setPage = (n) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(n))
    setSearchParams(next, { replace: true })
  }

  const pages = buildPages(page, totalPages)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 검색 결과 헤더 */}
      <div className="mb-6">
        {q ? (
          <h1 className="text-xl font-bold text-gray-900">
            '<span className="text-black">{q}</span>' 검색 결과
            {!loading && (
              <span className="text-sm font-normal text-gray-400 ml-2">({total}개)</span>
            )}
          </h1>
        ) : (
          <h1 className="text-xl font-bold text-gray-400">검색어를 입력해주세요.</h1>
        )}
      </div>

      {/* 결과 없음 */}
      {!loading && q && products.length === 0 && (
        <div className="py-24 text-center text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-medium text-gray-500">검색 결과가 없습니다.</p>
          <p className="text-sm mt-1">다른 검색어로 다시 시도해보세요.</p>
          <Link
            to="/"
            className="mt-6 inline-block border border-gray-800 text-gray-800 text-sm px-8 py-2.5 hover:bg-gray-800 hover:text-white transition-colors"
          >
            홈으로
          </Link>
        </div>
      )}

      {/* 상품 그리드 */}
      {(loading || products.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((p) => <ProductCard key={p._id} product={p} />)
          }
        </div>
      )}

      {/* 페이지네이션 */}
      {!loading && totalPages > 1 && (
        <div className="mt-10 flex justify-center items-center gap-1">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border border-gray-300 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed"
          >
            이전
          </button>

          {pages[0] > 1 && (
            <>
              <button onClick={() => setPage(1)}
                className="px-3 py-1.5 text-sm border border-gray-300 hover:border-black">1</button>
              {pages[0] > 2 && <span className="px-1 text-gray-400">…</span>}
            </>
          )}

          {pages.map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
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
              <button onClick={() => setPage(totalPages)}
                className="px-3 py-1.5 text-sm border border-gray-300 hover:border-black">{totalPages}</button>
            </>
          )}

          <button
            onClick={() => setPage(page + 1)}
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
