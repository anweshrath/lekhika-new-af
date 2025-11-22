import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  TrendingUp, 
  Zap, 
  Target,
  BarChart3,
  Activity,
  Sparkles,
  Plus,
  Brain,
  Settings
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useUserAuth } from '../contexts/UserAuthContext'
import { dbService } from '../services/database'
import UltraCard from '../components/UltraCard'
import UltraButton from '../components/UltraButton'
import UltraLoader from '../components/UltraLoader'
import MatrixNeuralNetwork from '../components/MatrixNeuralNetwork'
import AIThinkingModal from '../components/AIThinkingModal'
import useTokenWallet from '../hooks/useTokenWallet'

const Dashboard = () => {
  const { isDark } = useTheme()
  const { user, loading: authLoading } = useUserAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalWords: 0,
    streak: 0,
    productivity: 0
  })
  const [showAIThinking, setShowAIThinking] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  const [aiPhase, setAiPhase] = useState('initializing')
  const { stats: tokenStats } = useTokenWallet()

  console.log('🔍 Dashboard Debug:', { user, authLoading, loading })

  useEffect(() => {
    const fetchData = async () => {
      console.log('🔍 Fetching dashboard data...', { user })
      
      if (!user) {
        console.log('❌ No user found, setting loading to false')
        setLoading(false)
        return
      }

      try {
        console.log('📚 Fetching books for user:', user.id)
        const books = await dbService.getBooks(user.id)
        console.log('📚 Books fetched:', books)
        
        const totalWords = books.reduce((sum, book) => sum + (book.word_count || 0), 0)
        
        setStats({
          totalBooks: books.length,
          totalWords,
          streak: Math.min(books.length, 30),
          productivity: books.length > 0 ? Math.min(100, books.length * 10) : 0
        })
        
        console.log('✅ Stats updated:', stats)
      } catch (error) {
        console.error('❌ Error fetching data:', error)
      } finally {
        setLoading(false)
        console.log('✅ Loading set to false')
      }
    }

    fetchData()
  }, [user])

  // Simulate AI thinking process
  const simulateAIThinking = () => {
    setShowAIThinking(true)
    setAiProgress(0)
    setAiPhase('initializing')
    
    const phases = ['initializing', 'preparing', 'generating', 'processing', 'completed']
    let currentPhaseIndex = 0
    let progress = 0
    
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5
      
      if (progress >= 100) {
        progress = 100
        setAiProgress(progress)
        setAiPhase('completed')
        clearInterval(interval)
        
        setTimeout(() => {
          setShowAIThinking(false)
        }, 2000)
        return
      }
      
      if (progress > (currentPhaseIndex + 1) * 20) {
        currentPhaseIndex = Math.min(phases.length - 1, Math.floor(progress / 20))
        setAiPhase(phases[currentPhaseIndex])
      }
      
      setAiProgress(progress)
    }, 200)
  }

  const formatNumber = (value) => {
    if (value == null) return '0'
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return Math.round(value).toLocaleString()
  }

  const usagePercent = tokenStats.total > 0 ? Math.round(tokenStats.usagePercent * 100) : null

  const overviewCards = [
    {
      key: 'tokens',
      icon: Zap,
      label: 'Tokens Used',
      value: `${formatNumber(tokenStats.used)} / ${formatNumber(tokenStats.total)}`,
      color: 'var(--theme-secondary)',
      subtitle: tokenStats.total > 0 ? `${usagePercent}% of allocation · ${formatNumber(tokenStats.available)} available` : 'No allocation detected'
    },
    {
      key: 'books',
      icon: BookOpen,
      label: 'Total Books',
      value: stats.totalBooks,
      color: 'var(--theme-primary)',
      subtitle: 'All-time creations'
    },
    {
      key: 'words',
      icon: Sparkles,
      label: 'Words Written',
      value: formatNumber(stats.totalWords),
      color: 'var(--theme-accent)',
      subtitle: 'Lifetime output'
    },
    {
      key: 'streak',
      icon: Activity,
      label: 'Day Streak',
      value: `${stats.streak} 🔥`,
      color: 'var(--theme-success)',
      subtitle: 'Keep the momentum'
    }
  ]

  // Show loading if auth is still loading
  if (authLoading) {
    console.log('🔄 Auth still loading...')
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="text-center">
          <UltraLoader type="pulse" size="lg" />
          <p className="mt-4" style={{ color: 'var(--color-text-muted)' }}>Loading authentication...</p>
        </div>
      </div>
    )
  }

  // Show loading if data is still loading
  if (loading) {
    console.log('🔄 Data still loading...')
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="text-center">
          <UltraLoader type="pulse" size="lg" />
          <p className="mt-4" style={{ color: 'var(--color-text-muted)' }}>Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  console.log('🎯 Rendering dashboard with:', { user, stats })

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4 text-gradient">
            🚀 Dashboard
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            Welcome back, {user?.name || user?.email || 'Creator'}!
          </p>
          <div className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium"
            style={{ color: 'var(--color-text)' }}
          >
            <Zap className="h-4 w-4 text-emerald-300" />
            Tokens Used: <strong>{formatNumber(tokenStats.used)}</strong>
            <span style={{ color: 'var(--color-text-muted)' }}>/ {formatNumber(tokenStats.total)} total</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {overviewCards.map(card => (
            <UltraCard key={card.key} className="text-center p-6">
              <card.icon className="w-8 h-8 mx-auto mb-4" style={{ color: card.color }} />
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                {card.value}
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                {card.label}
              </div>
              {card.subtitle && (
                <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                  {card.subtitle}
                </div>
              )}
            </UltraCard>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <UltraButton
            variant="primary"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => window.location.href = '/app/create'}
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-semibold">Create Book</span>
          </UltraButton>

          <UltraButton
            variant="secondary"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => window.location.href = '/app/books'}
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-sm font-semibold">My Books</span>
          </UltraButton>

          <UltraButton
            variant="accent"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={simulateAIThinking}
          >
            <Brain className="w-6 h-6" />
            <span className="text-sm font-semibold">AI Analysis</span>
          </UltraButton>

          <UltraButton
            variant="secondary"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => window.location.href = '/app/copyai'}
          >
            <Brain className="w-6 h-6" />
            <span className="text-sm font-semibold">AI Studio</span>
          </UltraButton>

          <UltraButton
            variant="secondary"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => window.location.href = '/app/tokens'}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-sm font-semibold">Analytics</span>
          </UltraButton>
        </motion.div>

                {/* Neural Network Section */}
                <motion.div
                  className="mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <UltraCard className="p-8">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gradient">
                      🤖 AI Neural Network
                    </h2>
                    <div className="h-[700px]">
                      <MatrixNeuralNetwork />
                    </div>
                    <p className="text-center text-sm mt-4" style={{ color: 'var(--color-text-muted)' }}>
                      Your AI ebook generation agents are constantly learning and evolving
                    </p>
                  </UltraCard>
                </motion.div>

      {/* AI Thinking Modal */}
      <AIThinkingModal
        isOpen={showAIThinking}
        onClose={() => setShowAIThinking(false)}
        progress={aiProgress}
        currentPhase={aiPhase}
        executionData={{
          progress: aiProgress,
          status: aiPhase,
          nodeName: 'AI Analysis',
          currentNode: 'AI Analysis',
          tokens: Math.floor(Math.random() * 500) + 200,
          words: Math.floor(Math.random() * 800) + 300,
          duration: Math.floor(Math.random() * 120) + 60,
          userInput: {
            wordCount: 2000,
            chapterCount: 5,
            genre: "Fantasy",
            style: "Professional"
          },
          aiThinking: "Analyzing user patterns and preferences to generate optimal content strategies...",
          nodeResults: [
            {
              nodeId: 'analysis_node',
              nodeName: 'Pattern Analysis',
              aiResponse: "Detected high productivity during morning hours. User prefers detailed narrative structures with character development.",
              processedContent: "Based on user behavior analysis, recommending content generation strategies that align with peak productivity periods.",
              tokens: 45,
              providerName: 'Claude'
            }
          ]
        }}
      />
      </div>
    </div>
  )
}

export default Dashboard
