import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  Play, 
  Pause, 
  BarChart3,
  Eye,
  Edit3,
  Plus,
  Trash2,
  RefreshCw,
  Target,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react'
import { qualityGateService } from '../../services/qualityGateService'
import toast from 'react-hot-toast'

const QualityGateManager = () => {
  const [gates, setGates] = useState([])
  const [selectedGate, setSelectedGate] = useState(null)
  const [testContent, setTestContent] = useState('')
  const [testResults, setTestResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [gateStats, setGateStats] = useState({})

  useEffect(() => {
    loadGates()
  }, [])

  const loadGates = () => {
    // Get available quality gates
    const availableGates = [
      { id: 'word-count', name: 'Word Count', description: 'Validates content meets target word count', category: 'basic' },
      { id: 'readability', name: 'Readability', description: 'Checks content readability score', category: 'basic' },
      { id: 'coherence', name: 'Coherence', description: 'Analyzes logical flow and coherence', category: 'advanced' },
      { id: 'technical-depth', name: 'Technical Depth', description: 'Validates technical content depth', category: 'specialized' },
      { id: 'narrative-flow', name: 'Narrative Flow', description: 'Checks story flow and pacing', category: 'specialized' },
      { id: 'character-consistency', name: 'Character Consistency', description: 'Validates character consistency', category: 'specialized' },
      { id: 'accuracy-check', name: 'Accuracy Check', description: 'Verifies factual accuracy', category: 'advanced' },
      { id: 'citation-check', name: 'Citation Check', description: 'Validates citations and references', category: 'advanced' },
      { id: 'expert-review', name: 'Expert Review', description: 'Expert-level content validation', category: 'premium' },
      { id: 'style-consistency', name: 'Style Consistency', description: 'Checks writing style consistency', category: 'advanced' },
      { id: 'basic-quality', name: 'Basic Quality', description: 'Basic quality validation', category: 'basic' },
      { id: 'pro-quality', name: 'Pro Quality', description: 'Professional quality validation', category: 'advanced' },
      { id: 'premium-quality', name: 'Premium Quality', description: 'Premium quality validation', category: 'premium' }
    ]

    setGates(availableGates)
    
    // Generate mock stats
    const stats = {}
    availableGates.forEach(gate => {
      stats[gate.id] = {
        totalRuns: Math.floor(Math.random() * 1000) + 100,
        passRate: Math.floor(Math.random() * 30) + 70,
        avgScore: Math.floor(Math.random() * 20) + 75,
        avgDuration: Math.floor(Math.random() * 2000) + 500
      }
    })
    setGateStats(stats)
  }

  const handleTestGate = async (gateId) => {
    if (!testContent.trim()) {
      toast.error('Please enter test content')
      return
    }

    setLoading(true)
    try {
      const context = {
        targetWordCount: 1000,
        userTier: 'premium'
      }
      
      const result = await qualityGateService.runQualityGate(gateId, testContent, context)
      setTestResults(result)
      
      if (result.passed) {
        toast.success(`Quality gate passed with score: ${Math.round(result.score)}`)
      } else {
        toast.error(`Quality gate failed with score: ${Math.round(result.score)}`)
      }
    } catch (error) {
      console.error('Error testing quality gate:', error)
      toast.error('Failed to test quality gate')
    } finally {
      setLoading(false)
    }
  }

  const handleTestMultipleGates = async (gateIds) => {
    if (!testContent.trim()) {
      toast.error('Please enter test content')
      return
    }

    setLoading(true)
    try {
      const context = {
        targetWordCount: 1000,
        userTier: 'premium'
      }
      
      const result = await qualityGateService.runMultipleGates(gateIds, testContent, context)
      setTestResults(result)
      
      if (result.passed) {
        toast.success(`All quality gates passed! Average score: ${Math.round(result.averageScore)}`)
      } else {
        toast.error(`Some quality gates failed. Average score: ${Math.round(result.averageScore)}`)
      }
    } catch (error) {
      console.error('Error testing quality gates:', error)
      toast.error('Failed to test quality gates')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'basic':
        return 'bg-blue-900/20 text-blue-400 border-blue-500'
      case 'advanced':
        return 'bg-purple-900/20 text-purple-400 border-purple-500'
      case 'specialized':
        return 'bg-green-900/20 text-green-400 border-green-500'
      case 'premium':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-500'
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-500'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-blue-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-400" />
              Quality Gate Manager
            </h2>
            <p className="text-gray-400 mt-1">
              Configure and monitor content quality validation gates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Gate
            </button>
            <button
              onClick={loadGates}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{gates.length}</div>
            <div className="text-sm text-green-300">Available Gates</div>
          </div>
          <div className="p-4 bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">
              {Object.values(gateStats).reduce((sum, stat) => sum + stat.totalRuns, 0)}
            </div>
            <div className="text-sm text-blue-300">Total Runs</div>
          </div>
          <div className="p-4 bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round(Object.values(gateStats).reduce((sum, stat) => sum + stat.passRate, 0) / gates.length)}%
            </div>
            <div className="text-sm text-purple-300">Avg Pass Rate</div>
          </div>
          <div className="p-4 bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {Math.round(Object.values(gateStats).reduce((sum, stat) => sum + stat.avgDuration, 0) / gates.length)}ms
            </div>
            <div className="text-sm text-yellow-300">Avg Duration</div>
          </div>
        </div>
      </div>

      {/* Test Panel */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-blue-400" />
          Test Quality Gates
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Test Content
            </label>
            <textarea
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter content to test quality gates..."
              rows={6}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTestMultipleGates(['basic-quality', 'readability', 'coherence'])}
              disabled={loading || !testContent.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Test Basic Suite
            </button>
            
            <button
              onClick={() => handleTestMultipleGates(['pro-quality', 'style-consistency', 'accuracy-check'])}
              disabled={loading || !testContent.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Test Pro Suite
            </button>
            
            <button
              onClick={() => handleTestMultipleGates(['premium-quality', 'expert-review', 'citation-check'])}
              disabled={loading || !testContent.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
              Test Premium Suite
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h4 className="font-semibold text-white mb-3">Test Results</h4>
            
            {testResults.results ? (
              // Multiple gates results
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Overall Result:</span>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    testResults.passed 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {testResults.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(testResults.averageScore)}`}>
                      {Math.round(testResults.averageScore)}
                    </div>
                    <div className="text-sm text-gray-400">Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {testResults.summary.passedCount}/{testResults.summary.totalCount}
                    </div>
                    <div className="text-sm text-gray-400">Gates Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.round(testResults.summary.passRate)}%
                    </div>
                    <div className="text-sm text-gray-400">Pass Rate</div>
                  </div>
                </div>
                
                {testResults.results.map(result => (
                  <div key={result.gateName} className="p-3 bg-gray-600 rounded border border-gray-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white capitalize">
                        {result.gateName.replace('-', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                          {Math.round(result.score)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.passed 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {result.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-2">{result.feedback}</div>
                    
                    {result.suggestions && result.suggestions.length > 0 && (
                      <div className="text-xs text-yellow-300">
                        Suggestions: {result.suggestions.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Single gate result
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Gate:</span>
                  <span className="text-white capitalize">{testResults.gateName?.replace('-', ' ')}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Score:</span>
                  <span className={`text-lg font-bold ${getScoreColor(testResults.score)}`}>
                    {Math.round(testResults.score)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Result:</span>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    testResults.passed 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {testResults.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-300">{testResults.feedback}</div>
                
                {testResults.suggestions && testResults.suggestions.length > 0 && (
                  <div className="text-sm text-yellow-300">
                    <strong>Suggestions:</strong> {testResults.suggestions.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quality Gates List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Available Quality Gates
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gates.map(gate => {
            const stats = gateStats[gate.id] || {}
            
            return (
              <div key={gate.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{gate.name}</h4>
                    <p className="text-gray-400 text-sm mb-2">{gate.description}</p>
                    <span className={`px-2 py-1 rounded text-xs border ${getCategoryColor(gate.category)}`}>
                      {gate.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestGate(gate.id)}
                      disabled={loading || !testContent.trim()}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors disabled:opacity-50"
                      title="Test Gate"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedGate(gate)}
                      className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Gate Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center p-2 bg-gray-600 rounded">
                    <div className="font-bold text-white">{stats.totalRuns || 0}</div>
                    <div className="text-gray-400">Runs</div>
                  </div>
                  <div className="text-center p-2 bg-gray-600 rounded">
                    <div className={`font-bold ${getScoreColor(stats.passRate || 0)}`}>
                      {stats.passRate || 0}%
                    </div>
                    <div className="text-gray-400">Pass Rate</div>
                  </div>
                  <div className="text-center p-2 bg-gray-600 rounded">
                    <div className={`font-bold ${getScoreColor(stats.avgScore || 0)}`}>
                      {stats.avgScore || 0}
                    </div>
                    <div className="text-gray-400">Avg Score</div>
                  </div>
                  <div className="text-center p-2 bg-gray-600 rounded">
                    <div className="font-bold text-white">{stats.avgDuration || 0}ms</div>
                    <div className="text-gray-400">Duration</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Gate Detail Modal */}
      {selectedGate && (
        <GateDetailModal
          gate={selectedGate}
          stats={gateStats[selectedGate.id] || {}}
          onClose={() => setSelectedGate(null)}
          onTest={() => handleTestGate(selectedGate.id)}
          testDisabled={loading || !testContent.trim()}
        />
      )}
    </div>
  )
}

// Gate Detail Modal Component
const GateDetailModal = ({ gate, stats, onClose, onTest, testDisabled }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case 'basic':
        return 'bg-blue-900/20 text-blue-400 border-blue-500'
      case 'advanced':
        return 'bg-purple-900/20 text-purple-400 border-purple-500'
      case 'specialized':
        return 'bg-green-900/20 text-green-400 border-green-500'
      case 'premium':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-500'
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-500'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-blue-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{gate.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Gate Info */}
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded border ${getCategoryColor(gate.category)}`}>
                {gate.category}
              </span>
              <span className="text-gray-400 text-sm">ID: {gate.id}</span>
            </div>
            <p className="text-gray-300">{gate.description}</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.totalRuns || 0}</div>
              <div className="text-sm text-gray-400">Total Runs</div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg text-center">
              <div className={`text-2xl font-bold ${getScoreColor(stats.passRate || 0)}`}>
                {stats.passRate || 0}%
              </div>
              <div className="text-sm text-gray-400">Pass Rate</div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg text-center">
              <div className={`text-2xl font-bold ${getScoreColor(stats.avgScore || 0)}`}>
                {stats.avgScore || 0}
              </div>
              <div className="text-sm text-gray-400">Avg Score</div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.avgDuration || 0}ms</div>
              <div className="text-sm text-gray-400">Avg Duration</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onTest}
              disabled={testDisabled}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              Test Gate
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QualityGateManager
