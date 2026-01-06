import { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { DarkModeProvider } from './context/DarkModeContext'
import './App.css'

// Direct imports instead of lazy loading to avoid React errors
import Navbar from './components/Navbar'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import UserProfile from './pages/UserProfile'
import OAuthCallback from './pages/OAuthCallback'
import SocialAuthCallback from './pages/SocialAuthCallback'

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-700 dark:text-gray-400 font-semibold">Loading...</p>
    </div>
  </div>
)

function AnimatedRoutes() {
  const location = useLocation()
  const showNavbar = location.pathname === '/'

  return (
    <>
      {showNavbar && <Navbar />}
      <PageTransition>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/oauth/gmail/callback" element={<OAuthCallback provider="gmail" />} />
          <Route path="/oauth/outlook/callback" element={<OAuthCallback provider="outlook" />} />
          <Route path="/auth/callback/gmail" element={<SocialAuthCallback provider="gmail" />} />
        </Routes>
      </PageTransition>
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
