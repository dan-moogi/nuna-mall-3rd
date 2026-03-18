import { useState } from 'react'
import { paymentApi } from '../api/paymentApi'
import useToastStore from '../store/toastStore'

// 테스트/운영 SDK를 동적으로 로드
function loadInicisSDK(isTest) {
  return new Promise((resolve, reject) => {
    const src = isTest
      ? 'https://stgstdpay.inicis.com/stdjs/INIStdPay.js'
      : 'https://stdpay.inicis.com/stdjs/INIStdPay.js'

    // 이미 로드된 같은 SDK면 재사용
    if (window.INIStdPay) {
      const existing = document.querySelector('script[data-inicis]')
      const alreadyCorrect = existing && existing.src === src
      if (alreadyCorrect) { resolve(); return }
    }

    // 기존 SDK 제거 후 재로드
    document.querySelectorAll('script[data-inicis]').forEach((s) => s.remove())
    delete window.INIStdPay

    const script = document.createElement('script')
    script.src = src
    script.charset = 'UTF-8'
    script.setAttribute('data-inicis', '')
    script.onload = resolve
    script.onerror = () => reject(new Error('KG이니시스 SDK 로드 실패'))
    document.head.appendChild(script)
  })
}

export function usePayment() {
  const [loading, setLoading] = useState(false)
  const showToast = useToastStore((s) => s.showToast)

  const requestPayment = async (orderId, buyerEmail = '') => {
    setLoading(true)
    try {
      const { data } = await paymentApi.prepare(orderId)
      const { payInfo } = data

      const isTest = payInfo.mid === 'INIpayTest'
      await loadInicisSDK(isTest)

      const FORM_ID = 'ini-pay-form'
      const existing = document.getElementById(FORM_ID)
      if (existing) existing.remove()

      const form = document.createElement('form')
      form.id = FORM_ID
      form.method = 'POST'
      form.style.display = 'none'

      const fields = {
        P_INI_PAYMENT:  'CARD',
        P_MID:          payInfo.mid,
        P_OID:          payInfo.oid,
        P_AMT:          payInfo.price,
        P_GOODS:        payInfo.goodname,
        P_UNAME:        payInfo.buyername,
        P_MOBILE:       payInfo.buyertel,
        P_EMAIL:        buyerEmail,
        P_TIMESTAMP:    payInfo.timestamp,
        P_SIGNATURE:    payInfo.signature,
        P_VERIFICATION: payInfo.verification,
        P_NOTI_URL:     import.meta.env.VITE_API_URL + '/payment/webhook',
        P_NEXT_URL:     window.location.origin + '/payment/result',
        P_CHARSET:      'UTF-8',
        P_RESERVED:     'acodeset=utf8&bypass_isp=Y&closeBottomNav=Y',
      }

      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input')
        input.type  = 'hidden'
        input.name  = name
        input.value = value ?? ''
        form.appendChild(input)
      })

      document.body.appendChild(form)
      window.INIStdPay.pay(FORM_ID)   // SDK가 올바른 결제 URL로 제출
    } catch (err) {
      showToast(err.response?.data?.message || '결제 준비 중 오류가 발생했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return { requestPayment, loading }
}

export default usePayment
