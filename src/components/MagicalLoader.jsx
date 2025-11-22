import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Brain, Wand2, Stars } from 'lucide-react'

const MagicalLoader = ({ phase, progress, currentAgent }) => {
  const phases = {
    planning: { icon: Brain, color: 'blue', label: 'AI Planning Magic' },
    researching: { icon: Sparkles, color: 'purple', label: 'Research Wizardry' },
    writing: { icon: Wand2, color: 'green', label: 'Writing Enchantment' },
    editing: { icon: Stars, color: 'yellow', label: 'Editing Sorcery' },
    complete: { icon: Zap, color: 'rainbow', label: 'Masterpiece Created!' }
  }

  const currentPhase = phases[phase] || phases.planning
  const Icon = currentPhase.icon

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        {/* Magical Orb */}
        <div className="relative mb-8">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
            className="w-24 h-24 mx-auto relative"
          >
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${
              currentPhase.color === 'rainbow' 
                ? 'from-pink-500 via-purple-500 to-blue-500' 
                : `from-${currentPhase.color}-400 to-${currentPhase.color}-600`
            } opacity-20 animate-pulse`} />
            <div className={`absolute inset-2 rounded-full bg-gradient-to-r ${
              currentPhase.color === 'rainbow'
                ? 'from-pink-500 via-purple-500 to-blue-500'
                : `from-${currentPhase.color}-500 to-${currentPhase.color}-700`
            } flex items-center justify-center`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            
            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                animate={{
                  x: [0, Math.cos(i * 60 * Math.PI / 180) * 40],
                  y: [0, Math.sin(i * 60 * Math.PI / 180) * 40],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Phase Label */}
        <motion.h3
          key={phase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2"
        >
          {currentPhase.label}
        </motion.h3>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${
                currentPhase.color === 'rainbow'
                  ? 'from-pink-500 via-purple-500 to-blue-500'
                  : `from-${currentPhase.color}-500 to-${currentPhase.color}-600`
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Current Agent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-600 dark:text-gray-400"
        >
          <p className="text-sm">Current Agent: <span className="font-semibold">{currentAgent}</span></p>
        </motion.div>

        {/* Magical Effects */}
        <div className="absolute -top-4 -right-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </motion.div>
        </div>
        <div className="absolute -bottom-4 -left-4">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Stars className="w-6 h-6 text-purple-400" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default MagicalLoader
