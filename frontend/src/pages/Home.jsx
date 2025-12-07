import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useDarkMode } from '../context/DarkModeContext'

// Reusable animation component for scroll-triggered elements
const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      {children}
    </motion.div>
  )
}

// Floating animation component
const FloatingElement = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-10, 10, -10] }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    >
      {children}
    </motion.div>
  )
}

const Home = () => {
  const { darkMode, toggleDarkMode, autoMode } = useDarkMode()
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }
    }
  }

  const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
    }
  }

  const slideInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
    }
  }

  return (
    <div className="relative">
      {/* Floating Dark Mode Toggle - Only show when not in auto mode */}
      {!autoMode && (
        <motion.button
          onClick={toggleDarkMode}
          className="fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-600"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          {darkMode ? (
            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </motion.button>
      )}

      <div id="home" className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      {/* Hero Section with Parallax */}
      <motion.section 
        style={{ opacity, scale }}
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Main Heading */}
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight"
              variants={fadeInUp}
            >
              All Things In
              <motion.span 
                className="block mt-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent"
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                One Place
              </motion.span>
            </motion.h1>
            
            {/* Subheading */}
            <motion.p 
              className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto font-light"
              variants={fadeInUp}
            >
              Streamline your email management with InboxPilot. 
              Organize, prioritize, and conquer your inbox effortlessly.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
              variants={fadeInUp}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/auth" className="btn-primary">
                  Get Started
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a href="#features" className="btn-secondary">
                  Explore Features
                </a>
              </motion.div>
            </motion.div>

            {/* Hero Image/Illustration with Floating Animation */}
            <motion.div 
              className="relative max-w-5xl mx-auto"
              variants={scaleIn}
            >
              <FloatingElement delay={0}>
                <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-700 rounded-3xl shadow-2xl p-8 sm:p-12">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-10 shadow-inner">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <motion.div 
                        className="h-4 bg-blue-200 dark:bg-blue-900/40 rounded"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div 
                        className="h-4 bg-cyan-200 dark:bg-cyan-900/40 rounded"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      />
                      <motion.div 
                        className="h-4 bg-teal-200 dark:bg-teal-900/40 rounded"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                      />
                    </div>
                    <div className="space-y-4">
                      <motion.div 
                        className="h-20 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg"
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                      />
                      <motion.div 
                        className="h-20 bg-gradient-to-r from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 rounded-lg"
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                      />
                      <motion.div 
                        className="h-20 bg-gradient-to-r from-teal-100 to-blue-100 dark:from-teal-900/30 dark:to-blue-900/30 rounded-lg"
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                      />
                    </div>
                  </div>
                </div>
              </FloatingElement>
              {/* Decorative Elements with Floating */}
              <FloatingElement delay={1}>
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-cyan-400 dark:bg-cyan-600 rounded-full opacity-20 blur-xl"></div>
              </FloatingElement>
              <FloatingElement delay={1.5}>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-400 dark:bg-blue-600 rounded-full opacity-20 blur-xl"></div>
              </FloatingElement>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section 
        id="features" 
        className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose InboxPilot?
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to make email management simple and efficient
            </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Feature 1 - Multiple Email Accounts */}
            <ScrollReveal delay={0.1}>
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 text-center"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Multiple Email Accounts</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                Connect and manage multiple email accounts in one unified inbox
              </p>
              <div className="inline-block bg-gradient-to-r from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 text-cyan-700 dark:text-cyan-400 px-3 py-1.5 rounded-full text-xs font-semibold">
                2 Free Accounts
              </div>
              </motion.div>
            </ScrollReveal>

            {/* Feature 2 - AI Email Summarizer */}
            <ScrollReveal delay={0.2}>
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 text-center"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-500 dark:via-indigo-500 dark:to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI Email Summarizer</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                Get instant AI-powered summaries of lengthy emails and save valuable time
              </p>
              <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-full text-xs font-semibold">
                AI Powered
              </div>
              </motion.div>
            </ScrollReveal>

            {/* Feature 3 - Smart Priority Sorting */}
            <ScrollReveal delay={0.3}>
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 text-center"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 dark:from-amber-500 dark:via-orange-500 dark:to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Smart Priority Sorting</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                Emails categorized into High, Moderate, and Low priority. Don't waste your time!
              </p>
              <div className="inline-block bg-gradient-to-r from-red-100 via-yellow-100 to-green-100 dark:from-red-900/30 dark:via-yellow-900/30 dark:to-green-900/30 text-orange-700 dark:text-orange-400 px-3 py-1.5 rounded-full text-xs font-semibold">
                High • Medium • Low
              </div>
              </motion.div>
            </ScrollReveal>

            {/* Feature 4 - AI Email Writer */}
            <ScrollReveal delay={0.4}>
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 text-center"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-500 dark:via-teal-500 dark:to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI Email Writer</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                Wanna reply fast? AI writes your message and you can modify it. Saves time!
              </p>
              <div className="inline-block bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold">
                Write & Modify
              </div>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section 
        id="about" 
        className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <ScrollReveal>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                About InboxPilot
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                InboxPilot is a next-generation email management platform designed to help professionals 
                and teams take control of their inbox. We combine cutting-edge AI technology with 
                intuitive design to make email management effortless.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Founded in 2025, our mission is to eliminate email overwhelm and help you focus on 
                what truly matters. With InboxPilot, you can connect multiple accounts, let AI summarize 
                your emails, automatically prioritize messages, and even draft responses with AI assistance.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/30 dark:via-cyan-900/30 dark:to-teal-900/30 rounded-xl border border-blue-200 dark:border-blue-700 shadow-sm"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">10K+</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Active Users</div>
                </motion.div>
                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700 shadow-sm"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">1M+</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Emails Processed</div>
                </motion.div>
                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-green-900/30 rounded-xl border border-emerald-200 dark:border-emerald-700 shadow-sm"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">98%</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Satisfaction Rate</div>
                </motion.div>
                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/30 dark:via-yellow-900/30 dark:to-orange-900/30 rounded-xl border border-amber-200 dark:border-amber-700 shadow-sm"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Support Available</div>
                </motion.div>
              </div>
            </ScrollReveal>

            {/* Right side - Image/Illustration */}
            <ScrollReveal delay={0.2}>
              <FloatingElement>
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-700 rounded-3xl p-8 shadow-2xl">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
                      <div className="space-y-4">
                        <motion.div 
                          className="flex items-center space-x-3"
                          whileHover={{ x: 10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="h-4 bg-blue-200 dark:bg-blue-900/40 rounded w-3/4"></div>
                          </div>
                        </motion.div>
                        <motion.div 
                          className="flex items-center space-x-3"
                          whileHover={{ x: 10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="h-4 bg-purple-200 dark:bg-purple-900/40 rounded w-2/3"></div>
                          </div>
                        </motion.div>
                        <motion.div 
                          className="flex items-center space-x-3"
                          whileHover={{ x: 10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="h-4 bg-emerald-200 dark:bg-emerald-900/40 rounded w-5/6"></div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  <FloatingElement delay={1}>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cyan-400 dark:bg-cyan-600 rounded-full opacity-20 blur-xl"></div>
                  </FloatingElement>
                  <FloatingElement delay={1.5}>
                    <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-400 dark:bg-blue-600 rounded-full opacity-20 blur-xl"></div>
                  </FloatingElement>
                </div>
              </FloatingElement>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        id="contact" 
        className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Get In Touch
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-900 dark:text-white font-medium mb-2">Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 dark:text-white font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-900 dark:text-white font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-900 dark:text-white font-medium mb-2">Message</label>
                  <textarea
                    rows="6"
                    className="input-field resize-none"
                    placeholder="Tell us more about your inquiry..."
                    required
                  ></textarea>
                </div>

                <motion.button 
                  type="submit" 
                  className="w-full btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Message
                </motion.button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">support@inboxpilot.com</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Location</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">San Francisco, CA</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Support Hours</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">24/7 Available</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-700 dark:from-cyan-500 dark:to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">IP</span>
              </div>
              <span className="text-2xl font-bold">InboxPilot</span>
            </div>
            <p className="text-white/70 mb-6">All Things In One Place</p>
            <p className="text-white/50 text-sm">
              © 2025 InboxPilot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}

export default Home
