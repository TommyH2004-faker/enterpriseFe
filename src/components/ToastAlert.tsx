import { useEffect } from 'react'
import type React from 'react'
import toast from 'react-hot-toast'

interface ToastAlertProps {
  message?: string | null
  type?: 'error' | 'success' | 'loading'
}

const ToastAlert: React.FC<ToastAlertProps> = ({
  message,
  type = 'error',
}) => {
  useEffect(() => {
    if (!message) return

    if (type === 'success') toast.success(message)
    else if (type === 'loading') toast.loading(message)
    else toast.error(message)
  }, [message, type])

  return null
}

export default ToastAlert
