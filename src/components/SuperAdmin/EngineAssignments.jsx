import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Crown, 
  Star, 
  Rocket, 
  Plus, 
  Trash2, 
  Edit3, 
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  User,
  Shield
} from 'lucide-react'
import { engineAssignmentService } from '../../services/engineAssignmentService'
import { engineDeploymentService } from '../../services/engineDeploymentService'
import toast from 'react-hot-toast'

const EngineAssignments = () => {
  const [assignments, setAssignments] = useState([])
  const [engines, setEngines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterTier, setFilterTier] = useState('all')
  const [stats, setStats] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [assignmentsData, enginesData, statsData] = await Promise.all([
        engineAssignmentService.getEngineAssignments(),
        engineDeploymentService.getAllEngines(),
        engineAssignmentService.getAssignmentStats()
      ])
      
      setAssignments(assignmentsData)
      setEngines(enginesData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading assignment data:', error)
      toast.error('Failed to load assignment data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm('Are you sure you want to remove this assignment?')) {
      return
    }

    try {
      await engineAssignmentService.removeEngineAssignment(assignmentId)
      toast.success('Assignment removed successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to remove assignment')
    }
  }

  const handleUpdatePriority = async (assignmentId, newPriority) => {
    try {
      await engineAssignmentService.updateAssignmentPriority(assignmentId, newPriority)
      toast.success('Priority updated successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to update priority')
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.ai_engines?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.tier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || assignment.assignment_type === filterType
    const matchesTier = filterTier === 'all' || assignment.tier === filterTier
    
    return matchesSearch && matchesType && matchesTier
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
      default: return Shield
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
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">👥 Engine Assignments</h1>
            <p className="text-purple-100">Manage engine assignments to users and tiers</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 backdrop-blur-sm"
          >
            <Plus className="w-5 h-5" />
            <span>New Assignment</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-purple-200" />
              <div>
                <div className="text-2xl font-bold">{stats.totalAssignments}</div>
                <div className="text-sm text-purple-200">Total Assignments</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-200" />
              <div>
                <div className="text-2xl font-bold">{stats.tierAssignments}</div>
                <div className="text-sm text-purple-200">Tier Assignments</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8 text-green-200" />
              <div>
                <div className="text-2xl font-bold">{stats.userAssignments}</div>
                <div className="text-sm text-purple-200">User Assignments</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <Rocket className="w-8 h-8 text-yellow-200" />
              <div>
                <div className="text-2xl font-bold">{engines.filter(e => e.active).length}</div>
                <div className="text-sm text-purple-200">Active Engines</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="tier">Tier Assignments</option>
              <option value="user">User Assignments</option>
            </select>
            
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
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Engine
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Assignment Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => {
                const TierIcon = getTierIcon(assignment.tier)
                
                return (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Rocket className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.ai_engines?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.ai_engines?.description?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {assignment.assignment_type === 'tier' ? (
                          <Shield className="w-4 h-4 text-blue-500 mr-2" />
                        ) : (
                          <User className="w-4 h-4 text-green-500 mr-2" />
                        )}
                        <span className="text-sm font-medium capitalize">
                          {assignment.assignment_type}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignment.assignment_type === 'tier' ? (
                        <div className="flex items-center">
                          <TierIcon className="w-4 h-4 mr-2" />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTierColor(assignment.tier)}`}>
                            {assignment.tier?.toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {assignment.profiles?.full_name || assignment.profiles?.email || 'Unknown User'}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={assignment.priority}
                        onChange={(e) => handleUpdatePriority(assignment.id, parseInt(e.target.value))}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {assignment.active ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-700">Active</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                            <span className="text-sm text-red-700">Inactive</span>
                          </>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' || filterTier !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first engine assignment'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <CreateAssignmentModal
          engines={engines}
          onClose={() => setShowCreateModal(false)}
          onAssignmentCreated={() => {
            loadData()
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}

// Create Assignment Modal Component
const CreateAssignmentModal = ({ engines, onClose, onAssignmentCreated }) => {
  const [selectedEngine, setSelectedEngine] = useState('')
  const [assignmentType, setAssignmentType] = useState('tier')
  const [selectedTier, setSelectedTier] = useState('hobby')
  const [selectedUser, setSelectedUser] = useState('')
  const [priority, setPriority] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    try {
      setLoading(true)
      
      if (assignmentType === 'tier') {
        await engineAssignmentService.assignEngineToTier(selectedEngine, selectedTier, priority)
        toast.success(`Engine assigned to ${selectedTier} tier`)
      } else {
        if (!selectedUser) {
          toast.error('Please select a user')
          return
        }
        await engineAssignmentService.assignEngineToUser(selectedEngine, selectedUser, priority)
        toast.success('Engine assigned to user')
      }
      
      onAssignmentCreated()
    } catch (error) {
      toast.error('Failed to create assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Create Engine Assignment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Engine
            </label>
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an engine...</option>
              {engines.filter(e => e.active).map(engine => (
                <option key={engine.id} value={engine.id}>
                  {engine.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Type
            </label>
            <select
              value={assignmentType}
              onChange={(e) => setAssignmentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tier">Assign to Tier</option>
              <option value="user">Assign to User</option>
            </select>
          </div>

          {assignmentType === 'tier' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tier
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="hobby">Hobby</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User
              </label>
              <input
                type="text"
                placeholder="Enter user ID or email..."
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority (0-10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !selectedEngine}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EngineAssignments
