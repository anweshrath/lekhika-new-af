import React from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Crown, 
  Flame,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react'
import { useGamification } from '../contexts/GamificationContext'

const GamificationStats = ({ compact = false }) => {
  const { userStats, getXpProgress, getXpForNextLevel, ACHIEVEMENTS, getRarityColor, getRarityBg } = useGamification()
  const xpProgress = getXpProgress()
  const nextLevelXp = getXpForNextLevel(userStats.level)

  if (compact) {
    return (
      <div className="flex items-center space-x-4">
        {/* Level Badge */}
        <motion.div 
          className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full"
          whileHover={{ scale: 1.05 }}
        >
          <Crown className="w-4 h-4 mr-1" />
          <span className="font-bold">Lv.{userStats.level}</span>
        </motion.div>

        {/* XP Progress */}
        <div className="flex-1 max-w-32">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>{userStats.xp}</span>
            <span>{nextLevelXp}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Streak */}
        <motion.div 
          className="flex items-center bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full"
          whileHover={{ scale: 1.05 }}
        >
          <Flame className="w-4 h-4 mr-1" />
          <span className="font-bold">{userStats.streak}</span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Level & XP Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-4"
            >
              <Crown className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Level {userStats.level}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {userStats.xp.toLocaleString()} XP
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Next Level</p>
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              {(nextLevelXp - userStats.xp).toLocaleString()} XP
            </p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Progress to Level {userStats.level + 1}</span>
            <span>{Math.round(xpProgress.percentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress.percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-white/30"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Streak', 
            value: userStats.streak, 
            icon: Flame, 
            color: 'from-orange-400 to-red-500',
            suffix: userStats.streak === 1 ? 'day' : 'days'
          },
          { 
            label: 'Books Created', 
            value: userStats.booksCreated, 
            icon: Trophy, 
            color: 'from-blue-400 to-blue-600',
            suffix: 'total'
          },
          { 
            label: 'This Month', 
            value: userStats.monthlyBooks, 
            icon: Calendar, 
            color: 'from-green-400 to-green-600',
            suffix: 'books'
          },
          { 
            label: 'Achievements', 
            value: userStats.achievements.length, 
            icon: Award, 
            color: 'from-purple-400 to-purple-600',
            suffix: `/ ${Object.keys(ACHIEVEMENTS).length}`
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="card text-center"
          >
            <motion.div
              className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <stat.icon className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div 
              className="text-2xl font-bold text-gray-900 dark:text-white"
              key={stat.value}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {stat.value}
            </motion.div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stat.suffix}
            </p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent Achievements */}
      {userStats.achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Recent Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userStats.achievements.slice(-4).map((achievementId, index) => {
              const achievement = ACHIEVEMENTS[achievementId]
              if (!achievement) return null

              return (
                <motion.div
                  key={achievementId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getRarityBg(achievement.rarity)} flex items-center justify-center mr-3`}>
                    <achievement.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm ${getRarityColor(achievement.rarity)}`}>
                      {achievement.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      +{achievement.xp} XP
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default GamificationStats
