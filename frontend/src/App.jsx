import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { DarkModeProvider } from './context/DarkModeContext'
import './App.css'

// Lazy load components for better performance
const Navbar = lazy(() => import('./components/Navbar'))
const Home = lazy(() => import('./pages/Home'))
const Auth = lazy(() => import('./pages/Auth'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'))

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 dark:text-gray-400 font-semibold">Loading...</p>
    </div>
  </div>
)

function AnimatedRoutes() {
  const location = useLocation()
  const showNavbar = location.pathname === '/'

  return (
    <>
      {showNavbar && (
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      )}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <Suspense fallback={<PageLoader />}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Home />
                </motion.div>
              </Suspense>
            }
          />
          <Route
            path="/auth"
            element={
              <Suspense fallback={<PageLoader />}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <Auth />
                </motion.div>
              </Suspense>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<PageLoader />}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Dashboard />
                </motion.div>
              </Suspense>
            }
          />
          <Route
            path="/profile"
            element={
              <Suspense fallback={<PageLoader />}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <UserProfile />
                </motion.div>
              </Suspense>
            }
          />
          <Route
            path="/oauth/gmail/callback"
            element={
              <Suspense fallback={<PageLoader />}>
                <OAuthCallback provider="gmail" />
              </Suspense>
            }
          />
          <Route
            path="/oauth/outlook/callback"
            element={
              <Suspense fallback={<PageLoader />}>
                <OAuthCallback provider="outlook" />
              </Suspense>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  )
}

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
          <AnimatedRoutes />
        </div>
      </Router>
    </DarkModeProvider>
  )
}

export default App
