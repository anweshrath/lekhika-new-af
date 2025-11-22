import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, User, Settings, Zap } from 'lucide-react'
import PremiumSidebar from './PremiumSidebar'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '../contexts/ThemeContext'
import { useUserAuth } from '../contexts/UserAuthContext'
import useTokenWallet from '../hooks/useTokenWallet'

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isDark } = useTheme()
  const { user } = useUserAuth()
  const { stats: tokenStats } = useTokenWallet()
  const navigate = useNavigate()

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const formatNumber = (value) => {
    if (value == null) return '0'
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return Math.round(value).toLocaleString()
  }

  const TokenBadge = ({ compact = false }) => (
    <motion.div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 shadow-sm ${compact ? 'text-xs' : 'text-sm'}`}
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)'
      }}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Zap className={`shrink-0 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} style={{ color: 'var(--theme-secondary)' }} />
      <div className="flex flex-col leading-tight">
        <span className={`font-semibold uppercase tracking-wide ${compact ? 'text-[10px]' : 'text-[11px]'}`} style={{ color: 'var(--color-text-muted)' }}>
          Tokens Used
        </span>
        <span className={compact ? 'text-sm font-bold' : 'text-base font-bold'}>
          {formatNumber(tokenStats.used || 0)}
          <span className={`ml-1 font-medium ${compact ? 'text-[11px]' : 'text-sm'}`} style={{ color: 'var(--color-text-muted)' }}>
            / {formatNumber(tokenStats.total || tokenStats.rawTotal || 0)}
          </span>
        </span>
        <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium`} style={{ color: 'var(--color-text-muted)' }}>
          Avail {formatNumber(tokenStats.available)} · Reserved {formatNumber(tokenStats.reserved)}
        </span>
      </div>
    </motion.div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-background)' }}>
      {/* Premium Sidebar */}
      <PremiumSidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <motion.header 
          className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden"
          style={{ 
            background: 'var(--color-surface)', 
            borderBottom: '1px solid var(--color-border)' 
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            className="-m-2.5 p-2.5 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            style={{ color: 'var(--color-text)' }}
            onClick={toggleMobileMenu}
          >
            <span className="sr-only">Open sidebar</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-3 lg:gap-x-4">
              <TokenBadge compact />
              <ThemeToggle />
              {/* Profile Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate('/app/profile')
                }}
                className="p-2 rounded-xl transition-colors"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)'
                }}
                title="Go to Profile"
              >
                <User className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Desktop Header */}
        <motion.header 
          className="hidden lg:flex h-16 shrink-0 items-center gap-x-4 px-4 shadow-sm sm:gap-x-6 sm:px-6"
          style={{ 
            background: 'var(--color-surface)', 
            borderBottom: '1px solid var(--color-border)' 
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <TokenBadge />
              <ThemeToggle />
              {/* Profile Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate('/app/profile')
                }}
                className="p-2 rounded-xl transition-colors"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)'
                }}
                title="Go to Profile"
              >
                <User className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <motion.main 
          className="flex-1 overflow-auto min-w-0"
          style={{ background: 'var(--color-background)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="min-h-screen w-full max-w-full overflow-x-hidden p-10">
            <Outlet />
          </div>
        </motion.main>
      </div>

    </div>
  )
}

export default Layout