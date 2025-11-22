import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Calendar, Crown, Zap, BookOpen,
  Edit3, Save, Camera, Activity, Loader2
} from 'lucide-react'
import { useUserAuth } from '../contexts/UserAuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { dbService } from '../services/database'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile } = useUserAuth()
  const { currentTheme, isDark } = useTheme()
  
  // Get the proper colors based on theme and mode
  const getThemeColors = () => {
    if (isDark) {
      return {
        background: currentTheme.colors.background,
        surface: currentTheme.colors.surface,
        text: currentTheme.colors.text,
        muted: currentTheme.colors.muted,
        primary: currentTheme.colors.primary,
        secondary: currentTheme.colors.secondary,
        accent: currentTheme.colors.accent,
        warning: currentTheme.colors.warning
      }
    } else {
      // Light mode colors - need to get from theme context
      const lightColors = {
        aurora: { background: '#FFFFFF', surface: '#F8FAFC', text: '#0F172A', muted: '#475569' },
        zen: { background: '#FFFFFF', surface: '#F9FAFB', text: '#111827', muted: '#4B5563' },
        cyberpunk: { background: '#FFFFFF', surface: '#F8FAFC', text: '#0F172A', muted: '#475569' },
        royal: { background: '#FFFBEB', surface: '#FFFFFF', text: '#1F2937', muted: '#4B5563' },
        ocean: { background: '#F0F9FF', surface: '#FFFFFF', text: '#0F172A', muted: '#475569' }
      }
      const themeColors = lightColors[currentTheme.id] || lightColors.aurora
      return {
        background: themeColors.background,
        surface: themeColors.surface,
        text: themeColors.text,
        muted: themeColors.muted,
        primary: currentTheme.colors.primary,
        secondary: currentTheme.colors.secondary,
        accent: currentTheme.colors.accent,
        warning: currentTheme.colors.warning
      }
    }
  }
  
  const themeColors = getThemeColors()
  const [loading, setLoading] = useState(true)
  const [themeKey, setThemeKey] = useState(0) // Force re-render when theme changes
  
  // Force re-render when theme changes
  useEffect(() => {
    setThemeKey(prev => prev + 1)
  }, [currentTheme.id, isDark])
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const fileInputRef = useRef(null)
  
  // Profile form state
  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    avatar_url: '',
    date_of_birth: null
  })

  // Stats state
  const [stats, setStats] = useState({
    booksGenerated: 0,
    wordsGenerated: 0,
    joinDate: null,
    lastActivity: null,
    tier: 'starter',
    creditsUsed: 0
  })

  // Load user profile data
  useEffect(() => {
    if (user) {
      fetchProfileData()
    }
  }, [user])

  const fetchProfileData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Fetch user's books for stats
      let books = []
      let totalWords = 0
      try {
        books = await dbService.getBooks(user?.id || user?.user_id)
        totalWords = books.reduce((sum, book) => sum + (book.word_count || 0), 0)
      } catch (booksError) {
        console.warn('⚠️ Could not fetch books:', booksError)
      }
      
      // Set profile data
      setProfile({
        full_name: user.full_name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        date_of_birth: user.date_of_birth || null
      })
      
      setStats({
        booksGenerated: books.length,
        wordsGenerated: totalWords,
        joinDate: user.created_at ? new Date(user.created_at) : null,
        lastActivity: user.last_activity ? new Date(user.last_activity) : null,
        tier: user.tier || 'starter',
        creditsUsed: 0
      })
      
    } catch (error) {
      console.error('❌ Error fetching profile data:', error)
      
      // Set basic profile data even if books fetch fails
      setProfile({
        full_name: user?.full_name || '',
        bio: user?.bio || '',
        avatar_url: user?.avatar_url || '',
        date_of_birth: user?.date_of_birth || null
      })
      
      setStats({
        booksGenerated: 0,
        wordsGenerated: 0,
        joinDate: user?.created_at ? new Date(user.created_at) : null,
        lastActivity: user?.last_activity ? new Date(user.last_activity) : null,
        tier: user?.tier || 'starter',
        creditsUsed: 0
      })
      
      toast.error('Profile loaded with limited data')
    } finally {
      setLoading(false)
    }
  }

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    setImageUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const userId = user?.id || user?.user_id
      
      if (!userId) {
        throw new Error('User ID not found')
      }
      
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('🚨 Storage upload error:', error)
        throw error
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
      toast.success('Profile image uploaded successfully!')

    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to upload image: ' + error.message)
    } finally {
      setImageUploading(false)
    }
  }

  // Save profile
  const handleSave = async () => {
    setSaving(true)

    try {
      const userId = user?.id || user?.user_id
      if (!userId) {
        throw new Error('User ID not found')
      }

      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name || null,
          bio: profile.bio || null,
          date_of_birth: profile.date_of_birth || null,
          avatar_url: profile.avatar_url || null
        })
        .eq('id', userId)

      if (error) {
        throw error
      }

      await updateProfile({
        full_name: profile.full_name || null,
        bio: profile.bio || null,
        date_of_birth: profile.date_of_birth || null,
        avatar_url: profile.avatar_url || null
      })

      setEditing(false)
      toast.success('Profile updated successfully!')

    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case 'starter': return 'from-gray-500 to-gray-600 dark:from-gray-400 dark:to-gray-500'
      case 'pro': return 'from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500'
      case 'enterprise': return 'from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500'
      default: return 'from-gray-500 to-gray-600 dark:from-gray-400 dark:to-gray-500'
    }
  }

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'starter': return <User className="w-5 h-5" />
      case 'pro': return <Crown className="w-5 h-5" />
      case 'enterprise': return <Crown className="w-5 h-5" />
      default: return <User className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: themeColors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: themeColors.primary }}></div>
          <p style={{ color: themeColors.muted }}>Loading profile...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.background }} key={themeKey}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold" style={{ background: currentTheme.gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Profile Settings
              </h1>
              <p className="mt-2" style={{ color: isDark ? themeColors.muted : '#6B7280' }}>
                Manage your account settings and preferences
              </p>
            </div>
            
            <div className="flex gap-3">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 rounded-xl transition-colors font-medium"
                    style={{ 
                      backgroundColor: isDark ? themeColors.surface : '#FFFFFF', 
                      color: isDark ? themeColors.text : '#1F2937',
                      border: `1px solid ${isDark ? themeColors.muted : '#D1D5DB'}`
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ 
                      background: currentTheme.gradients.primary,
                      color: 'white'
                    }}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-3 text-white rounded-xl transition-all font-medium flex items-center gap-2"
                  style={{ 
                    background: currentTheme.gradients.primary,
                    color: 'white'
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card - Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="rounded-2xl shadow-xl p-8 text-center sticky top-6" style={{ 
              backgroundColor: isDark ? themeColors.surface : '#FFFFFF', 
              border: `1px solid ${isDark ? themeColors.muted : '#E2E8F0'}`,
              boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
            }}>
              {/* Avatar Section */}
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden p-1" style={{ background: currentTheme.gradients.primary }}>
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: themeColors.surface }}>
                      <User className="w-16 h-16" style={{ color: themeColors.muted }} />
                    </div>
                  )}
                </div>
                
                {editing && (
                  <div className="absolute bottom-2 right-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageUploading}
                      className="p-3 rounded-full shadow-lg transition-colors"
                      style={{ 
                        backgroundColor: themeColors.surface, 
                        border: `2px solid ${themeColors.muted}` 
                      }}
                    >
                      {imageUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: themeColors.primary }} />
                      ) : (
                        <Camera className="w-5 h-5" style={{ color: themeColors.primary }} />
                      )}
                    </button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <h2 className="text-2xl font-bold mb-2" style={{ color: isDark ? themeColors.text : '#1F2937' }}>
                {profile.full_name || user?.full_name || 'Anonymous User'}
              </h2>
              <p className="mb-1" style={{ color: isDark ? themeColors.muted : '#6B7280' }}>
                {user?.email}
              </p>
              <p className="text-xs mb-2" style={{ color: isDark ? themeColors.muted : '#9CA3AF' }}>
                ID: {user?.id || user?.user_id || 'N/A'}
              </p>
              {profile.bio && (
                <p className="text-sm mb-4 italic" style={{ color: isDark ? themeColors.muted : '#6B7280' }}>
                  "{profile.bio}"
                </p>
              )}

              {/* Tier Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white mb-6" style={{ background: currentTheme.gradients.primary }}>
                {getTierIcon(stats.tier)}
                <span className="font-semibold capitalize">{stats.tier}</span>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl" style={{ backgroundColor: isDark ? themeColors.background : '#F8FAFC' }}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" style={{ color: themeColors.primary }} />
                    <span style={{ color: isDark ? themeColors.muted : '#6B7280' }}>Books</span>
                  </div>
                  <span className="font-semibold" style={{ color: isDark ? themeColors.text : '#1F2937' }}>{stats.booksGenerated}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl" style={{ backgroundColor: isDark ? themeColors.background : '#F8FAFC' }}>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" style={{ color: themeColors.secondary }} />
                    <span style={{ color: isDark ? themeColors.muted : '#6B7280' }}>Words</span>
                  </div>
                  <span className="font-semibold" style={{ color: isDark ? themeColors.text : '#1F2937' }}>{stats.wordsGenerated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl" style={{ backgroundColor: isDark ? themeColors.background : '#F8FAFC' }}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: themeColors.accent }} />
                    <span style={{ color: isDark ? themeColors.muted : '#6B7280' }}>Joined</span>
                  </div>
                  <span className="font-semibold" style={{ color: isDark ? themeColors.text : '#1F2937' }}>
                    {stats.joinDate ? stats.joinDate.toLocaleDateString() : user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Tabs */}
            <div className="rounded-2xl shadow-xl mb-8" style={{ 
              backgroundColor: isDark ? themeColors.surface : '#FFFFFF', 
              border: `1px solid ${isDark ? themeColors.muted : '#E2E8F0'}`,
              boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex" style={{ borderBottom: `1px solid ${isDark ? themeColors.muted : '#E2E8F0'}` }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2 px-6 py-4 font-medium transition-colors"
                    style={{
                      color: activeTab === tab.id ? themeColors.primary : (isDark ? themeColors.muted : '#6B7280'),
                      borderBottom: activeTab === tab.id ? `2px solid ${themeColors.primary}` : 'none',
                      backgroundColor: activeTab === tab.id ? `${themeColors.primary}20` : 'transparent'
                    }}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold mb-6" style={{ color: isDark ? themeColors.text : '#1F2937' }}>Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: isDark ? themeColors.text : '#1F2937' }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profile.full_name}
                          onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                          disabled={!editing}
                          className="w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            borderColor: isDark ? themeColors.muted : '#D1D5DB',
                            backgroundColor: isDark ? themeColors.surface : '#FFFFFF',
                            color: isDark ? themeColors.text : '#1F2937',
                            '--placeholder-color': isDark ? themeColors.muted : '#9CA3AF'
                          }}
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: isDark ? themeColors.text : '#1F2937' }}>
                          Email
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled={true}
                          className="w-full px-4 py-3 border-2 rounded-xl cursor-not-allowed"
                          style={{
                            borderColor: isDark ? themeColors.muted : '#D1D5DB',
                            backgroundColor: isDark ? themeColors.background : '#F9FAFB',
                            color: isDark ? themeColors.muted : '#6B7280'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: isDark ? themeColors.text : '#1F2937' }}>
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={profile.date_of_birth || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, date_of_birth: e.target.value || null }))}
                          disabled={!editing}
                          className="w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            borderColor: isDark ? themeColors.muted : '#D1D5DB',
                            backgroundColor: isDark ? themeColors.surface : '#FFFFFF',
                            color: isDark ? themeColors.text : '#1F2937'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: isDark ? themeColors.text : '#1F2937' }}>
                        Bio
                      </label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!editing}
                        rows={4}
                        className="w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          borderColor: isDark ? themeColors.muted : '#D1D5DB',
                          backgroundColor: isDark ? themeColors.surface : '#FFFFFF',
                          color: isDark ? themeColors.text : '#1F2937',
                          '--placeholder-color': isDark ? themeColors.muted : '#9CA3AF'
                        }}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold mb-6" style={{ color: isDark ? themeColors.text : '#1F2937' }}>Activity Overview</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-xl border" style={{ 
                        background: isDark ? currentTheme.gradients.surface : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
                        borderColor: themeColors.primary,
                        backgroundColor: isDark ? undefined : '#FFFFFF'
                      }}>
                        <div className="flex items-center gap-3 mb-3">
                          <BookOpen className="w-8 h-8" style={{ color: themeColors.primary }} />
                          <h4 className="text-lg font-semibold" style={{ color: isDark ? themeColors.text : '#1F2937' }}>Books Generated</h4>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: isDark ? themeColors.text : '#1F2937' }}>{stats.booksGenerated}</p>
                        <p className="text-sm" style={{ color: isDark ? themeColors.muted : '#6B7280' }}>Total books created</p>
                      </div>
                      
                      <div className="p-6 rounded-xl border" style={{ 
                        background: isDark ? currentTheme.gradients.surface : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
                        borderColor: themeColors.secondary,
                        backgroundColor: isDark ? undefined : '#FFFFFF'
                      }}>
                        <div className="flex items-center gap-3 mb-3">
                          <Zap className="w-8 h-8" style={{ color: themeColors.secondary }} />
                          <h4 className="text-lg font-semibold" style={{ color: isDark ? themeColors.text : '#1F2937' }}>Words Generated</h4>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: isDark ? themeColors.text : '#1F2937' }}>{stats.wordsGenerated.toLocaleString()}</p>
                        <p className="text-sm" style={{ color: isDark ? themeColors.muted : '#6B7280' }}>Total words created</p>
                      </div>
                      
                      <div className="p-6 rounded-xl border" style={{ 
                        background: isDark ? currentTheme.gradients.surface : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
                        borderColor: themeColors.accent,
                        backgroundColor: isDark ? undefined : '#FFFFFF'
                      }}>
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="w-8 h-8" style={{ color: themeColors.accent }} />
                          <h4 className="text-lg font-semibold" style={{ color: isDark ? themeColors.text : '#1F2937' }}>Member Since</h4>
                        </div>
                        <p className="text-lg font-bold" style={{ color: isDark ? themeColors.text : '#1F2937' }}>
                          {stats.joinDate ? stats.joinDate.toLocaleDateString() : user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-sm" style={{ color: isDark ? themeColors.muted : '#6B7280' }}>Account creation date</p>
                      </div>
                      
                      <div className="p-6 rounded-xl border" style={{ 
                        background: isDark ? currentTheme.gradients.surface : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
                        borderColor: themeColors.warning,
                        backgroundColor: isDark ? undefined : '#FFFFFF'
                      }}>
                        <div className="flex items-center gap-3 mb-3">
                          <Crown className="w-8 h-8" style={{ color: themeColors.warning }} />
                          <h4 className="text-lg font-semibold" style={{ color: isDark ? themeColors.text : '#1F2937' }}>Current Plan</h4>
                        </div>
                        <p className="text-lg font-bold" style={{ color: isDark ? themeColors.text : '#1F2937' }}>{stats.tier}</p>
                        <p className="text-sm" style={{ color: isDark ? themeColors.muted : '#6B7280' }}>Subscription tier</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Profile