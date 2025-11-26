import React, { useState, useEffect } from 'react'
import { 
  Users, Search, Filter, Eye, Edit, Trash2, 
  UserPlus, Shield, Key, LogIn, Activity,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle,
  Clock, Mail, Phone, Calendar, Settings, Lock,
  UserCheck, UserX, Crown, Star, Zap, Database
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [expandedUsers, setExpandedUsers] = useState(new Set())
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byLevel: {}
  })

  useEffect(() => {
    fetchUsers()
    fetchLevels()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          levels:level_id (
            id,
            name,
            display_name,
            tier_level
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setUsers(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const fetchLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('tier_level')

      if (error) throw error
      setLevels(data || [])
    } catch (error) {
      console.error('Error fetching levels:', error)
      toast.error('Failed to fetch levels')
    }
  }

  const calculateStats = (userData) => {
    const stats = {
      total: userData.length,
      active: userData.filter(u => u.is_active).length,
      inactive: userData.filter(u => !u.is_active).length,
      byLevel: {}
    }

    userData.forEach(user => {
      const levelName = user.levels?.name || 'No Level'
      stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1
    })

    setUserStats(stats)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLevel = selectedLevel === 'all' || user.levels?.name === selectedLevel

    return matchesSearch && matchesLevel
  })

  const loginAsUser = async (user) => {
    try {
      // Create a session for the user
      const sessionData = {
        user_id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        tier: user.tier,
        access_level: user.access_level,
        login_time: new Date().toISOString(),
        admin_login: true // Flag to indicate this was an admin login
      }

      const { data: sessionId, error } = await supabase
        .rpc('create_user_session', {
          p_user_id: user.id,
          p_session_data: sessionData,
          p_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })

      if (error) throw error

      // Store session in localStorage for the new tab
      const sessionInfo = {
        sessionId,
        userData: sessionData,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isAdminLogin: true
      }

      // Open new tab with user session
      const newWindow = window.open('/app/dashboard', '_blank')
      
      // Wait for window to load, then set session
      setTimeout(() => {
        if (newWindow && !newWindow.closed) {
          newWindow.localStorage.setItem('user_session', JSON.stringify(sessionInfo))
          newWindow.location.reload()
        }
      }, 1000)

      toast.success(`Logged in as ${user.username || user.email}`)
    } catch (error) {
      console.error('Error logging in as user:', error)
      toast.error('Failed to login as user')
    }
  }

  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedUsers(newExpanded)
  }

  const getLevelColor = (levelName) => {
    const colors = {
      'freemium': 'bg-gray-100 text-gray-800',
      'hobby': 'bg-blue-100 text-blue-800',
      'pro': 'bg-purple-100 text-purple-800',
      'macdaddy': 'bg-yellow-100 text-yellow-800',
      'byok': 'bg-red-100 text-red-800'
    }
    return colors[levelName] || 'bg-gray-100 text-gray-800'
  }

  const getLevelIcon = (levelName) => {
    const icons = {
      'freemium': Users,
      'hobby': Star,
      'pro': Zap,
      'macdaddy': Crown,
      'byok': Shield
    }
    return icons[levelName] || Users
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">👥 User Management</h2>
          <p className="text-gray-400 mt-1">Fort Knox level user management with login capabilities</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{userStats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Users</p>
              <p className="text-2xl font-bold text-green-500">{userStats.active}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Inactive Users</p>
              <p className="text-2xl font-bold text-red-500">{userStats.inactive}</p>
            </div>
            <UserX className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Levels</p>
              <p className="text-2xl font-bold text-purple-500">{levels.length}</p>
            </div>
            <Database className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Levels</option>
              {levels.map(level => (
                <option key={level.id} value={level.name}>
                  {level.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => {
                const LevelIcon = getLevelIcon(user.levels?.name)
                const isExpanded = expandedUsers.has(user.id)
                
                return (
                  <React.Fragment key={user.id}>
                    <tr className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.full_name || 'No Name'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {user.email}
                            </div>
                            {user.username && (
                              <div className="text-xs text-gray-500">
                                @{user.username}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {user.levels ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(user.levels.name)}`}>
                            <LevelIcon className="w-3 h-3 mr-1" />
                            {user.levels.display_name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            No Level
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {user.is_active ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <UserX className="w-4 h-4 text-red-500 mr-2" />
                          )}
                          <span className={`text-sm ${user.is_active ? 'text-green-400' : 'text-red-400'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {user.last_login ? (
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(user.last_login).toLocaleDateString()}
                          </div>
                        ) : (
                          'Never'
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => loginAsUser(user)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            title="Login as User"
                          >
                            <LogIn className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowUserModal(true)
                            }}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => toggleUserExpansion(user.id)}
                            className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            title="Toggle Details"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr className="bg-gray-750">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-2">Account Details</h4>
                              <div className="space-y-1 text-sm text-gray-400">
                                <div><strong>Role:</strong> {user.role}</div>
                                <div><strong>Tier:</strong> {user.tier}</div>
                                <div><strong>Access Level:</strong> {user.access_level}</div>
                                <div><strong>Credits:</strong> {user.credits_balance}</div>
                                <div><strong>Monthly Limit:</strong> {user.monthly_limit}</div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-2">Activity</h4>
                              <div className="space-y-1 text-sm text-gray-400">
                                <div><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</div>
                                <div><strong>Last Login:</strong> {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</div>
                                <div><strong>Onboarding:</strong> {user.onboarding_completed ? 'Completed' : 'Pending'}</div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-2">Quick Actions</h4>
                              <div className="space-y-2">
                                <button
                                  onClick={() => loginAsUser(user)}
                                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                                >
                                  <LogIn className="w-4 h-4" />
                                  <span>Login as User</span>
                                </button>
                                
                                <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm">
                                  <Edit className="w-4 h-4" />
                                  <span>Edit User</span>
                                </button>
                                
                                <button className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm">
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete User</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserManagement
