import { useState } from 'react'
import { paymentApi } from '../api/paymentApi'
import useToastStore from '../store/toastStore'

export function usePayment() {
  const [loading, setLoading]   = useState(false)
  const showToast = useToastStore((s) => s.showToast)

  const requestPayment = async (orderId, buyerEmail = '') => {
    setLoading(true)
    try {
      const { data } = await paymentApi.prepare(orderId)
      const { payInfo } = data

      // 테스트 MID면 스테이징, 아니면 운영 URL
      const payUrl = payInfo.mid === 'INIpayTest'
        ? 'https://stgstdpay.inicis.com/stdpay'
        : 'https://stdpay.inicis.com/stdpay'

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

      // SDK 대신 직접 form POST → 팝업차단·SDK 미로드 문제 우회
      const FORM_ID = 'ini-pay-form'
      const existing = document.getElementById(FORM_ID)
      if (existing) existing.remove()

      const form = document.createElement('form')
      form.id     = FORM_ID
      form.method = 'POST'
      form.action = payUrl
      form.style.display = 'none'

      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input')
        input.type  = 'hidden'
        input.name  = name
        input.value = value ?? ''
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()   // 페이지 전체가 KG이니시스로 이동 → 결제 후 P_NEXT_URL 복귀
    } catch (err) {
      showToast(err.response?.data?.message || '결제 준비 중 오류가 발생했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return { requestPayment, loading }
}

export default usePayment
