import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gmailAuth, outlookAuth } from '../utils/api'

const OAuthCallback = ({ provider }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing')
  const [message, setMessage] = useState('Completing authorization...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setMessage(`Authorization failed: ${error}`)
          setTimeout(() => navigate('/dashboard'), 3000)
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('No authorization code received')
          setTimeout(() => navigate('/dashboard'), 3000)
          return
        }

        setMessage(`Connecting your ${provider === 'gmail' ? 'Gmail' : 'Outlook'} account...`)

        // Exchange code for tokens
        let result
        if (provider === 'gmail') {
          result = await gmailAuth.callback(code)
        } else {
          result = await outlookAuth.callback(code)
        }

        setStatus('success')
        setMessage(result.message || 'Account connected successfully!')
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              message: `${provider === 'gmail' ? 'Gmail' : 'Outlook'} account connected successfully!`,
              type: 'success'
            }
          })
        }, 2000)

      } catch (err) {
        console.error('OAuth callback error:', err)
        console.error('Error details:', {
          message: err.message,
          response: err.response,
          stack: err.stack
        })
        
        // Extract more detailed error message
        let errorMessage = 'Failed to connect account'
        if (err.message) {
          errorMessage = err.message
        }
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error
        }
        
        setStatus('error')
        setMessage(errorMessage)
        setTimeout(() => navigate('/dashboard'), 5000)
      }
    }

    handleCallback()
  }, [searchParams, navigate, provider])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
      >
        <div className="text-center">
          {/* Icon */}
          <motion.div
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6"
            animate={status === 'processing' ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: status === 'processing' ? Infinity : 0, ease: "linear" }}
            style={{
              background: status === 'success' 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : status === 'error'
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
            }}
          >
            {status === 'processing' && (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {status === 'success' && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            )}
            {status === 'error' && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </motion.svg>
            )}
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {status === 'processing' && 'Connecting Account'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Connection Failed'}
          </h2>

          {/* Message */}
          <p className="text-gray-700 dark:text-gray-400 mb-6">
            {message}
          </p>

          {/* Progress bar for processing */}
          {status === 'processing' && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
          )}

          {/* Redirect message */}
          {(status === 'success' || status === 'error') && (
            <p className="text-sm text-gray-700 dark:text-gray-500">
              Redirecting to dashboard...
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default OAuthCallback
