import { createContext, useContext, useState, useEffect } from 'react'

const DarkModeContext = createContext()

export const useDarkMode = () => {
  const context = useContext(DarkModeContext)
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}

export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const savedMode = localStorage.getItem('darkMode')
    const userPreference = localStorage.getItem('darkModePreference')
    
    if (userPreference === 'manual' && savedMode !== null) {
      // User has manually set preference
      return JSON.parse(savedMode)
    }
    
    // Auto mode: Check time (7 PM - 7 AM = dark mode)
    return isNightTime()
  })

  const [autoMode, setAutoMode] = useState(() => {
    const userPreference = localStorage.getItem('darkModePreference')
    return userPreference !== 'manual'
  })

  // Helper function to check if it's night time
  function isNightTime() {
    const hour = new Date().getHours()
    // Dark mode between 7 PM (19:00) and 7 AM (07:00)
    return hour >= 19 || hour < 7
  }

  // Auto-update dark mode based on time (only if auto mode is enabled)
  useEffect(() => {
    if (!autoMode) return

    const checkTime = () => {
      const shouldBeDark = isNightTime()
      if (darkMode !== shouldBeDark) {
        setDarkMode(shouldBeDark)
      }
    }

    // Check every minute
    const interval = setInterval(checkTime, 60000)
    
    // Check immediately
    checkTime()

    return () => clearInterval(interval)
  }, [autoMode, darkMode])

  useEffect(() => {
    // Save to localStorage whenever it changes
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    
    // Apply dark class to html element
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    // When user manually toggles, disable auto mode
    setAutoMode(false)
    localStorage.setItem('darkModePreference', 'manual')
    setDarkMode(prev => !prev)
  }

  const enableAutoMode = () => {
    setAutoMode(true)
    localStorage.setItem('darkModePreference', 'auto')
    // Immediately apply time-based mode
    setDarkMode(isNightTime())
  }

  const disableAutoMode = () => {
    setAutoMode(false)
    localStorage.setItem('darkModePreference', 'manual')
  }

  return (
    <DarkModeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode, 
      setDarkMode,
      autoMode,
      enableAutoMode,
      disableAutoMode
    }}>
      {children}
    </DarkModeContext.Provider>
  )
}
