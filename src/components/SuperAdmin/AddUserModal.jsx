import React, { useState, useEffect } from 'react'
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Crown, 
  Shield, 
  Send, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Zap,
  Workflow
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    username: '',
    password: '',
    tier: 'hobby',
    role: 'user',
    credits_balance: '100',
    monthly_limit: '100',
    is_active: true,
    onboarding_completed: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [levels, setLevels] = useState([])
  const [availableFeatures, setAvailableFeatures] = useState([])
  const [availableWorkflows, setAvailableWorkflows] = useState([])
  const [selectedFeatures, setSelectedFeatures] = useState({})
  const [selectedWorkflows, setSelectedWorkflows] = useState([])
  const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true)
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true)
  const [resetPasswordOnFirstLogin, setResetPasswordOnFirstLogin] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadLevels()
      loadAvailableFeatures()
      loadAvailableWorkflows()
    }
  }, [isOpen])

  const loadLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('name, display_name, credits_monthly, monthly_limit')
        .eq('is_active', true)
        .order('tier_level')
      
      if (error) throw error
      setLevels(data || [])
    } catch (error) {
      console.error('Error loading levels:', error)
      toast.error('Failed to load user levels')
    }
  }

  const loadAvailableFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('level_features')
        .select('feature_name, feature_category, is_enabled, usage_limit')
        .eq('is_enabled', true)
        .order('feature_category, feature_name')
      
      if (error) throw error
      
      // Group features by category
      const groupedFeatures = data.reduce((acc, feature) => {
        if (!acc[feature.feature_category]) {
          acc[feature.feature_category] = []
        }
        acc[feature.feature_category].push(feature)
        return acc
      }, {})
      
      setAvailableFeatures(groupedFeatures)
    } catch (error) {
      console.error('Error loading features:', error)
      toast.error('Failed to load available features')
    }
  }

  const loadAvailableWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_workflows')
        .select('id, name, description, category')
        .eq('is_active', true)
      
      if (error) {
        console.warn('No workflows available yet:', error.message)
        setAvailableWorkflows([])
        return
      }
      
      setAvailableWorkflows(data || [])
    } catch (error) {
      console.warn('Error loading workflows:', error)
      setAvailableWorkflows([])
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleTierChange = (tier) => {
    const selectedLevel = levels.find(level => level.name === tier)
    setFormData(prev => ({
      ...prev,
      tier,
      credits_balance: selectedLevel?.credits_monthly?.toString() || '100',
      monthly_limit: selectedLevel?.monthly_limit?.toString() || '100'
    }))
  }

  const handleFeatureToggle = (featureName, category) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [featureName]: {
        category,
        is_enabled: !prev[featureName]?.is_enabled,
        usage_limit: prev[featureName]?.usage_limit || 100
      }
    }))
  }

  const handleFeatureLimitChange = (featureName, limit) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [featureName]: {
        ...prev[featureName],
        usage_limit: parseInt(limit) || 0
      }
    }))
  }

  const handleWorkflowToggle = (workflowId) => {
    setSelectedWorkflows(prev => {
      if (prev.includes(workflowId)) {
        return prev.filter(id => id !== workflowId)
      } else {
        return [...prev, workflowId]
      }
    })
  }

  const handleLoginAsUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      toast.success('Logged in as user successfully!')
      // You can redirect to user dashboard here if needed
      
    } catch (error) {
      console.error('Error logging in as user:', error)
      toast.error(`Failed to login as user: ${error.message}`)
    }
  }

  const validateForm = () => {
    if (!formData.email || !formData.full_name || !formData.password) {
      toast.error('Please fill in all required fields')
      return false
    }
    
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return false
    }
    
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      // First create the user in auth.users (Supabase Auth)
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          full_name: formData.full_name,
          username: formData.username
        }
      })
      
      if (authError) throw authError
      
      // Then create the user record in public.users
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authUser.user.id,
          email: formData.email,
          full_name: formData.full_name,
          username: formData.username,
          role: formData.role,
          tier: formData.tier,
          credits_balance: parseInt(formData.credits_balance),
          monthly_limit: parseInt(formData.monthly_limit),
          is_active: formData.is_active,
          onboarding_completed: formData.onboarding_completed,
          metadata: {
            created_by: 'superadmin',
            send_confirmation_email: sendConfirmationEmail,
            send_welcome_email: sendWelcomeEmail,
            reset_password_on_first_login: resetPasswordOnFirstLogin
          }
        }])
        .select()
        .single()
      
      // Save user-specific feature overrides
      if (Object.keys(selectedFeatures).length > 0) {
        const featureOverrides = Object.entries(selectedFeatures).map(([featureName, config]) => ({
          user_id: authUser.user.id,
          feature_name: featureName,
          feature_category: config.category,
          is_enabled: config.is_enabled,
          usage_limit: config.usage_limit,
          is_override: true
        }))
        
        const { error: featureError } = await supabase
          .from('user_feature_overrides')
          .insert(featureOverrides)
        
        if (featureError) {
          console.warn('Warning: Could not save feature overrides:', featureError)
        }
      }
      
      // Save user-specific workflow assignments
      if (selectedWorkflows.length > 0) {
        const workflowAssignments = selectedWorkflows.map(workflowId => ({
          user_id: authUser.user.id,
          workflow_id: workflowId,
          assignment_type: 'manual_override',
          is_active: true
        }))
        
        const { error: workflowError } = await supabase
          .from('user_workflow_assignments')
          .insert(workflowAssignments)
        
        if (workflowError) {
          console.warn('Warning: Could not save workflow assignments:', workflowError)
        }
      }
      
      // Send confirmation email if requested
      if (sendConfirmationEmail) {
        await supabase.auth.admin.generateLink({
          type: 'signup',
          email: formData.email
        })
      }
      
      // Send welcome email if requested
      if (sendWelcomeEmail) {
        // This would integrate with your email service
        console.log('Welcome email would be sent to:', formData.email)
      }
      
      // Force password reset on first login if requested
      if (resetPasswordOnFirstLogin) {
        await supabase.auth.admin.updateUserById(authUser.user.id, {
          user_metadata: { ...authUser.user.user_metadata, force_password_reset: true }
        })
      }
      
      toast.success('User created successfully!')
      onUserAdded(userRecord)
      onClose()
      
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error(`Failed to create user: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      email: '',
      full_name: '',
      username: '',
      password: '',
      tier: 'hobby',
      role: 'user',
      credits_balance: '100',
      monthly_limit: '100',
      is_active: true,
      onboarding_completed: false
    })
    setShowPassword(false)
    setSendConfirmationEmail(true)
    setSendWelcomeEmail(true)
    setResetPasswordOnFirstLogin(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add New User</h2>
              <p className="text-gray-400 text-sm">Create a new user account with full configuration</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-400" />
              <span>Basic Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username (optional)"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password (min 8 characters)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* User Level & Role */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span>User Level & Role</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User Level *
                </label>
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={(e) => handleTierChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {levels.map(level => (
                    <option key={level.name} value={level.name}>
                      {level.display_name} - {level.credits_monthly} credits/month
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">Regular User</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Credits Balance
                </label>
                <input
                  type="number"
                  name="credits_balance"
                  value={formData.credits_balance}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Initial credits"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monthly Limit
                </label>
                <input
                  type="number"
                  name="monthly_limit"
                  value={formData.monthly_limit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Monthly usage limit"
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span>Account Settings</span>
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-300">Account is active</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="onboarding_completed"
                  checked={formData.onboarding_completed}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-300">Onboarding completed</span>
              </label>
            </div>
          </div>

          {/* CopyAlchemist Lab Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>CopyAlchemist Lab Features</span>
            </h3>
            <p className="text-gray-400 text-sm">Override level-based features for this specific user</p>
            
            {Object.entries(availableFeatures).map(([category, features]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-md font-medium text-gray-300 capitalize">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {features.map(feature => (
                    <div key={feature.feature_name} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedFeatures[feature.feature_name]?.is_enabled || false}
                        onChange={() => handleFeatureToggle(feature.feature_name, feature.feature_category)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <span className="text-white text-sm">{feature.feature_name}</span>
                        {selectedFeatures[feature.feature_name]?.is_enabled && (
                          <div className="mt-2">
                            <input
                              type="number"
                              placeholder="Usage limit"
                              value={selectedFeatures[feature.feature_name]?.usage_limit || ''}
                              onChange={(e) => handleFeatureLimitChange(feature.feature_name, e.target.value)}
                              className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Workflow Assignments */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Workflow className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Workflow Assignments</h3>
            </div>
            
            {availableWorkflows.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  Select workflows to assign to this user (overrides level-based assignments)
                </p>
                {availableWorkflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`workflow-${workflow.id}`}
                      checked={selectedWorkflows.includes(workflow.id)}
                      onChange={() => handleWorkflowToggle(workflow.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor={`workflow-${workflow.id}`} className="text-sm">
                      <span className="font-medium">{workflow.name}</span>
                      <span className="text-gray-400 ml-2">({workflow.category})</span>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400 mb-2">No workflows available yet</p>
                <p className="text-xs text-gray-500">
                  Workflows will be automatically assigned based on user level
                </p>
              </div>
            )}
          </div>

          {/* Email & Communication */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Send className="w-5 h-5 text-purple-400" />
              <span>Email & Communication</span>
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendConfirmationEmail}
                  onChange={(e) => setSendConfirmationEmail(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-300">Send confirmation email</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendWelcomeEmail}
                  onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-300">Send welcome email with login instructions</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetPasswordOnFirstLogin}
                  onChange={(e) => setResetPasswordOnFirstLogin(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-300">Force password reset on first login</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={() => handleLoginAsUser(formData.email, formData.password)}
              disabled={!formData.email || !formData.password}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:cursor-not-allowed"
            >
              <User className="w-4 h-4" />
              <span>Login as User</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating User...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Create User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddUserModal
