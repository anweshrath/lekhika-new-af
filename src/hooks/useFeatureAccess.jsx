import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export const useFeatureAccess = () => {
  const { user, credits, tier, hasFeatureAccess, deductCredits } = useAuth()
  const [isChecking, setIsChecking] = useState(false)

  const checkFeatureAccess = (feature, requiredCredits = 0) => {
    if (!user) {
      return {
        hasAccess: false,
        reason: 'authentication_required',
        message: 'Please sign in to access this feature'
      }
    }

    if (!hasFeatureAccess(feature)) {
      return {
        hasAccess: false,
        reason: 'tier_restriction',
        message: `This feature requires ${feature.includes('expert') ? 'Expert' : 'Standard'} tier or higher`
      }
    }

    if (requiredCredits > 0 && credits < requiredCredits) {
      return {
        hasAccess: false,
        reason: 'insufficient_credits',
        message: `This action requires ${requiredCredits} credits. You have ${credits} credits remaining.`
      }
    }

    return {
      hasAccess: true,
      reason: 'allowed',
      message: 'Access granted'
    }
  }

  const executeWithCredits = async (action, requiredCredits, actionName) => {
    setIsChecking(true)
    
    try {
      const accessCheck = checkFeatureAccess('basic_generation', requiredCredits)
      
      if (!accessCheck.hasAccess) {
        toast.error(accessCheck.message)
        return { success: false, reason: accessCheck.reason }
      }

      // Deduct credits before executing action
      await deductCredits(requiredCredits, actionName)
      
      // Execute the action
      const result = await action()
      
      return { success: true, result }
    } catch (error) {
      console.error('Error executing action with credits:', error)
      toast.error('An error occurred while processing your request')
      return { success: false, error: error.message }
    } finally {
      setIsChecking(false)
    }
  }

  const getFeatureLimits = () => {
    const limits = {
      free: {
        books_per_month: 1,
        words_per_book: 5000,
        export_formats: ['txt'],
        ai_models: ['basic'],
        support: 'community'
      },
      standard: {
        books_per_month: 10,
        words_per_book: 15000,
        export_formats: ['txt', 'pdf', 'docx'],
        ai_models: ['basic', 'advanced'],
        support: 'email'
      },
      expert: {
        books_per_month: 50,
        words_per_book: 50000,
        export_formats: ['txt', 'pdf', 'docx', 'epub'],
        ai_models: ['basic', 'advanced', 'premium'],
        support: 'priority'
      },
      byok: {
        books_per_month: 'unlimited',
        words_per_book: 'unlimited',
        export_formats: ['all'],
        ai_models: ['all'],
        support: 'priority'
      }
    }

    return limits[tier] || limits.free
  }

  const getCreditCosts = () => {
    return {
      book_generation: {
        basic: 100,      // ~1000 words
        standard: 500,   // ~5000 words  
        advanced: 1000,  // ~10000 words
        premium: 2000    // ~20000 words
      },
      content_enhancement: 50,
      image_generation: 25,
      export_premium: 10
    }
  }

  return {
    // Access checking
    checkFeatureAccess,
    executeWithCredits,
    isChecking,
    
    // Feature info
    hasFeatureAccess,
    getFeatureLimits,
    getCreditCosts,
    
    // Current state
    tier,
    credits,
    isAuthenticated: !!user
  }
}

// Feature gate component
export const FeatureGate = ({ 
  feature, 
  requiredCredits = 0, 
  children, 
  fallback = null,
  showUpgrade = true 
}) => {
  const { checkFeatureAccess } = useFeatureAccess()
  const accessCheck = checkFeatureAccess(feature, requiredCredits)

  if (accessCheck.hasAccess) {
    return children
  }

  if (fallback) {
    return fallback
  }

  if (showUpgrade) {
    return (
      <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Feature Locked
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {accessCheck.message}
        </p>
        <button 
          onClick={() => window.location.href = '/app/billing'}
          className="btn-primary"
        >
          Upgrade Now
        </button>
      </div>
    )
  }

  return null
}
