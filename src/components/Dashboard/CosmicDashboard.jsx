import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MatrixNeuralNetwork from '../MatrixNeuralNetwork'
import { 
  BookOpen, 
  TrendingUp, 
  Zap, 
  Target,
  Award,
  BarChart3,
  Activity,
  Sparkles,
  Crown,
  Star,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Plus,
  Settings,
  Bell,
  Brain,
  Rocket,
  Play,
  Hexagon,
  Triangle,
  Circle
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useUserAuth } from '../../contexts/UserAuthContext'
import { dbService } from '../../services/database'
import CircularProgress from '../CircularProgress'
import CreditUsageBar from '../CreditUsageBar'
import MilestoneTracker from '../MilestoneTracker'
import StatCard from '../StatCard'
import UltraButton from '../UltraButton'
import { FloatingParticles } from '../ParticleSystem'

const CosmicDashboard = () => {
  const { isDark } = useTheme()
  const { user } = useUserAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalWords: 0,
    streak: 0,
    productivity: 0
  })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState([])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const books = await dbService.getBooks(user.id)
        const totalWords = books.reduce((sum, book) => sum + (book.word_count || 0), 0)
        
        setStats({
          totalBooks: books.length,
          totalWords,
          streak: calculateStreak(books),
          productivity: books.length > 0 ? Math.min(100, books.length * 10) : 0
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      
      if (Math.random() > 0.98) {
        setParticles(prev => [...prev.slice(-15), {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1
        }])
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

  const calculateStreak = (books) => {
    if (books.length === 0) return 0
    return Math.min(books.length, 30) // Simplified for demo
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: isDark ? '#0F1419' : '#F9FAFB' }}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-16 h-16" style={{ color: '#3B82F6' }} />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: isDark ? '#0F1419' : '#F9FAFB' }}>
      {/* Particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            background: '#3B82F6',
            left: particle.x,
            top: particle.y
          }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ 
            scale: [1, 3, 0],
            opacity: [1, 0.7, 0],
            x: particle.vx * 50,
            y: particle.vy * 50
          }}
          transition={{ duration: 1.5 }}
        />
      ))}

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orbs */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, #3B82F640, transparent)',
            top: '5%',
            left: '5%'
          }}
          animate={{
            x: [0, 200, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, #8B5CF640, transparent)',
            bottom: '5%',
            right: '5%'
          }}
          animate={{
            x: [0, -150, 0],
            y: [0, -80, 0],
            scale: [1, 1.4, 1]
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating shapes */}
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: Math.random() * 80 + 30,
              height: Math.random() * 80 + 30,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(45deg, ${['#3B82F6', '#8B5CF6', '#EC4899', '#10B981'][i % 4]}20, transparent)`,
              borderRadius: ['50%', '20%', '0%'][i % 3]
            }}
            animate={{
              rotate: [0, 360],
              y: [0, -30, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 20 + Math.random() * 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
        >
          <motion.h1
            className="text-8xl font-bold mb-6"
            style={{
              background: 'linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899, #10B981, #F59E0B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '400% 400%'
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            COSMIC CREATOR
          </motion.h1>
          
          <motion.p
            className="text-2xl mb-12"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            Welcome to the Future of Content Creation
          </motion.p>

          {/* 3D Central Orb */}
          <div className="relative w-96 h-96 mx-auto mb-16">
            {/* Outer rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-opacity-30"
              style={{
                borderColor: '#3B82F6',
                background: 'radial-gradient(circle, transparent 20%, rgba(59, 130, 246, 0.1) 100%)'
              }}
              animate={{
                rotate: 360,
                scale: [1, 1.05, 1]
              }}
              transition={{
                rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            
            <motion.div
              className="absolute inset-8 rounded-full border-2 border-opacity-40"
              style={{
                borderColor: '#8B5CF6',
                background: 'radial-gradient(circle, transparent 30%, rgba(139, 92, 246, 0.1) 100%)'
              }}
              animate={{
                rotate: -360,
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
            />

            {/* Central core */}
            <motion.div
              className="absolute inset-16 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.2), transparent)',
                backdropFilter: 'blur(30px)',
                boxShadow: '0 0 60px rgba(59, 130, 246, 0.3)'
              }}
              animate={{
                scale: [1, 1.08, 1],
                rotateX: [0, 360],
                rotateY: [0, 360]
              }}
              transition={{
                scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                rotateX: { duration: 15, repeat: Infinity, ease: "linear" },
                rotateY: { duration: 12, repeat: Infinity, ease: "linear" }
              }}
            >
              <div className="text-center">
                <motion.div
                  className="text-6xl font-bold mb-4"
                  style={{
                    background: 'linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  {stats.totalBooks}
                </motion.div>
                <div className="text-lg font-medium" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  BOOKS CREATED
                </div>
              </div>
            </motion.div>

            {/* Floating stat orbs */}
            {[
              { label: 'WORDS', value: stats.totalWords.toLocaleString(), color: '#10B981', angle: 0 },
              { label: 'STREAK', value: `${stats.streak}`, color: '#F59E0B', angle: 120 },
              { label: 'PRODUCTIVITY', value: `${stats.productivity}%`, color: '#EC4899', angle: 240 }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="absolute w-20 h-20 rounded-full flex items-center justify-center text-white font-bold shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${stat.color}, ${stat.color}CC)`,
                  boxShadow: `0 10px 40px ${stat.color}50`,
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0'
                }}
                animate={{
                  x: Math.cos(stat.angle * Math.PI / 180) * 150 - 40,
                  y: Math.sin(stat.angle * Math.PI / 180) * 150 - 40,
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  x: { duration: 30, repeat: Infinity, ease: "linear" },
                  y: { duration: 30, repeat: Infinity, ease: "linear" },
                  rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <div className="text-center">
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs opacity-90">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid with Progress Components */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          {/* Profile Completion */}
          <div className="card-ultra p-6 text-center">
            <CircularProgress
              value={user?.onboarding_completed ? 100 : 50}
              size={140}
              strokeWidth={10}
              label="Profile Completion"
              icon={Target}
              animated={true}
              glowing={true}
            />
          </div>

          {/* Credit Usage */}
          <div className="card-ultra p-6">
            <CreditUsageBar
              used={user?.credits_balance ? (1000 - user.credits_balance) : 0}
              total={user?.monthly_limit || 1000}
              label="Monthly Credits"
              size="lg"
              animated={true}
            />
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl font-black text-gradient">
                  {user?.credits_balance || 0}
                </div>
                <div className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                  Available
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-gradient">
                  {user?.monthly_limit || 1000}
                </div>
                <div className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                  Limit
                </div>
              </div>
            </div>
          </div>

          {/* Book Milestones */}
          <div className="card-ultra p-6">
            <h3 className="text-lg font-black text-gradient mb-4">📚 Book Milestones</h3>
            <MilestoneTracker
              currentValue={stats.totalBooks}
              vertical={true}
              milestones={[
                { value: 1, label: 'First Book', unit: 'book', reward: '+100 credits' },
                { value: 5, label: 'Author', unit: 'books', reward: '+500 credits' },
                { value: 10, label: 'Pro Writer', unit: 'books', reward: '+1000 credits' },
                { value: 25, label: 'Bestseller', unit: 'books', reward: 'Pro Badge' }
              ]}
              animated={true}
            />
          </div>
        </motion.div>

        {/* Quick Stats with StatCards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <StatCard
            label="Total Books"
            value={stats.totalBooks}
            icon={BookOpen}
            trend={{ direction: 'up', value: '+3', label: 'this week' }}
            color="var(--theme-primary)"
            gradient={true}
            animated={true}
          />
          <StatCard
            label="Words Written"
            value={stats.totalWords}
            icon={Zap}
            trend={{ direction: 'up', value: '+15K', label: 'this month' }}
            color="var(--theme-secondary)"
            gradient={true}
            animated={true}
          />
          <StatCard
            label="Day Streak"
            value={stats.streak}
            unit="🔥"
            icon={Activity}
            color="var(--theme-accent)"
            gradient={true}
            animated={true}
          />
          <StatCard
            label="Productivity"
            value={stats.productivity}
            unit="%"
            icon={TrendingUp}
            trend={{ direction: stats.productivity >= 80 ? 'up' : 'neutral', value: `${stats.productivity}%` }}
            color="var(--theme-success)"
            gradient={true}
            animated={true}
          />
        </motion.div>

        {/* Command Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 1.5 }}
        >
          {[
            { icon: Plus, label: 'CREATE BOOK', color: '#3B82F6', action: () => navigate('/app/create') },
            { icon: BookOpen, label: 'LIBRARY', color: '#8B5CF6', action: () => navigate('/app/books') },
            { icon: Brain, label: 'AI STUDIO', color: '#EC4899', action: () => navigate('/app/studio') },
            { icon: BarChart3, label: 'ANALYTICS', color: '#10B981', action: () => navigate('/app/tokens') }
          ].map((action, index) => (
            <motion.button
              key={index}
              onClick={action.action}
              className="p-8 rounded-2xl text-center relative overflow-hidden"
              style={{
                background: isDark 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(255, 255, 255, 0.9)',
                border: `2px solid ${action.color}40`,
                backdropFilter: 'blur(20px)'
              }}
              whileHover={{ 
                scale: 1.05,
                y: -10,
                boxShadow: `0 20px 60px ${action.color}40`
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5 + index * 0.2, duration: 1 }}
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 opacity-0"
                style={{
                  background: `linear-gradient(135deg, ${action.color}20, transparent)`
                }}
                whileHover={{ opacity: 1 }}
              />

              {/* Icon */}
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${action.color}, ${action.color}CC)`,
                  boxShadow: `0 8px 32px ${action.color}40`
                }}
                animate={{
                  rotate: [0, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <action.icon className="w-8 h-8 text-white" />
              </motion.div>

              {/* Label */}
              <div className="font-bold text-lg" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                {action.label}
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Neural Network Section */}
        <motion.div
          className="p-12 rounded-3xl mb-20"
          style={{
            background: isDark 
              ? 'rgba(255, 255, 255, 0.03)' 
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3, duration: 1.5 }}
        >
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">
            AI NEURAL NETWORK
          </h2>
          
          <MatrixNeuralNetwork />
          
          <p className="text-center text-lg mt-8" style={{ color: 'var(--color-text-muted)' }}>
            Your AI ebook generation agents are constantly learning and evolving
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default CosmicDashboard
