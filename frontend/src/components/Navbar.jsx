import { Link } from 'react-router-dom'
import { useState } from 'react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md dark:shadow-gray-900/50 fixed w-full top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">IP</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">InboxPilot</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-800 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium transition-all duration-300 relative group">
              <span>Home</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-cyan-400 dark:via-cyan-500 dark:to-teal-400 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#features" className="text-gray-800 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium transition-all duration-300 relative group">
              <span>Features</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-cyan-400 dark:via-cyan-500 dark:to-teal-400 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#about" className="text-gray-800 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium transition-all duration-300 relative group">
              <span>About</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-cyan-400 dark:via-cyan-500 dark:to-teal-400 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#contact" className="text-gray-800 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium transition-all duration-300 relative group">
              <span>Contact</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-cyan-400 dark:via-cyan-500 dark:to-teal-400 group-hover:w-full transition-all duration-300"></span>
            </a>
            <Link to="/auth" className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-500 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 dark:hover:from-blue-600 dark:hover:via-cyan-600 dark:hover:to-teal-600 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 focus:outline-none transition-colors duration-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <a href="#home" onClick={() => setIsMenuOpen(false)} className="text-gray-800 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium py-2 transition-all duration-300 hover:translate-x-2">
                Home
              </a>
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-gray-800 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium py-2 transition-all duration-300 hover:translate-x-2">
                Features
              </a>
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-gray-800 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium py-2 transition-all duration-300 hover:translate-x-2">
                About
              </a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-gray-800 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium py-2 transition-all duration-300 hover:translate-x-2">
                Contact
              </a>
              <Link to="/auth" className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-500 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 dark:hover:from-blue-600 dark:hover:via-cyan-600 dark:hover:to-teal-600 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 w-full text-center hover:scale-105 shadow-md hover:shadow-lg">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
