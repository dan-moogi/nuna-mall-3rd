import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi }       from '../api/authApi'
import useToastStore     from '../store/toastStore'

const PW_RULES = [
  { test: (pw) => pw.length >= 8,                              label: '8자 이상' },
  { test: (pw) => /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw),   label: '영문 + 숫자 조합' },
]

export default function Join() {
  const navigate   = useNavigate()
  const showToast  = useToastStore((s) => s.showToast)

  const [form, setForm] = useState({
    name: '', email: '', password: '', passwordConfirm: '', phone: '',
  })
  const [showPw, setShowPw]         = useState(false)
  const [showPwC, setShowPwC]       = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const pwValid   = PW_RULES.every((r) => r.test(form.password))
  const pwMatch   = form.password && form.passwordConfirm && form.password === form.passwordConfirm
  const pwNoMatch = form.passwordConfirm && form.password !== form.passwordConfirm

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.passwordConfirm) {
      setError('필수 항목을 모두 입력해주세요.')
      return
    }
    if (!pwValid) {
      setError('비밀번호 형식을 확인해주세요.')
      return
    }
    if (!pwMatch) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    try {
      const payload = { name: form.name, email: form.email, password: form.password }
      if (form.phone) payload.phone = form.phone
      await authApi.register(payload)
      showToast('회원가입이 완료되었습니다!')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white p-10 w-full max-w-md shadow-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-3xl font-bold tracking-widest text-black">
            GERIO
          </Link>
          <p className="text-sm text-gray-400 mt-2">회원가입</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              이름 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="홍길동"
              maxLength={20}
              className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black transition-colors"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              이메일 <span className="text-red-400">*</span>
            </label>
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
            <label className="block text-xs font-medium text-gray-600 mb-1">
              비밀번호 <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="영문+숫자 8자 이상"
                autoComplete="new-password"
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
            {/* 비밀번호 규칙 */}
            {form.password && (
              <ul className="mt-2 space-y-1">
                {PW_RULES.map((rule) => {
                  const ok = rule.test(form.password)
                  return (
                    <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-500' : 'text-gray-300'}`}>
                      <span>{ok ? '✓' : '○'}</span>
                      <span>{rule.label}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              비밀번호 확인 <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPwC ? 'text' : 'password'}
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                autoComplete="new-password"
                className={`w-full border px-4 py-2.5 text-sm outline-none transition-colors pr-12
                  ${pwMatch ? 'border-green-400 focus:border-green-500'
                  : pwNoMatch ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-300 focus:border-black'}`}
              />
              <button
                type="button"
                onClick={() => setShowPwC((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                {showPwC ? '숨기기' : '보기'}
              </button>
            </div>
            {form.passwordConfirm && (
              <p className={`text-xs mt-1 ${pwMatch ? 'text-green-500' : 'text-red-400'}`}>
                {pwMatch ? '✓ 비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
              </p>
            )}
          </div>

          {/* 전화번호 (선택) */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              전화번호 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black transition-colors"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          {/* 가입 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 text-sm font-medium tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? '처리 중...' : '회원가입하기'}
          </button>
        </form>

        {/* 로그인 링크 */}
        <p className="text-center text-sm text-gray-500 mt-6">
          이미 회원이신가요?{' '}
          <Link to="/login" className="text-black font-medium underline underline-offset-2 hover:text-gray-700">
            로그인하기
          </Link>
        </p>
      </div>
    </div>
  )
}
