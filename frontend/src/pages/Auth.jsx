import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const Auth = () => {
  const navigate = useNavigate()
  const [isSignIn, setIsSignIn] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleToggle = () => {
    setIsSignIn(!isSignIn)
    setShowForgotPassword(false)
    setError('')
  }

  const handleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword)
    setError('')
  }

  const handleGmailConnect = () => {
    // Gmail OAuth is handled in Dashboard after login
    alert('Please sign in first to connect your Gmail account')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (showForgotPassword) {
        // Handle password reset
        alert('Password reset link would be sent to: ' + email)
        setShowForgotPassword(false)
        setLoading(false)
        return
      }

      if (isSignIn) {
        // Handle Sign In
        const response = await fetch(`${API_BASE_URL}/auth/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: email,
            password: password,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.detail || 'Login failed. Please check your credentials.')
        }

        // Save tokens to localStorage
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)

        // Redirect to dashboard
        navigate('/dashboard')
      } else {
        // Handle Sign Up
        // Validate password match
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/auth/register/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: email,
            email: email,
            password: password,
            password_confirm: confirmPassword,
            first_name: name.split(' ')[0] || '',
            last_name: name.split(' ').slice(1).join(' ') || '',
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.username?.[0] || data.email?.[0] || data.password?.[0] || 'Registration failed')
        }

        // After successful registration, auto-login
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: email,
            password: password,
          }),
        })

        const loginData = await loginResponse.json()

        if (!loginResponse.ok) {
          throw new Error('Registration successful but login failed. Please sign in manually.')
        }

        // Save tokens to localStorage
        localStorage.setItem('access_token', loginData.access)
        localStorage.setItem('refresh_token', loginData.refresh)

        // Redirect to dashboard
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full">
        {/* Back to Home Link */}
        <Link to="/" className="inline-flex items-center text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors duration-200">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        {/* Auth Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-700 ease-out">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-700 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">IP</span>
            </div>
          </div>

          {/* Creative Messages */}
          <div className="text-center mb-8 min-h-[80px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {showForgotPassword ? (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Reset Password
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    Don't worry, we've got you covered! 🔒
                  </p>
                </motion.div>
              ) : isSignIn ? (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome Back! 👋
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    Your inbox has missed you
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Join InboxPilot 🚀
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    Start your journey with InboxPilot
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Gmail Connect Button - Only show when NOT in forgot password mode */}
          <AnimatePresence mode="wait">
            {!showForgotPassword && (
              <motion.div
                key="gmail-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                <button
                  onClick={handleGmailConnect}
                  className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-3 mb-6"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Gmail</span>
                </button>

                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                  <span className="px-4 text-gray-500 dark:text-gray-400 text-sm">or</span>
                  <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {!isSignIn && !showForgotPassword && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <label className="block text-gray-900 dark:text-white font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="John Doe"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              key="email-field"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <label className="block text-gray-900 dark:text-white font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </motion.div>

            <AnimatePresence mode="wait">
              {!showForgotPassword && (
                <motion.div
                  key="password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <label className="block text-gray-900 dark:text-white font-medium mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!isSignIn && !showForgotPassword && (
                <motion.div
                  key="confirm-password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <label className="block text-gray-900 dark:text-white font-medium mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isSignIn && !showForgotPassword && (
                <motion.div
                  key="remember-forgot"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between text-sm"
                >
                  <label className="flex items-center text-gray-700 dark:text-gray-300">
                    <input type="checkbox" className="mr-2 rounded" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-blue-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium transition-colors duration-300"
                  >
                    Forgot password?
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              key={showForgotPassword ? 'reset' : isSignIn ? 'signin' : 'signup'}
              type="submit"
              disabled={loading}
              className="w-full btn-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {showForgotPassword ? 'Sending...' : isSignIn ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                showForgotPassword ? 'Send Reset Link' : isSignIn ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
          </form>

          {/* Toggle Between Sign In / Sign Up */}
          <AnimatePresence mode="wait">
            {!showForgotPassword && (
              <motion.div
                key="toggle-auth"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-6 text-center"
              >
                <p className="text-gray-700 dark:text-gray-300">
                  {isSignIn ? "Don't have an account?" : "Already have an account?"}
                  <button
                    onClick={handleToggle}
                    className="ml-2 text-blue-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold transition-colors duration-300"
                  >
                    {isSignIn ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back to Sign In from Forgot Password */}
          <AnimatePresence mode="wait">
            {showForgotPassword && (
              <motion.div
                key="back-signin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-6 text-center"
              >
                <button
                  onClick={handleForgotPassword}
                  className="text-blue-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold transition-all duration-300 flex items-center justify-center mx-auto group"
                >
                  <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Sign In
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Terms & Privacy */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="text-blue-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}

export default Auth
