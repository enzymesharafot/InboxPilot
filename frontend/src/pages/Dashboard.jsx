import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ComposeEmail from '../components/ComposeEmail'
import { ToastContainer } from '../components/Toast'
import { useToast } from '../hooks/useToast'
import { useDarkMode } from '../context/DarkModeContext'
import { gmailAuth, outlookAuth, emailAccounts, emails as emailsAPI, currentUser } from '../utils/api'

const Dashboard = () => {
  const navigate = useNavigate()
  const { darkMode, toggleDarkMode, autoMode } = useDarkMode()
  const { toasts, removeToast, success, error, warning, info } = useToast()
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [openEmailDetail, setOpenEmailDetail] = useState(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  const [showAISummarizer, setShowAISummarizer] = useState(false)
  const [aiSummary, setAiSummary] = useState('')
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [showAIReply, setShowAIReply] = useState(false)
  const [aiReply, setAiReply] = useState('')
  const [isGeneratingReply, setIsGeneratingReply] = useState(false)
  const [activeView, setActiveView] = useState('inbox') // inbox, archive, trash
  const [archivedEmails, setArchivedEmails] = useState([])
  const [trashedEmails, setTrashedEmails] = useState([])
  const [user, setUser] = useState(null)
  
  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      error('Please login first')
      navigate('/auth')
    }
  }, [navigate])
  
  // Load connected accounts on mount
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const accounts = await emailAccounts.getAccounts()
        if (accounts && accounts.length > 0) {
          setConnectedAccounts(accounts.map(acc => ({
            id: acc.id,
            email: acc.email_address,
            provider: acc.provider,
            unreadCount: 0,
            totalEmails: 0,
            storageUsed: 0,
            lastSynced: new Date(acc.last_synced_at || Date.now()),
            status: acc.is_active ? 'active' : 'inactive',
            color: acc.provider === 'gmail' ? 'red' : 'blue'
          })))
        } else {
          // No accounts, set empty
          setConnectedAccounts([])
        }
      } catch (err) {
        console.error('Failed to load accounts:', err)
        // Keep empty if error
        setConnectedAccounts([])
      }
    }
    
    loadAccounts()
  }, [])
  
  // Handle OAuth callback on page load
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      
      if (code && state) {
        try {
          info('Completing Gmail connection... ⏳')
          
          if (state === 'gmail') {
            const result = await gmailAuth.callback(code)
            success(`✅ ${result.message || 'Gmail account connected successfully!'}`)
            
            // Fetch updated accounts
            const accounts = await emailAccounts.getAccounts()
            setConnectedAccounts(accounts.map(acc => ({
              id: acc.id,
              email: acc.email_address,
              provider: acc.provider,
              unreadCount: 0,
              totalEmails: 0,
              storageUsed: 0,
              lastSynced: new Date(acc.last_synced_at || Date.now()),
              status: acc.is_active ? 'active' : 'inactive',
              color: acc.provider === 'gmail' ? 'red' : 'blue'
            })))
          } else if (state === 'outlook_oauth_state') {
            const result = await outlookAuth.callback(code)
            success(`✅ ${result.message || 'Outlook account connected successfully!'}`)
            
            // Fetch updated accounts
            const accounts = await emailAccounts.getAccounts()
            setConnectedAccounts(accounts.map(acc => ({
              id: acc.id,
              email: acc.email_address,
              provider: acc.provider,
              unreadCount: 0,
              totalEmails: 0,
              storageUsed: 0,
              lastSynced: new Date(acc.last_synced_at || Date.now()),
              status: acc.is_active ? 'active' : 'inactive',
              color: acc.provider === 'gmail' ? 'red' : 'blue'
            })))
          }
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (err) {
          error(`Failed to connect account: ${err.message}`)
          console.error(err)
          // Clean up URL even on error
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      }
    }
    
    handleOAuthCallback()
  }, [])
  
  const [connectedAccounts, setConnectedAccounts] = useState([])
  
  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await currentUser.get()
        setUser({
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username,
          email: userData.email,
          username: userData.username,
          avatar: userData.preferences?.profile_picture || null,
          plan: 'Free Plan',
          accountsUsed: connectedAccounts.length,
          accountsLimit: 10
        })
      } catch (err) {
        console.error('Failed to load user:', err)
        // Set default user if fetch fails
        setUser({
          name: 'User',
          email: 'user@example.com',
          username: 'user',
          avatar: null,
          plan: 'Free Plan',
          accountsUsed: connectedAccounts.length,
          accountsLimit: 10
        })
      }
    }
    
    loadUser()
  }, [])

  // Mock email data - converted to state for dynamic updates
  const [emails, setEmails] = useState([
    {
      id: 1,
      sender: 'John Doe',
      email: 'john@company.com',
      subject: 'Project Update: Q4 Report',
      preview: 'Hi, I wanted to share the latest updates on our Q4 project. The team has made significant progress...',
      time: '10:30 AM',
      priority: 'high',
      isRead: false,
      isStarred: true,
      account: 'work@email.com'
    },
    {
      id: 2,
      sender: 'Sarah Wilson',
      email: 'sarah@example.com',
      subject: 'Meeting Reminder: Tomorrow at 2 PM',
      preview: 'Just a friendly reminder about our meeting scheduled for tomorrow at 2 PM. Please prepare...',
      time: '9:15 AM',
      priority: 'medium',
      isRead: false,
      isStarred: false,
      account: 'work@email.com'
    },
    {
      id: 3,
      sender: 'Newsletter Team',
      email: 'news@newsletter.com',
      subject: 'Weekly Tech Digest',
      preview: 'Your weekly roundup of the latest tech news and trends. This week we cover AI advancements...',
      time: 'Yesterday',
      priority: 'low',
      isRead: true,
      isStarred: false,
      account: 'personal@email.com'
    },
    {
      id: 4,
      sender: 'Marketing Team',
      email: 'marketing@company.com',
      subject: 'Campaign Performance Review',
      preview: 'The latest marketing campaign has exceeded our expectations with a 25% increase in engagement...',
      time: 'Yesterday',
      priority: 'high',
      isRead: false,
      isStarred: true,
      account: 'work@email.com'
    },
    {
      id: 5,
      sender: 'Support Team',
      email: 'support@service.com',
      subject: 'Your Ticket #12345 Has Been Resolved',
      preview: 'We are pleased to inform you that your support ticket has been successfully resolved...',
      time: '2 days ago',
      priority: 'medium',
      isRead: true,
      isStarred: false,
      account: 'personal@email.com'
    }
  ])

  // Handler functions for email actions
  const handleArchiveEmail = (email) => {
    setEmails(emails.filter(e => e.id !== email.id))
    setArchivedEmails([...archivedEmails, { ...email, archivedAt: new Date() }])
    setOpenEmailDetail(null)
    success(`📥 "${email.subject}" archived successfully`)
  }

  const handleDeleteEmail = (email) => {
    setEmails(emails.filter(e => e.id !== email.id))
    setArchivedEmails(archivedEmails.filter(e => e.id !== email.id))
    setTrashedEmails([...trashedEmails, { ...email, trashedAt: new Date() }])
    setOpenEmailDetail(null)
    warning(`🗑️ Moved to trash. You can restore it within 30 days.`)
  }

  const handleRestoreFromArchive = (email) => {
    setArchivedEmails(archivedEmails.filter(e => e.id !== email.id))
    setEmails([...emails, email])
    setOpenEmailDetail(null) // Close the modal
    success(`📬 Email restored to inbox successfully`)
  }

  const handleRestoreFromTrash = (email) => {
    setTrashedEmails(trashedEmails.filter(e => e.id !== email.id))
    setEmails([...emails, email])
    setOpenEmailDetail(null) // Close the modal
    success(`📬 Email recovered from trash`)
  }

  const handlePermanentDelete = (email) => {
    setTrashedEmails(trashedEmails.filter(e => e.id !== email.id))
    setOpenEmailDetail(null) // Close the modal
    warning(`⚠️ Email permanently deleted. This action cannot be undone.`)
  }

  const handleEmptyTrash = () => {
    const count = trashedEmails.length
    setTrashedEmails([])
    success(`🧹 ${count} email${count !== 1 ? 's' : ''} permanently deleted`)
  }

  // Handle opening email and marking as read
  const handleOpenEmail = async (email) => {
    // Mark as read in local state if it's unread
    if (!email.isRead) {
      const updateEmailInList = (emailList) => 
        emailList.map(e => e.id === email.id ? { ...e, isRead: true } : e)
      
      setEmails(updateEmailInList(emails))
      setArchivedEmails(updateEmailInList(archivedEmails))
      setTrashedEmails(updateEmailInList(trashedEmails))
      
      // Update the email object for the modal
      email = { ...email, isRead: true }
      
      // Try to update on backend if it's a real email (has numeric ID from database)
      if (typeof email.id === 'number' && email.id > 1000) {
        try {
          await emailsAPI.markAsRead(email.id)
        } catch (err) {
          console.error('Failed to mark email as read in backend:', err)
          // Continue anyway since we've updated local state
        }
      }
      
      // Only show notification if email was previously unread
      info('📖 Reading email...')
    }
    
    // Open the email detail modal
    setOpenEmailDetail(email)
  }

  // Toggle star on email
  const handleToggleStar = (emailId) => {
    const updateStarInList = (list) => 
      list.map(e => e.id === emailId ? { ...e, isStarred: !e.isStarred } : e)
    
    // Update in the appropriate list
    if (activeView === 'inbox') {
      setEmails(updateStarInList(emails))
    } else if (activeView === 'archive') {
      setArchivedEmails(updateStarInList(archivedEmails))
    } else if (activeView === 'trash') {
      setTrashedEmails(updateStarInList(trashedEmails))
    }
    
    // Update the open email detail if it's the same email
    if (openEmailDetail && openEmailDetail.id === emailId) {
      setOpenEmailDetail({ ...openEmailDetail, isStarred: !openEmailDetail.isStarred })
    }
    
    // Show notification
    const email = [...emails, ...archivedEmails, ...trashedEmails].find(e => e.id === emailId)
    if (email) {
      if (!email.isStarred) {
        success('⭐ Email starred!')
      } else {
        info('Star removed')
      }
    }
  }

  // Get current email list based on active view
  const getCurrentEmails = () => {
    if (activeView === 'archive') return archivedEmails
    if (activeView === 'trash') return trashedEmails
    return emails
  }

  const currentEmails = getCurrentEmails()

  const filteredEmails = selectedPriority === 'all' 
    ? currentEmails 
    : currentEmails.filter(email => email.priority === selectedPriority)

  const priorityColors = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
  }

  // Helper function to format time ago
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  // Sync account function
  const handleSyncAccount = (accountId) => {
    setConnectedAccounts(accounts =>
      accounts.map(account =>
        account.id === accountId
          ? { ...account, lastSynced: new Date() }
          : account
      )
    )
    // Show success notification (you can add a toast here)
    console.log('Account synced successfully')
  }

  // Remove account function
  const handleRemoveAccount = async (accountId) => {
    if (window.confirm('Are you sure you want to disconnect this account?')) {
      try {
        await emailAccounts.disconnectAccount(accountId)
        setConnectedAccounts(accounts =>
          accounts.filter(account => account.id !== accountId)
        )
        success('Account disconnected successfully')
      } catch (err) {
        error(`Failed to disconnect account: ${err.message}`)
        console.error(err)
      }
    }
  }

  // Add account function
  const handleAddAccount = async (provider) => {
    if (connectedAccounts.length >= user.accountsLimit) {
      warning('You have reached your account limit. Please upgrade your plan to add more accounts.')
      return
    }
    
    try {
      setShowAddAccountModal(false)
      info(`Connecting to ${provider}... 🔗`)
      
      if (provider.toLowerCase() === 'gmail') {
        const result = await gmailAuth.getAuthUrl()
        // Redirect to Google OAuth
        window.location.href = result.auth_url
      } else if (provider.toLowerCase() === 'outlook') {
        const result = await outlookAuth.getAuthUrl()
        // Redirect to Microsoft OAuth
        window.location.href = result.auth_url
      } else {
        warning(`${provider} integration coming soon! 🚀`)
      }
    } catch (err) {
      error(`Failed to connect ${provider}: ${err.message}`)
      console.error(err)
    }
  }

  // AI Summarize function
  const handleAISummarize = (emailToSummarize = null) => {
    const email = emailToSummarize || selectedEmail
    
    if (!email) {
      warning('⚠️ Please select an email to summarize')
      return
    }
    
    setShowAISummarizer(true)
    setIsGeneratingSummary(true)
    setAiSummary('')
    info('🤖 AI analyzing email content...')
    
    // Simulate AI processing
    setTimeout(() => {
      const summary = `📧 Email Summary:\n\n` +
        `From: ${email.sender}\n` +
        `Subject: ${email.subject}\n\n` +
        `Key Points:\n` +
        `• This is a ${email.priority} priority email\n` +
        `• Main topic: ${email.subject}\n` +
        `• Action required: Review and respond\n\n` +
        `AI Insight: This email appears to be ${email.priority === 'high' ? 'urgent and requires immediate attention' : 'informational and can be addressed at your convenience'}.`
      
      setAiSummary(summary)
      setIsGeneratingSummary(false)
      success('✨ Summary generated! Review the key points above.')
    }, 2000)
  }

  // AI Writer function (opens compose with AI)
  const handleAIWriter = () => {
    if (!selectedEmail) {
      warning('⚠️ Select an email first to use AI Writer')
      return
    }
    
    // Don't close AI Summarizer, just open compose on top
    setIsComposeOpen(true)
    info('✍️ AI Writer ready! Start composing your message.')
    // The ComposeEmail component will handle AI writing
  }

  // AI Reply Generator function
  const handleAIReply = () => {
    if (!openEmailDetail) {
      warning('⚠️ Open an email first to generate a reply')
      return
    }
    
    setShowAIReply(true)
    setIsGeneratingReply(true)
    setAiReply('')
    info('🤖 Crafting intelligent reply...')
    
    // Simulate AI processing
    setTimeout(() => {
      const reply = `Dear ${openEmailDetail.sender},\n\n` +
        `Thank you for your email regarding "${openEmailDetail.subject}".\n\n` +
        `I have reviewed your message and wanted to respond promptly. ` +
        `${openEmailDetail.priority === 'high' ? 'I understand this is urgent and will prioritize accordingly.' : 'I appreciate you reaching out and sharing this information.'}\n\n` +
        `Based on the content of your email, I would like to suggest the following:\n\n` +
        `• I will review the details you've provided\n` +
        `• ${openEmailDetail.priority === 'high' ? 'I will follow up within the next business day' : 'I will get back to you within a few business days'}\n` +
        `• Please let me know if you have any additional questions or concerns\n\n` +
        `Thank you for your time and I look forward to continuing our conversation.\n\n` +
        `Best regards,\n` +
        `[Your name]`
      
      setAiReply(reply)
      setIsGeneratingReply(false)
      success('✨ Professional reply ready! Edit and send when ready.')
    }, 3000)
  }

  // Handle sending AI-generated reply
  const handleSendAIReply = () => {
    if (!aiReply.trim()) {
      warning('⚠️ Generate a reply first before sending')
      return
    }
    
    setShowAIReply(false)
    setOpenEmailDetail(null)
    setAiReply('')
    success('✅ Reply sent successfully!')
  }

  // Show loading if user data not loaded yet
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Top Navigation Bar with User Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 transition-colors duration-300 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-darkBlue-900 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">IP</span>
              </div>
              <span className="text-2xl font-bold text-darkBlue-900 dark:text-white">InboxPilot</span>
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle - Only show when not in auto mode */}
              {!autoMode && (
                <motion.button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {darkMode ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </motion.button>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-3 py-2 transition-colors duration-200"
                >
                {/* User Avatar */}
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 dark:from-blue-600 dark:via-cyan-600 dark:to-teal-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold text-lg">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                {/* User Info */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{user.plan}</p>
                </div>
                {/* Dropdown Arrow */}
                <svg className={`w-5 h-5 text-gray-700 dark:text-gray-300 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 dark:from-blue-600 dark:via-cyan-600 dark:to-teal-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                          <span className="text-white font-semibold text-xl">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate" title={user.email}>{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-teal-900/20 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Current Plan</span>
                      <span className="text-xs bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-semibold">{user.plan}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Email Accounts</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{user.accountsUsed}/{user.accountsLimit}</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link to="/profile" state={{ tab: 'profile' }} className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors duration-200">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">Profile Settings</span>
                    </Link>
                    
                    <Link to="/profile" state={{ tab: 'accounts' }} className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors duration-200">
                      <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">Manage Accounts</span>
                    </Link>

                    <Link to="/profile" state={{ tab: 'preferences' }} className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors duration-200">
                      <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">Preferences</span>
                    </Link>

                    <Link to="/profile" state={{ tab: 'upgrade' }} className="w-full px-4 py-2 text-left hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 dark:hover:from-amber-900/20 dark:hover:to-yellow-900/20 flex items-center space-x-3 transition-colors duration-200">
                      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-amber-700 dark:text-amber-300 font-semibold">Upgrade Plan</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <Link 
                      to="/auth"
                      className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 transition-colors duration-200 text-red-600 dark:text-red-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-semibold">Logout</span>
                    </Link>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-darkBlue-900 dark:text-white mb-2">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <p className="text-darkBlue-600 dark:text-gray-400">You have {emails.filter(e => !e.isRead).length} unread messages</p>
        </div>

        {/* Top Row - AI Tools & Mail Navigation */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* AI Tools */}
          <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-700 dark:via-indigo-700 dark:to-blue-700 rounded-xl shadow-xl overflow-hidden">
            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm p-4 border-b border-white/30 dark:border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/30 dark:bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">AI Tools</h3>
                </div>
                <div className="flex items-center space-x-1 bg-white/30 dark:bg-white/20 px-2 py-1 rounded-full shadow-sm">
                  <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-300 rounded-full animate-pulse shadow-sm"></div>
                  <span className="text-xs text-white font-bold">AI Ready</span>
                </div>
              </div>
            </div>

            <div className="p-4 grid grid-cols-3 gap-3">
              {/* AI Summarize */}
              <button 
                onClick={handleAISummarize}
                className="bg-white/25 dark:bg-white/15 hover:bg-white/35 dark:hover:bg-white/25 backdrop-blur-sm rounded-xl p-4 text-center transition-all duration-300 border border-white/40 dark:border-white/30 hover:border-white/60 dark:hover:border-white/50 group hover:shadow-xl hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 dark:from-purple-300 dark:to-indigo-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="font-bold text-white text-sm">AI Summarize</p>
                <p className="text-xs text-white/80 mt-1">Quick summary</p>
              </button>

              {/* AI Writer */}
              <button 
                onClick={handleAIWriter}
                className="bg-white/25 dark:bg-white/15 hover:bg-white/35 dark:hover:bg-white/25 backdrop-blur-sm rounded-xl p-4 text-center transition-all duration-300 border border-white/40 dark:border-white/30 hover:border-white/60 dark:hover:border-white/50 group hover:shadow-xl hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-500 dark:from-indigo-300 dark:to-blue-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="font-bold text-white text-sm">AI Writer</p>
                <p className="text-xs text-white/80 mt-1">Smart replies</p>
              </button>

              {/* Smart Priority */}
              <button className="bg-white/25 dark:bg-white/15 hover:bg-white/35 dark:hover:bg-white/25 backdrop-blur-sm rounded-xl p-4 text-center transition-all duration-300 border border-white/40 dark:border-white/30 hover:border-white/60 dark:hover:border-white/50 group hover:shadow-xl hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 dark:from-blue-300 dark:to-cyan-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                </div>
                <p className="font-bold text-white text-sm">Smart Priority</p>
                <p className="text-xs text-white/80 mt-1">Auto-sort</p>
              </button>
            </div>
          </div>

          {/* Mail Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <h3 className="text-lg font-bold text-darkBlue-900 dark:text-white mb-4">Mail Navigation</h3>
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  onClick={() => {
                    setActiveView('inbox')
                    setSelectedPriority('all')
                  }}
                  className={`flex flex-col items-center justify-center px-4 py-4 rounded-xl transition-all duration-200 ${
                    activeView === 'inbox'
                      ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 font-semibold shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <span className="text-sm font-semibold">Inbox</span>
                  {emails.length > 0 && (
                    <span className="mt-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {emails.length}
                    </span>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => {
                    setActiveView('archive')
                    setSelectedPriority('all')
                  }}
                  className={`flex flex-col items-center justify-center px-4 py-4 rounded-xl transition-all duration-200 ${
                    activeView === 'archive'
                      ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-300 font-semibold shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span className="text-sm font-semibold">Archive</span>
                  {archivedEmails.length > 0 && (
                    <span className="mt-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {archivedEmails.length}
                    </span>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => {
                    setActiveView('trash')
                    setSelectedPriority('all')
                  }}
                  className={`flex flex-col items-center justify-center px-4 py-4 rounded-xl transition-all duration-200 ${
                    activeView === 'trash'
                      ? 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-300 font-semibold shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-sm font-semibold">Trash</span>
                  {trashedEmails.length > 0 && (
                    <span className="mt-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {trashedEmails.length}
                    </span>
                  )}
                </motion.button>
              </div>

              {trashedEmails.length > 0 && activeView === 'trash' && (
                <motion.button
                  onClick={handleEmptyTrash}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 mt-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Empty Trash</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl shadow-md border border-blue-100 dark:border-blue-800 p-6 hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
            whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Total Emails</p>
                <motion.p 
                  className="text-3xl font-bold text-blue-700 dark:text-blue-300"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                >
                  {emails.length}
                </motion.p>
              </div>
              <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360, transition: { duration: 0.3 } }}
              >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl shadow-md border border-red-100 dark:border-red-800 p-6 hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">High Priority</p>
                <motion.p 
                  className="text-3xl font-bold text-red-700 dark:text-red-300"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                >
                  {emails.filter(e => e.priority === 'high').length}
                </motion.p>
              </div>
              <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360, transition: { duration: 0.3 } }}
              >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-md border border-purple-100 dark:border-purple-800 p-6 hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">Unread</p>
                <motion.p 
                  className="text-3xl font-bold text-purple-700 dark:text-purple-300"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                >
                  {emails.filter(e => !e.isRead).length}
                </motion.p>
              </div>
              <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360, transition: { duration: 0.3 } }}
              >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl shadow-md border border-amber-100 dark:border-amber-800 p-6 hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1">Starred</p>
                <motion.p 
                  className="text-3xl font-bold text-amber-700 dark:text-amber-300"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                >
                  {emails.filter(e => e.isStarred).length}
                </motion.p>
              </div>
              <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360, transition: { duration: 0.3 } }}
              >
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Email List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md transition-colors duration-300 overflow-hidden">
              {/* Filter Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/30 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {activeView === 'inbox' && (
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    )}
                    {activeView === 'archive' && (
                      <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    )}
                    {activeView === 'trash' && (
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    <h2 className="text-xl font-bold text-darkBlue-900 dark:text-white capitalize">
                      {activeView === 'inbox' ? 'Inbox' : activeView === 'archive' ? 'Archive' : 'Trash'}
                    </h2>
                  </div>
                  {activeView === 'inbox' && (
                    <motion.button 
                      onClick={() => setIsComposeOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Compose
                    </motion.button>
                  )}
                </div>
                
                <div className="flex space-x-2 flex-wrap gap-2">
                  <motion.button
                    onClick={() => setSelectedPriority('all')}
                    className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                      selectedPriority === 'all' 
                        ? 'text-white' 
                        : 'bg-white dark:bg-gray-700 text-darkBlue-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedPriority === 'all' && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">All</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setSelectedPriority('high')}
                    className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                      selectedPriority === 'high' 
                        ? 'text-white' 
                        : 'bg-white dark:bg-gray-700 text-darkBlue-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedPriority === 'high' && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-lg"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">High Priority</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setSelectedPriority('medium')}
                    className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                      selectedPriority === 'medium' 
                        ? 'text-white' 
                        : 'bg-white dark:bg-gray-700 text-darkBlue-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedPriority === 'medium' && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl shadow-lg"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">Medium</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setSelectedPriority('low')}
                    className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                      selectedPriority === 'low' 
                        ? 'text-white' 
                        : 'bg-white dark:bg-gray-700 text-darkBlue-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedPriority === 'low' && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl shadow-lg"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">Low Priority</span>
                  </motion.button>
                </div>
              </div>

              {/* Email List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence mode="popLayout">
                  {filteredEmails.map((email, index) => (
                    <motion.div
                      key={email.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeInOut",
                        layout: { duration: 0.3, ease: "easeInOut" }
                      }}
                      onClick={() => setSelectedEmail(selectedEmail?.id === email.id ? null : email)}
                      onDoubleClick={() => handleOpenEmail(email)}
                      className={`p-6 cursor-pointer transition-all duration-300 ease-in-out border-l-4 ${
                        selectedEmail?.id === email.id 
                          ? 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 border-l-blue-600 dark:border-l-cyan-400 shadow-lg' 
                          : `${!email.isRead ? 'bg-blue-50 dark:bg-gray-700/80' : 'bg-white dark:bg-gray-800'} border-l-transparent hover:bg-blue-100 dark:hover:bg-gray-700 hover:border-l-blue-400 dark:hover:border-l-cyan-400 hover:shadow-md`
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3 flex-1">
                          <motion.div 
                            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 dark:from-blue-400 dark:to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-md transition-all duration-300"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            {email.sender.charAt(0)}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className={`text-sm font-semibold text-darkBlue-900 dark:text-white truncate transition-all duration-300 ${!email.isRead ? 'font-bold' : ''}`}>
                                {email.sender}
                              </h3>
                              <motion.span 
                                className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-all duration-300 ${priorityColors[email.priority]}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                              >
                                {email.priority}
                              </motion.span>
                            </div>
                            <p className="text-xs text-darkBlue-600 dark:text-gray-400 transition-colors duration-300">{email.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!email.isRead && (
                            <motion.div 
                              className="w-2 h-2 bg-blue-600 dark:bg-cyan-400 rounded-full shadow-sm"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            />
                          )}
                          <span className="text-xs text-darkBlue-600 dark:text-gray-400 font-medium whitespace-nowrap transition-colors duration-300">{email.time}</span>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation() // Prevent opening email when clicking star
                              handleToggleStar(email.id)
                            }}
                            className={`p-1 rounded transition-colors duration-300 ${
                              email.isStarred 
                                ? 'text-amber-500 dark:text-amber-400' 
                                : 'text-gray-400 dark:text-gray-600 hover:text-amber-500 dark:hover:text-amber-400'
                            }`}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            <svg 
                              className="w-5 h-5 transition-colors duration-300" 
                              viewBox="0 0 20 20"
                              fill={email.isStarred ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth={email.isStarred ? 0 : 2}
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                      <h4 className={`text-sm text-darkBlue-900 dark:text-white mb-1 transition-all duration-300 ${!email.isRead ? 'font-semibold' : ''}`}>
                        {email.subject}
                      </h4>
                      <p className="text-sm text-darkBlue-600 dark:text-gray-400 line-clamp-2 transition-colors duration-300">{email.preview}</p>
                      <div className="mt-2">
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium transition-colors duration-300">{email.account}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Connected Accounts */}
          <div className="space-y-6">
            {/* Connected Accounts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-bold text-white">Connected Accounts</h3>
                  </div>
                  <span className="text-xs bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-white font-bold shadow-md">
                    {connectedAccounts.length}/{user.accountsLimit}
                  </span>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {/* Dynamic Account Cards */}
                {connectedAccounts.map((account) => {
                  const isGmail = account.provider === 'gmail'
                  const gradientColors = isGmail 
                    ? 'from-red-100 via-orange-50 to-red-50 border-red-200 dark:from-red-900/30 dark:via-orange-900/20 dark:to-red-900/20 dark:border-red-800'
                    : 'from-blue-100 via-cyan-50 to-blue-50 border-blue-200 dark:from-blue-900/30 dark:via-cyan-900/20 dark:to-blue-900/20 dark:border-blue-800'
                  const iconGradient = isGmail
                    ? 'from-red-500 via-orange-500 to-red-600'
                    : 'from-blue-500 via-cyan-500 to-blue-600'
                  const progressGradient = isGmail
                    ? 'from-red-500 via-orange-500 to-red-600'
                    : 'from-blue-500 via-cyan-500 to-blue-600'
                  const buttonColor = isGmail ? 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300' : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                  const optionsColor = isGmail ? 'hover:text-red-600 dark:hover:text-red-400' : 'hover:text-blue-600 dark:hover:text-blue-400'
                  const textColor = isGmail ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'

                  return (
                    <div key={account.id} className={`group relative bg-gradient-to-br ${gradientColors} rounded-xl p-4 border hover:shadow-lg transition-all duration-300`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`w-12 h-12 bg-gradient-to-br ${iconGradient} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              {isGmail ? (
                                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                              ) : (
                                <path d="M24 7.875v8.25A3.375 3.375 0 0120.625 19.5h-17.25A3.375 3.375 0 010 16.125v-8.25A3.375 3.375 0 013.375 4.5h17.25A3.375 3.375 0 0124 7.875zm-2.25 0v-.281c0-.329-.157-.637-.422-.825L12 12.562 2.672 6.769a1.125 1.125 0 00-.422.825v.281L12 13.688l9.75-5.813zm-9.75 7.313L2.25 9.375v6.75c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-6.75L12 15.188z"/>
                              )}
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className={`text-sm font-bold ${textColor} truncate`}>{account.email}</p>
                              <span className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></span>
                            </div>
                            <p className={`text-xs font-semibold mb-1 ${account.unreadCount > 0 ? textColor : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {account.unreadCount > 0 ? `${account.unreadCount} unread message${account.unreadCount > 1 ? 's' : ''}` : 'All caught up! 🎉'}
                            </p>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-white/70 dark:bg-gray-700/50 rounded-full h-2 overflow-hidden shadow-inner">
                                <div className={`bg-gradient-to-r ${progressGradient} h-full rounded-full transition-all duration-500`} style={{ width: `${account.storageUsed}%` }}></div>
                              </div>
                              <span className={`text-xs ${textColor} font-bold`}>{account.storageUsed}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <button 
                            className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 ${optionsColor}`}
                            onClick={() => handleRemoveAccount(account.id)}
                            title="Disconnect account"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className={`mt-3 pt-3 border-t ${isGmail ? 'border-red-100 dark:border-red-900/30' : 'border-blue-100 dark:border-blue-900/30'} flex items-center justify-between text-xs`}>
                        <div className="flex items-center space-x-1">
                          <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">Last synced: <span className="font-bold text-gray-900 dark:text-white">{getTimeAgo(account.lastSynced)}</span></span>
                        </div>
                        <button 
                          onClick={() => handleSyncAccount(account.id)}
                          className={`${buttonColor} font-semibold flex items-center space-x-1 hover:scale-105 transition-transform duration-200`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Sync</span>
                        </button>
                      </div>
                    </div>
                  )
                })}

                {/* Add Account Button */}
                <button 
                  onClick={() => setShowAddAccountModal(true)}
                  disabled={connectedAccounts.length >= user.accountsLimit}
                  className={`w-full p-4 border-2 border-dashed rounded-xl text-sm font-semibold group transition-all duration-300 ${
                    connectedAccounts.length >= user.accountsLimit
                      ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800/30'
                      : 'border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:border-cyan-500 dark:hover:border-cyan-500 hover:bg-gradient-to-br hover:from-blue-50 hover:via-cyan-50 hover:to-teal-50 dark:hover:from-blue-900/20 dark:hover:via-cyan-900/20 dark:hover:to-teal-900/20 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-8 h-8 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-500 rounded-lg flex items-center justify-center transition-transform duration-300 shadow-md ${
                      connectedAccounts.length < user.accountsLimit ? 'group-hover:scale-110 group-hover:shadow-xl' : 'opacity-50'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className={connectedAccounts.length < user.accountsLimit ? 'group-hover:text-cyan-800 dark:group-hover:text-cyan-200 transition-colors duration-300' : ''}>
                      Add Email Account
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {connectedAccounts.length >= user.accountsLimit
                      ? 'Upgrade your plan to add more accounts'
                      : 'Connect Gmail, Outlook, or other providers'
                    }
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compose Email Modal */}
      <ComposeEmail 
        isOpen={isComposeOpen} 
        onClose={() => setIsComposeOpen(false)}
        onSend={(type, message) => {
          if (type === 'success') success(message)
          else if (type === 'error') error(message)
        }}
      />

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-darkBlue-900 to-primary-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Add Email Account</h3>
                <button
                  onClick={() => setShowAddAccountModal(false)}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-white/80 text-sm mt-2">Choose your email provider to connect</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-3">
              {/* Gmail Option */}
              <button
                onClick={() => handleAddAccount('gmail')}
                className="w-full p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-100 dark:border-red-800 hover:border-red-300 dark:hover:border-red-600 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-darkBlue-900 dark:text-white text-lg">Gmail</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Connect your Google account</p>
                  </div>
                  <svg className="w-6 h-6 text-red-500 dark:text-red-400 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Outlook Option */}
              <button
                onClick={() => handleAddAccount('outlook')}
                className="w-full p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-100 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 7.875v8.25A3.375 3.375 0 0120.625 19.5h-17.25A3.375 3.375 0 010 16.125v-8.25A3.375 3.375 0 013.375 4.5h17.25A3.375 3.375 0 0124 7.875zm-2.25 0v-.281c0-.329-.157-.637-.422-.825L12 12.562 2.672 6.769a1.125 1.125 0 00-.422.825v.281L12 13.688l9.75-5.813zm-9.75 7.313L2.25 9.375v6.75c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-6.75L12 15.188z"/>
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-darkBlue-900 dark:text-white text-lg">Outlook</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Connect your Microsoft account</p>
                  </div>
                  <svg className="w-6 h-6 text-blue-500 dark:text-blue-400 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Yahoo Option */}
              <button
                onClick={() => handleAddAccount('yahoo')}
                className="w-full p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-100 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-darkBlue-900 dark:text-white text-lg">Yahoo Mail</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Connect your Yahoo account</p>
                  </div>
                  <svg className="w-6 h-6 text-purple-500 dark:text-purple-400 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Other Provider */}
              <button
                onClick={() => handleAddAccount('other')}
                className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-darkBlue-900 dark:text-white text-lg">Other Provider</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">IMAP/SMTP configuration</p>
                  </div>
                  <svg className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                🔒 Your credentials are encrypted and stored securely
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Summarizer Modal */}
      {showAISummarizer && (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 ${isComposeOpen ? 'z-[60] opacity-90' : 'z-[60] opacity-100'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-700 dark:via-indigo-700 dark:to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/30 dark:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">AI Email Summary</h3>
                    <p className="text-sm text-white/90 dark:text-white/80">Powered by GPT-4</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAISummarizer(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 bg-white dark:bg-gray-800">
              {isGeneratingSummary ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">Analyzing email content...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This may take a few seconds</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Content */}
                  <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                    <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-relaxed">
                      {aiSummary}
                    </pre>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleAISummarize}
                      className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Regenerate</span>
                    </button>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold">
                        Copy Summary
                      </button>
                      <button 
                        onClick={() => setIsComposeOpen(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-500 dark:via-indigo-500 dark:to-blue-500 text-white rounded-lg hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:via-indigo-600 dark:hover:to-blue-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                      >
                        Reply with AI
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>AI Credit used: 1 of 50 today</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <span>⚡ Generated in 2.3s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Reply Modal */}
      {showAIReply && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/30 dark:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">AI Reply Generator</h3>
                    <p className="text-sm text-white/90 dark:text-white/80">Smart email responses powered by AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIReply(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 bg-white dark:bg-gray-800 overflow-y-auto max-h-[60vh]">
              {isGeneratingReply ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-6 text-gray-700 dark:text-gray-300 font-semibold text-lg">Crafting your reply...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Analyzing context and tone</p>
                  <div className="flex items-center space-x-1 mt-4">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Original Email Context */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-indigo-500">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Replying to:</p>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">{openEmailDetail?.subject}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">From: {openEmailDetail?.sender}</p>
                  </div>

                  {/* AI Generated Reply */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">AI Generated Reply:</label>
                    <textarea
                      value={aiReply}
                      onChange={(e) => setAiReply(e.target.value)}
                      className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Your AI-generated reply will appear here..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleAIReply}
                      className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Regenerate Reply</span>
                    </button>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => setShowAIReply(false)}
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSendAIReply}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 text-white rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 dark:hover:from-indigo-600 dark:hover:via-purple-600 dark:hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                        disabled={!aiReply.trim()}
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>AI Credit used: 1 of 50 today</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <span>✨ Smart reply technology</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Detail Modal */}
      <AnimatePresence>
        {openEmailDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpenEmailDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-700 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <motion.div 
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/30"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    >
                      {openEmailDetail.sender.charAt(0)}
                    </motion.div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">{openEmailDetail.sender}</h2>
                      <p className="text-sm text-white/80">{openEmailDetail.from || openEmailDetail.sender.toLowerCase().replace(' ', '.') + '@email.com'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleStar(openEmailDetail.id)}
                    >
                      <svg className="w-6 h-6" fill={openEmailDetail.isStarred ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </motion.button>
                    <motion.button
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setOpenEmailDetail(null)}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{openEmailDetail.subject}</h3>
                </div>
              </div>

              {/* Email Metadata */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-1">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{openEmailDetail.time}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Priority</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      openEmailDetail.priority === 'high' 
                        ? 'bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700' 
                        : openEmailDetail.priority === 'medium'
                        ? 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700'
                        : 'bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                    }`}>
                      {openEmailDetail.priority.charAt(0).toUpperCase() + openEmailDetail.priority.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      openEmailDetail.isRead
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        : 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-700'
                    }`}>
                      {openEmailDetail.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Attachments</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-1">
                      <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span>{openEmailDetail.attachments || 0}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="p-6 overflow-y-auto max-h-[50vh] bg-white dark:bg-gray-800">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {openEmailDetail.preview || openEmailDetail.body || `Dear Team,\n\n${openEmailDetail.subject}\n\nThis is a detailed email message that would contain the full content of the email. The actual email body would be displayed here with proper formatting and styling.\n\nBest regards,\n${openEmailDetail.sender}`}
                  </p>
                </div>
              </div>

                {/* Actions */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex flex-wrap gap-3">
                  {activeView === 'inbox' && (
                    <>
                      <motion.button
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setOpenEmailDetail(null)
                          setIsComposeOpen(true)
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        <span>Reply</span>
                      </motion.button>
                      <motion.button
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAIReply()}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>Reply with AI</span>
                      </motion.button>
                      <motion.button
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAISummarize(openEmailDetail)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>AI Summarizer</span>
                      </motion.button>
                      <motion.button
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setOpenEmailDetail(null)
                          setIsComposeOpen(true)
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span>Forward</span>
                      </motion.button>
                      <motion.button
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleArchiveEmail(openEmailDetail)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span>Archive</span>
                      </motion.button>
                      <motion.button
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteEmail(openEmailDetail)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </motion.button>
                    </>
                  )}

                  {activeView === 'archive' && (
                    <>
                      <motion.button
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRestoreFromArchive(openEmailDetail)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        <span>Restore to Inbox</span>
                      </motion.button>
                      <motion.button
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteEmail(openEmailDetail)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Move to Trash</span>
                      </motion.button>
                    </>
                  )}

                  {activeView === 'trash' && (
                    <>
                      <motion.button
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRestoreFromTrash(openEmailDetail)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        <span>Restore to Inbox</span>
                      </motion.button>
                      <motion.button
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePermanentDelete(openEmailDetail)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete Permanently</span>
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
