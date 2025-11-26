import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download,
  Trash2,
  Save,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  Settings as SettingsIcon,
  Brain,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Lock
} from 'lucide-react'
import { useUserAuth } from '../contexts/UserAuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { dbService } from '../services/database'
import { aiUsageVerifier } from '../services/aiUsageVerifier'
import AIUsageReport from '../components/AIUsageReport'
import toast from 'react-hot-toast'
import UltraButton from '../components/UltraButton'
import UltraCard from '../components/UltraCard'
import UltraInput from '../components/UltraInput'
import { ultraToast } from '../utils/ultraToast'

const Settings = () => {
  const { user, updateUser } = useUserAuth()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [showAIReport, setShowAIReport] = useState(false)
  const [aiStatus, setAiStatus] = useState(null)
  const [checkingAI, setCheckingAI] = useState(false)
  const [settings, setSettings] = useState({
    theme: 'system',
    notifications: true,
    soundEffects: true,
    autoSave: true,
    language: 'en',
    timezone: 'UTC'
  })

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    preferences: {
      defaultBookType: 'ebook',
      defaultNiche: 'business',
      defaultTone: 'professional'
    }
  })

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.full_name || user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar_url || user.avatar || '',
        preferences: user.preferences || {
          defaultBookType: 'ebook',
          defaultNiche: 'business',
          defaultTone: 'professional'
        }
      })
    }
  }, [user])

  useEffect(() => {
    // Check AI status when AI Services tab is active
    if (activeTab === 'ai-services') {
      checkAIStatus()
    }
  }, [activeTab])

  const checkAIStatus = async () => {
    setCheckingAI(true)
    try {
      const results = await aiUsageVerifier.verifyAIUsage()
      setAiStatus(results)
    } catch (error) {
      console.error('Error checking AI status:', error)
      toast.error('Failed to check AI service status')
    } finally {
      setCheckingAI(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'ai-services', name: 'AI Services', icon: Brain },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'advanced', name: 'Advanced', icon: Globe }
  ]

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      
      // Update user profile in database
      const updatedUser = {
        ...user,
        full_name: profile.name,
        email: profile.email,
        bio: profile.bio,
        avatar_url: profile.avatar,
        preferences: profile.preferences
      }
      
      await updateUser(updatedUser)
      ultraToast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      ultraToast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      // Save settings to localStorage or database
      localStorage.setItem('userSettings', JSON.stringify(settings))
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await dbService.clearAllData()
        localStorage.clear()
        toast.success('All data cleared successfully!')
        window.location.reload()
      } catch (error) {
        console.error('Error clearing data:', error)
        toast.error('Failed to clear data')
      }
    }
  }

  const getStatusIcon = (online) => {
    return online ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    )
  }

  const getVerdictColor = (verdict) => {
    if (verdict?.includes('FULL_AI')) return 'text-green-600'
    if (verdict?.includes('ALL_FALLBACK')) return 'text-red-600'
    if (verdict?.includes('MIXED')) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getVerdictIcon = (verdict) => {
    if (verdict?.includes('FULL_AI')) return <Brain className="w-6 h-6 text-green-500" />
    if (verdict?.includes('ALL_FALLBACK')) return <AlertTriangle className="w-6 h-6 text-red-500" />
    if (verdict?.includes('MIXED')) return <AlertTriangle className="w-6 h-6 text-yellow-500" />
    return <SettingsIcon className="w-6 h-6 text-gray-500" />
  }

  // Check if user is BYOK tier
  const isByokUser = tier === 'byok'

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-5xl font-black text-gradient-animated mb-3">
          ⚙️ Settings
        </h1>
        <p className="text-lg font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Manage your account settings and preferences
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar - ULTRA VERSION */}
        <div className="lg:col-span-1">
          <UltraCard hover={false} gradient className="!p-3">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl font-semibold transition-smooth ${
                    activeTab === tab.id ? 'gradient-bg-primary text-white shadow-gradient-primary' : ''
                  }`}
                  style={{
                    background: activeTab === tab.id ? 'var(--theme-gradient-primary)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'var(--color-text)'
                  }}
                  whileHover={activeTab !== tab.id ? { x: 4 } : {}}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </motion.button>
              ))}
            </nav>
          </UltraCard>
        </div>

        {/* Content - ULTRA VERSION */}
        <div className="lg:col-span-3">
          <UltraCard hover={false} className="gradient-border">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-2xl font-black text-gradient mb-6">
                  Profile Information
                </h2>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <UltraInput
                      label="Full Name"
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                    
                    <UltraInput
                      label="Email Address"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                      Bio
                    </label>
                    <motion.textarea
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      className="input-ultra w-full px-4 py-3 rounded-xl font-medium h-24 resize-none transition-smooth"
                      style={{
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        border: '2px solid var(--color-border)'
                      }}
                      placeholder="Tell us about yourself..."
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Default Book Type
                      </label>
                      <select
                        value={profile.preferences.defaultBookType}
                        onChange={(e) => setProfile(prev => ({ 
                          ...prev, 
                          preferences: { ...prev.preferences, defaultBookType: e.target.value }
                        }))}
                        className="input-field"
                      >
                        <option value="ebook">eBook</option>
                        <option value="report">Report</option>
                        <option value="guide">Guide</option>
                        <option value="whitepaper">Whitepaper</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Default Niche
                      </label>
                      <select
                        value={profile.preferences.defaultNiche}
                        onChange={(e) => setProfile(prev => ({ 
                          ...prev, 
                          preferences: { ...prev.preferences, defaultNiche: e.target.value }
                        }))}
                        className="input-field"
                      >
                        <option value="business">Business</option>
                        <option value="health">Health</option>
                        <option value="technology">Technology</option>
                        <option value="education">Education</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Default Tone
                      </label>
                      <select
                        value={profile.preferences.defaultTone}
                        onChange={(e) => setProfile(prev => ({ 
                          ...prev, 
                          preferences: { ...prev.preferences, defaultTone: e.target.value }
                        }))}
                        className="input-field"
                      >
                        <option value="professional">Professional</option>
                        <option value="conversational">Conversational</option>
                        <option value="academic">Academic</option>
                        <option value="inspirational">Inspirational</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <UltraButton
                      onClick={handleSaveProfile}
                      disabled={loading}
                      loading={loading}
                      icon={Save}
                      size="lg"
                      variant="primary"
                    >
                      Save Profile
                    </UltraButton>
                  </div>
                </div>
              </div>
            )}

            {/* AI Services Tab */}
            {activeTab === 'ai-services' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    AI Services Status
                  </h2>
                  <div className="flex gap-3">
                    <UltraButton
                      onClick={checkAIStatus}
                      disabled={checkingAI}
                      loading={checkingAI}
                      icon={RefreshCw}
                      variant="secondary"
                    >
                      Refresh Status
                    </UltraButton>
                    <UltraButton
                      onClick={() => setShowAIReport(true)}
                      icon={Eye}
                      variant="primary"
                    >
                      Detailed Report
                    </UltraButton>
                  </div>
                </div>

                {/* AI Status Overview */}
                <div className="mb-6 p-4 rounded-2xl border-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wifi className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <span className="font-bold text-lg text-green-700 dark:text-green-400">
                          🚀 Specialized AI Teams Online!
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Research Team (OpenAI + Claude) • Writing Team (Gemini + Perplexity) • Image Team (DALL-E + GROK)
                        </p>
                        {!isByokUser && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                            ✨ Using platform-managed API keys for optimal performance
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Status Details */}
                {aiStatus && (
                  <div className="space-y-6">
                    {/* Verdict Section */}
                    {aiStatus.summary && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          {getVerdictIcon(aiStatus.summary.verdict)}
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">System Status</h3>
                            <p className={`text-sm font-medium ${getVerdictColor(aiStatus.summary.verdict)}`}>
                              {aiStatus.summary.verdict}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {aiStatus.summary.recommendation}
                        </p>
                      </div>
                    )}

                    {/* Service Status Grid */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center space-x-2 text-gray-900 dark:text-white">
                        <Wifi className="w-5 h-5" />
                        <span>AI Service Status</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiStatus.aiServicesOnline && Object.entries(aiStatus.aiServicesOnline).map(([service, status]) => (
                          <div key={service} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(status.online)}
                                <span className="font-medium capitalize text-gray-900 dark:text-white">{service}</span>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded ${
                                status.online 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                                {status.online ? 'Online' : 'Offline'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p>API Key: {status.hasApiKey ? '✅ Configured' : '❌ Missing'}</p>
                              {status.error && (
                                <p className="text-red-600 dark:text-red-400 mt-1">Error: {status.error}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary Stats */}
                    {aiStatus.summary && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {aiStatus.summary.onlineServices}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Online Services</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {aiStatus.summary.offlineServices}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Offline Services</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {aiStatus.summary.totalServices}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Services</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round((aiStatus.summary.onlineServices / aiStatus.summary.totalServices) * 100)}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                      <div className="flex flex-wrap gap-3">
                        {/* API Key Management - BYOK Users Only */}
                        {isByokUser ? (
                          <button
                            onClick={() => window.open('/superadmin', '_blank')}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                          >
                            <SettingsIcon className="w-4 h-4" />
                            <span>Manage API Keys</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed">
                            <Lock className="w-4 h-4" />
                            <span>API Keys (BYOK Only)</span>
                          </div>
                        )}
                        
                        {/* AI Testing - Available to all users */}
                        <button
                          onClick={() => window.open('/internal/ai-test', '_blank')}
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                          <Brain className="w-4 h-4" />
                          <span>Test AI Services</span>
                        </button>
                      </div>
                      
                      {/* Information for non-BYOK users */}
                      {!isByokUser && (
                        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            <strong>Your tier ({tier}):</strong> Uses our optimized platform API keys for the best performance. 
                            Upgrade to BYOK tier to manage your own API keys.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {checkingAI && !aiStatus && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Checking AI service status...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Appearance Settings
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'light', name: 'Light', icon: Sun },
                        { id: 'dark', name: 'Dark', icon: Moon },
                        { id: 'system', name: 'System', icon: Monitor }
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSettings(prev => ({ ...prev, theme: theme.id }))}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            settings.theme === theme.id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                          }`}
                        >
                          <theme.icon className="w-6 h-6 mx-auto mb-2" />
                          <div className="text-sm font-medium">{theme.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <UltraButton
                      onClick={handleSaveSettings}
                      disabled={loading}
                      loading={loading}
                      icon={Save}
                      size="lg"
                      variant="primary"
                    >
                      Save Settings
                    </UltraButton>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Notification Preferences
                </h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'notifications', label: 'Push Notifications', description: 'Receive notifications about book generation' },
                    { key: 'soundEffects', label: 'Sound Effects', description: 'Play sounds for UI interactions' },
                    { key: 'autoSave', label: 'Auto Save', description: 'Automatically save your work' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{setting.label}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings[setting.key] ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings[setting.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                  <div className="flex justify-end mt-6">
                    <UltraButton
                      onClick={handleSaveSettings}
                      disabled={loading}
                      loading={loading}
                      icon={Save}
                      size="lg"
                      variant="primary"
                    >
                      Save Settings
                    </UltraButton>
                  </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Privacy & Security
                </h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                      Data Usage
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Your data is stored locally and used only for generating books. We don't share your information with third parties.
                    </p>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <h3 className="font-medium text-red-800 dark:text-red-400 mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Clear all your data including books, settings, and preferences. This action cannot be undone.
                    </p>
                    <UltraButton
                      onClick={clearAllData}
                      icon={Trash2}
                      variant="danger"
                    >
                      Clear All Data
                    </UltraButton>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Advanced Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                        className="input-field"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                        className="input-field"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="GMT">Greenwich Mean Time</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <UltraButton
                      onClick={handleSaveSettings}
                      disabled={loading}
                      loading={loading}
                      icon={Save}
                      size="lg"
                      variant="primary"
                    >
                      Save Settings
                    </UltraButton>
                  </div>
                </div>
              </div>
            )}
          </UltraCard>
        </div>
      </div>

      {/* AI Usage Report Modal */}
      {showAIReport && (
        <AIUsageReport onClose={() => setShowAIReport(false)} />
      )}
    </div>
  )
}

export default Settings
