import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!duration || isPaused) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
    }, 10)

    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [duration, onClose, isPaused])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/90 dark:via-green-900/90 dark:to-teal-900/90',
          border: 'border-emerald-200 dark:border-emerald-700',
          icon: 'text-emerald-600 dark:text-emerald-400',
          text: 'text-emerald-900 dark:text-emerald-100',
          progress: 'bg-emerald-500 dark:bg-emerald-400'
        }
      case 'error':
        return {
          bg: 'from-red-50 via-rose-50 to-pink-50 dark:from-red-900/90 dark:via-rose-900/90 dark:to-pink-900/90',
          border: 'border-red-200 dark:border-red-700',
          icon: 'text-red-600 dark:text-red-400',
          text: 'text-red-900 dark:text-red-100',
          progress: 'bg-red-500 dark:bg-red-400'
        }
      case 'warning':
        return {
          bg: 'from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/90 dark:via-yellow-900/90 dark:to-orange-900/90',
          border: 'border-amber-200 dark:border-amber-700',
          icon: 'text-amber-600 dark:text-amber-400',
          text: 'text-amber-900 dark:text-amber-100',
          progress: 'bg-amber-500 dark:bg-amber-400'
        }
      case 'info':
        return {
          bg: 'from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/90 dark:via-cyan-900/90 dark:to-teal-900/90',
          border: 'border-blue-200 dark:border-blue-700',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-900 dark:text-blue-100',
          progress: 'bg-blue-500 dark:bg-blue-400'
        }
      default:
        return {
          bg: 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
          border: 'border-gray-200 dark:border-gray-700',
          icon: 'text-gray-600 dark:text-gray-400',
          text: 'text-gray-900 dark:text-gray-100',
          progress: 'bg-gray-500 dark:bg-gray-400'
        }
    }
  }

  const colors = getColors()

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3, rotateX: -90 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      exit={{ 
        opacity: 0, 
        x: 400, 
        scale: 0.5,
        transition: { duration: 0.3, ease: "easeIn" }
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        mass: 0.8
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative min-w-[320px] max-w-md bg-gradient-to-r ${colors.bg} border-2 ${colors.border} rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300`}
      style={{ perspective: 1000 }}
    >
      <div className="p-4 flex items-start space-x-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.15, 
            type: "spring", 
            stiffness: 300,
            damping: 15
          }}
          whileHover={{ scale: 1.2, rotate: 360 }}
          className={`flex-shrink-0 ${colors.icon}`}
        >
          {getIcon()}
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, duration: 0.4, ease: "easeOut" }}
            className={`text-sm font-medium ${colors.text} break-words leading-relaxed`}
          >
            {message}
          </motion.p>
        </div>
        
        <motion.button
          onClick={onClose}
          className={`flex-shrink-0 ${colors.icon} rounded-lg p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200`}
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.85, rotate: 180 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </div>
      
      {duration && (
        <div className="relative h-1 bg-black/10 dark:bg-white/10 overflow-hidden">
          <motion.div
            style={{ width: `${progress}%` }}
            className={`h-full ${colors.progress} shadow-lg transition-opacity duration-300`}
            initial={{ width: "100%" }}
            animate={{ opacity: isPaused ? 0.6 : 1 }}
            transition={{ ease: "linear" }}
          />
          {!isPaused ? (
            <motion.div
              className={`absolute top-0 right-0 h-full w-12 ${colors.progress}`}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              style={{ 
                background: `linear-gradient(90deg, transparent, currentColor)`,
                filter: 'blur(6px)'
              }}
            />
          ) : (
            <motion.div
              className="absolute top-0 left-0 h-full w-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div 
                className={`w-1 h-1 rounded-full ${colors.progress} opacity-70`}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <motion.div 
                className={`w-1 h-1 rounded-full ${colors.progress} opacity-70 ml-1`}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div 
                className={`w-1 h-1 rounded-full ${colors.progress} opacity-70 ml-1`}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
              />
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none max-w-[90vw] sm:max-w-md">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0
            }}
            exit={{ 
              opacity: 0,
              scale: 0.8,
              transition: { duration: 0.2 }
            }}
            transition={{ 
              layout: { duration: 0.3, ease: "easeInOut" },
              default: { type: "spring", stiffness: 300, damping: 25 }
            }}
            className="pointer-events-auto"
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export { Toast, ToastContainer }
