import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sun, 
  Moon, 
  Palette, 
  ChevronDown,
  Check,
  Sparkles,
  Zap
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeToggle = () => {
  const { currentTheme, currentThemeId, isDark, themes, setTheme, toggleDarkMode } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const handleThemeChange = (themeId) => {
    setTheme(themeId)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Theme Selector Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 border"
        style={{
          backgroundColor: isDark ? 'var(--color-surface)' : '#FFFFFF',
          borderColor: isDark ? 'var(--color-border)' : '#E2E8F0',
          color: isDark ? 'var(--color-text)' : '#1F2937',
          boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div 
          className="w-6 h-6 rounded-lg flex items-center justify-center text-lg"
          style={{
            background: 'var(--theme-gradient-primary)',
            animation: 'var(--theme-animation-primary)'
          }}
        >
          {currentTheme.icon}
        </div>
        <span className="font-medium text-sm hidden sm:block">{currentTheme.name}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Theme Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 z-50"
            style={{
              backgroundColor: isDark ? 'var(--color-surface)' : '#FFFFFF',
              border: `1px solid ${isDark ? 'var(--color-border)' : '#E2E8F0'}`,
              borderRadius: '16px',
              boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.15)' : '0 10px 25px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Header */}
            <div className="p-4 border-b" style={{ borderColor: isDark ? 'var(--color-border)' : '#E2E8F0' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                  <h3 className="font-semibold" style={{ color: isDark ? 'var(--color-text)' : '#1F2937' }}>
                    Choose Theme
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: isDark ? 'var(--theme-primary)' : '#F3F4F6',
                    color: isDark ? '#FFFFFF' : '#1F2937',
                    border: `1px solid ${isDark ? 'transparent' : '#D1D5DB'}`
                  }}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.button>
              </div>
              <p className="text-sm mt-1" style={{ color: isDark ? 'var(--color-text-muted)' : '#6B7280' }}>
                {isDark ? 'Dark Mode' : 'Light Mode'} • {currentTheme.description}
              </p>
            </div>

            {/* Theme Options */}
            <div className="p-2 space-y-1">
              {themes.map((theme) => (
                <motion.button
                  key={theme.id}
                  whileHover={{ x: 4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleThemeChange(theme.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300"
                  style={{
                    background: currentThemeId === theme.id 
                      ? 'var(--theme-gradient-primary)' 
                      : 'transparent',
                    color: currentThemeId === theme.id ? '#FFFFFF' : (isDark ? 'var(--color-text)' : '#1F2937')
                  }}
                  onMouseEnter={(e) => {
                    if (currentThemeId !== theme.id) {
                      e.target.style.background = isDark ? 'var(--color-surface-hover)' : '#F9FAFB'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentThemeId !== theme.id) {
                      e.target.style.background = 'transparent'
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{
                        background: currentThemeId === theme.id 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : 'var(--theme-gradient-primary)',
                        animation: currentThemeId === theme.id 
                          ? 'none' 
                          : 'var(--theme-animation-primary)'
                      }}
                    >
                      {theme.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{theme.name}</div>
                      <div 
                        className="text-xs"
                        style={{ 
                          color: currentThemeId === theme.id 
                            ? 'rgba(255, 255, 255, 0.8)' 
                            : (isDark ? 'var(--color-text-muted)' : '#6B7280')
                        }}
                      >
                        {theme.description}
                      </div>
                    </div>
                  </div>
                  
                  {currentThemeId === theme.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Preview Section */}
            <div className="p-4 border-t" style={{ borderColor: isDark ? 'var(--color-border)' : '#E2E8F0' }}>
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                <span className="text-sm font-medium" style={{ color: isDark ? 'var(--color-text)' : '#1F2937' }}>
                  Live Preview
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Sample Card */}
                <motion.div
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: isDark ? 'var(--color-surface)' : '#F8FAFC',
                    borderColor: isDark ? 'var(--color-border)' : '#E2E8F0',
                    animation: 'var(--theme-animation-secondary)'
                  }}
                >
                  <div 
                    className="w-full h-2 rounded mb-2"
                    style={{ background: 'var(--theme-gradient-primary)' }}
                  />
                  <div 
                    className="w-3/4 h-1 rounded"
                    style={{ background: isDark ? 'var(--color-text-muted)' : '#9CA3AF' }}
                  />
                </motion.div>
                
                {/* Sample Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: 'var(--theme-gradient-primary)',
                    color: '#FFFFFF'
                  }}
                >
                  <Zap className="w-3 h-3 inline mr-1" />
                  Action
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ThemeToggle