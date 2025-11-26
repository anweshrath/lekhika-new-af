import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  BookOpen, 
  Download, 
  Users, 
  Calendar,
  Target,
  Zap,
  Activity,
  Eye,
  Clock,
  RefreshCw,
  FileText,
  Award,
  Trophy,
  Star,
  Rocket,
  Flame,
  Crown,
  Sparkles,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Percent,
  BarChart,
  PieChart,
  LineChart
} from 'lucide-react'
import { dbService } from '../services/database'
import { useUserAuth } from '../contexts/UserAuthContext'
import { useTheme } from '../contexts/ThemeContext'
import UltraCard from '../components/UltraCard'
import UltraButton from '../components/UltraButton'
import UltraLoader from '../components/UltraLoader'
import { ultraToast } from '../utils/ultraToast'

const Analytics = () => {
  const { user } = useUserAuth()
  const { isDark } = useTheme()
  const [analytics, setAnalytics] = useState({
    booksGenerated: 0,
    wordsGenerated: 0,
    creditsUsed: 0,
    averageBookLength: 0,
    mostUsedTemplates: [],
    monthlyStats: [],
    achievements: [],
    streak: 0,
    productivity: 0,
    efficiency: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('6months')
  const [animatedValues, setAnimatedValues] = useState({
    books: 0,
    words: 0,
    credits: 0,
    avgLength: 0
  })
  const [showCelebration, setShowCelebration] = useState(false)
  const [selectedChart, setSelectedChart] = useState('monthly')

  useEffect(() => {
    loadAnalytics()
  }, [user?.id, timeRange])

  // Animate counters when analytics data loads
  useEffect(() => {
    if (analytics.booksGenerated > 0) {
      animateCounters()
    }
  }, [analytics])

  const animateCounters = () => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps
    
    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      
      setAnimatedValues({
        books: Math.floor(analytics.booksGenerated * progress),
        words: Math.floor(analytics.wordsGenerated * progress),
        credits: Math.floor(analytics.creditsUsed * progress),
        avgLength: Math.floor(analytics.averageBookLength * progress)
      })
      
      if (currentStep >= steps) {
        clearInterval(interval)
        setAnimatedValues({
          books: analytics.booksGenerated,
          words: analytics.wordsGenerated,
          credits: analytics.creditsUsed,
          avgLength: analytics.averageBookLength
        })
        
        // Trigger celebration if user has good stats
        if (analytics.booksGenerated > 5 || analytics.wordsGenerated > 10000) {
          setShowCelebration(true)
          setTimeout(() => setShowCelebration(false), 3000)
        }
      }
    }, stepDuration)
  }

  const loadAnalytics = async () => {
    if (!user?.id) return
    
    try {
      setRefreshing(true)
      
      // Fetch user's books for analytics
      const books = await dbService.getBooks(user.id)
      const totalWords = books.reduce((sum, book) => sum + (book.word_count || 0), 0)
      
      // Fetch token usage analytics
      const tokenUsage = await dbService.getTokenUsageAnalytics(user.id)
      const totalCreditsUsed = tokenUsage.reduce((sum, usage) => sum + (usage.tokens_used || 0), 0)
      
      // Calculate average book length
      const averageBookLength = books.length > 0 ? Math.round(totalWords / books.length) : 0
      
      // Generate monthly stats (last 6 months)
      const monthlyStats = generateMonthlyStats(books)
      
      // Calculate motivational metrics
      const streak = calculateStreak(books)
      const productivity = calculateProductivity(books, timeRange)
      const efficiency = calculateEfficiency(totalWords, totalCreditsUsed)
      const achievements = generateAchievements(books, totalWords, streak)
      
      setAnalytics({
        booksGenerated: books.length,
        wordsGenerated: totalWords,
        creditsUsed: totalCreditsUsed,
        averageBookLength,
        mostUsedTemplates: getMostUsedTemplates(books),
        monthlyStats,
        achievements,
        streak,
        productivity,
        efficiency
      })
      
    } catch (error) {
      console.error('Error loading analytics:', error)
      ultraToast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const calculateStreak = (books) => {
    if (books.length === 0) return 0
    
    const sortedBooks = books.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < sortedBooks.length; i++) {
      const bookDate = new Date(sortedBooks[i].created_at)
      bookDate.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor((today - bookDate) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
      } else if (daysDiff === streak + 1) {
        // Continue streak
      } else {
        break
      }
    }
    
    return streak
  }

  const calculateProductivity = (books, timeRange) => {
    const months = timeRange === '1month' ? 1 : 
                   timeRange === '3months' ? 3 : 
                   timeRange === '6months' ? 6 : 12
    
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - months)
    
    const recentBooks = books.filter(book => new Date(book.created_at) > cutoffDate)
    return Math.round((recentBooks.length / months) * 10) / 10
  }

  const calculateEfficiency = (totalWords, totalCredits) => {
    if (totalCredits === 0) return 0
    return Math.round((totalWords / totalCredits) * 100) / 100
  }

  const generateAchievements = (books, totalWords, streak) => {
    const achievements = []
    
    if (books.length >= 1) achievements.push({ name: 'First Book', icon: BookOpen, color: '#3B82F6' })
    if (books.length >= 5) achievements.push({ name: 'Content Creator', icon: Award, color: '#10B981' })
    if (books.length >= 10) achievements.push({ name: 'Prolific Writer', icon: Trophy, color: '#F59E0B' })
    if (books.length >= 25) achievements.push({ name: 'Author Extraordinaire', icon: Crown, color: '#8B5CF6' })
    if (totalWords >= 10000) achievements.push({ name: 'Word Wizard', icon: Star, color: '#EF4444' })
    if (totalWords >= 50000) achievements.push({ name: 'Literary Giant', icon: Flame, color: '#FF6B6B' })
    if (streak >= 3) achievements.push({ name: 'Consistent Creator', icon: Rocket, color: '#4ECDC4' })
    if (streak >= 7) achievements.push({ name: 'Daily Writer', icon: Sparkles, color: '#45B7D1' })
    
    return achievements
  }

  const generateMonthlyStats = (books) => {
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      
      const monthBooks = books.filter(book => {
        const bookDate = new Date(book.created_at)
        return bookDate.getMonth() === date.getMonth() && bookDate.getFullYear() === date.getFullYear()
      })
      
      months.push({
        month: monthName,
        books: monthBooks.length,
        words: monthBooks.reduce((sum, book) => sum + (book.word_count || 0), 0)
      })
    }
    
    return months
  }

  const getMostUsedTemplates = (books) => {
    const templateCounts = {}
    books.forEach(book => {
      const template = book.template_name || 'Custom'
      templateCounts[template] = (templateCounts[template] || 0) + 1
    })
    
    return Object.entries(templateCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="text-center">
          <UltraLoader type="pulse" size="lg" />
          <p className="mt-4" style={{ color: 'var(--color-text-muted)' }}>Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 relative overflow-hidden" style={{ background: 'var(--color-background)' }}>
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-20"
            style={{ background: 'var(--theme-primary)' }}
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: 'var(--theme-primary)'
            }}
          />
        ))}
      </div>

      {/* Celebration Confetti */}
      <AnimatePresence>
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3"
                style={{
                  background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)],
                  left: `${Math.random() * 100}%`,
                  top: '-10px'
                }}
                initial={{ opacity: 1, y: -10, rotate: 0 }}
                animate={{ 
                  opacity: 0, 
                  y: window.innerHeight + 10, 
                  rotate: 360,
                  x: (Math.random() - 0.5) * 200
                }}
                transition={{ duration: 3, delay: Math.random() * 2 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Dynamic Header with Motivational Message */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🚀 Analytics Command Center
          </motion.h1>
          <motion.p 
            className="text-xl max-w-3xl mx-auto mb-6" 
            style={{ color: 'var(--color-text-muted)' }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {analytics.booksGenerated > 0 ? 
              `Amazing work! You've created ${analytics.booksGenerated} books and ${analytics.wordsGenerated.toLocaleString()} words!` :
              "Ready to start your content creation journey? Let's make it legendary!"
            }
          </motion.p>
          
          {/* Achievement Badges */}
          {analytics.achievements.length > 0 && (
            <motion.div 
              className="flex justify-center flex-wrap gap-3 mb-6"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {analytics.achievements.slice(0, 4).map((achievement, index) => (
                <motion.div
                  key={achievement.name}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full text-white font-medium shadow-lg"
                  style={{ background: achievement.color }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <achievement.icon className="w-5 h-5" />
                  <span>{achievement.name}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Time Range Selector */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <UltraCard className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { value: '1month', label: '1 Month', icon: Calendar },
                { value: '3months', label: '3 Months', icon: TrendingUp },
                { value: '6months', label: '6 Months', icon: BarChart3 },
                { value: '1year', label: '1 Year', icon: Trophy }
              ].map((range) => (
                <motion.div
                  key={range.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UltraButton
                    onClick={() => setTimeRange(range.value)}
                    variant={timeRange === range.value ? 'primary' : 'secondary'}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <range.icon className="w-4 h-4" />
                    <span>{range.label}</span>
                  </UltraButton>
                </motion.div>
              ))}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UltraButton
                  onClick={loadAnalytics}
                  icon={refreshing ? Clock : RefreshCw}
                  variant="secondary"
                  size="sm"
                  disabled={refreshing}
                  className="flex items-center space-x-2"
                >
                  <motion.div
                    animate={{ rotate: refreshing ? 360 : 0 }}
                    transition={{ duration: 1, repeat: refreshing ? Infinity : 0 }}
                  >
                    {refreshing ? <Clock className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                  </motion.div>
                  <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
                </UltraButton>
              </motion.div>
            </div>
          </UltraCard>
        </motion.div>

        {/* Enhanced Key Metrics with Animations */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Books Generated */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <UltraCard className="text-center p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-200 dark:border-blue-800">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              >
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              </motion.div>
              <motion.div 
                className="text-4xl font-bold mb-2 text-blue-600 dark:text-blue-400"
                key={animatedValues.books}
              >
                {animatedValues.books.toLocaleString()}
              </motion.div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Books Generated
              </div>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                📈 +{analytics.productivity}/month
              </div>
            </UltraCard>
          </motion.div>

          {/* Words Generated */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <UltraCard className="text-center p-8 bg-gradient-to-br from-green-500/10 to-teal-500/10 border-2 border-green-200 dark:border-green-800">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-500" />
              </motion.div>
              <motion.div 
                className="text-4xl font-bold mb-2 text-green-600 dark:text-green-400"
                key={animatedValues.words}
              >
                {animatedValues.words.toLocaleString()}
              </motion.div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Words Generated
              </div>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                🎯 {analytics.efficiency} words/credit
              </div>
            </UltraCard>
          </motion.div>

          {/* Credits Used */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <UltraCard className="text-center p-8 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-200 dark:border-orange-800">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <Zap className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              </motion.div>
              <motion.div 
                className="text-4xl font-bold mb-2 text-orange-600 dark:text-orange-400"
                key={animatedValues.credits}
              >
                {animatedValues.credits.toLocaleString()}
              </motion.div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Credits Used
              </div>
              <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                ⚡ AI Powered
              </div>
            </UltraCard>
          </motion.div>

          {/* Average Book Length */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <UltraCard className="text-center p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-200 dark:border-purple-800">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              >
                <Target className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              </motion.div>
              <motion.div 
                className="text-4xl font-bold mb-2 text-purple-600 dark:text-purple-400"
                key={animatedValues.avgLength}
              >
                {animatedValues.avgLength.toLocaleString()}
              </motion.div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Book Length
              </div>
              <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                🎯 {analytics.streak} day streak
              </div>
            </UltraCard>
          </motion.div>
        </motion.div>

        {/* Motivational Progress Bar */}
        {analytics.booksGenerated > 0 && (
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <UltraCard className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-200 dark:border-yellow-800">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                  🏆 Your Writing Journey Progress
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {analytics.booksGenerated >= 25 ? 
                    "🎉 You're a Literary Legend! Keep the momentum going!" :
                    analytics.booksGenerated >= 10 ? 
                    "🔥 You're on fire! You're becoming a prolific writer!" :
                    analytics.booksGenerated >= 5 ? 
                    "💪 Great progress! You're building your content empire!" :
                    "🌟 You've started your journey! Every book counts!"
                  }
                </p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                <motion.div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((analytics.booksGenerated / 25) * 100, 100)}%` }}
                  transition={{ duration: 2, delay: 1 }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Books Created: {analytics.booksGenerated}</span>
                <span>Goal: 25 Books</span>
              </div>
            </UltraCard>
          </motion.div>
        )}

        {/* Enhanced Monthly Stats with Charts */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Monthly Performance Chart */}
          <UltraCard className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-2 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                📈 Monthly Performance
              </h3>
              <div className="flex space-x-2">
                <UltraButton
                  onClick={() => setSelectedChart('monthly')}
                  variant={selectedChart === 'monthly' ? 'primary' : 'secondary'}
                  size="sm"
                >
                  <BarChart className="w-4 h-4" />
                </UltraButton>
                <UltraButton
                  onClick={() => setSelectedChart('trends')}
                  variant={selectedChart === 'trends' ? 'primary' : 'secondary'}
                  size="sm"
                >
                  <LineChart className="w-4 h-4" />
                </UltraButton>
              </div>
            </div>
            
            <div className="space-y-4">
              {analytics.monthlyStats.map((stat, index) => (
                <motion.div 
                  key={stat.month} 
                  className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {stat.month}
                    </motion.div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {stat.books} Books Generated
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.words.toLocaleString()} words
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <motion.div 
                      className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 * index, type: "spring" }}
                    >
                      {stat.books}
                    </motion.div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      books
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </UltraCard>

          {/* Achievement Gallery */}
          <UltraCard className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-200 dark:border-yellow-800">
            <h3 className="text-xl font-bold mb-6 text-yellow-600 dark:text-yellow-400">
              🏆 Achievement Gallery
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {analytics.achievements.length > 0 ? (
                analytics.achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.name}
                    className="flex flex-col items-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index, type: "spring" }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-lg"
                      style={{ background: achievement.color }}
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      <achievement.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <span className="text-sm font-medium text-center text-gray-800 dark:text-gray-200">
                      {achievement.name}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-600 dark:text-gray-400">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Complete your first book to unlock achievements!</p>
                </div>
              )}
            </div>
          </UltraCard>
        </motion.div>

        {/* Enhanced Templates Section */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Most Used Templates */}
          <UltraCard className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-200 dark:border-emerald-800">
            <h3 className="text-xl font-bold mb-6 text-emerald-600 dark:text-emerald-400">
              🎯 Most Used Templates
            </h3>
            <div className="space-y-4">
              {analytics.mostUsedTemplates.length > 0 ? (
                analytics.mostUsedTemplates.map((template, index) => (
                  <motion.div 
                    key={template.name} 
                    className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg"
                        whileHover={{ scale: 1.2, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        {index + 1}
                      </motion.div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {template.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {template.count} times
                      </span>
                      <div className="w-20 h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                        <motion.div 
                          className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${(template.count / analytics.mostUsedTemplates[0].count) * 100}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  </motion.div>
                  <p>No templates used yet</p>
                  <p className="text-sm mt-2">Start creating to see your template usage!</p>
                </div>
              )}
            </div>
          </UltraCard>

          {/* Quick Actions & Motivational Stats */}
          <UltraCard className="p-6 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-2 border-pink-200 dark:border-pink-800">
            <h3 className="text-xl font-bold mb-6 text-pink-600 dark:text-pink-400">
              🚀 Quick Actions & Insights
            </h3>
            
            <div className="space-y-4">
              {/* Streak Counter */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Flame className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      Current Streak
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Keep the momentum going!
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {analytics.streak} 🔥
                </div>
              </div>

              {/* Productivity Score */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Activity className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      Productivity Score
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Books per month
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.productivity} 📈
                </div>
              </div>

              {/* Efficiency Rating */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Target className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      Efficiency Rating
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Words per credit
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analytics.efficiency} ⚡
                </div>
              </div>

              {/* Call to Action */}
              <motion.div
                className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-200 dark:border-purple-800"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-center">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 mb-2">
                    Ready for Your Next Creation?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Keep building your content empire!
                  </p>
                  <UltraButton
                    variant="primary"
                    className="w-full"
                    onClick={() => window.location.href = '/app/create'}
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Create New Book
                  </UltraButton>
                </div>
              </motion.div>
            </div>
          </UltraCard>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics