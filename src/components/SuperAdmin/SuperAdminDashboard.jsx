import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import PricingScraper from '../PricingScraper'
import { 
  Users, 
  Settings, 
  Activity, 
  TrendingUp, 
  Database,
  Cpu,
  Network,
  Zap,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

// Import existing components
import UserManagement from './UserManagement'
import SystemConfiguration from './SystemConfiguration'
import AIServiceManagement from './AIServiceManagement'
import ContentCreationFlow from './ContentCreationFlow'
import AIPlayground from './AIPlayground'
import AnalyticsOverview from './AnalyticsOverview'
import DebugLogs from './DebugLogs'

// Import new orchestration component
import OrchestrationDashboard from './OrchestrationDashboard'
import WorkerControlDashboard from './WorkerControlDashboard'

// Import services
import { userService } from '../../services/userService'
import { analyticsService } from '../../services/analyticsService'

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBooks: 0,
    systemHealth: 'healthy'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSystemStats()
  }, [])

  const loadSystemStats = async () => {
    try {
      const [usersData, analyticsData] = await Promise.all([
        userService.getAllUsers(),
        analyticsService.getSystemAnalytics()
      ])

      setSystemStats({
        totalUsers: usersData.length,
        activeUsers: usersData.filter(user => 
          new Date(user.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        totalBooks: analyticsData.totalBooks || 0,
        systemHealth: 'healthy'
      })
    } catch (error) {
      console.error('Failed to load system stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getHealthIcon = (health) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />
      case 'warning': return <AlertTriangle className="h-5 w-5" />
      case 'critical': return <AlertTriangle className="h-5 w-5" />
      default: return <Activity className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Lekhika Logo */}
          <div className="flex items-center justify-center">
            <img 
              src="/src/components/img/11.png" 
              alt="LEKHIKA Logo"
              className="h-12 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">SuperAdmin</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 ${getHealthColor(systemStats.systemHealth)}`}>
            {getHealthIcon(systemStats.systemHealth)}
            <span className="font-medium">System {systemStats.systemHealth}</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
            Overview
          </TabsTrigger>
          <TabsTrigger value="orchestration" className="data-[state=active]:bg-gray-700">
            Orchestration
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-gray-700">
            Users
          </TabsTrigger>
          <TabsTrigger value="ai-services" className="data-[state=active]:bg-gray-700">
            AI Services
          </TabsTrigger>
          <TabsTrigger value="workflows" className="data-[state=active]:bg-gray-700">
            Workflows
          </TabsTrigger>
          <TabsTrigger value="playground" className="data-[state=active]:bg-gray-700">
            Playground
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-700">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-gray-700">
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-white">{systemStats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-4">
                  <Badge variant="outline" className="text-xs">
                    {systemStats.activeUsers} active this week
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Books</p>
                    <p className="text-2xl font-bold text-white">{systemStats.totalBooks}</p>
                  </div>
                  <Database className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-4">
                  <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                    +12% this month
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">AI Orchestration</p>
                    <p className="text-2xl font-bold text-white">Active</p>
                  </div>
                  <Cpu className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-4">
                  <Badge variant="outline" className="text-xs text-purple-400 border-purple-400">
                    Multi-Agent Ready
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">System Load</p>
                    <p className="text-2xl font-bold text-white">Normal</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-500" />
                </div>
                <div className="mt-4">
                  <Badge variant="outline" className="text-xs">
                    All systems operational
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setActiveTab('orchestration')}
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <Network className="h-6 w-6" />
                  <span className="text-sm">Orchestration</span>
                </Button>
                <Button 
                  onClick={() => setActiveTab('users')}
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Manage Users</span>
                </Button>
                <Button 
                  onClick={() => setActiveTab('workflows')}
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <Zap className="h-6 w-6" />
                  <span className="text-sm">Create Workflow</span>
                </Button>
                <Button 
                  onClick={() => setActiveTab('analytics')}
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">View Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent System Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white">Multi-agent orchestration system initialized</span>
                  </div>
                  <span className="text-gray-400 text-sm">2 minutes ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-white">New workflow template created</span>
                  </div>
                  <span className="text-gray-400 text-sm">15 minutes ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-white">Resource allocation optimized</span>
                  </div>
                  <span className="text-gray-400 text-sm">1 hour ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orchestration">
          <OrchestrationDashboard />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="ai-services">
          <AIServiceManagement />
        </TabsContent>

        <TabsContent value="workflows">
          <ContentCreationFlow />
        </TabsContent>

        <TabsContent value="playground">
          <AIPlayground />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsOverview />
        </TabsContent>

        <TabsContent value="system">
          <div className="space-y-6">
            <WorkerControlDashboard />
            <SystemConfiguration />
            <DebugLogs />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SuperAdminDashboard
