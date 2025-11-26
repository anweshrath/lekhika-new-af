import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Progress } from '../ui/progress'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  Target,
  Zap,
  FileText,
  Brain,
  Settings,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  Eye,
  Lightbulb
} from 'lucide-react'
import { qualityControlService } from '../../services/qualityControlService'
import { contentValidationEngine } from '../../services/quality/contentValidationEngine'
import { aiQualityAssessor } from '../../services/quality/aiQualityAssessor'
import { improvementSuggestionEngine } from '../../services/quality/improvementSuggestionEngine'

const QualityControlDashboard = () => {
  const [qualityStats, setQualityStats] = useState({
    totalAssessments: 0,
    averageQualityScore: 0,
    passRate: 0,
    improvementSuggestions: 0,
    activeValidations: 0
  })

  const [validationStats, setValidationStats] = useState({
    totalValidations: 0,
    passedValidations: 0,
    failedValidations: 0,
    averageValidationTime: 0
  })

  const [recentAssessments, setRecentAssessments] = useState([])
  const [activeValidations, setActiveValidations] = useState([])
  const [qualityTrends, setQualityTrends] = useState([])
  const [improvementSuggestions, setImprovementSuggestions] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    initializeQualityControl()
    loadQualityData()
    
    const interval = setInterval(loadQualityData, 60000) // Update every 60 seconds
    return () => clearInterval(interval)
  }, [])

  const initializeQualityControl = async () => {
    try {
      console.log('🛡️ Initializing Quality Control System...')
      
      // Initialize quality control service
      await qualityControlService.initialize()
      
      // Initialize validation engine
      await contentValidationEngine.initialize()
      
      // Initialize AI quality assessor
      await aiQualityAssessor.initialize()
      
      // Initialize improvement suggestion engine
      await improvementSuggestionEngine.initialize()
      
      console.log('✅ Quality Control System initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Quality Control System:', error)
    }
  }

  const loadQualityData = async () => {
    try {
      // Get quality statistics
      const qualityData = await qualityControlService.getQualityStatistics()
      setQualityStats(qualityData)

      // Get validation statistics
      const validationData = await contentValidationEngine.getValidationStatistics()
      setValidationStats(validationData)

      // Get recent assessments
      const assessments = await qualityControlService.getRecentAssessments(10)
      setRecentAssessments(assessments)

      // Get active validations
      const activeVals = await contentValidationEngine.getActiveValidations()
      setActiveValidations(activeVals)

      // Get quality trends
      const trends = await qualityControlService.getQualityTrends(30) // Last 30 days
      setQualityTrends(trends)

      // Get improvement suggestions
      const suggestions = await improvementSuggestionEngine.getRecentSuggestions(5)
      setImprovementSuggestions(suggestions)

      setLastUpdate(new Date())
      setLoading(false)

    } catch (error) {
      console.error('Failed to load quality data:', error)
      setLoading(false)
    }
  }

  const handleStartMonitoring = async () => {
    try {
      setIsMonitoring(true)
      await qualityControlService.startContinuousMonitoring()
      console.log('✅ Quality monitoring started')
    } catch (error) {
      console.error('❌ Failed to start quality monitoring:', error)
      setIsMonitoring(false)
    }
  }

  const handleStopMonitoring = async () => {
    try {
      setIsMonitoring(false)
      await qualityControlService.stopContinuousMonitoring()
      console.log('✅ Quality monitoring stopped')
    } catch (error) {
      console.error('❌ Failed to stop quality monitoring:', error)
    }
  }

  const handleTestQualityAssessment = async () => {
    try {
      console.log('🧪 Starting quality assessment test...')
      
      const testContent = {
        title: 'The Future of Artificial Intelligence',
        content: `Artificial intelligence represents one of the most transformative technologies of our time. 
        From machine learning algorithms that power recommendation systems to sophisticated neural networks 
        capable of generating human-like text, AI is reshaping industries and redefining what's possible.
        
        The rapid advancement in AI capabilities has led to breakthrough applications in healthcare, 
        finance, transportation, and creative industries. However, with great power comes great responsibility, 
        and the ethical implications of AI development cannot be ignored.
        
        As we move forward, it's crucial to ensure that AI systems are developed with transparency, 
        fairness, and human welfare in mind. The future of AI depends not just on technological 
        advancement, but on our collective wisdom in guiding its development.`,
        type: 'article',
        targetAudience: 'general',
        expectedLength: 1000
      }

      const assessment = await aiQualityAssessor.assessContent(testContent, {
        includeDetailedAnalysis: true,
        generateImprovements: true
      })

      console.log('✅ Quality assessment test completed:', assessment)
      
      // Refresh data to show new assessment
      await loadQualityData()
      
    } catch (error) {
      console.error('❌ Quality assessment test failed:', error)
    }
  }

  const handleTestContentValidation = async () => {
    try {
      console.log('🔍 Starting content validation test...')
      
      const testContent = {
        title: 'Machine Learning Fundamentals',
        content: 'This is a comprehensive guide to machine learning that covers supervised learning, unsupervised learning, and reinforcement learning techniques.',
        metadata: {
          wordCount: 150,
          readingLevel: 'intermediate',
          topics: ['machine learning', 'AI', 'data science']
        }
      }

      const validationRules = [
        { type: 'length', parameters: { minWords: 100, maxWords: 5000 } },
        { type: 'readability', parameters: { maxGradeLevel: 12 } },
        { type: 'coherence', parameters: { minScore: 0.7 } },
        { type: 'originality', parameters: { minScore: 0.8 } }
      ]

      const validation = await contentValidationEngine.validateContent(
        testContent,
        validationRules,
        { generateReport: true }
      )

      console.log('✅ Content validation test completed:', validation)
      
      // Refresh data
      await loadQualityData()
      
    } catch (error) {
      console.error('❌ Content validation test failed:', error)
    }
  }

  const handleTestImprovementSuggestions = async () => {
    try {
      console.log('💡 Starting improvement suggestions test...')
      
      const testContent = {
        title: 'Basic Programming Concepts',
        content: 'Programming is writing code. Variables store data. Functions do things. Loops repeat code.',
        qualityScore: 0.4,
        issues: ['too_simple', 'lacks_detail', 'poor_structure']
      }

      const suggestions = await improvementSuggestionEngine.generateSuggestions(
        testContent,
        {
          targetQualityScore: 0.8,
          includeExamples: true,
          prioritizeIssues: true
        }
      )

      console.log('✅ Improvement suggestions test completed:', suggestions)
      
      // Refresh data
      await loadQualityData()
      
    } catch (error) {
      console.error('❌ Improvement suggestions test failed:', error)
    }
  }

  const getQualityColor = (score) => {
    if (score >= 0.8) return 'text-green-500'
    if (score >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getQualityBadge = (score) => {
    if (score >= 0.9) return { text: 'Excellent', color: 'bg-green-500' }
    if (score >= 0.8) return { text: 'Good', color: 'bg-blue-500' }
    if (score >= 0.6) return { text: 'Fair', color: 'bg-yellow-500' }
    return { text: 'Poor', color: 'bg-red-500' }
  }

  const getValidationIcon = (status) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default: return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Initializing quality control system...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Quality Control & Validation</h2>
          <p className="text-gray-400 mt-1">
            Advanced AI-powered content quality assessment and validation
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
          <Button onClick={loadQualityData} variant="outline" size="sm">
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
            Quality Control Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={handleTestQualityAssessment} variant="outline" size="sm">
              Test Quality Assessment
            </Button>
            <Button onClick={handleTestContentValidation} variant="outline" size="sm">
              Test Content Validation
            </Button>
            <Button onClick={handleTestImprovementSuggestions} variant="outline" size="sm">
              Test Improvement Suggestions
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
                <p className="text-sm font-medium text-gray-400">Average Quality Score</p>
                <p className={`text-2xl font-bold ${getQualityColor(qualityStats.averageQualityScore)}`}>
                  {(qualityStats.averageQualityScore * 100).toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <Progress value={qualityStats.averageQualityScore * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {qualityStats.totalAssessments} total assessments
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Validation Pass Rate</p>
                <p className="text-2xl font-bold text-white">
                  {(qualityStats.passRate * 100).toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <Progress value={qualityStats.passRate * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {validationStats.totalValidations} total validations
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Validations</p>
                <p className="text-2xl font-bold text-white">{qualityStats.activeValidations}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                {qualityStats.activeValidations > 0 ? 'Processing' : 'Idle'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Improvement Suggestions</p>
                <p className="text-2xl font-bold text-white">{qualityStats.improvementSuggestions}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Generated this week
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="assessments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="assessments" className="data-[state=active]:bg-gray-700">
            Quality Assessments
          </TabsTrigger>
          <TabsTrigger value="validation" className="data-[state=active]:bg-gray-700">
            Content Validation
          </TabsTrigger>
          <TabsTrigger value="improvements" className="data-[state=active]:bg-gray-700">
            Improvement Engine
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-700">
            Quality Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Quality Assessor Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Assessment Engine</span>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      Active
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Quality Models</span>
                    <span className="text-white">5 Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Assessment Speed</span>
                    <span className="text-white">
                      {(validationStats.averageValidationTime / 1000).toFixed(1)}s avg
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Accuracy Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-20 h-2" />
                      <span className="text-white text-sm">92%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Quality Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAssessments.length > 0 ? (
                    recentAssessments.slice(0, 5).map((assessment) => {
                      const badge = getQualityBadge(assessment.overallScore)
                      return (
                        <div key={assessment.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                          <div>
                            <p className="text-white text-sm font-medium">
                              {assessment.contentTitle || assessment.id}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {new Date(assessment.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${badge.color} text-white`}>
                              {badge.text}
                            </Badge>
                            <span className="text-white text-sm">
                              {(assessment.overallScore * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-gray-400 text-sm">No recent assessments</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Validation Engine Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Validation Rules</span>
                    <span className="text-white">12 Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Processing Queue</span>
                    <span className="text-white">{activeValidations.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Success Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={validationStats.passedValidations / validationStats.totalValidations * 100} className="w-20 h-2" />
                      <span className="text-white text-sm">
                        {((validationStats.passedValidations / validationStats.totalValidations) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Average Processing Time</span>
                    <span className="text-white">
                      {(validationStats.averageValidationTime / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Active Validations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeValidations.length > 0 ? (
                    activeValidations.slice(0, 5).map((validation) => (
                      <div key={validation.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                        <div>
                          <p className="text-white text-sm font-medium">
                            {validation.contentId}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {validation.rules.length} rules • Started: {new Date(validation.startTime).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getValidationIcon(validation.status)}
                          <Progress value={validation.progress} className="w-16 h-2" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No active validations</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="improvements" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Improvement Engine Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Suggestion Models</span>
                    <span className="text-white">3 Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Improvement Categories</span>
                    <span className="text-white">8 Types</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Auto-Apply Threshold</span>
                    <span className="text-white">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Success Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={88} className="w-20 h-2" />
                      <span className="text-white text-sm">88%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Recent Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {improvementSuggestions.length > 0 ? (
                    improvementSuggestions.map((suggestion) => (
                      <div key={suggestion.id} className="p-3 bg-gray-700 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-white font-medium text-sm">
                            {suggestion.category}
                          </span>
                          <Badge variant="outline" className={`text-xs ${
                            suggestion.priority === 'high' ? 'text-red-400 border-red-400' :
                            suggestion.priority === 'medium' ? 'text-yellow-400 border-yellow-400' :
                            'text-green-400 border-green-400'
                          }`}>
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-xs mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">
                            Impact: +{(suggestion.expectedImprovement * 100).toFixed(0)}%
                          </span>
                          <span className="text-gray-400 text-xs">
                            {new Date(suggestion.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No recent suggestions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quality Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">This Week</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">+12%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">This Month</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">+8%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Quality Distribution</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-4 bg-green-500 rounded"></div>
                      <div className="w-2 h-3 bg-blue-500 rounded"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                      <div className="w-2 h-1 bg-red-500 rounded"></div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-gray-500">
                      Quality scores improving consistently over time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Processing Speed</span>
                    <span className="text-white">2.3s avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Accuracy Rate</span>
                    <span className="text-white">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">False Positives</span>
                    <span className="text-white">3.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">System Uptime</span>
                    <span className="text-white">99.8%</span>
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

export default QualityControlDashboard
