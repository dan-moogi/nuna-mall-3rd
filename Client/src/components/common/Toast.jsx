import { useEffect, useState } from 'react'
import useToastStore from '../../store/toastStore'

const STYLES = {
  success: 'bg-green-500',
  error:   'bg-red-500',
  info:    'bg-blue-500',
  warning: 'bg-yellow-500',
}

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // 마운트 후 슬라이드 인
    const t1 = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t1)
  }, [])

  const handleRemove = () => {
    setVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  return (
    <div
      onClick={handleRemove}
      className={`${STYLES[toast.type] || STYLES.info} text-white px-4 py-3 rounded shadow-lg cursor-pointer
        min-w-[220px] max-w-[320px] flex items-start gap-2
        transform transition-all duration-300
        ${visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
    >
      <span className="flex-1 text-sm leading-snug">{toast.message}</span>
      <span className="text-white/70 text-lg leading-none mt-0.5">×</span>
    </div>
  )
}

const Toast = () => {
  const { toasts, removeToast } = useToastStore()
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  )
}

export default Toast
