import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { paymentApi } from '../api/paymentApi'

export default function PaymentResult() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing') // processing | success | fail
  const [result, setResult] = useState(null)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    const params = {}
    for (const [key, value] of searchParams.entries()) {
      params[key] = value
    }

    paymentApi.confirm(params)
      .then(({ data }) => {
        setResult(data.order)
        setStatus('success')
      })
      .catch((err) => {
        setErrMsg(err.response?.data?.message || '결제 처리 중 오류가 발생했습니다.')
        setStatus('fail')
      })
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Processing ── */
  if (status === 'processing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">결제를 처리하고 있습니다...</p>
      </div>
    )
  }

  /* ── Success ── */
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white shadow-sm p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 완료!</h1>
          <p className="text-gray-500 text-sm mb-8">주문이 정상적으로 접수되었습니다.</p>

          <div className="border border-gray-100 rounded divide-y divide-gray-100 mb-8 text-left">
            <div className="flex justify-between px-4 py-3 text-sm">
              <span className="text-gray-400">주문번호</span>
              <span className="font-medium text-gray-800">{result?.orderNumber}</span>
            </div>
            <div className="flex justify-between px-4 py-3 text-sm">
              <span className="text-gray-400">결제금액</span>
              <span className="font-bold text-gray-900">₩{result?.finalPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between px-4 py-3 text-sm">
              <span className="text-gray-400">결제상태</span>
              <span className="text-green-600 font-medium">{result?.status}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to="/mypage"
              className="flex-1 border border-black text-black py-3 text-sm font-medium text-center hover:bg-gray-50 transition-colors"
            >
              주문 내역 보기
            </Link>
            <Link
              to="/"
              className="flex-1 bg-black text-white py-3 text-sm font-medium text-center hover:bg-gray-800 transition-colors"
            >
              쇼핑 계속하기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ── Fail ── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-sm p-10 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
        <p className="text-gray-500 text-sm mb-8">{errMsg}</p>
        <button
          onClick={() => navigate(-1)}
          className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          다시 시도하기
        </button>
      </div>
    </div>
  )
}
