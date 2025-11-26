import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Crown, 
  Flame,
  TrendingUp,
  Calendar,
  Award,
  BookOpen,
  Pen,
  Medal,
  Sparkles
} from 'lucide-react'

const GamificationContext = createContext()

export const useGamification = () => {
  const context = useContext(GamificationContext)
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider')
  }
  return context
}

// Achievement definitions
export const ACHIEVEMENTS = {
  'first-book': {
    id: 'first-book',
    name: 'First Steps',
    description: 'Created your first book',
    icon: BookOpen,
    xp: 100,
    rarity: 'common'
  },
  'prolific-author': {
    id: 'prolific-author',
    name: 'Prolific Author',
    description: 'Created 5 books',
    icon: Pen,
    xp: 250,
    rarity: 'rare'
  },
  'master-creator': {
    id: 'master-creator',
    name: 'Master Creator',
    description: 'Created 10 books',
    icon: Crown,
    xp: 500,
    rarity: 'epic'
  },
  'word-smith': {
    id: 'word-smith',
    name: 'Word Smith',
    description: 'Written 10,000 words',
    icon: Sparkles,
    xp: 300,
    rarity: 'rare'
  },
  'streak-master': {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Maintained a 7-day streak',
    icon: Flame,
    xp: 200,
    rarity: 'uncommon'
  },
  'perfectionist': {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Completed perfect configuration',
    icon: Target,
    xp: 150,
    rarity: 'uncommon'
  },
  'avatar-master': {
    id: 'avatar-master',
    name: 'Avatar Master',
    description: 'Selected custom avatar',
    icon: Star,
    xp: 75,
    rarity: 'common'
  },
  'feature-explorer': {
    id: 'feature-explorer',
    name: 'Feature Explorer',
    description: 'Used advanced features',
    icon: Zap,
    xp: 100,
    rarity: 'common'
  }
}

export const GamificationProvider = ({ children }) => {
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    totalXp: 0,
    booksCreated: 0,
    monthlyBooks: 0,
    wordsWritten: 0,
    achievements: [],
    streak: 0,
    lastActivity: null
  })

  const [recentNotifications, setRecentNotifications] = useState([])
  const [notificationCooldown, setNotificationCooldown] = useState(false)

  // XP thresholds for each level
  const getXpForLevel = (level) => {
    return Math.floor(100 * Math.pow(1.5, level - 1))
  }

  // Get XP needed for next level
  const getXpForNextLevel = (currentLevel) => {
    return getXpForLevel(currentLevel + 1)
  }

  // Get XP progress for current level
  const getXpProgress = () => {
    const nextLevelXp = getXpForNextLevel(userStats.level)
    return {
      current: userStats.xp,
      needed: nextLevelXp,
      percentage: Math.round((userStats.xp / nextLevelXp) * 100)
    }
  }

  // Calculate level from total XP
  const calculateLevel = (totalXp) => {
    let level = 1
    let xpNeeded = 0
    
    while (xpNeeded <= totalXp) {
      xpNeeded += getXpForLevel(level)
      if (xpNeeded <= totalXp) {
        level++
      }
    }
    
    return level
  }

  // Rarity color helpers
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 dark:text-gray-400'
      case 'uncommon': return 'text-green-600 dark:text-green-400'
      case 'rare': return 'text-blue-600 dark:text-blue-400'
      case 'epic': return 'text-purple-600 dark:text-purple-400'
      case 'legendary': return 'text-yellow-600 dark:text-yellow-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getRarityBg = (rarity) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600'
      case 'uncommon': return 'from-green-400 to-green-600'
      case 'rare': return 'from-blue-400 to-blue-600'
      case 'epic': return 'from-purple-400 to-purple-600'
      case 'legendary': return 'from-yellow-400 to-yellow-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  // Add XP with spam prevention
  const addXp = (amount, reason = 'Activity completed') => {
    // Prevent spam by checking recent notifications
    const now = Date.now()
    const recentSimilar = recentNotifications.filter(
      notif => notif.reason === reason && (now - notif.timestamp) < 5000 // 5 seconds
    )

    // If we have more than 2 similar notifications in the last 5 seconds, don't show more
    if (recentSimilar.length >= 2) {
      // Still add XP, just don't show notification
      setUserStats(prev => {
        const newTotalXp = prev.totalXp + amount
        const newLevel = calculateLevel(newTotalXp)
        const currentLevelXp = newTotalXp - (newLevel > 1 ? 
          Array.from({length: newLevel - 1}, (_, i) => getXpForLevel(i + 1))
            .reduce((sum, xp) => sum + xp, 0) : 0)
        
        return {
          ...prev,
          xp: currentLevelXp,
          totalXp: newTotalXp,
          level: newLevel,
          lastActivity: new Date().toISOString()
        }
      })
      return
    }

    setUserStats(prev => {
      const newTotalXp = prev.totalXp + amount
      const newLevel = calculateLevel(newTotalXp)
      const prevLevel = prev.level
      
      // Calculate current level XP
      const currentLevelXp = newTotalXp - (newLevel > 1 ? 
        Array.from({length: newLevel - 1}, (_, i) => getXpForLevel(i + 1))
          .reduce((sum, xp) => sum + xp, 0) : 0)

      // Check for level up
      if (newLevel > prevLevel && !notificationCooldown) {
        setNotificationCooldown(true)
        toast.success(`🎉 Level Up! You're now level ${newLevel}!`, {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 'bold'
          }
        })
        
        // Reset cooldown after 3 seconds
        setTimeout(() => setNotificationCooldown(false), 3000)
      } else if (!notificationCooldown && amount > 0) {
        // Only show XP notification if not in cooldown and not spamming
        const shouldShowNotification = recentSimilar.length === 0
        
        if (shouldShowNotification) {
          toast.success(`+${amount} XP - ${reason}`, {
            duration: 2000,
            style: {
              background: '#10b981',
              color: 'white',
              fontSize: '14px'
            }
          })
        }
      }

      return {
        ...prev,
        xp: currentLevelXp,
        totalXp: newTotalXp,
        level: newLevel,
        lastActivity: new Date().toISOString()
      }
    })

    // Track notification to prevent spam
    setRecentNotifications(prev => {
      const newNotification = { reason, timestamp: now, amount }
      const filtered = prev.filter(notif => (now - notif.timestamp) < 10000) // Keep last 10 seconds
      return [...filtered, newNotification].slice(-10) // Keep max 10 recent notifications
    })
  }

  // Award achievement with spam prevention
  const awardAchievement = (achievementId) => {
    const achievement = ACHIEVEMENTS[achievementId]
    if (!achievement) return

    setUserStats(prev => {
      if (prev.achievements.includes(achievementId)) {
        return prev // Already has this achievement
      }

      if (!notificationCooldown) {
        toast.success(`🏆 Achievement Unlocked: ${achievement.name}`, {
          duration: 5000,
          style: {
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            fontWeight: 'bold'
          }
        })
      }

      // Add achievement XP
      addXp(achievement.xp, `Achievement: ${achievement.name}`)

      return {
        ...prev,
        achievements: [...prev.achievements, achievementId]
      }
    })
  }

  // Update book creation stats
  const updateBookStats = (wordCount = 0) => {
    setUserStats(prev => {
      const newBooksCreated = prev.booksCreated + 1
      const newWordsWritten = prev.wordsWritten + wordCount
      
      // Check for achievements
      if (newBooksCreated === 1 && !prev.achievements.includes('first-book')) {
        setTimeout(() => awardAchievement('first-book'), 500)
      } else if (newBooksCreated === 5 && !prev.achievements.includes('prolific-author')) {
        setTimeout(() => awardAchievement('prolific-author'), 500)
      } else if (newBooksCreated === 10 && !prev.achievements.includes('master-creator')) {
        setTimeout(() => awardAchievement('master-creator'), 500)
      }

      if (newWordsWritten >= 10000 && !prev.achievements.includes('word-smith')) {
        setTimeout(() => awardAchievement('word-smith'), 500)
      }

      return {
        ...prev,
        booksCreated: newBooksCreated,
        wordsWritten: newWordsWritten,
        monthlyBooks: prev.monthlyBooks + 1
      }
    })

    // Award XP for book creation (with spam prevention)
    addXp(50, 'Book created')
  }

  // Update streak
  const updateStreak = () => {
    const today = new Date().toDateString()
    const lastActivity = userStats.lastActivity ? new Date(userStats.lastActivity).toDateString() : null
    
    if (lastActivity !== today) {
      setUserStats(prev => {
        const newStreak = lastActivity === new Date(Date.now() - 86400000).toDateString() ? prev.streak + 1 : 1
        
        // Check for streak achievement
        if (newStreak === 7 && !prev.achievements.includes('streak-master')) {
          setTimeout(() => awardAchievement('streak-master'), 500)
        }

        return {
          ...prev,
          streak: newStreak,
          lastActivity: new Date().toISOString()
        }
      })
      
      addXp(10, 'Daily activity')
    }
  }

  // Track book creation
  const trackBookCreation = (bookType, generationTime) => {
    addXp(100, `${bookType} book created`)
    updateBookStats()
  }

  // Track avatar selection
  const trackAvatarSelection = () => {
    addXp(25, 'Avatar selected')
    
    // Award achievement for avatar selection
    if (!userStats.achievements.includes('avatar-master')) {
      setTimeout(() => awardAchievement('avatar-master'), 500)
    }
  }

  // Track advanced features usage
  const trackAdvancedFeatures = () => {
    addXp(50, 'Advanced features used')
    
    // Award achievement for feature exploration
    if (!userStats.achievements.includes('feature-explorer')) {
      setTimeout(() => awardAchievement('feature-explorer'), 500)
    }
  }

  // Track perfect configuration
  const trackPerfectConfiguration = () => {
    addXp(75, 'Perfect configuration completed')
    
    // Award achievement for perfectionist
    if (!userStats.achievements.includes('perfectionist')) {
      setTimeout(() => awardAchievement('perfectionist'), 500)
    }
  }

  // Get progress to next level (legacy function name)
  const getProgressToNextLevel = () => {
    return getXpProgress()
  }

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('gamification-stats')
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats)
        setUserStats(parsed)
      } catch (error) {
        console.error('Error loading gamification stats:', error)
      }
    }
  }, [])

  // Save stats to localStorage when they change
  useEffect(() => {
    localStorage.setItem('gamification-stats', JSON.stringify(userStats))
  }, [userStats])

  const value = {
    userStats,
    addXp,
    awardAchievement,
    updateBookStats,
    updateStreak,
    trackBookCreation,
    trackAvatarSelection,
    trackAdvancedFeatures,
    trackPerfectConfiguration,
    getProgressToNextLevel,
    getXpProgress,
    getXpForLevel,
    getXpForNextLevel,
    ACHIEVEMENTS,
    getRarityColor,
    getRarityBg
  }

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  )
}
