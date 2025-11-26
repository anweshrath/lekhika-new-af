import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MatrixNeuralNetwork from '../MatrixNeuralNetwork'
import { 
  BookOpen, 
  TrendingUp, 
  Users, 
  Zap, 
  Calendar,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  Crown,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings,
  Bell,
  Search,
  FileText,
  Rocket,
  TrendingDown,
  Eye,
  Download,
  Share2,
  Brain,
  Layers,
  Cpu,
  Database,
  Globe,
  Heart,
  Flame,
  Infinity,
  Hexagon,
  Triangle,
  Circle,
  Square,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useUserAuth } from '../../contexts/UserAuthContext'
import { dbService } from '../../services/database'
import toast from 'react-hot-toast'

const ModernDashboard = () => {
  const { currentTheme, isDark } = useTheme()
  const { user } = useUserAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBooks: 0,
    booksThisMonth: 0,
    totalWords: 0,
    avgCompletionTime: '0 days',
    userRank: 'Starter',
    streak: 0,
    productivity: 0
  })
  const [recentBooks, setRecentBooks] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState([])
  const [activeSection, setActiveSection] = useState('overview')
  const [isWriting, setIsWriting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(0)

  // Refs for 3D elements
  const heroRef = useRef(null)
  const commandCenterRef = useRef(null)
  const statsOrbRef = useRef(null)

  // Animation controls
  const heroControls = useAnimation()
  const commandControls = useAnimation()
  const statsControls = useAnimation()

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Fetch books
        const books = await dbService.getBooks(user.id)
        
        // Calculate stats
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const booksThisMonth = books.filter(book => 
          new Date(book.created_at) >= thisMonthStart
        ).length

        const totalWords = books.reduce((sum, book) => 
          sum + (book.word_count || 0), 0
        )

        const completedBooks = books.filter(book => book.status === 'completed')
        const avgTime = completedBooks.length > 0
          ? completedBooks.reduce((sum, book) => {
              const created = new Date(book.created_at)
              const completed = new Date(book.updated_at)
              const daysDiff = Math.ceil((completed - created) / (1000 * 60 * 60 * 24))
              return sum + daysDiff
            }, 0) / completedBooks.length
          : 0

        // Generate activity data
        const activityData = books.slice(0, 5).map(book => ({
          id: book.id,
          type: book.status === 'completed' ? 'book_completed' : 'book_created',
          title: book.title || 'Untitled Book',
          time: formatTimeAgo(book.created_at),
          status: book.status || 'draft'
        }))

        setStats({
          totalBooks: books.length,
          booksThisMonth,
          totalWords,
          avgCompletionTime: `${avgTime.toFixed(1)} days`,
          userRank: user.tier === 'pro' ? 'Pro Writer' : user.tier === 'enterprise' ? 'Elite Author' : 'Rising Star',
          streak: calculateStreak(books),
          productivity: books.length > 0 ? Math.min(100, books.length * 10) : 0
        })

        setRecentBooks(books.slice(0, 3))
        setRecentActivity(activityData)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  // Mouse tracking for 3D effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      
      // Create particle trails
      if (Math.random() > 0.98) {
        const newParticle = {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1
        }
        setParticles(prev => [...prev.slice(-20), newParticle])
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Particle animation
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 0.02,
          vx: particle.vx * 0.98,
          vy: particle.vy * 0.98
        })).filter(particle => particle.life > 0)
      )
    }

    const interval = setInterval(animateParticles, 50)
    return () => clearInterval(interval)
  }, [])

  // Helper functions
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return `${Math.floor(seconds / 604800)} weeks ago`
  }

  const calculateStreak = (books) => {
    if (books.length === 0) return 0
    
    const sortedDates = books
      .map(book => new Date(book.created_at).toDateString())
      .sort((a, b) => new Date(b) - new Date(a))
    
    let streak = 1
    const today = new Date().toDateString()
    
    if (sortedDates[0] !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      if (sortedDates[0] !== yesterday.toDateString()) return 0
    }
    
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i])
      const previous = new Date(sortedDates[i - 1])
      const daysDiff = Math.floor((previous - current) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 1) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  // 3D Stats Orb Component
  const StatsOrb = () => {
    const [rotation, setRotation] = useState({ x: 0, y: 0 })
    
    useEffect(() => {
      const interval = setInterval(() => {
        setRotation(prev => ({
          x: prev.x + 0.5,
          y: prev.y + 0.3
        }))
      }, 50)
      return () => clearInterval(interval)
    }, [])

    return (
      <div className="relative w-80 h-80 mx-auto">
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-opacity-20"
          style={{
            borderColor: isDark ? '#3B82F6' : '#1E40AF',
            background: 'radial-gradient(circle, transparent 30%, rgba(59, 130, 246, 0.1) 100%)'
          }}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Middle ring */}
        <motion.div
          className="absolute inset-4 rounded-full border border-opacity-30"
          style={{
            borderColor: isDark ? '#8B5CF6' : '#7C3AED',
            background: 'radial-gradient(circle, transparent 40%, rgba(139, 92, 246, 0.1) 100%)'
          }}
          animate={{
            rotate: -360
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Inner core */}
        <motion.div
          className="absolute inset-8 rounded-full flex items-center justify-center"
          style={{
            background: isDark 
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.2), transparent)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.1), transparent)',
            backdropFilter: 'blur(20px)'
          }}
          animate={{
            scale: [1, 1.05, 1],
            rotateX: rotation.x,
            rotateY: rotation.y
          }}
          transition={{
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {/* Central stats display */}
          <div className="text-center">
            <motion.div
              className="text-4xl font-bold mb-2"
              style={{
                background: 'linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {stats.totalBooks}
            </motion.div>
            <div className="text-sm font-medium" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              Books Created
            </div>
          </div>
        </motion.div>

        {/* Floating stat orbs */}
        {[
          { label: 'Words', value: stats.totalWords.toLocaleString(), color: '#10B981', angle: 0 },
          { label: 'Streak', value: `${stats.streak}`, color: '#F59E0B', angle: 120 },
          { label: 'Productivity', value: `${stats.productivity}%`, color: '#EC4899', angle: 240 }
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="absolute w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${stat.color}, ${stat.color}CC)`,
              boxShadow: `0 8px 32px ${stat.color}40`,
              top: '50%',
              left: '50%',
              transformOrigin: '0 0'
            }}
            animate={{
              x: Math.cos(stat.angle * Math.PI / 180) * 120 - 32,
              y: Math.sin(stat.angle * Math.PI / 180) * 120 - 32,
              rotate: 360
            }}
            transition={{
              x: { duration: 20, repeat: Infinity, ease: "linear" },
              y: { duration: 20, repeat: Infinity, ease: "linear" },
              rotate: { duration: 10, repeat: Infinity, ease: "linear" }
            }}
          >
            <div className="text-center">
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs opacity-80">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  // Command Center Component
  const CommandCenter = () => {
    const [selectedAction, setSelectedAction] = useState(null)
    
    const actions = [
      { 
        id: 'create', 
        icon: Plus, 
        label: 'Create Book', 
        color: '#3B82F6',
        action: () => navigate('/app/create')
      },
      { 
        id: 'browse', 
        icon: BookOpen, 
        label: 'Browse Library', 
        color: '#8B5CF6',
        action: () => navigate('/app/books')
      },
      { 
        id: 'ai', 
        icon: Brain, 
        label: 'AI Studio', 
        color: '#EC4899',
        action: () => navigate('/app/studio')
      },
      { 
        id: 'analytics', 
        icon: BarChart3, 
        label: 'Analytics', 
        color: '#10B981',
        action: () => navigate('/app/tokens')
      },
      { 
        id: 'settings', 
        icon: Settings, 
        label: 'Settings', 
        color: '#F59E0B',
        action: () => navigate('/app/settings')
      },
      { 
        id: 'help', 
        icon: Rocket, 
        label: 'Help', 
        color: '#06B6D4',
        action: () => navigate('/app/help')
      }
    ]

    return (
      <div className="relative w-96 h-96 mx-auto">
        {/* Central hub */}
        <motion.div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: isDark 
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.1), transparent)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05), transparent)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`
          }}
          animate={{
            scale: [1, 1.02, 1],
            rotate: [0, 360]
          }}
          transition={{
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 60, repeat: Infinity, ease: "linear" }
          }}
        >
          <div className="text-center">
            <motion.div
              className="text-2xl font-bold mb-2"
              style={{
                background: 'linear-gradient(45deg, #3B82F6, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Command Center
            </motion.div>
            <div className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              Choose your action
            </div>
          </div>
        </motion.div>

        {/* Action buttons in circle */}
        {actions.map((action, index) => {
          const angle = (index * 60) * Math.PI / 180
          const radius = 140
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius

          return (
            <motion.button
              key={action.id}
              className="absolute w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${action.color}, ${action.color}CC)`,
                boxShadow: `0 8px 32px ${action.color}40`,
                left: '50%',
                top: '50%',
                transform: `translate(${x - 32}px, ${y - 32}px)`
              }}
              whileHover={{ 
                scale: 1.2,
                boxShadow: `0 12px 48px ${action.color}60`
              }}
              whileTap={{ scale: 0.9 }}
              onClick={action.action}
              onMouseEnter={() => setSelectedAction(action.id)}
              onMouseLeave={() => setSelectedAction(null)}
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                rotate: { duration: 60, repeat: Infinity, ease: "linear" }
              }}
            >
              <action.icon className="w-6 h-6" />
            </motion.button>
          )
        })}

        {/* Connection lines */}
        {actions.map((action, index) => {
          const angle = (index * 60) * Math.PI / 180
          const radius = 140
          const x1 = Math.cos(angle) * radius + 192 // Center + offset
          const y1 = Math.sin(angle) * radius + 192

          return (
            <motion.line
              key={`line-${index}`}
              x1="192"
              y1="192"
              x2={x1}
              y2={y1}
              stroke={action.color}
              strokeWidth="2"
              opacity="0.3"
              className="absolute"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: index * 0.1 }}
            />
          )
        })}

        {/* Action tooltips */}
        <AnimatePresence>
          {selectedAction && (
            <motion.div
              className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg text-sm font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {actions.find(a => a.id === selectedAction)?.label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Neural Network Visualization
  const NeuralNetwork = () => {
    const [connections, setConnections] = useState([])
    
    useEffect(() => {
      // Generate random neural network connections
      const nodes = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 400,
        y: Math.random() * 300
      }))
      
      const newConnections = []
      nodes.forEach((node, i) => {
        if (i < nodes.length - 1) {
          newConnections.push({
            id: `${i}-${i + 1}`,
            x1: node.x,
            y1: node.y,
            x2: nodes[i + 1].x,
            y2: nodes[i + 1].y
          })
        }
      })
      
      setConnections(newConnections)
    }, [])

    return (
      <div className="relative w-full h-64 overflow-hidden rounded-xl">
        <svg className="w-full h-full">
          {connections.map((conn, index) => (
            <motion.line
              key={conn.id}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke="#3B82F6"
              strokeWidth="1"
              opacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: index * 0.1 }}
            />
          ))}
          
          {Array.from({ length: 20 }, (_, i) => (
            <motion.circle
              key={i}
              cx={Math.random() * 400}
              cy={Math.random() * 300}
              r="3"
              fill="#3B82F6"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1] }}
              transition={{ duration: 1, delay: i * 0.1 }}
            />
          ))}
        </svg>
      </div>
    )
  }

  // Achievement Constellation
  const AchievementConstellation = () => {
    const achievements = [
      { id: 1, name: 'First Book', earned: stats.totalBooks > 0, x: 50, y: 30 },
      { id: 2, name: 'Word Master', earned: stats.totalWords > 10000, x: 80, y: 60 },
      { id: 3, name: 'Streak Keeper', earned: stats.streak > 7, x: 20, y: 70 },
      { id: 4, name: 'Productivity Pro', earned: stats.productivity > 80, x: 70, y: 20 },
      { id: 5, name: 'Monthly Creator', earned: stats.booksThisMonth > 0, x: 30, y: 50 }
    ]

    return (
      <div className="relative w-full h-64 bg-black bg-opacity-20 rounded-xl overflow-hidden">
        {/* Stars background */}
        {Array.from({ length: 50 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
        
        {/* Achievement stars */}
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            className="absolute"
            style={{
              left: `${achievement.x}%`,
              top: `${achievement.y}%`
            }}
            animate={{
              scale: achievement.earned ? [1, 1.2, 1] : 1,
              opacity: achievement.earned ? 1 : 0.3
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <div
              className={`w-4 h-4 rounded-full ${
                achievement.earned ? 'bg-yellow-400' : 'bg-gray-400'
              }`}
              style={{
                boxShadow: achievement.earned ? '0 0 20px #FCD34D' : 'none'
              }}
            />
          </motion.div>
        ))}
        
        {/* Constellation lines */}
        {achievements.slice(0, -1).map((achievement, index) => (
          <motion.line
            key={`line-${index}`}
            x1={`${achievement.x}%`}
            y1={`${achievement.y}%`}
            x2={`${achievements[index + 1].x}%`}
            y2={`${achievements[index + 1].y}%`}
            stroke="#3B82F6"
            strokeWidth="1"
            opacity="0.5"
            className="absolute"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: index * 0.2 }}
          />
        ))}
      </div>
    )
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: isDark ? '#0F1419' : '#F9FAFB' }}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-8 rounded-full"
            style={{
              background: 'linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899)',
              backgroundSize: '200% 200%'
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              rotate: 360
            }}
            transition={{
              backgroundPosition: { duration: 3, repeat: Infinity },
              rotate: { duration: 2, repeat: Infinity, ease: "linear" }
            }}
          />
          <motion.h1
            className="text-3xl font-bold mb-4"
            style={{
              background: 'linear-gradient(45deg, #3B82F6, #8B5CF6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Loading Your Universe...
          </motion.h1>
          <motion.div
            className="w-64 h-1 mx-auto rounded-full overflow-hidden"
            style={{ background: isDark ? '#374151' : '#E5E7EB' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)'
              }}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: isDark ? '#0F1419' : '#F9FAFB' }}>
      {/* Ambient particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            background: '#3B82F6',
            left: particle.x,
            top: particle.y
          }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ 
            scale: [1, 2, 0],
            opacity: [1, 0.5, 0],
            x: particle.vx * 100,
            y: particle.vy * 100
          }}
          transition={{ duration: 2 }}
        />
      ))}

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, #3B82F630, transparent)',
            top: '10%',
            left: '10%'
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, #8B5CF630, transparent)',
            bottom: '10%',
            right: '10%'
          }}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating geometric shapes */}
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: Math.random() * 60 + 20,
              height: Math.random() * 60 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(45deg, ${['#3B82F6', '#8B5CF6', '#EC4899', '#10B981'][i % 4]}, transparent)`,
              opacity: 0.1
            }}
            animate={{
              rotate: [0, 360],
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6">
        {/* Hero Section */}
        <motion.div
          ref={heroRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            className="text-6xl font-bold mb-4"
            style={{
              background: 'linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899, #10B981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '300% 300%'
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            Welcome to Your Creative Universe
          </motion.h1>
          <motion.p
            className="text-xl mb-8"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            {user?.full_name?.split(' ')[0] || user?.username || 'Creator'} • {stats.userRank}
          </motion.p>

          {/* 3D Stats Orb */}
          <div className="mb-16">
            <StatsOrb />
          </div>
        </motion.div>

        {/* Command Center */}
        <motion.div
          ref={commandCenterRef}
          className="mb-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
            Command Center
          </h2>
          <CommandCenter />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Neural Network Visualization */}
          <motion.div
            className="p-6 rounded-2xl backdrop-blur-xl"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
              boxShadow: isDark
                ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                : '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
            }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-gradient">
              AI Neural Network
            </h3>
            <MatrixNeuralNetwork />
            <p className="text-sm mt-4" style={{ color: 'var(--color-text-muted)' }}>
              Your AI ebook generation agents are constantly learning and adapting
            </p>
          </motion.div>

          {/* Achievement Constellation */}
          <motion.div
            className="p-6 rounded-2xl backdrop-blur-xl"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
              boxShadow: isDark
                ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                : '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
            }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 1 }}
          >
            <h3 className="text-2xl font-bold mb-6" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
              Achievement Constellation
            </h3>
            <AchievementConstellation />
            <p className="text-sm mt-4" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              Your progress mapped across the creative galaxy
            </p>
          </motion.div>
        </div>

        {/* Live Activity Stream */}
        <motion.div
          className="p-8 rounded-2xl backdrop-blur-xl mb-16"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            boxShadow: isDark
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
              : '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 1 }}
        >
          <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
            Live Activity Stream
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="p-6 rounded-xl relative overflow-hidden"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  {/* Animated background gradient */}
                  <motion.div
                    className="absolute inset-0 opacity-10"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
                    }}
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-4">
                      <motion.div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          background: activity.status === 'completed' 
                            ? 'linear-gradient(135deg, #10B981, #059669)' 
                            : 'linear-gradient(135deg, #3B82F6, #2563EB)'
                        }}
                        animate={{
                          rotate: [0, 360]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        {activity.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <Clock className="w-6 h-6 text-white" />
                        )}
                      </motion.div>
                      
                      <div>
                        <h4 className="font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                          {activity.title}
                        </h4>
                        <p className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                    
                    <motion.div
                      className="px-3 py-1 rounded-full text-xs font-bold text-white inline-block"
                      style={{
                        background: activity.status === 'completed' 
                          ? 'linear-gradient(135deg, #10B981, #059669)' 
                          : 'linear-gradient(135deg, #F59E0B, #D97706)'
                      }}
                      animate={{
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {activity.status}
                    </motion.div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <motion.div
                  animate={{
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-16 h-16 mx-auto mb-4" style={{ color: isDark ? '#4B5563' : '#D1D5DB' }} />
                </motion.div>
                <h4 className="text-xl font-bold mb-2" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                  No Activity Yet
                </h4>
                <p className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  Start creating to see your activity stream come alive
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ModernDashboard