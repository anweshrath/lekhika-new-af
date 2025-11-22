import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Moon, Sun, User, LogOut, Settings, ChevronDown, Zap } from 'lucide-react'
import { useUserAuth } from '../contexts/UserAuthContext'
import { useTheme } from '../contexts/ThemeContext'
import ThemeToggle from './ThemeToggle'
import useTokenWallet from '../hooks/useTokenWallet'

const Header = ({ isAdmin = false }) => {
  const { user, logout } = useUserAuth()
  const { currentTheme, isDark } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const { stats: tokenStats } = useTokenWallet()

  const formatNumber = (value) => {
    if (value == null) return '0'
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`
    return Math.round(value).toLocaleString()
  }

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="glass-card border-0 border-b mx-8 mt-6 mb-0 px-8 py-6 relative z-20"
      style={{ 
        borderBottomColor: currentTheme.colors.border,
        backgroundColor: currentTheme.colors.surface
      }}
    >
      <div className="flex items-center justify-between">
        {/* Search Section */}
        <motion.div 
          className="flex items-center space-x-6"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="relative group">
            <motion.div
              animate={{ 
                scale: searchFocused ? 1.02 : 1,
                boxShadow: searchFocused 
                  ? currentTheme.shadows.xl
                  : currentTheme.shadows.md
              }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Search 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300"
                style={{ 
                  color: searchFocused ? currentTheme.colors.primary : currentTheme.colors.textMuted 
                }}
              />
              <input
                type="text"
                placeholder={isAdmin ? "Search users, books, analytics..." : "Search your books, projects..."}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="input-field pl-12 pr-6 py-4 w-96 text-sm font-medium"
                style={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: searchFocused ? currentTheme.colors.primary : currentTheme.colors.border,
                  color: currentTheme.colors.text
                }}
                aria-label="Search"
              />
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, ${currentTheme.colors.primary}20, ${currentTheme.colors.secondary}20)`
                }}
              />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Actions Section */}
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Token Usage Badge */}
          <motion.div
            className="flex items-center gap-2 rounded-2xl border px-4 py-2 shadow-lg"
            style={{
              borderColor: currentTheme.colors.border,
              backgroundColor: currentTheme.colors.surface
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <Zap className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: currentTheme.colors.textMuted }}>
                Tokens Used
              </span>
              <span className="text-sm font-bold" style={{ color: currentTheme.colors.text }}>
                {formatNumber(tokenStats.used || 0)}
                <span className="text-xs font-medium" style={{ color: currentTheme.colors.textMuted }}>
                  {' '}/ {formatNumber(tokenStats.total || tokenStats.rawTotal || 0)}
                </span>
              </span>
              <span className="text-[10px] font-medium" style={{ color: currentTheme.colors.textMuted }}>
                Avail {formatNumber(tokenStats.available)} • Reserved {formatNumber(tokenStats.reserved)}
              </span>
            </div>
          </motion.div>

          {/* Theme Toggle Component */}
          <ThemeToggle />
          
          {/* Notifications */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl group"
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.textSecondary
            }}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(to right, ${currentTheme.colors.error}, ${currentTheme.colors.accent})`
              }}
            >
              <span className="text-xs text-white font-bold">3</span>
            </motion.span>
            <div 
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(to right, ${currentTheme.colors.primary}20, ${currentTheme.colors.secondary}20)`
              }}
            />
          </motion.button>
          
          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl group"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border
              }}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div className="relative">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2"
                  style={{ ringColor: currentTheme.colors.border }}
                />
                <div 
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                  style={{ 
                    backgroundColor: currentTheme.colors.success,
                    borderColor: currentTheme.colors.surface
                  }}
                />
              </div>
              
              <div className="hidden md:block text-left">
                <p 
                  className="text-sm font-semibold"
                  style={{ color: currentTheme.colors.text }}
                >
                  {user?.name}
                </p>
                <p 
                  className="text-xs font-medium"
                  style={{ color: currentTheme.colors.textMuted }}
                >
                  {isAdmin ? 'Super Admin' : 'Creator'}
                </p>
              </div>
              
              <motion.div
                animate={{ rotate: showUserMenu ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown 
                  className="w-4 h-4"
                  style={{ color: currentTheme.colors.textMuted }}
                />
              </motion.div>
            </motion.button>
            
            {/* User Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 glass-card z-50"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border
                  }}
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div 
                    className="p-4 border-b"
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <p 
                          className="font-semibold"
                          style={{ color: currentTheme.colors.text }}
                        >
                          {user?.name}
                        </p>
                        <p 
                          className="text-sm"
                          style={{ color: currentTheme.colors.textMuted }}
                        >
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button 
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200"
                      style={{ 
                        color: currentTheme.colors.textSecondary,
                        ':hover': { backgroundColor: currentTheme.colors.backgroundSecondary }
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = currentTheme.colors.backgroundSecondary}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <User className="w-4 h-4" />
                      <span className="font-medium">Profile Settings</span>
                    </button>
                    
                    <button 
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200"
                      style={{ 
                        color: currentTheme.colors.textSecondary,
                        ':hover': { backgroundColor: currentTheme.colors.backgroundSecondary }
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = currentTheme.colors.backgroundSecondary}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <Settings className="w-4 h-4" />
                      <span className="font-medium">Preferences</span>
                    </button>
                    
                    <hr 
                      className="my-2"
                      style={{ borderColor: currentTheme.colors.border }}
                    />
                    
                    <button 
                      onClick={logout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200"
                      style={{ 
                        color: currentTheme.colors.error,
                        ':hover': { backgroundColor: currentTheme.colors.errorLight }
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = currentTheme.colors.errorLight}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.header>
  )
}

export default Header
