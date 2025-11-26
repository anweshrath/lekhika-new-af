import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  PlusCircle, 
  Library, 
  BarChart3, 
  Settings, 
  Users, 
  Shield,
  Database,
  TrendingUp,
  Wand2
} from 'lucide-react'

const Sidebar = ({ isAdmin = false }) => {
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)
  
  const userNavItems = [
    { path: '/app', icon: BarChart3, label: 'Dashboard', exact: true, color: 'from-blue-500 to-cyan-500' },
    { path: '/app/create', icon: PlusCircle, label: 'Create Book', color: 'from-green-500 to-emerald-500' },
    { path: '/app/books', icon: Library, label: 'My Books', color: 'from-purple-500 to-violet-500' },
    { path: '/app/copyai-tools', icon: Wand2, label: 'Alchemist\'s Lab', color: 'from-pink-500 to-rose-500' },
    { path: '/app/analytics', icon: TrendingUp, label: 'Analytics', color: 'from-orange-500 to-red-500' },
    { path: '/app/settings', icon: Settings, label: 'Settings', color: 'from-gray-500 to-slate-500' }
  ]
  
  const adminNavItems = [
    { path: '/admin', icon: Shield, label: 'Admin Dashboard', exact: true, color: 'from-red-500 to-pink-500' },
    { path: '/admin/users', icon: Users, label: 'Users', color: 'from-blue-500 to-indigo-500' },
    { path: '/admin/books', icon: Database, label: 'All Books', color: 'from-purple-500 to-violet-500' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', color: 'from-orange-500 to-yellow-500' },
    { path: '/admin/settings', icon: Settings, label: 'Settings', color: 'from-gray-500 to-slate-500' }
  ]
  
  const navItems = isAdmin ? adminNavItems : userNavItems

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  }

  return (
    <motion.div 
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="w-80 glass-card border-0 border-r border-gray-200/50 dark:border-gray-700/50 m-6 mr-0 rounded-r-none rounded-l-3xl flex flex-col relative overflow-hidden h-[calc(100vh-3rem)]"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
      
      {/* Header */}
      <motion.div 
        variants={itemVariants}
        className="p-8 relative z-10 flex-shrink-0"
      >
        <div className="flex items-center space-x-4">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group"
          >
            <Wand2 className="w-8 h-8 text-white relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.div>
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              {isAdmin ? 'Admin Panel' : 'Copy Alchemist\'s Lab'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-gray-500 dark:text-gray-400 font-medium"
            >
              {isAdmin ? 'Super Admin' : 'AI-Powered Content Creation'}
            </motion.p>
          </div>
        </div>
      </motion.div>
      
      {/* Scrollable Navigation Container */}
      <div className="flex-1 overflow-y-auto sidebar-scroll relative z-10">
        {/* Navigation */}
        <nav className="px-6 space-y-3 pb-8">
          {navItems.map((item, index) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)
            
            return (
              <motion.div
                key={item.path}
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to={item.path}
                  className={`sidebar-item relative group ${
                    isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
                  }`}
                >
                  {/* Background gradient for active state */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBackground"
                      className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl shadow-lg`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Hover effect */}
                  {hoveredItem === item.path && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-2xl"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  
                  <div className="relative z-10 flex items-center space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-2 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    <span className="font-semibold text-sm">{item.label}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </div>
                </NavLink>
              </motion.div>
            )
          })}
        </nav>
      </div>
    </motion.div>
  )
}

export default Sidebar
