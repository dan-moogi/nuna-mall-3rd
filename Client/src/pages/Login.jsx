import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi }     from '../api/authApi'
import useAuthStore    from '../store/authStore'
import useCartStore    from '../store/cartStore'

export default function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const setToken  = useAuthStore((s) => s.setToken)
  const setUser   = useAuthStore((s) => s.setUser)
  const fetchCart = useCartStore((s) => s.fetchCart)

  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      setToken(data.accessToken)
      setUser(data.user)
      await fetchCart()
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 w-full max-w-md shadow-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-3xl font-bold tracking-widest text-black">
            NUNA MALL
          </Link>
          <p className="text-sm text-gray-400 mt-2">로그인</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">이메일</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              autoComplete="email"
              className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black transition-colors"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">비밀번호</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                {showPw ? '숨기기' : '보기'}
              </button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 text-sm font-medium tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? '로그인 중...' : '로그인하기'}
          </button>
        </form>

        {/* 회원가입 링크 */}
        <p className="text-center text-sm text-gray-500 mt-6">
          회원이 아니신가요?{' '}
          <Link to="/join" className="text-black font-medium underline underline-offset-2 hover:text-gray-700">
            회원가입하기
          </Link>
        </p>
      </div>
    </div>
  )
}
