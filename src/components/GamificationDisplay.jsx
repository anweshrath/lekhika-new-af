import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Target, TrendingUp, Award, X } from 'lucide-react'
import { useGamification } from '../contexts/GamificationContext'

const GamificationDisplay = ({ compact = false }) => {
  const { userStats, getProgressToNextLevel } = useGamification()
  const [showDetails, setShowDetails] = useState(false)
  const progress = getProgressToNextLevel()

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg shadow-lg cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Level {userStats.level}</div>
              <div className="text-xs opacity-90">{progress.current}/{progress.needed} XP</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-90">Books</div>
            <div className="text-sm font-semibold">{userStats.booksCreated}</div>
          </div>
        </div>
        
        <div className="mt-2 bg-white/20 rounded-full h-2">
          <motion.div
            className="bg-white rounded-full h-2"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Your Progress
          </h3>
          <button
            onClick={() => setShowDetails(true)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View Details
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.level}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Level</div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.totalXp.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total XP</div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.booksCreated}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Books Created</div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.achievements.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Level {userStats.level} Progress
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {progress.current}/{progress.needed} XP
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {progress.needed - progress.current} XP to next level
          </div>
        </div>

        {userStats.achievements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Achievements</h4>
            <div className="flex flex-wrap gap-2">
              {userStats.achievements.slice(-3).map((achievement, index) => (
                <div
                  key={achievement.id}
                  className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-xs"
                >
                  <span>{achievement.icon}</span>
                  <span>{achievement.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Gaming Profile</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{userStats.level}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Current Level</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{userStats.totalXp.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Experience</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{userStats.booksCreated}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Books Created</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{userStats.wordsWritten.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Words Written</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{userStats.streak}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{userStats.achievements.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
                  </div>
                </div>

                {userStats.achievements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Achievements</h3>
                    <div className="grid gap-3">
                      {userStats.achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{achievement.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default GamificationDisplay
