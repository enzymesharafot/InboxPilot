import { useState, useCallback } from 'react'

let toastId = 0
const MAX_TOASTS = 5 // Maximum number of toasts shown at once

export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = toastId++
    const newToast = { id, message, type, duration }
    
    setToasts((prevToasts) => {
      // If we have too many toasts, remove the oldest one
      const updatedToasts = prevToasts.length >= MAX_TOASTS 
        ? prevToasts.slice(1) 
        : prevToasts
      return [...updatedToasts, newToast]
    })
    
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback((message, duration) => {
    return addToast(message, 'success', duration)
  }, [addToast])

  const error = useCallback((message, duration) => {
    return addToast(message, 'error', duration)
  }, [addToast])

  const warning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration)
  }, [addToast])

  const info = useCallback((message, duration) => {
    return addToast(message, 'info', duration)
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}
