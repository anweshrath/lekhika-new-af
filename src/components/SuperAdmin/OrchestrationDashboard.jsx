import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Progress } from '../ui/progress'
import { 
  Activity, 
  Cpu, 
  Network, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw
} from 'lucide-react'
// Legacy orchestration services removed
// import { orchestrationService } from '../../services/orchestrationService'
// import { parallelExecutionEngine } from '../../services/orchestration/parallelExecutionEngine'
// import { agentCommunicationProtocol } from '../../services/orchestration/agentCommunicationProtocol'
// import { dynamicResourceAllocator } from '../../services/orchestration/dynamicResourceAllocator'

const OrchestrationDashboard = () => {
  const [orchestrationStats, setOrchestrationStats] = useState({
    activeExecutions: 0,
    totalExecutions: 0,
    averageExecutionTime: 0,
    successRate: 0,
    resourceUtilization: 0
  })

  const [communicationStats, setCommunicationStats] = useState({
    totalChannels: 0,
    totalMessages: 0,
    activeAgents: 0,
    messageRate: 0
  })

  const [resourceStats, setResourceStats] = useState({
    totalPools: 0,
    activeAllocations: 0,
    averageCost: 0,
    overallHealth: 'healthy'
  })

  const [activeExecutions, setActiveExecutions] = useState([])
  const [resourceStatus, setResourceStatus] = useState({})
  const [communicationChannels, setCommunicationChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    initializeOrchestration()
    loadOrchestrationData()
    
    const interval = setInterval(loadOrchestrationData, 60000)
    return () => clearInterval(interval)
  }, [])

  const initializeOrchestration = async () => {
    try {
      console.log('🚀 Initializing orchestration services...')
      
      // Legacy orchestration services removed
      // await agentCommunicationProtocol.initialize()
      // dynamicResourceAllocator.startMonitoring()
      // await orchestrationService.initialize()
      
      console.log('✅ Orchestration services initialized')
    } catch (error) {
      console.error('❌ Failed to initialize orchestration:', error)
    }
  }

  const loadOrchestrationData = async () => {
    try {
      // Legacy orchestration services removed - using mock data
      const executionStats = {
        activeExecutions: 0,
        totalExecutions: 0,
        averageExecutionTime: 0,
        successRate: 100,
        resourceUtilization: 0
      }
      setOrchestrationStats(executionStats)

      const commStats = {
        totalChannels: 0,
        totalMessages: 0,
        totalSubscriptions: 0
      }
      setCommunicationStats({
        totalChannels: commStats.totalChannels,
        totalMessages: commStats.totalMessages,
        activeAgents: commStats.totalSubscriptions,
        messageRate: commStats.totalMessages / 60 // messages per minute approximation
      })

      // Get real resource stats
      const resourceData = dynamicResourceAllocator.getResourceStatus()
      setResourceStats({
        totalPools: Object.keys(resourceData.pools).length,
        activeAllocations: Object.values(resourceData.pools).reduce((sum, pool) => sum + pool.activeAllocations, 0),
        averageCost: await calculateAverageCost(),
        overallHealth: resourceData.overallHealth
      })

      // Get active executions
      const activeExecs = await orchestrationService.getActiveExecutions()
      setActiveExecutions(activeExecs)

      // Get resource status
      setResourceStatus(resourceData)

      // Get communication channels
      const channels = agentCommunicationProtocol.getActiveChannels()
      setCommunicationChannels(channels)

      setLastUpdate(new Date())
      setLoading(false)

    } catch (error) {
      console.error('Failed to load orchestration data:', error)
      setLoading(false)
    }
  }

  const calculateAverageCost = async () => {
    try {
      const stats = dynamicResourceAllocator.getAllocationStatistics()
      return stats.averageCost || 0
    } catch (error) {
      return 0
    }
  }

  const handleStartMonitoring = async () => {
    try {
      setIsMonitoring(true)
      await orchestrationService.startMonitoring()
      dynamicResourceAllocator.startMonitoring(30000) // 30 seconds
      console.log('✅ Monitoring started')
    } catch (error) {
      console.error('❌ Failed to start monitoring:', error)
      setIsMonitoring(false)
    }
  }

  const handleStopMonitoring = async () => {
    try {
      setIsMonitoring(false)
      await orchestrationService.stopMonitoring()
      dynamicResourceAllocator.stopMonitoring()
      console.log('✅ Monitoring stopped')
    } catch (error) {
      console.error('❌ Failed to stop monitoring:', error)
    }
  }

  const handleTestExecution = async () => {
    try {
      console.log('🧪 Starting test execution...')
      
      const testWorkflow = {
        id: 'test-workflow-' + Date.now(),
        name: 'Test Multi-Agent Workflow',
        nodes: [
          {
            id: 'agent-1',
            type: 'aiAgent',
            data: {
              service: 'openai',
              model: 'gpt-4',
              prompt: 'Generate a creative story opening about space exploration.',
              parameters: { maxTokens: 500, temperature: 0.8 }
            }
          },
          {
            id: 'agent-2',
            type: 'aiAgent',
            data: {
              service: 'claude',
              model: 'claude-3-sonnet',
              prompt: 'Review and improve the story opening for clarity and engagement.',
              parameters: { maxTokens: 600, temperature: 0.6 }
            }
          },
          {
            id: 'quality-gate',
            type: 'qualityGate',
            data: {
              criteria: [
                { name: 'length', type: 'length', parameters: { minLength: 200, maxLength: 1000 } },
                { name: 'coherence', type: 'coherence', parameters: {} }
              ],
              threshold: 0.7
            }
          }
        ],
        connections: [
          { source: 'agent-1', target: 'agent-2' },
          { source: 'agent-2', target: 'quality-gate' }
        ]
      }

      const result = await parallelExecutionEngine.executeParallelWorkflow(
        testWorkflow.id,
        testWorkflow.nodes,
        testWorkflow.connections,
        { testMode: true }
      )

      console.log('✅ Test execution completed:', result)
      
      // Refresh data to show new execution
      await loadOrchestrationData()
      
    } catch (error) {
      console.error('❌ Test execution failed:', error)
    }
  }

  const handleTestCommunication = async () => {
    try {
      console.log('📡 Testing agent communication...')
      
      // Create test channel
      await agentCommunicationProtocol.createChannel('test-channel', ['agent-1', 'agent-2'], {
        persistent: false
      })

      // Send test messages
      await agentCommunicationProtocol.sendMessage('agent-1', 'agent-2', {
        type: 'test',
        content: 'Hello from Agent 1!',
        timestamp: Date.now()
      }, { channelId: 'test-channel' })

      await agentCommunicationProtocol.sendMessage('agent-2', 'agent-1', {
        type: 'test',
        content: 'Hello back from Agent 2!',
        timestamp: Date.now()
      }, { channelId: 'test-channel' })

      console.log('✅ Communication test completed')
      
      // Refresh data
      await loadOrchestrationData()
      
    } catch (error) {
      console.error('❌ Communication test failed:', error)
    }
  }

  const handleTestResourceAllocation = async () => {
    try {
      console.log('⚡ Testing resource allocation...')
      
      const testRequirements = {
        resourceType: 'ai',
        estimatedTokens: 1000,
        priority: 'high',
        service: 'openai'
      }

      const allocation = await dynamicResourceAllocator.allocateResources(
        'test-task-' + Date.now(),
        testRequirements,
        'adaptive'
      )

      console.log('✅ Resource allocation test completed:', allocation)
      
      // Release resources after a short delay
      setTimeout(async () => {
        await dynamicResourceAllocator.releaseResources(allocation.taskId, {
          success: true,
          tokensUsed: 800,
          responseTime: 2000,
          actualCost: 0.016
        })
        console.log('✅ Resources released')
        await loadOrchestrationData()
      }, 3000)
      
      // Refresh data
      await loadOrchestrationData()
      
    } catch (error) {
      console.error('❌ Resource allocation test failed:', error)
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
      case 'healthy': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Initializing orchestration services...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Multi-Agent Orchestration</h2>
          <p className="text-gray-400 mt-1">
            Advanced parallel execution and resource management
            {lastUpdate && (
              <span className="ml-2 text-xs">
                • Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleStartMonitoring} 
            variant="outline" 
            size="sm"
            disabled={isMonitoring}
          >
            <Play className="h-4 w-4 mr-2" />
            {isMonitoring ? 'Monitoring...' : 'Start Monitoring'}
          </Button>
          <Button 
            onClick={handleStopMonitoring} 
            variant="outline" 
            size="sm"
            disabled={!isMonitoring}
          >
            <Pause className="h-4 w-4 mr-2" />
            Stop Monitoring
          </Button>
          <Button onClick={loadOrchestrationData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Test Controls */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            System Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={handleTestExecution} variant="outline" size="sm">
              Test Execution
            </Button>
            <Button onClick={handleTestCommunication} variant="outline" size="sm">
              Test Communication
            </Button>
            <Button onClick={handleTestResourceAllocation} variant="outline" size="sm">
              Test Resources
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Executions</p>
                <p className="text-2xl font-bold text-white">{orchestrationStats.activeExecutions}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <Progress value={(orchestrationStats.activeExecutions / 20) * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {orchestrationStats.activeExecutions}/20 concurrent limit
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-white">
                  {(orchestrationStats.successRate * 100).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <Progress value={orchestrationStats.successRate * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {orchestrationStats.totalExecutions} total executions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg Execution Time</p>
                <p className="text-2xl font-bold text-white">
                  {(orchestrationStats.averageExecutionTime / 1000).toFixed(1)}s
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                {orchestrationStats.resourceUtilization > 0.8 ? 'High Load' : 'Normal'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">System Health</p>
                <p className={`text-2xl font-bold ${getHealthColor(resourceStats.overallHealth)}`}>
                  {resourceStats.overallHealth.charAt(0).toUpperCase() + resourceStats.overallHealth.slice(1)}
                </p>
              </div>
              <div className={getHealthColor(resourceStats.overallHealth)}>
                {getHealthIcon(resourceStats.overallHealth)}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                {resourceStats.totalPools} resource pools active
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="execution" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="execution" className="data-[state=active]:bg-gray-700">
            Parallel Execution
          </TabsTrigger>
          <TabsTrigger value="communication" className="data-[state=active]:bg-gray-700">
            Agent Communication
          </TabsTrigger>
          <TabsTrigger value="resources" className="data-[state=active]:bg-gray-700">
            Resource Allocation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="execution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Execution Engine Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Parallel Branches</span>
                    <Badge variant="outline">
                      {orchestrationStats.activeExecutions > 0 ? 'Active' : 'Idle'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Queue Length</span>
                    <span className="text-white">
                      {parallelExecutionEngine.getResourceUsage().queueLength}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Max Concurrent</span>
                    <span className="text-white">
                      {parallelExecutionEngine.maxConcurrentTasks}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Resource Utilization</span>
                    <div className="flex items-center gap-2">
                      <Progress value={orchestrationStats.resourceUtilization * 100} className="w-20 h-2" />
                      <span className="text-white text-sm">
                        {(orchestrationStats.resourceUtilization * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeExecutions.length > 0 ? (
                    activeExecutions.slice(0, 5).map((execution) => (
                      <div key={execution.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                        <div>
                          <p className="text-white text-sm font-medium">
                            {execution.workflowId || execution.id}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Status: {execution.status} • Started: {new Date(execution.startTime).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {execution.metrics?.completedNodes || 0}/{execution.metrics?.totalNodes || 0}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No active executions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Communication Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Active Channels</span>
                    <span className="text-white">{communicationStats.totalChannels}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Messages</span>
                    <span className="text-white">{communicationStats.totalMessages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Active Agents</span>
                    <span className="text-white">{communicationStats.activeAgents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Message Rate</span>
                    <span className="text-white">{communicationStats.messageRate.toFixed(1)}/min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Channels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {communicationChannels.length > 0 ? (
                    communicationChannels.slice(0, 5).map((channel) => (
                      <div key={channel.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                        <div>
                          <p className="text-white text-sm font-medium">{channel.id}</p>
                          <p className="text-gray-400 text-xs">
                            {channel.participants.size} participants • {channel.messageCount || 0} messages
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {channel.config.persistent ? 'Persistent' : 'Temporary'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No active channels</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Resource Pools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(resourceStatus.pools || {}).map(([poolId, pool]) => (
                    <div key={poolId} className="p-3 bg-gray-700 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{poolId}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            pool.load > 0.8 ? 'text-red-400 border-red-400' :
                            pool.load > 0.6 ? 'text-yellow-400 border-yellow-400' :
                            'text-green-400 border-green-400'
                          }`}
                        >
                          {(pool.load * 100).toFixed(0)}% Load
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Active Allocations</span>
                          <span className="text-white">{pool.activeAllocations}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Queue Length</span>
                          <span className="text-white">{pool.queueLength}</span>
                        </div>
                        <Progress value={pool.load * 100} className="h-1 mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cost Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Average Cost per Task</span>
                    <span className="text-white">
                      ${resourceStats.averageCost.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Active Allocations</span>
                    <span className="text-white">{resourceStats.activeAllocations}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Cost Efficiency</span>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      Optimal
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Resource Utilization</span>
                    <div className="flex items-center gap-2">
                      <Progress value={orchestrationStats.resourceUtilization * 100} className="w-20 h-2" />
                      <span className="text-white text-sm">
                        {(orchestrationStats.resourceUtilization * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default OrchestrationDashboard
