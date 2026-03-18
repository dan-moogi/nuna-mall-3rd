import useToastStore from '../store/toastStore'

// Phase 6에서 KG이니시스 연동 예정
const usePayment = () => {
  const showToast = useToastStore.getState().showToast

  const requestPayment = async (orderId) => {
    // TODO: KG이니시스 결제창 호출
    showToast('결제 기능은 Phase 6에서 구현됩니다.', 'info', 4000)
    return { success: false, orderId }
  }

  return { requestPayment }
}

export default usePayment
