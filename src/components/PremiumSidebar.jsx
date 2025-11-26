import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight,
  Home,
  BookOpen,
  Brain,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Zap,
  Target,
  FileText,
  Users,
  Calendar,
  CreditCard,
  HelpCircle,
  Bell,
  Search,
  Plus,
  Folder,
  Star,
  Heart,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Shield,
  Crown,
  Gem,
  Sparkles,
  Rocket,
  TrendingUp,
  Activity,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  Camera,
  Image,
  Video,
  Mic,
  Palette,
  Code,
  Database,
  Server,
  Cloud,
  Wifi,
  Battery,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useUserAuth } from '../contexts/UserAuthContext'
import { useUserPreferences } from '../contexts/UserPreferencesContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

/**
 * PREMIUM COLLAPSIBLE SIDEBAR
 * Theme-aware, animated, professional sidebar component
 */
const PremiumSidebar = ({ 
  isCollapsed = false, 
  onToggle, 
  className = '' 
}) => {
  const { isDark, theme } = useTheme()
  const { user, logout } = useUserAuth() // SURGICAL FIX: Destructure the real logout function
  const { preferences } = useUserPreferences()
  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)
  const [isHovered, setIsHovered] = useState(false)
  const [bookCount, setBookCount] = useState(0)

  useEffect(() => {
    let isMounted = true
    let subscription

    const fetchBookCount = async () => {
      if (!user?.id) {
        if (isMounted) setBookCount(0)
        return
      }

      try {
        const { count, error } = await supabase
          .from('books')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (error) throw error
        if (isMounted) setBookCount(count || 0)
      } catch (error) {
        console.error('❌ Failed to fetch book count:', error)
        if (isMounted) setBookCount(0)
      }
    }

    fetchBookCount()

    if (user?.id) {
      subscription = supabase
        .channel(`sidebar-books-count-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'books',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchBookCount()
          }
        )
        .subscribe()
    }

    return () => {
      isMounted = false
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [user?.id])

  // Navigation structure
  const navigationItems = [
    {
      category: 'DASHBOARD',
      items: [
        { id: 'dashboard', label: 'Overview', icon: Home, path: '/app/dashboard' },
        { id: 'books', label: 'My Books', icon: BookOpen, path: '/app/books', badge: bookCount },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/app/analytics' }
      ]
    },
    {
      category: 'CREATION',
      items: [
        { id: 'create', label: 'Create Book', icon: Plus, path: '/app/create' },
        { id: 'alchemist', label: 'Alchemist Lab', icon: Brain, path: '/app/copyai' },
        { id: 'studio', label: 'AI Studio', icon: Sparkles, path: '/app/studio' }
      ]
    },
    {
      category: 'ACCOUNT',
      items: [
        { id: 'tokens', label: 'Token Usage', icon: Zap, path: '/app/tokens' },
        { id: 'billing', label: 'Billing', icon: CreditCard, path: '/app/billing' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/app/settings' },
        { id: 'profile', label: 'Profile', icon: User, path: '/app/profile' }
      ]
    }
  ]

  const bottomItems = [
    { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/help' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications', badge: 3 }
  ]

  const handleItemClick = (item) => {
    if (item.path) {
      navigate(item.path)
    }
  }
  /* SURGICAL FIX: Removed the fake, empty logout function
  const handleLogout = () => {
    // Logout logic
    console.log('Logout clicked')
  }
  */
  const isActive = (path) => {
    return location.pathname === path
  }

  const getThemeStyles = () => {
    return {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
  }

  const getItemStyles = (item, isActiveItem) => {
    const baseStyles = {
      color: 'var(--color-text-muted)',
      transition: 'all 0.2s ease'
    }

    if (isActiveItem) {
      return {
        ...baseStyles,
        color: 'var(--theme-primary)',
        background: 'var(--theme-primary)20',
        borderRadius: '8px'
      }
    }

    if (hoveredItem === item.id) {
      return {
        ...baseStyles,
        color: 'var(--theme-primary)',
        background: 'var(--color-surface-hover)',
        borderRadius: '8px'
      }
    }

    return baseStyles
  }

  return (
    <motion.div
      className={`relative h-full flex flex-col ${className}`}
      style={{
        ...getThemeStyles(),
        width: isCollapsed ? '80px' : '280px'
      }}
      initial={false}
      animate={{
        width: isCollapsed ? 80 : 280
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--theme-gradient-primary)' }}>
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">CopyAlche</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          onClick={onToggle}
          className="p-2 rounded-lg transition-colors"
          style={{ 
            background: 'transparent',
            color: 'var(--color-text-muted)'
          }}
          whileHover={{ 
            scale: 1.05,
            background: 'var(--color-surface-hover)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-6">
          {navigationItems.map((category) => (
            <div key={category.category}>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {category.category}
                  </motion.h3>
                )}
              </AnimatePresence>
              
              <div className="space-y-1">
                {category.items.map((item) => {
                  const isActiveItem = isActive(item.path)
                  const Icon = item.icon
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left transition-all duration-200"
                      style={getItemStyles(item, isActiveItem)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex-1 flex items-center justify-between"
                          >
                            <span className="text-sm font-medium">{item.label}</span>
                            {item.badge && (
                              <span 
                                className="px-2 py-1 text-xs font-bold rounded-full"
                                style={{ 
                                  background: 'var(--theme-primary)20',
                                  color: 'var(--theme-primary)'
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        {/* Bottom Navigation */}
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const isActiveItem = isActive(item.path)
            const Icon = item.icon
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left transition-all duration-200"
                style={getItemStyles(item, isActiveItem)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{item.label}</span>
                            {item.badge && (
                              <span 
                                className="px-2 py-1 text-xs font-bold rounded-full"
                                style={{ 
                                  background: 'var(--theme-error)20',
                                  color: 'var(--theme-error)'
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>

        {/* User Profile */}
        <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <motion.div
            className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer"
            style={{ 
              background: 'transparent',
              color: 'var(--color-text)'
            }}
            whileHover={{ 
              x: 4,
              background: 'var(--color-surface-hover)'
            }}
            onClick={() => navigate('/app/profile')}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                    {user?.email || 'User'}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {user?.plan || 'Free Plan'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                logout() // SURGICAL FIX: Call the real logout function
              }}
              className="p-1 rounded transition-colors"
              style={{ 
                background: 'transparent',
                color: 'var(--color-text-muted)'
              }}
              whileHover={{ 
                scale: 1.1,
                background: 'var(--color-surface-hover)'
              }}
              whileTap={{ scale: 0.9 }}
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default PremiumSidebar
