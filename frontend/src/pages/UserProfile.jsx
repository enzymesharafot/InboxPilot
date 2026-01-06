import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDarkMode } from '../context/DarkModeContext'
import { ToastContainer } from '../components/Toast'
import { useToast } from '../hooks/useToast'
import { currentUser, emailAccounts, preferences as preferencesAPI } from '../utils/api'

const UserProfile = () => {
  const location = useLocation()
  const { darkMode, setDarkMode, autoMode, enableAutoMode, disableAutoMode } = useDarkMode()
  const { toasts, removeToast, success, error, warning, info } = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileImage, setProfileImage] = useState(null)
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null)
  const [showAccountSettings, setShowAccountSettings] = useState(null)
  const [syncingAccount, setSyncingAccount] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasUnsavedPreferences, setHasUnsavedPreferences] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    timezone: 'PST',
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    desktopNotifications: false,
    weeklyDigest: true,
    autoArchive: false,
    darkMode: false,
  })

  const [connectedAccountsList, setConnectedAccountsList] = useState([])

  // Load user data and connected accounts from API
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true)

        // Load user profile and connected accounts in parallel for better performance
        const [userData, accounts] = await Promise.all([
          currentUser.get(),
          emailAccounts.getAccounts()
        ])

        console.log('[UserProfile] Loaded accounts:', accounts)

        let mappedAccounts = []
        if (accounts && accounts.length > 0) {
          mappedAccounts = accounts.map(acc => ({
            id: acc.id,
            email: acc.email_address,
            type: acc.provider === 'gmail' ? 'Gmail' : acc.provider === 'outlook' ? 'Outlook' : acc.provider,
            status: acc.status || 'active',
            unread: 0,
            color: acc.provider === 'gmail' ? 'bg-red-500' : 'bg-blue-500',
            lastSync: acc.last_sync ? new Date(acc.last_sync).toLocaleString() : 'Never',
            autoSync: acc.sync_enabled ?? true,
            notifications: true
          }))
          setConnectedAccountsList(mappedAccounts)
        }

        // Load profile picture from preferences
        const savedProfilePicture = userData.preferences?.profile_picture || null
        setProfileImage(savedProfilePicture)

        // Extract subscription info
        const subscription = userData.subscription || {}
        const planName = subscription.plan_display || 'Free Plan'
        const accountsLimit = subscription.email_accounts_limit || 2

        // Set user data with subscription info
        setUser({
          name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username,
          email: userData.email,
          username: userData.username,
          avatar: savedProfilePicture,
          plan: planName,
          accountsUsed: mappedAccounts.length,
          accountsLimit: accountsLimit,
          joinDate: new Date(userData.preferences?.created_at || Date.now()).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          }),
        })

        // Set form data
        setFormData({
          name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username,
          email: userData.email,
          phone: userData.preferences?.phone || '',
          company: userData.preferences?.company || '',
          timezone: userData.preferences?.timezone || 'PST',
        })

        // Set preferences
        setPreferences({
          emailNotifications: userData.preferences?.email_notifications ?? true,
          desktopNotifications: userData.preferences?.desktop_notifications ?? false,
          weeklyDigest: userData.preferences?.weekly_digest ?? true,
          autoArchive: userData.preferences?.auto_archive_read ?? false,
          darkMode: userData.preferences?.dark_mode_enabled ?? false,
        })
      } catch (err) {
        console.error('Failed to load user data:', err)
        error('Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, []) // Remove connectedAccountsList.length dependency

  const connectedAccounts = connectedAccountsList

  const plans = [
    {
      name: 'Free Plan',
      price: '$0',
      period: 'forever',
      features: [
        '2 Email Accounts',
        'AI Email Summarizer',
        'Smart Priority Sorting',
        'Basic Support',
      ],
      current: true
    },
    {
      name: 'Pro Plan',
      price: '$9.99',
      period: 'per month',
      features: [
        '5 Email Accounts',
        'AI Email Summarizer',
        'Smart Priority Sorting',
        'AI Email Writer',
        'Priority Support',
        'Advanced Analytics',
      ],
      popular: true
    },
    {
      name: 'Business Plan',
      price: '$19.99',
      period: 'per month',
      features: [
        'Unlimited Email Accounts',
        'All AI Features',
        'Team Collaboration',
        'Custom Integrations',
        '24/7 Premium Support',
        'Advanced Analytics',
        'Custom Branding',
      ],
    }
  ]

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePreferenceChange = (key) => {
    setHasUnsavedPreferences(true)
    if (key === 'darkMode') {
      // Toggle dark mode using context
      setDarkMode(!darkMode)
    } else {
      setPreferences({
        ...preferences,
        [key]: !preferences[key]
      })
    }
  }

  // Handle tab navigation from URL state
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab)
    }
  }, [location])

  const handleSaveProfile = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name || !formData.email) {
      error('Please fill in all required fields')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      error('Please enter a valid email address')
      return
    }

    try {
      info('💾 Saving profile...')

      // Split name into first and last name
      const nameParts = formData.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // Update user profile
      const updatedUser = await currentUser.update({
        email: formData.email,
        first_name: firstName,
        last_name: lastName,
      })

      // Update preferences with phone, company, and timezone
      await preferencesAPI.update({
        phone: formData.phone,
        company: formData.company,
        timezone: formData.timezone,
      })

      // Update local user state
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
      })

      success('✅ Profile updated successfully!')
    } catch (err) {
      console.error('Failed to save profile:', err)
      error(err.message || '❌ Failed to save profile. Please try again.')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        error('File size should not exceed 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result
          // Upload to backend
          await currentUser.updateProfilePicture(base64Image)
          setProfileImage(base64Image)
          setUser({ ...user, avatar: base64Image })
          success('Profile image updated successfully!')
        } catch (err) {
          console.error('Failed to upload profile picture:', err)
          error(err.message || 'Failed to upload profile image')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = async () => {
    try {
      await currentUser.removeProfilePicture()
      setProfileImage(null)
      setUser({ ...user, avatar: null })
      info('Profile image removed')
    } catch (err) {
      console.error('Failed to remove profile picture:', err)
      error(err.message || 'Failed to remove profile image')
    }
  }

  const handleSavePreferences = async (e) => {
    if (e) e.preventDefault()

    try {
      info('💾 Saving preferences...')

      // Prepare preferences data for backend (matching backend model field names)
      const preferencesData = {
        email_notifications: preferences.emailNotifications,
        desktop_notifications: preferences.desktopNotifications,
        weekly_digest: preferences.weeklyDigest,
        auto_archive_read: preferences.autoArchive,
        dark_mode_enabled: darkMode,
        dark_mode_preference: autoMode ? 'auto' : 'manual',
      }

      // Update preferences via API
      const result = await preferencesAPI.update(preferencesData)

      setHasUnsavedPreferences(false)
      success('✅ Preferences saved successfully!')
    } catch (err) {
      console.error('Failed to save preferences:', err)
      error(err.message || '❌ Failed to save preferences. Please try again.')
    }
  }

  // Account Management Functions
  const handleAddAccount = (accountData) => {
    const newAccount = {
      id: Date.now(),
      email: accountData.email,
      type: accountData.type,
      status: 'active',
      unread: 0,
      color: accountData.type === 'Gmail' ? 'bg-red-500' : 'bg-blue-500',
      lastSync: 'Just now',
      autoSync: true,
      notifications: true
    }
    setConnectedAccountsList([...connectedAccountsList, newAccount])
    setShowAddAccountModal(false)
    success(`${accountData.email} added successfully!`)
  }

  const handleRemoveAccount = async (accountId) => {
    try {
      const account = connectedAccountsList.find(acc => acc.id === accountId)

      // Call API to disconnect account
      await emailAccounts.disconnectAccount(accountId)

      // Update local state
      setConnectedAccountsList(connectedAccountsList.filter(acc => acc.id !== accountId))
      setShowRemoveConfirm(null)
      success(`${account.email} removed from your accounts`)
    } catch (err) {
      console.error('Failed to remove account:', err)
      error('Failed to remove account. Please try again.')
      setShowRemoveConfirm(null)
    }
  }

  const handleSyncAccount = async (accountId) => {
    try {
      setSyncingAccount(accountId)

      // Call API to sync account
      await emailAccounts.syncAccount(accountId)

      // Update local state
      setConnectedAccountsList(connectedAccountsList.map(acc =>
        acc.id === accountId ? { ...acc, lastSync: 'Just now' } : acc
      ))

      success('Account synced successfully')
    } catch (err) {
      console.error('Failed to sync account:', err)
      error('Failed to sync account. Please try again.')
    } finally {
      setSyncingAccount(null)
    }
  }

  const handleToggleAccountSetting = (accountId, setting) => {
    setConnectedAccountsList(connectedAccountsList.map(acc =>
      acc.id === accountId
        ? { ...acc, [setting]: !acc[setting] }
        : acc
    ))
    const account = connectedAccountsList.find(acc => acc.id === accountId)
    const settingName = setting === 'autoSync' ? 'Auto-sync' : 'Notifications'
    const newValue = !account[setting]
    info(`${settingName} ${newValue ? 'enabled' : 'disabled'} for ${account.email}`)
  }

  // Show loading spinner while fetching user data
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Top Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">IP</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">InboxPilot</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - User Info & Navigation */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden sticky top-24 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* User Profile Card */}
              <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-700 p-6 text-white text-center">
                <motion.div
                  className="relative w-24 h-24 mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  {user.avatar ? (
                    <motion.img
                      src={user.avatar}
                      alt={user.name}
                      className="w-24 h-24 rounded-full border-4 border-white dark:border-white/90 shadow-lg object-cover"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    />
                  ) : (
                    <motion.div
                      className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-full flex items-center justify-center border-4 border-white dark:border-white/90 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <span className="text-white font-bold text-3xl">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
                <motion.h2
                  className="text-xl font-bold mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {user.name}
                </motion.h2>
                <motion.p
                  className="text-sm text-white/90 dark:text-white/80 mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {user.email}
                </motion.p>
                <motion.div
                  className="inline-block bg-white/30 dark:bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  {user.plan}
                </motion.div>
              </div>

              {/* Account Stats */}
              <motion.div
                className="p-4 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-teal-900/20 border-b border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 dark:text-gray-300 font-medium">Email Accounts</span>
                  <span className="font-bold text-gray-900 dark:text-white">{user.accountsUsed}/{user.accountsLimit}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 h-2 rounded-full transition-all duration-300 shadow-sm"
                    initial={{ width: 0 }}
                    animate={{ width: `${(user.accountsUsed / user.accountsLimit) * 100}%` }}
                    transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </motion.div>

              {/* Navigation Menu */}
              <nav className="p-2">
                <motion.button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'profile'
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 font-semibold shadow-sm'
                    : 'text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile Settings</span>
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab('accounts')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'accounts'
                    ? 'bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/30 dark:to-teal-900/30 text-cyan-700 dark:text-cyan-300 font-semibold shadow-sm'
                    : 'text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Manage Accounts</span>
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'preferences'
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                    : 'text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Preferences</span>
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab('upgrade')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'upgrade'
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-300 font-semibold shadow-sm'
                    : 'text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upgrade Plan</span>
                </motion.button>

                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                  <Link
                    to="/auth"
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Logout</span>
                  </Link>
                </div>
              </nav>
            </motion.div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Profile Settings Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h2>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Profile Picture Section */}
                    <div className="flex items-center space-x-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="relative">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-24 h-24 rounded-full border-4 border-blue-200 dark:border-cyan-700 shadow-lg object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-full flex items-center justify-center border-4 border-blue-200 dark:border-cyan-700 shadow-lg">
                            <span className="text-white font-bold text-3xl">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Profile Picture</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-400 mb-3">Update your profile photo (Max 5MB)</p>
                        <div className="flex space-x-3">
                          <motion.label
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 dark:hover:from-blue-600 dark:hover:via-cyan-600 dark:hover:to-teal-600 transition-all duration-300 cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            {user.avatar ? 'Change Photo' : 'Upload Photo'}
                          </motion.label>
                          {user.avatar && (
                            <motion.button
                              type="button"
                              onClick={handleRemoveImage}
                              className="px-4 py-2 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 text-red-600 dark:text-red-400 hover:from-red-200 hover:to-red-300 dark:hover:from-red-900/40 dark:hover:to-red-800/40 rounded-lg transition-all duration-300 font-medium shadow-sm hover:shadow-md border border-red-300 dark:border-red-700"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Remove
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="John Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="john.smith@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Company</label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="Tech Corp"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Timezone</label>
                      <select
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-transparent hover:border-blue-400 dark:hover:border-cyan-600 transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '2.5rem'
                        }}
                      >
                        <option value="PST">Pacific Standard Time (PST)</option>
                        <option value="EST">Eastern Standard Time (EST)</option>
                        <option value="CST">Central Standard Time (CST)</option>
                        <option value="MST">Mountain Standard Time (MST)</option>
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                      </select>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Current Password</label>
                          <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">New Password</label>
                            <input
                              type="password"
                              className="input-field"
                              placeholder="••••••••"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Confirm Password</label>
                            <input
                              type="password"
                              className="input-field"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <motion.button
                        type="button"
                        className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          // Reset form to original values
                          setFormData({
                            name: 'John Smith',
                            email: 'john.smith@example.com',
                            phone: '+1 (555) 123-4567',
                            company: 'Tech Corp',
                            timezone: 'PST',
                          })
                          info('Changes cancelled')
                        }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 dark:hover:from-blue-600 dark:hover:via-cyan-600 dark:hover:to-teal-600 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="flex items-center space-x-2">
                          <span>Save Changes</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      </motion.button>
                    </div>
                  </form>
                </div>
              )}

              {/* Manage Accounts Tab */}
              {activeTab === 'accounts' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                          Connected Email Accounts
                        </h2>
                        <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">
                          {user.accountsUsed} of {user.accountsLimit} accounts connected
                        </p>
                      </div>
                      <motion.button
                        className={`btn-primary text-sm py-2 px-4 ${user.accountsUsed >= user.accountsLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => user.accountsUsed < user.accountsLimit && setShowAddAccountModal(true)}
                        disabled={user.accountsUsed >= user.accountsLimit}
                        whileHover={user.accountsUsed < user.accountsLimit ? { scale: 1.05 } : {}}
                        whileTap={user.accountsUsed < user.accountsLimit ? { scale: 0.95 } : {}}
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Account
                      </motion.button>
                    </div>

                    <div className="space-y-4">
                      {connectedAccounts.map((account) => (
                        <motion.div
                          key={account.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              <motion.div
                                className={`w-14 h-14 ${account.color} rounded-xl flex items-center justify-center shadow-md`}
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                              >
                                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                                </svg>
                              </motion.div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-semibold text-gray-900 dark:text-white text-lg">{account.email}</p>
                                  {account.unread > 0 && (
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full animate-pulse">
                                      {account.unread} new
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-3 mt-1.5">
                                  <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded-full font-medium">
                                    {account.type}
                                  </span>
                                  <span className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                    {account.status === 'active' ? 'Active' : 'Inactive'}
                                  </span>
                                  <span className="text-xs text-gray-700 dark:text-gray-400 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Last synced: {account.lastSync}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {/* Sync Button */}
                              <motion.button
                                className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 group relative"
                                onClick={() => handleSyncAccount(account.id)}
                                disabled={syncingAccount === account.id}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <svg
                                  className={`w-5 h-5 text-blue-600 dark:text-blue-400 ${syncingAccount === account.id ? 'animate-spin' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Sync now
                                </span>
                              </motion.button>

                              {/* Settings Button */}
                              <motion.button
                                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 group relative"
                                onClick={() => setShowAccountSettings(showAccountSettings === account.id ? null : account.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <svg className="w-5 h-5 text-gray-800 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Settings
                                </span>
                              </motion.button>

                              {/* Delete Button */}
                              <motion.button
                                className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 text-red-600 dark:text-red-400 group relative"
                                onClick={() => setShowRemoveConfirm(account.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Remove
                                </span>
                              </motion.button>
                            </div>
                          </div>

                          {/* Account Settings Panel */}
                          {showAccountSettings === account.id && (
                            <motion.div
                              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Account Settings</h4>
                              <div className="space-y-3">
                                {/* Auto Sync Toggle */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-sync</p>
                                      <p className="text-xs text-gray-700 dark:text-gray-400">Automatically sync emails every 5 minutes</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleToggleAccountSetting(account.id, 'autoSync')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-300 ${account.autoSync ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : 'bg-gray-300 dark:bg-gray-600'
                                      }`}
                                  >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${account.autoSync ? 'translate-x-6' : 'translate-x-1'
                                      }`} />
                                  </button>
                                </div>

                                {/* Notifications Toggle */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">Notifications</p>
                                      <p className="text-xs text-gray-700 dark:text-gray-400">Receive notifications for this account</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleToggleAccountSetting(account.id, 'notifications')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-300 ${account.notifications ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-gray-300 dark:bg-gray-600'
                                      }`}
                                  >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${account.notifications ? 'translate-x-6' : 'translate-x-1'
                                      }`} />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* Remove Confirmation */}
                          {showRemoveConfirm === account.id && (
                            <motion.div
                              className="mt-4 pt-4 border-t border-red-200 dark:border-red-800"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <div className="flex items-start space-x-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-red-900 dark:text-red-300">Remove this account?</h4>
                                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                    This will disconnect <strong>{account.email}</strong> from InboxPilot. You won't receive emails from this account anymore.
                                  </p>
                                  <div className="flex space-x-3 mt-3">
                                    <motion.button
                                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                                      onClick={() => handleRemoveAccount(account.id)}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      Yes, Remove
                                    </motion.button>
                                    <motion.button
                                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors"
                                      onClick={() => setShowRemoveConfirm(null)}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      Cancel
                                    </motion.button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Account Limit Warning */}
                    {user.accountsUsed >= user.accountsLimit && (
                      <motion.div
                        className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700 rounded-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-start space-x-3">
                          <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div className="flex-1">
                            <p className="font-semibold text-amber-900 dark:text-amber-300">Account Limit Reached</p>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                              You've reached your account limit ({user.accountsLimit} accounts). Upgrade to Pro to add up to 5 email accounts.
                            </p>
                            <motion.button
                              className="mt-3 px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white text-sm font-medium rounded-lg transition-all"
                              onClick={() => setActiveTab('upgrade')}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Upgrade Now
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* Add Account Modal */}
              {showAddAccountModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                        Add Email Account
                      </h3>
                      <button
                        onClick={() => setShowAddAccountModal(false)}
                        className="text-gray-600 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.target)
                      handleAddAccount({
                        email: formData.get('email'),
                        type: formData.get('type')
                      })
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
                            Email Provider
                          </label>
                          <select
                            name="type"
                            className="input-field w-full"
                            required
                          >
                            <option value="Gmail">Gmail</option>
                            <option value="Outlook">Outlook</option>
                            <option value="Yahoo">Yahoo</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            className="input-field w-full"
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                          <div className="flex items-start space-x-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              You'll be redirected to securely sign in to your email account.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3 mt-6">
                        <motion.button
                          type="submit"
                          className="flex-1 btn-primary py-3"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Connect Account
                        </motion.button>
                        <motion.button
                          type="button"
                          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
                          onClick={() => setShowAddAccountModal(false)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Preferences</h2>

                  <div className="space-y-6">
                    {/* Notifications Section */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 dark:from-blue-600 dark:via-cyan-600 dark:to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      </div>
                      <div className="space-y-3">
                        {/* Email Notifications */}
                        <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-teal-900/20 hover:from-blue-100 hover:via-cyan-100 hover:to-teal-100 dark:hover:from-blue-900/30 dark:hover:via-cyan-900/30 dark:hover:to-teal-900/30 rounded-xl border border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-md">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">Email Notifications</p>
                              <p className="text-sm text-gray-700 dark:text-gray-400 mt-0.5">Receive email updates about your inbox</p>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => handlePreferenceChange('emailNotifications')}
                            className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-all duration-300 shadow-md ${preferences.emailNotifications ? 'bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            whileTap={{ scale: 0.9 }}
                          >
                            <motion.span
                              className="inline-block h-5 w-5 rounded-full bg-white shadow-lg"
                              animate={{
                                x: preferences.emailNotifications ? 24 : 4
                              }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </motion.button>
                        </div>

                        {/* Desktop Notifications */}
                        <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 hover:from-indigo-100 hover:via-purple-100 hover:to-pink-100 dark:hover:from-indigo-900/30 dark:hover:via-purple-900/30 dark:hover:to-pink-900/30 rounded-xl border border-indigo-200 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-md">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">Desktop Notifications</p>
                              <p className="text-sm text-gray-700 dark:text-gray-400 mt-0.5">Get desktop alerts for new emails</p>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => handlePreferenceChange('desktopNotifications')}
                            className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-all duration-300 shadow-md ${preferences.desktopNotifications ? 'bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            whileTap={{ scale: 0.9 }}
                          >
                            <motion.span
                              className="inline-block h-5 w-5 rounded-full bg-white shadow-lg"
                              animate={{
                                x: preferences.desktopNotifications ? 24 : 4
                              }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </motion.button>
                        </div>

                        {/* Weekly Digest */}
                        <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 hover:from-amber-100 hover:via-yellow-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:via-yellow-900/30 dark:hover:to-orange-900/30 rounded-xl border border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-300 hover:shadow-md">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">Weekly Digest</p>
                              <p className="text-sm text-gray-700 dark:text-gray-400 mt-0.5">Receive a summary of your week every Monday</p>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => handlePreferenceChange('weeklyDigest')}
                            className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-all duration-300 shadow-md ${preferences.weeklyDigest ? 'bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            whileTap={{ scale: 0.9 }}
                          >
                            <motion.span
                              className="inline-block h-5 w-5 rounded-full bg-white shadow-lg"
                              animate={{
                                x: preferences.weeklyDigest ? 24 : 4
                              }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Email Management Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 dark:from-red-600 dark:via-orange-600 dark:to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Management</h3>
                      </div>
                      <div className="space-y-3">
                        {/* Auto Archive */}
                        <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-amber-900/20 hover:from-red-100 hover:via-orange-100 hover:to-amber-100 dark:hover:from-red-900/30 dark:hover:via-orange-900/30 dark:hover:to-amber-900/30 rounded-xl border border-red-200 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600 transition-all duration-300 hover:shadow-md">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">Auto Archive</p>
                              <p className="text-sm text-gray-700 dark:text-gray-400 mt-0.5">Automatically archive emails older than 30 days</p>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => handlePreferenceChange('autoArchive')}
                            className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-all duration-300 shadow-md ${preferences.autoArchive ? 'bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            whileTap={{ scale: 0.9 }}
                          >
                            <motion.span
                              className="inline-block h-5 w-5 rounded-full bg-white shadow-lg"
                              animate={{
                                x: preferences.autoArchive ? 24 : 4
                              }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-600 via-gray-700 to-slate-800 dark:from-slate-500 dark:via-gray-600 dark:to-slate-700 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h3>
                      </div>
                      <div className="space-y-3">
                        {/* Dark Mode */}
                        <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900/20 dark:via-gray-900/20 dark:to-slate-900/20 hover:from-slate-100 hover:via-gray-100 hover:to-slate-200 dark:hover:from-slate-900/30 dark:hover:via-gray-900/30 dark:hover:to-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-md">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-5 h-5 text-slate-700 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                              <p className="text-sm text-gray-700 dark:text-gray-400 mt-0.5">Enable dark theme for the interface</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handlePreferenceChange('darkMode')}
                            className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-all duration-300 shadow-md ${darkMode ? 'bg-gradient-to-r from-slate-700 via-gray-800 to-slate-900 dark:from-slate-600 dark:via-gray-700 dark:to-slate-800' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>

                        {/* Auto Dark Mode - Time Based */}
                        <motion.div
                          className="group flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 hover:from-indigo-100 hover:via-blue-100 hover:to-cyan-100 dark:hover:from-indigo-900/30 dark:hover:via-blue-900/30 dark:hover:to-cyan-900/30 rounded-xl border border-indigo-200 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-md"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-semibold text-gray-900 dark:text-white">Auto Mode</p>
                                <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-bold rounded-full shadow-sm">NEW</span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-400 mt-0.5">
                                {autoMode
                                  ? '🌙 Dark 7PM-7AM • ☀️ Light 7AM-7PM'
                                  : 'Switch theme automatically based on time'
                                }
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (autoMode) {
                                disableAutoMode()
                                info('Auto mode disabled - Manual control enabled')
                              } else {
                                enableAutoMode()
                                success('Auto mode enabled - Theme follows time! 🎨')
                              }
                            }}
                            className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-all duration-300 shadow-md ${autoMode ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                          >
                            <motion.span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${autoMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              whileHover={{ scale: 1.1 }}
                            />
                          </button>
                        </motion.div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                      {hasUnsavedPreferences ? (
                        <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>You have unsaved changes</span>
                        </p>
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-400">All changes saved</p>
                      )}
                      <motion.button
                        onClick={handleSavePreferences}
                        className={`px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2 ${hasUnsavedPreferences
                          ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-500 text-white hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 dark:hover:from-blue-600 dark:hover:via-cyan-600 dark:hover:to-teal-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-500 cursor-not-allowed'
                          }`}
                        whileHover={hasUnsavedPreferences ? { scale: 1.05 } : {}}
                        whileTap={hasUnsavedPreferences ? { scale: 0.95 } : {}}
                        disabled={!hasUnsavedPreferences}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        <span>Save Preferences</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Upgrade Plan Tab */}
              {activeTab === 'upgrade' && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
                    <motion.h2
                      className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      Upgrade Your Plan
                    </motion.h2>
                    <motion.p
                      className="text-gray-800 dark:text-gray-300 mb-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Choose the perfect plan for your needs
                    </motion.p>

                    <div className="grid md:grid-cols-3 gap-6">
                      {plans.map((plan, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.4 }}
                          whileHover={{ y: -8, transition: { duration: 0.2 } }}
                          className={`relative rounded-xl p-6 border-2 transition-all duration-300 ${plan.current
                            ? 'border-blue-500 dark:border-blue-400 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/30 dark:via-cyan-900/30 dark:to-teal-900/30 shadow-lg'
                            : plan.popular
                              ? 'border-purple-500 dark:border-purple-400 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-pink-900/30 shadow-xl scale-105'
                              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-lg'
                            }`}
                        >
                          {plan.popular && (
                            <motion.div
                              className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                            >
                              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 dark:from-purple-500 dark:via-indigo-500 dark:to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md inline-flex items-center space-x-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>POPULAR</span>
                              </span>
                            </motion.div>
                          )}
                          {plan.current && (
                            <motion.div
                              className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                            >
                              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md inline-flex items-center space-x-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>CURRENT PLAN</span>
                              </span>
                            </motion.div>
                          )}

                          <motion.h3
                            className="text-xl font-bold text-gray-900 dark:text-white mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                          >
                            {plan.name}
                          </motion.h3>
                          <motion.div
                            className="mb-4"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                          >
                            <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                              {plan.price}
                            </span>
                            <span className="text-gray-700 dark:text-gray-400 ml-2">/ {plan.period}</span>
                          </motion.div>

                          <ul className="space-y-3 mb-6">
                            {plan.features.map((feature, idx) => (
                              <motion.li
                                key={idx}
                                className="flex items-start space-x-2"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 + idx * 0.05 }}
                                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                              >
                                <motion.svg
                                  className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  whileHover={{ scale: 1.2, rotate: 360 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </motion.svg>
                                <span className="text-sm text-gray-800 dark:text-gray-300">{feature}</span>
                              </motion.li>
                            ))}
                          </ul>

                          <motion.button
                            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${plan.current
                              ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-300 cursor-not-allowed'
                              : plan.popular
                                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 dark:from-purple-500 dark:via-indigo-500 dark:to-pink-500 text-white hover:from-purple-700 hover:via-indigo-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:via-indigo-600 dark:hover:to-pink-600'
                                : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-500 text-white hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 dark:hover:from-blue-600 dark:hover:via-cyan-600 dark:hover:to-teal-600'
                              }`}
                            disabled={plan.current}
                            whileHover={!plan.current ? { scale: 1.05 } : {}}
                            whileTap={!plan.current ? { scale: 0.95 } : {}}
                          >
                            {plan.current ? (
                              <span className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Current Plan</span>
                              </span>
                            ) : (
                              <span className="flex items-center justify-center space-x-2">
                                <span>Upgrade Now</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </span>
                            )}
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* FAQ Section */}
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Frequently Asked Questions</span>
                    </h3>
                    <div className="space-y-4">
                      <motion.div
                        className="border-b border-gray-200 dark:border-gray-700 pb-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ x: 4 }}
                      >
                        <p className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                          <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Q</span>
                          <span>Can I change my plan later?</span>
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-300 ml-8">Yes, you can upgrade or downgrade your plan at any time.</p>
                      </motion.div>
                      <motion.div
                        className="border-b border-gray-200 dark:border-gray-700 pb-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ x: 4 }}
                      >
                        <p className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                          <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Q</span>
                          <span>What happens to my data if I downgrade?</span>
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-300 ml-8">Your data remains safe. You'll need to remove extra accounts to match your new plan limit.</p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        whileHover={{ x: 4 }}
                      >
                        <p className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                          <span className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Q</span>
                          <span>Do you offer refunds?</span>
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-300 ml-8">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
