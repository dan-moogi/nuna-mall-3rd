import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-8xl font-bold text-gray-200 select-none">404</h1>
      <p className="text-xl font-medium text-gray-700">페이지를 찾을 수 없습니다.</p>
      <p className="text-sm text-gray-400">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link
        to="/"
        className="mt-4 bg-black text-white px-8 py-3 text-sm font-medium tracking-widest hover:bg-gray-800 transition-colors"
      >
        홈으로
      </Link>
    </div>
  )
}
