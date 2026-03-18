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

      const payParams = {
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

      window.INIStdPay.pay(payParams)
      // 이후 KG이니시스가 결제창을 띄우고 /payment/result 로 리다이렉트
    } catch (err) {
      showToast(err.response?.data?.message || '결제 준비 중 오류가 발생했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return { requestPayment, loading }
}

export default usePayment
