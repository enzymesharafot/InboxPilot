import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { emails } from '../utils/api'

const ComposeEmail = ({ isOpen, onClose, onSend }) => {
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [priority, setPriority] = useState('normal')
  const [useAI, setUseAI] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    
    if (!to || !subject || !body) {
      if (onSend) onSend('error', 'Please fill in all required fields')
      return
    }
    
    setIsSending(true)
    
    try {
      const emailData = {
        to,
        cc,
        bcc,
        subject,
        body,
        priority
      }
      
      const response = await emails.send(emailData)
      
      // Notify success
      if (onSend) onSend('success', response.message || `Email sent successfully to ${to}`)
      
      // Reset form
      setTo('')
      setCc('')
      setBcc('')
      setSubject('')
      setBody('')
      setShowCc(false)
      setShowBcc(false)
      setPriority('normal')
      onClose()
    } catch (error) {
      console.error('Failed to send email:', error)
      if (onSend) onSend('error', error.message || 'Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  const handleAIGenerate = () => {
    if (!aiPrompt.trim()) return
    
    // Simulate AI generation
    const templates = {
      'meeting': `Dear Team,\n\nI hope this email finds you well. I would like to schedule a meeting to discuss our upcoming project deliverables.\n\nPlease let me know your availability for this week.\n\nBest regards`,
      'follow up': `Hi,\n\nI wanted to follow up on my previous email regarding our discussion. Please let me know if you need any additional information from my side.\n\nLooking forward to your response.\n\nBest regards`,
      'thank you': `Dear [Name],\n\nThank you so much for your time and assistance. I really appreciate your help with this matter.\n\nBest regards`
    }
    
    // Simple keyword matching
    let generatedText = templates['thank you']
    if (aiPrompt.toLowerCase().includes('meeting')) {
      generatedText = templates['meeting']
    } else if (aiPrompt.toLowerCase().includes('follow')) {
      generatedText = templates['follow up']
    }
    
    setBody(generatedText)
    setAiPrompt('')
    setUseAI(false)
  }

  const handleSaveDraft = () => {
    console.log('Saving draft:', { to, subject, body })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60"
            onClick={onClose}
          />

          {/* Compose Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:bottom-4 md:right-4 md:top-auto md:left-auto md:w-[600px] md:max-h-[700px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-[70] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 dark:from-indigo-700 dark:via-blue-700 dark:to-cyan-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/30 dark:bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">New Message</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSend} className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
              <div className="p-6 space-y-4">
                {/* To Field */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">To:</label>
                    <input
                      type="email"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="flex-1 outline-none text-sm text-gray-900 dark:text-gray-100 bg-transparent"
                      placeholder="recipient@example.com"
                      required
                    />
                    <div className="flex items-center space-x-2">
                      {!showCc && (
                        <button
                          type="button"
                          onClick={() => setShowCc(true)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                          Cc
                        </button>
                      )}
                      {!showBcc && (
                        <button
                          type="button"
                          onClick={() => setShowBcc(true)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                          Bcc
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cc Field */}
                <AnimatePresence>
                  {showCc && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b border-gray-200 dark:border-gray-700 pb-3"
                    >
                      <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">Cc:</label>
                        <input
                          type="email"
                          value={cc}
                          onChange={(e) => setCc(e.target.value)}
                          className="flex-1 outline-none text-sm text-gray-900 dark:text-gray-100 bg-transparent"
                          placeholder="cc@example.com"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCc(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bcc Field */}
                <AnimatePresence>
                  {showBcc && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b border-gray-200 dark:border-gray-700 pb-3"
                    >
                      <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">Bcc:</label>
                        <input
                          type="email"
                          value={bcc}
                          onChange={(e) => setBcc(e.target.value)}
                          className="flex-1 outline-none text-sm text-gray-900 dark:text-gray-100 bg-transparent"
                          placeholder="bcc@example.com"
                        />
                        <button
                          type="button"
                          onClick={() => setShowBcc(false)}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subject Field */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">Subject:</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="flex-1 outline-none text-sm text-gray-900 dark:text-gray-100 bg-transparent"
                      placeholder="Email subject"
                      required
                    />
                  </div>
                </div>

                {/* Priority Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setPriority('low')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        priority === 'low'
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      Low
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('medium')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        priority === 'medium'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('high')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        priority === 'high'
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      High
                    </button>
                  </div>
                </div>

                {/* AI Assistant Toggle */}
                <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-sm font-semibold text-purple-900 dark:text-purple-300">AI Email Writer</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUseAI(!useAI)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        useAI ? 'bg-purple-600 dark:bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          useAI ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {useAI && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2"
                      >
                        <input
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                          placeholder="e.g., Write a meeting request, Follow up email, Thank you note"
                        />
                        <button
                          type="button"
                          onClick={handleAIGenerate}
                          className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-500 dark:via-indigo-500 dark:to-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:via-indigo-600 dark:hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Generate with AI ✨
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Body Field */}
                <div>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full h-64 outline-none text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 resize-none p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50"
                    placeholder="Write your message here..."
                    required
                  />
                </div>

                {/* Formatting Toolbar */}
                <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                    title="Bold"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                    title="Italic"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                    title="Attach File"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                    title="Insert Link"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                    title="Insert Emoji"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium flex items-center space-x-1 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save Draft</span>
              </button>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 dark:from-indigo-500 dark:via-blue-500 dark:to-cyan-500 text-white rounded-lg font-semibold hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 dark:hover:from-indigo-600 dark:hover:via-blue-600 dark:hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ComposeEmail
