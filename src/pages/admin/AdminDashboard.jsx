import React, { useState, useEffect } from 'react'
import { 
  Users, 
  BookOpen, 
  Settings, 
  BarChart3, 
  Crown, 
  Zap,
  Shield,
  Activity,
  Database,
  Key,
  Layers
} from 'lucide-react'
import UserManagement from '../../components/admin/UserManagement'
import BookManagement from '../../components/admin/BookManagement'
import SystemSettings from '../../components/admin/SystemSettings'
import Analytics from '../../components/admin/Analytics'
import TierManagement from '../../components/admin/TierManagement'
import APIKeyManagement from '../../components/admin/APIKeyManagement'
import AIEnginePlayground from '../../components/admin/AIEnginePlayground'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('engines')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    activeUsers: 0,
    systemHealth: 100
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminAccess()
    loadStats()
  }, [user])

  const checkAdminAccess = async () => {
    if (!user) return

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.')
        window.location.href = '/dashboard'
        return
      }
    } catch (error) {
      console.error('Admin access check failed:', error)
      toast.error('Failed to verify admin access')
    }
  }

  const loadStats = async () => {
    try {
      // Load user stats
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at, last_sign_in_at')

      if (usersError) throw usersError

      // Load book stats
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('id, created_at, status')

      if (booksError) throw booksError

      // Calculate stats
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const activeUsers = users?.filter(user => 
        user.last_sign_in_at && new Date(user.last_sign_in_at) > thirtyDaysAgo
      ).length || 0

      setStats({
        totalUsers: users?.length || 0,
        totalBooks: books?.length || 0,
        activeUsers,
        systemHealth: 98 // This would be calculated based on actual system metrics
      })

    } catch (error) {
      console.error('Failed to load stats:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'engines', label: 'AI Engines', icon: Layers, component: AIEnginePlayground },
    { id: 'users', label: 'Users', icon: Users, component: UserManagement },
    { id: 'books', label: 'Books', icon: BookOpen, component: BookManagement },
    { id: 'tiers', label: 'Tiers', icon: Crown, component: TierManagement },
    { id: 'api-keys', label: 'API Keys', icon: Key, component: APIKeyManagement },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, component: Analytics },
    { id: 'settings', label: 'Settings', icon: Settings, component: SystemSettings }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">System management and configuration</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Activity className="w-4 h-4" />
                <span>System Health: {stats.systemHealth}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalBooks}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.systemHealth}%</p>
              </div>
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
