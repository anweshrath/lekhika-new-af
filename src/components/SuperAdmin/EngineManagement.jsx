import React, { useState, useEffect } from 'react'
import { 
  Rocket, 
  Settings, 
  Users, 
  Crown, 
  Star, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Play, 
  Pause, 
  BarChart3,
  Zap,
  Target,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react'
import { engineDeploymentService } from '../../services/engineDeploymentService'
import { engineAssignmentService } from '../../services/engineAssignmentService'
import toast from 'react-hot-toast'

const EngineManagement = () => {
  const [engines, setEngines] = useState([])
  const [assignments, setAssignments] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedEngine, setSelectedEngine] = useState(null)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [enginesData, assignmentsData, statsData] = await Promise.all([
        engineDeploymentService.getAllEngines(),
        engineAssignmentService.getEngineAssignments(),
        engineDeploymentService.getEngineStats()
      ])
      
      setEngines(enginesData)
      setAssignments(assignmentsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading engine data:', error)
      toast.error('Failed to load engine data')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleEngine = async (engineId, currentStatus) => {
    try {
      await engineDeploymentService.updateEngine(engineId, { active: !currentStatus })
      toast.success(`Engine ${!currentStatus ? 'activated' : 'deactivated'}`)
      loadData()
    } catch (error) {
      toast.error('Failed to update engine status')
    }
  }

  const handleDuplicateEngine = async (engineId) => {
    try {
      await engineDeploymentService.duplicateEngine(engineId)
      toast.success('Engine duplicated successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to duplicate engine')
    }
  }

  const handleDeleteEngine = async (engineId) => {
    if (!confirm('Are you sure you want to delete this engine? This action cannot be undone.')) {
      return
    }

    try {
      await engineDeploymentService.deleteEngine(engineId)
      toast.success('Engine deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete engine')
    }
  }

  const filteredEngines = engines.filter(engine => {
    const matchesSearch = engine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engine.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = filterTier === 'all' || engine.tier === filterTier
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && engine.active) ||
                         (filterStatus === 'inactive' && !engine.active)
    
    return matchesSearch && matchesTier && matchesStatus
  })

  const getTierColor = (tier) => {
    switch (tier) {
      case 'hobby': return 'bg-green-100 text-green-800 border-green-200'
      case 'pro': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'enterprise': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'hobby': return Star
      case 'pro': return Crown
      case 'enterprise': return Rocket
      default: return Target
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">🚀 Engine Management</h1>
            <p className="text-blue-100">Deploy, manage, and assign AI engines to users and tiers</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <Rocket className="w-8 h-8 text-blue-200" />
              <div>
                <div className="text-2xl font-bold">{stats.totalEngines}</div>
                <div className="text-sm text-blue-200">Total Engines</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-300" />
              <div>
                <div className="text-2xl font-bold">{stats.activeEngines}</div>
                <div className="text-sm text-blue-200">Active Engines</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-yellow-300" />
              <div>
                <div className="text-2xl font-bold">{stats.totalExecutions}</div>
                <div className="text-sm text-blue-200">Total Executions</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-green-300" />
              <div>
                <div className="text-2xl font-bold">${stats.totalCostEstimate?.toFixed(2) || '0.00'}</div>
                <div className="text-sm text-blue-200">Est. Cost (30d)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search engines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tiers</option>
              <option value="hobby">Hobby</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Engines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEngines.map((engine) => {
          const TierIcon = getTierIcon(engine.tier)
          const modelCount = Array.isArray(engine.models) ? engine.models.length : 0
          const stepCount = engine.flow_config?.steps?.length || 0
          
          return (
            <div key={engine.id} className="bg-white rounded-2xl border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                      engine.active 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      <TierIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-xl">{engine.name}</h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getTierColor(engine.tier)}`}>
                          {engine.tier?.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                          ID: {engine.id?.slice(0, 8)}...
                        </span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                          engine.active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            engine.active ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span>{engine.active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {engine.description || 'No description provided'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{modelCount}</div>
                    <div className="text-xs text-blue-600 font-medium">AI Models</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{stepCount}</div>
                    <div className="text-xs text-purple-600 font-medium">Process Steps</div>
                  </div>
                </div>

                {/* Models Preview */}
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-3">AI Models:</div>
                  <div className="flex flex-wrap gap-2">
                    {(engine.models || []).slice(0, 3).map((model, index) => (
                      <span key={index} className="px-3 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                        {model.service}
                      </span>
                    ))}
                    {modelCount > 3 && (
                      <span className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                        +{modelCount - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleToggleEngine(engine.id, engine.active)}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                      engine.active
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-red-200'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-green-200'
                    }`}
                  >
                    {engine.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{engine.active ? 'Deactivate' : 'Activate'}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedEngine(engine)
                      setShowAssignmentModal(true)
                    }}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-200"
                  >
                    <Users className="w-4 h-4" />
                    <span>Assign</span>
                  </button>
                  
                  <button
                    onClick={() => handleDuplicateEngine(engine.id)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl text-sm font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-gray-200"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteEngine(engine.id)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredEngines.length === 0 && (
        <div className="text-center py-12">
          <Rocket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No engines found</h3>
          <p className="text-gray-500">
            {searchTerm || filterTier !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Deploy your first engine from Content Flows'
            }
          </p>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && selectedEngine && (
        <EngineAssignmentModal
          engine={selectedEngine}
          onClose={() => {
            setShowAssignmentModal(false)
            setSelectedEngine(null)
          }}
          onAssignmentComplete={() => {
            loadData()
            setShowAssignmentModal(false)
            setSelectedEngine(null)
          }}
        />
      )}
    </div>
  )
}

// Engine Assignment Modal Component
const EngineAssignmentModal = ({ engine, onClose, onAssignmentComplete }) => {
  const [assignmentType, setAssignmentType] = useState('level')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [levels, setLevels] = useState([])
  const [loadingLevels, setLoadingLevels] = useState(false)

  useEffect(() => {
    loadLevels()
    if (assignmentType === 'user') {
      loadUsers()
    }
  }, [assignmentType])

  const loadLevels = async () => {
    try {
      setLoadingLevels(true)
      // Load levels from your levels service
      const response = await fetch('/api/levels')
      if (response.ok) {
        const levelsData = await response.json()
        setLevels(levelsData)
      }
    } catch (error) {
      console.error('Error loading levels:', error)
      toast.error('Failed to load levels')
    } finally {
      setLoadingLevels(false)
    }
  }

  const loadUsers = async () => {
    try {
      // Load users from your user service
      const response = await fetch('/api/users')
      if (response.ok) {
        const usersData = await response.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    }
  }

  const handleAssign = async () => {
    try {
      setLoading(true)
      
      if (assignmentType === 'level') {
        await engineAssignmentService.assignEngineToLevel(engine.id, selectedLevel)
        toast.success(`Engine assigned to level successfully`)
      } else {
        await engineAssignmentService.assignEngineToUser(engine.id, selectedUser)
        toast.success('Engine assigned to user successfully')
      }
      
      onAssignmentComplete()
    } catch (error) {
      console.error('Assignment error:', error)
      toast.error('Failed to assign engine')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">🚀 Assign Engine</h3>
              <p className="text-blue-100">Engine ID: {engine.id?.slice(0, 8)}...</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/20 rounded-xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Engine Info */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{engine.name}</h4>
                <p className="text-sm text-gray-600">{engine.description || 'No description'}</p>
              </div>
            </div>
          </div>

          {/* Assignment Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Assignment Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAssignmentType('level')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  assignmentType === 'level'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Crown className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Assign to Level</div>
                <div className="text-xs text-gray-500">All users in level</div>
              </button>
              <button
                onClick={() => setAssignmentType('user')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  assignmentType === 'user'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Assign to User</div>
                <div className="text-xs text-gray-500">Specific user</div>
              </button>
            </div>
          </div>

          {/* Level/User Selection */}
          {assignmentType === 'level' ? (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Select Level
              </label>
              {loadingLevels ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                >
                  <option value="">Choose a level...</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name} - {level.description}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Select User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              >
                <option value="">Choose a user...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || (assignmentType === 'level' && !selectedLevel) || (assignmentType === 'user' && !selectedUser)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Assigning...</span>
              </div>
            ) : (
              'Assign Engine'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EngineManagement
