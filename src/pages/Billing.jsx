import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Crown,
  Key,
  ArrowRight,
  Sparkles,
  Clock,
  Users,
  BookOpen,
  Download,
  Headphones,
  TrendingUp,
  Calendar,
  DollarSign,
  RefreshCw
} from 'lucide-react'
import { useUserAuth } from '../contexts/UserAuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { dbService } from '../services/database'
import UltraButton from '../components/UltraButton'
import UltraCard from '../components/UltraCard'
import UltraLoader from '../components/UltraLoader'
import { ultraToast } from '../utils/ultraToast'

const Billing = () => {
  const { user } = useUserAuth()
  const { isDark } = useTheme()
  const [loading, setLoading] = useState(true)
  const [billingData, setBillingData] = useState({
    credits: 0,
    tier: 'free',
    monthlyLimit: 1000,
    usage: {
      booksGenerated: 0,
      wordsGenerated: 0,
      creditsUsed: 0,
      creditsRemaining: 0
    },
    subscription: null,
    paymentHistory: [],
    nextBillingDate: null
  })

  useEffect(() => {
    fetchBillingData()
  }, [user])

  const fetchBillingData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Fetch user's books for usage stats
      const books = await dbService.getBooks(user.id)
      const totalWords = books.reduce((sum, book) => sum + (book.word_count || 0), 0)
      
      // Fetch token usage analytics
      const tokenUsage = await dbService.getTokenUsageAnalytics(user.id)
      const totalCreditsUsed = tokenUsage.reduce((sum, usage) => sum + (usage.tokens_used || 0), 0)
      
      // Calculate credits remaining
      const creditsRemaining = Math.max(0, (user.credits_balance || 1000) - totalCreditsUsed)
      
      setBillingData({
        credits: user.credits_balance || 1000,
        tier: user.tier || 'free',
        monthlyLimit: user.monthly_limit || 1000,
        usage: {
          booksGenerated: books.length,
          wordsGenerated: totalWords,
          creditsUsed: totalCreditsUsed,
          creditsRemaining: creditsRemaining
        },
        subscription: user.subscription || null,
        paymentHistory: [], // TODO: Implement payment history
        nextBillingDate: user.subscription?.expires_at ? new Date(user.subscription.expires_at) : null
      })
      
    } catch (error) {
      console.error('Error fetching billing data:', error)
      ultraToast.error('Failed to load billing information')
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'Free Tier',
      price: 0,
      period: 'forever',
      credits: 1000,
      description: 'Perfect for trying out our AI magic',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-gray-500 to-gray-600',
      features: [
        '1,000 credits included',
        'Basic AI models',
        'Text export only',
        'Community support'
      ],
      limitations: [
        'Limited credits',
        'Basic templates only',
        'No premium features'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      period: 'month',
      credits: 5000,
      description: 'Great for regular content creators',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      popular: false,
      features: [
        '5,000 credits (~50k words)',
        'Unlimited books',
        'Advanced AI models',
        'PDF, DOCX, TXT export',
        'Email support',
        'Advanced templates'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      period: 'month',
      credits: 20000,
      description: 'For serious authors and businesses',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      popular: true,
      features: [
        '20,000 credits (~200k words)',
        'Unlimited books',
        'Premium AI models',
        'All export formats',
        'Priority support',
        'Advanced customization',
        'Bulk generation',
        'API access'
      ]
    },
    {
      id: 'byok',
      name: 'BYOK (Bring Your Own Key)',
      price: 20,
      period: 'month',
      credits: 'unlimited',
      description: 'Use your own API keys for unlimited generation',
      icon: <Key className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      features: [
        'Unlimited word generation',
        'Use your OpenAI/Claude keys',
        'Unlimited books',
        'All premium features',
        'Priority support',
        'Custom model selection',
        'Advanced fine-tuning',
        'White-label options'
      ]
    }
  ]

  const currentPlan = plans.find(p => p.id === billingData.tier) || plans[0]

  const handleRefresh = () => {
    fetchBillingData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="text-center">
          <UltraLoader type="pulse" size="lg" />
          <p className="mt-4" style={{ color: 'var(--color-text-muted)' }}>Loading billing information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4 text-gradient">
            💳 Billing & Usage
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Manage your subscription and track your AI usage
          </p>
        </motion.div>

        {/* Usage Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <UltraCard className="text-center p-6">
            <Zap className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--theme-primary)' }} />
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {billingData.usage.creditsRemaining.toLocaleString()}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Credits Remaining
            </div>
          </UltraCard>

          <UltraCard className="text-center p-6">
            <BookOpen className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--theme-secondary)' }} />
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {billingData.usage.booksGenerated}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Books Generated
            </div>
          </UltraCard>

          <UltraCard className="text-center p-6">
            <TrendingUp className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--theme-accent)' }} />
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {billingData.usage.wordsGenerated.toLocaleString()}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Words Generated
            </div>
          </UltraCard>

          <UltraCard className="text-center p-6">
            <DollarSign className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--theme-success)' }} />
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {billingData.usage.creditsUsed.toLocaleString()}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Credits Used
            </div>
          </UltraCard>
        </motion.div>

        {/* Current Plan Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <UltraCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                Current Plan: {currentPlan.name}
              </h3>
              <UltraButton
                onClick={handleRefresh}
                icon={RefreshCw}
                variant="secondary"
                size="sm"
              >
                Refresh
              </UltraButton>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentPlan.color} flex items-center justify-center text-white`}>
                    {currentPlan.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                      ${currentPlan.price}
                      {currentPlan.period && <span className="text-lg font-normal" style={{ color: 'var(--color-text-muted)' }}>/{currentPlan.period}</span>}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {typeof currentPlan.credits === 'number' 
                        ? `${currentPlan.credits.toLocaleString()} credits included`
                        : 'Unlimited credits with your keys'
                      }
                    </div>
                  </div>
                </div>
                
                {billingData.nextBillingDate && (
                  <div className="flex items-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Next billing: {billingData.nextBillingDate.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Plan Features:</h4>
                <div className="space-y-2">
                  {currentPlan.features.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </UltraCard>
        </motion.div>

        {/* Pricing Plans */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {plans.map((plan, index) => (
            <UltraCard
              key={plan.id}
              className={`relative ${plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''} ${billingData.tier === plan.id ? 'bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {billingData.tier === plan.id && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center text-white`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                  {plan.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  {plan.description}
                </p>
                <div className="mb-4">
                  <span className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                    ${plan.price}
                  </span>
                  {plan.period && (
                    <span style={{ color: 'var(--color-text-muted)' }}>/{plan.period}</span>
                  )}
                </div>
                {typeof plan.credits === 'number' && (
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {plan.credits.toLocaleString()} credits included
                  </div>
                )}
                {plan.credits === 'unlimited' && (
                  <div className="text-sm text-green-600 font-medium">
                    Unlimited credits with your keys
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{feature}</span>
                  </div>
                ))}
              </div>

              {plan.limitations && (
                <div className="space-y-2 mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-xs font-medium text-yellow-800 dark:text-yellow-400 mb-2">Limitations:</p>
                  {plan.limitations.map((limitation, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                      <span className="text-xs text-yellow-700 dark:text-yellow-300">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}

              <UltraButton
                variant={billingData.tier === plan.id ? 'secondary' : 'primary'}
                className="w-full"
                disabled={billingData.tier === plan.id || plan.id === 'free'}
              >
                {billingData.tier === plan.id ? (
                  <>
                    <Check className="w-4 h-4 inline mr-2" />
                    Current Plan
                  </>
                ) : plan.id === 'free' ? (
                  'Free Tier Active'
                ) : (
                  <>
                    Upgrade Now
                    <ArrowRight className="w-4 h-4 inline ml-2" />
                  </>
                )}
              </UltraButton>
            </UltraCard>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <UltraCard className="p-6">
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              💡 Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>How do credits work?</h4>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Credits are consumed based on the length and complexity of content generated. A basic 1,000-word book costs 100 credits, while a premium 20,000-word book costs 2,000 credits.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>What's BYOK (Bring Your Own Key)?</h4>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  With BYOK, you use your own OpenAI, Claude, or other AI service API keys. This gives you unlimited generation at your API provider's cost, plus access to all premium features.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Can I cancel anytime?</h4>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Yes! All subscriptions can be cancelled anytime. You'll retain access to your current plan until the end of your billing period.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Do unused credits roll over?</h4>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Credits expire at the end of each billing cycle, but we'll send you reminders before they expire so you can use them up.
                </p>
              </div>
            </div>
          </UltraCard>
        </motion.div>
      </div>
    </div>
  )
}

export default Billing