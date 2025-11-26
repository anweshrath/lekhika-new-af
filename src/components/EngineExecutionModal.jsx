import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Rocket,
  Download,
  Eye,
  Zap,
  Brain,
  Clock,
  TrendingUp,
  DollarSign,
  FileText,
  PlayCircle,
  PauseCircle,
  StopCircle
} from 'lucide-react'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import toast from 'react-hot-toast'
import UltraButton from './UltraButton'

const EngineExecutionModal = ({
  isOpen,
  onClose,
  executionData,
  onForceStop,
  onRestart
}) => {
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(false)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (executionData?.status === 'completed') {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [executionData?.status])

  // Generate floating particles during AI thinking
  useEffect(() => {
    if (executionData?.status === 'running' && executionData?.aiThinking) {
      const interval = setInterval(() => {
        setParticles(prev => [
          ...prev.slice(-20), // Keep only last 20 particles
          {
            id: Date.now(),
            x: Math.random() * 100,
            y: Math.random() * 100
          }
        ])
      }, 200)
      return () => clearInterval(interval)
    }
  }, [executionData?.status, executionData?.aiThinking])

  const getStatusColor = () => {
    switch (executionData?.status) {
      case 'completed': return '#10b981'
      case 'failed': return '#ef4444'
      case 'running': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = () => {
    switch (executionData?.status) {
      case 'completed': return CheckCircle
      case 'failed': return AlertTriangle
      case 'running': return Loader2
      default: return PlayCircle
    }
  }

  const StatusIcon = getStatusIcon()
  const progress = executionData?.progress || 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Confetti for completion */}
          {showConfetti && (
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.3}
            />
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Card with Glassmorphism */}
            <div
              className="relative overflow-hidden rounded-3xl"
              style={{
                background: 'rgba(20, 20, 30, 0.95)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Animated Background Gradient */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${getStatusColor()}, transparent 70%)`,
                  animation: 'pulse 3s ease-in-out infinite'
                }}
              />

              {/* Floating Particles */}
              {particles.map(particle => (
                <motion.div
                  key={particle.id}
                  initial={{ opacity: 0, scale: 0, x: `${particle.x}%`, y: `${particle.y}%` }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: '-100%' }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ background: getStatusColor() }}
                />
              ))}

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{
                        rotate: executionData?.status === 'running' ? 360 : 0,
                        scale: executionData?.status === 'running' ? [1, 1.1, 1] : 1
                      }}
                      transition={{
                        rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 1, repeat: Infinity }
                      }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${getStatusColor()}30, ${getStatusColor()}10)`,
                        boxShadow: `0 4px 24px ${getStatusColor()}40`
                      }}
                    >
                      <StatusIcon 
                        className={`w-6 h-6 ${executionData?.status === 'running' ? 'animate-spin' : ''}`}
                        style={{ color: getStatusColor() }}
                      />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {executionData?.status === 'completed' ? 'Content Generated!' :
                         executionData?.status === 'failed' ? 'Generation Failed' :
                         'Generating Content...'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {executionData?.currentNode || 'Initializing...'}
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Progress Ring */}
                <div className="p-8 flex flex-col items-center">
                  <div className="relative w-48 h-48">
                    {/* Background Circle */}
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="8"
                        fill="none"
                      />
                      {/* Progress Circle */}
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke={getStatusColor()}
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: 552 }}
                        animate={{ 
                          strokeDashoffset: 552 - (552 * progress) / 100,
                          stroke: getStatusColor()
                        }}
                        style={{
                          strokeDasharray: 552,
                          filter: `drop-shadow(0 0 8px ${getStatusColor()})`
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </svg>
                    
                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        key={progress}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-5xl font-bold text-white"
                      >
                        {Math.round(progress)}%
                      </motion.div>
                      <div className="text-sm text-gray-400 mt-2">
                        {executionData?.nodeType || 'Processing'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Thinking Display */}
                {executionData?.aiThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-8 pb-4"
                  >
                    <div 
                      className="p-4 rounded-xl relative overflow-hidden"
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Brain className="w-5 h-5 text-blue-400" />
                        </motion.div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-blue-400 mb-1">
                            AI is thinking {executionData?.providerName && `(${executionData.providerName})`}
                          </div>
                          <div className="text-sm text-gray-300 line-clamp-3">
                            {executionData.aiThinking.substring(0, 200)}
                            {executionData.aiThinking.length > 200 && '...'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Stats */}
                <div className="px-8 pb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-3 rounded-xl text-center"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                    <div className="text-lg font-bold text-white">
                      {executionData?.tokens?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-400">Tokens</div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-3 rounded-xl text-center"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-400" />
                    <div className="text-lg font-bold text-white">
                      ${(executionData?.cost || 0).toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-400">Cost</div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-3 rounded-xl text-center"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <FileText className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                    <div className="text-lg font-bold text-white">
                      {executionData?.words?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-400">Words</div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-3 rounded-xl text-center"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <Clock className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <div className="text-lg font-bold text-white">
                      {Math.round(executionData?.duration || 0)}s
                    </div>
                    <div className="text-xs text-gray-400">Time</div>
                  </motion.div>
                </div>

                {/* Error Display */}
                {executionData?.error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-8 pb-6"
                  >
                    <div 
                      className="p-4 rounded-xl"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-red-400 mb-1">
                            Error occurred
                          </div>
                          <div className="text-sm text-gray-300">
                            {executionData.error}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="px-8 pb-8 flex gap-3 justify-end">
                  {executionData?.status === 'running' && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <UltraButton
                        onClick={onForceStop}
                        variant="secondary"
                        icon={StopCircle}
                      >
                        Stop
                      </UltraButton>
                    </motion.div>
                  )}

                  {executionData?.status === 'failed' && onRestart && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <UltraButton
                        onClick={onRestart}
                        variant="primary"
                        icon={PlayCircle}
                      >
                        Retry
                      </UltraButton>
                    </motion.div>
                  )}

                  {executionData?.status === 'completed' && (
                    <>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <UltraButton
                          onClick={() => {
                            // Download logic
                            toast.success('Download started!')
                          }}
                          variant="secondary"
                          icon={Download}
                        >
                          Download
                        </UltraButton>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <UltraButton
                          onClick={onClose}
                          variant="primary"
                          icon={Eye}
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)'
                          }}
                        >
                          View Result
                        </UltraButton>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Add keyframes for pulse animation */}
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 0.4; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EngineExecutionModal

