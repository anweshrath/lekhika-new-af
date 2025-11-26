import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'

const XPGainAnimation = ({ amount, source, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            y: -50, 
            scale: [0.8, 1.2, 1, 0.8] 
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <Zap className="w-5 h-5" />
            </motion.div>
            <span className="font-bold text-lg">+{amount} XP</span>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="text-center mt-2"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-lg">
              {source}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default XPGainAnimation
