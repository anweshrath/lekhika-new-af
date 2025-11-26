import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Crown, ArrowRight, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import UltraButton from './UltraButton'

const TokenLimitExceededModal = ({ isOpen, onClose, currentTokens, policyLimit, availableTokens }) => {
  const navigate = useNavigate()

  const handleUpgrade = () => {
    onClose()
    navigate('/app/billing')
  }

  if (!isOpen) return null

  const usagePercent = policyLimit > 0 ? Math.min((currentTokens / policyLimit) * 100, 100) : 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(12px) saturate(150%)'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            boxShadow: '0 20px 60px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(239, 68, 68, 0.1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div
            className="relative px-6 py-5 border-b"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
              borderColor: 'rgba(239, 68, 68, 0.2)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-xl"
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444'
                  }}
                >
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#ef4444' }}>
                    Token Limit Exceeded
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    Upgrade to continue generating
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Usage Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  Current Usage
                </span>
                <span className="text-lg font-bold" style={{ color: '#ef4444' }}>
                  {currentTokens.toLocaleString()} / {policyLimit.toLocaleString()}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                    }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold" style={{ color: '#ef4444' }}>
                    {usagePercent.toFixed(1)}% Used
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>Available Tokens</span>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  {availableTokens.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Message */}
            <div
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                You've reached your monthly token limit of <strong>{policyLimit.toLocaleString()} tokens</strong>.
                Upgrade your plan to get more tokens and continue creating amazing content.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Crown className="w-4 h-4 shrink-0" style={{ color: '#fbbf24' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Higher monthly token limits
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <TrendingUp className="w-4 h-4 shrink-0" style={{ color: '#10b981' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Priority support and faster processing
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Zap className="w-4 h-4 shrink-0" style={{ color: '#3b82f6' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Access to premium features
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            className="px-6 py-4 border-t flex items-center justify-end gap-3"
            style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderColor: 'rgba(239, 68, 68, 0.1)'
            }}
          >
            <UltraButton
              variant="secondary"
              onClick={onClose}
            >
              Maybe Later
            </UltraButton>
            <UltraButton
              variant="primary"
              onClick={handleUpgrade}
              icon={ArrowRight}
              className="gap-2"
            >
              Upgrade Now
            </UltraButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TokenLimitExceededModal

