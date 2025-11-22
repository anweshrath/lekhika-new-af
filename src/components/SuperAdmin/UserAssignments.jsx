import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Crown, 
  Shield, 
  User,
  Settings,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

const UserAssignments = ({ engines, onShowAssignModal }) => {
  const [users, setUsers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserAssignments()
  }, [engines])

  const loadUserAssignments = async () => {
    try {
      // Simulate loading user assignments
      const mockUsers = [
        {
          id: 'user_1',
          name: 'John Doe',
          email: 'john@example.com',
          tier: 'expert',
          assignedEngines: ['engine_1', 'engine_2'],
          status: 'active',
          lastActive: '2024-01-15T10:30:00Z'
        },
        {
          id: 'user_2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          tier: 'enterprise',
          assignedEngines: ['engine_1', 'engine_3'],
          status: 'active',
          lastActive: '2024-01-14T15:45:00Z'
        },
        {
          id: 'user_3',
          name: 'Bob Wilson',
          email: 'bob@example.com',
          tier: 'hobby',
          assignedEngines: ['engine_2'],
          status: 'inactive',
          lastActive: '2024-01-10T09:15:00Z'
        }
      ]

      const mockAssignments = [
        {
          id: 'assign_1',
          userId: 'user_1',
          engineId: 'engine_1',
          assignedAt: '2024-01-10T12:00:00Z',
          permissions: ['read', 'execute']
        },
        {
          id: 'assign_2',
          userId: 'user_1',
          engineId: 'engine_2',
          assignedAt: '2024-01-12T14:30:00Z',
          permissions: ['read', 'execute', 'configure']
        }
      ]

      setUsers(mockUsers)
      setAssignments(mockAssignments)
    } catch (error) {
      console.error('Failed to load user assignments:', error)
      toast.error('Failed to load user assignments')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = filterTier === 'all' || user.tier === filterTier
    
    return matchesSearch && matchesTier
  })

  const getUserEngines = (userId) => {
    const user = users.find(u => u.id === userId)
    if (!user) return []
    
    return user.assignedEngines.map(engineId => 
      engines.find(e => e.id === engineId)
    ).filter(Boolean)
  }

  const removeEngineAssignment = async (userId, engineId) => {
    if (!confirm('Are you sure you want to remove this engine assignment?')) return

    try {
      // Simulate API call
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, assignedEngines: user.assignedEngines.filter(id => id !== engineId) }
          : user
      ))
      
      toast.success('Engine assignment removed')
    } catch (error) {
      toast.error('Failed to remove assignment')
    }
  }

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'enterprise': return Crown
      case 'expert': return Shield
      default: return User
    }
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case 'enterprise': return 'text-purple-400 bg-purple-900/20'
      case 'expert': return 'text-blue-400 bg-blue-900/20'
      default: return 'text-green-400 bg-green-900/20'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Engine Assignments</h2>
          <p className="text-gray-400">Manage which users can access specific AI engines</p>
        </div>
        
        <button
          onClick={onShowAssignModal}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Tiers</option>
            <option value="hobby">Hobby</option>
            <option value="expert">Expert</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Users Found</h3>
            <p className="text-gray-400">No users match your current filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredUsers.map((user) => {
              const TierIcon = getTierIcon(user.tier)
              const userEngines = getUserEngines(user.id)
              
              return (
                <div key={user.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-white">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getTierColor(user.tier)}`}>
                            <TierIcon className="w-3 h-3" />
                            <span className="capitalize">{user.tier}</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${
                            user.status === 'active' ? 'text-green-400' : 'text-gray-500'
                          }`}>
                            {user.status === 'active' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            <span className="text-xs capitalize">{user.status}</span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-gray-500 text-xs">
                          Last active: {new Date(user.lastActive).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-400">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Assigned Engines */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                      Assigned Engines ({userEngines.length})
                    </h4>
                    
                    {userEngines.length === 0 ? (
                      <div className="text-center py-6 bg-gray-700/50 rounded-lg">
                        <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No engines assigned</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {userEngines.map((engine) => (
                          <div key={engine.id} className="bg-gray-700 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  engine.active ? 'bg-green-400' : 'bg-gray-500'
                                }`}></div>
                                <span className="text-white text-sm font-medium">
                                  {engine.name}
                                </span>
                              </div>
                              
                              <button
                                onClick={() => removeEngineAssignment(user.id, engine.id)}
                                className="text-gray-400 hover:text-red-400"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <p className="text-gray-400 text-xs mb-2">
                              {engine.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">
                                {engine.models.length} models
                              </span>
                              <span className={`capitalize ${
                                engine.tier === 'enterprise' ? 'text-purple-400' :
                                engine.tier === 'expert' ? 'text-blue-400' : 'text-green-400'
                              }`}>
                                {engine.tier}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserAssignments
