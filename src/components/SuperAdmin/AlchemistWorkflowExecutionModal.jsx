/**
 * ALCHEMIST WORKFLOW EXECUTION MODAL - MAGICAL & SOPHISTICATED
 * Boss's Vision: AI Thinking displays, sophisticated tracking, magical UX
 * ZERO tolerance for stuck buttons or missing modals!
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Play, Pause, Square, AlertTriangle, CheckCircle, Clock,
  Zap, Brain, Target, Eye, Download, RefreshCw, Loader2,
  TrendingUp, DollarSign, Hash, FileText, Activity, Sparkles,
  Stars, Cpu, Workflow, Layers
} from 'lucide-react'
import toast from 'react-hot-toast'

const AlchemistWorkflowExecutionModal = ({ 
  isOpen, 
  onClose, 
  onForceStop,
  workflowData,
  isExecuting,
  executionProgress,
  currentExecutingNode,
  executionStatuses,
  executionResults,
  executionError,
  executionLog,
  flowId,
  userId,
  nodes,
  edges,
  setExecutionError,
  setExecutionStatuses, 
  setExecutionProgress,
  setCurrentExecutingNode,
  setExecutionLog
}) => {
  const [activeTab, setActiveTab] = useState('progress')
  const [totalTokens, setTotalTokens] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [totalWords, setTotalWords] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [nodeResults, setNodeResults] = useState(new Map())
  const [showNodeDetails, setShowNodeDetails] = useState(false)
  const [selectedNodeDetail, setSelectedNodeDetail] = useState(null)
  const [expandedLogs, setExpandedLogs] = useState(false)
  const [pulseAnimation, setPulseAnimation] = useState(false)
  const logEndRef = useRef(null)

  // Timer for elapsed time
  useEffect(() => {
    if (isExecuting && !startTime) {
      setStartTime(Date.now())
    }
    
    let interval
    if (isExecuting && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 100)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isExecuting, startTime])

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [executionLog])

  // Pulse animation trigger
  useEffect(() => {
    if (currentExecutingNode) {
      setPulseAnimation(true)
      const timer = setTimeout(() => setPulseAnimation(false), 600)
      return () => clearTimeout(timer)
    }
  }, [currentExecutingNode])

  // Add to execution log
  const addLogEntry = (type, message, nodeId = null, data = null) => {
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      type, // success, error, info, warning
      message,
      nodeId,
      data
    }
    setExecutionLog(prev => [...prev, logEntry])
  }

  // Update execution stats from workflowData
  useEffect(() => {
    if (workflowData) {
      if (workflowData.tokens) setTotalTokens(prev => prev + workflowData.tokens)
      if (workflowData.cost) setTotalCost(prev => prev + workflowData.cost)
      if (workflowData.words) setTotalWords(prev => prev + workflowData.words)
      
      // Add to log based on status
      if (workflowData.status === 'completed') {
        addLogEntry('success', `✅ ${workflowData.nodeName} completed successfully`, workflowData.nodeId, workflowData)
      } else if (workflowData.status === 'error') {
        addLogEntry('error', `❌ ${workflowData.nodeName} failed: ${workflowData.error}`, workflowData.nodeId, workflowData)
      } else if (workflowData.status === 'executing') {
        addLogEntry('info', `🔄 Processing ${workflowData.nodeName}...`, workflowData.nodeId, workflowData)
      }
    }
  }, [workflowData])

  // Handle execution completion
  useEffect(() => {
    if (executionResults) {
      addLogEntry('success', '🎉 Workflow execution completed successfully!', null, executionResults)
    }
    if (executionError) {
      addLogEntry('error', `💥 Workflow execution failed: ${executionError}`)
    }
  }, [executionResults, executionError])

  // Format elapsed time
  const formatElapsedTime = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  // Get node status icon
  const getNodeStatusIcon = (nodeId) => {
    const status = executionStatuses[nodeId]
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'executing': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  // Get log entry icon
  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default: return <Activity className="w-4 h-4 text-blue-400" />
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'logs', label: 'Execution Logs', icon: FileText },
    { id: 'stats', label: 'Statistics', icon: Activity },
    { id: 'results', label: 'Results', icon: CheckCircle }
  ]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-purple-500/30"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700/50 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${isExecuting ? 'from-blue-500 to-purple-600' : executionError ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'} ${pulseAnimation ? 'animate-pulse' : ''}`}>
                {isExecuting ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : executionError ? (
                  <AlertTriangle className="w-6 h-6 text-white" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  🧪 {(workflowData?.name || 'Alchemist Flow')} Execution
                  {isExecuting && <span className="text-sm font-normal text-blue-300">({Math.round(executionProgress)}%)</span>}
                </h2>
                <p className="text-gray-300 text-sm">
                  {isExecuting ? 'Processing workflow...' : executionError ? 'Execution failed' : 'Execution completed'}
                  {startTime && (
                    <span className="ml-2 text-purple-300">• {formatElapsedTime(elapsedTime)}</span>
                  )}
                </p>
              </div>
            </div>
          <button
            onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
          {/* Progress Bar */}
          {isExecuting && (
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${executionProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-4 bg-gray-800/50 border-b border-gray-700/50">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* PROGRESS TAB */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
            {/* MAGICAL AI THINKING DISPLAY */}
            {isExecuting && currentExecutingNode && workflowData?.aiThinking && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-cyan-900/30 border border-blue-500/30 rounded-xl p-6 relative overflow-hidden"
              >
                  {/* Magical background animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                          <Brain className="w-8 h-8 text-blue-400" />
                        </div>
                        {/* Pulsing rings around brain */}
                        <div className="absolute inset-0 rounded-xl bg-blue-500/20 animate-ping"></div>
                        <div className="absolute inset-2 rounded-lg bg-blue-500/10 animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            🧠 AI THINKING...
                          </h3>
                          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                        </div>
                        <p className="text-blue-300 text-sm">Processing: {workflowData?.nodeName || currentExecutingNode}</p>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                    
                    {/* AI Thinking Process */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Cpu className="w-4 h-4 text-blue-400" />
                          <div className="text-blue-300 font-medium">Neural Processing</div>
                        </div>
                        <div className="text-blue-100 text-sm">{workflowData?.nodeType || 'Content Generation'}</div>
                        <div className="w-full bg-blue-900/50 rounded-full h-1 mt-2">
                          <div className="h-full bg-blue-400 rounded-full animate-pulse" style={{width: `${Math.min(executionProgress + 10, 100)}%`}}></div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Layers className="w-4 h-4 text-purple-400" />
                          <div className="text-purple-300 font-medium">Context Analysis</div>
                        </div>
                        <div className="text-purple-100 text-sm">{workflowData?.currentStep || 'Analyzing patterns...'}</div>
                        <div className="w-full bg-purple-900/50 rounded-full h-1 mt-2">
                          <div className="h-full bg-purple-400 rounded-full animate-pulse" style={{width: `${Math.min(executionProgress + 20, 100)}%`}}></div>
                        </div>
                      </div>
                      
                      <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Workflow className="w-4 h-4 text-cyan-400" />
                          <div className="text-cyan-300 font-medium">Output Generation</div>
                        </div>
                        <div className="text-cyan-100 text-sm">Creating content...</div>
                        <div className="w-full bg-cyan-900/50 rounded-full h-1 mt-2">
                          <div className="h-full bg-cyan-400 rounded-full animate-pulse" style={{width: `${executionProgress}%`}}></div>
                        </div>
                      </div>
                    </div>

                    {/* Live AI Thinking Messages */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Stars className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300 font-medium text-sm">AI THOUGHT PROCESS</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-green-300"
                        >
                          💭 Understanding user input and context...
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 }}
                          className="text-blue-300"
                        >
                          🧮 Processing variables and applying constraints...
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 2 }}
                          className="text-purple-300"
                        >
                          ✨ Generating high-quality content with AI model...
                        </motion.div>
                        {executionProgress > 50 && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-yellow-300"
                          >
                            🎯 Optimizing output and applying formatting rules...
                          </motion.div>
                        )}
                        {executionProgress > 80 && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-cyan-300"
                          >
                            🚀 Finalizing results and preparing delivery...
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Node Status Grid */}
              {workflowData?.nodes && (
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Workflow Nodes ({Object.keys(executionStatuses).length}/{workflowData.nodes.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {workflowData.nodes.map((node, index) => (
                      <div
                        key={node.id}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          executionStatuses[node.id] === 'completed'
                            ? 'bg-green-900/20 border-green-500/30'
                            : executionStatuses[node.id] === 'executing'
                            ? 'bg-blue-900/20 border-blue-500/30 animate-pulse'
                            : executionStatuses[node.id] === 'error'
                            ? 'bg-red-900/20 border-red-500/30'
                            : 'bg-gray-800/50 border-gray-600/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {getNodeStatusIcon(node.id)}
                          <span className="text-white font-medium text-sm">{node.data?.label || node.type}</span>
                        </div>
                        <p className="text-gray-400 text-xs">{node.type}</p>
                        {executionStatuses[node.id] && (
                          <div className="mt-2 text-xs">
                            <span className={`px-2 py-1 rounded-full ${
                              executionStatuses[node.id] === 'completed' ? 'bg-green-500/20 text-green-300' :
                              executionStatuses[node.id] === 'executing' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {executionStatuses[node.id]}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Execution Logs ({executionLog.length})
                </h3>
                <button
                  onClick={() => setExpandedLogs(!expandedLogs)}
                  className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
                >
                  {expandedLogs ? 'Collapse' : 'Expand All'}
                </button>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
                {executionLog.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-2 rounded hover:bg-gray-800/50 transition-colors"
                  >
                    {getLogIcon(log.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">{log.timestamp}</span>
                        {log.nodeId && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                            {log.nodeId}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-200 text-sm mt-1">{log.message}</p>
                      {log.data && expandedLogs && (
                        <pre className="text-xs text-gray-400 mt-2 bg-gray-800 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          )}

          {/* STATISTICS TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Execution Statistics
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm font-medium">Total Tokens</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{totalTokens.toLocaleString()}</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 text-sm font-medium">Total Cost</span>
                  </div>
                  <p className="text-white text-2xl font-bold">${totalCost.toFixed(4)}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 text-sm font-medium">Words Generated</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{totalWords.toLocaleString()}</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 rounded-xl p-4 border border-orange-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-300 text-sm font-medium">Execution Time</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{formatElapsedTime(elapsedTime)}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-white font-medium mb-3">Performance Metrics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Tokens per second:</span>
                    <span className="text-white ml-2">
                      {elapsedTime > 0 ? Math.round((totalTokens / elapsedTime) * 1000) : 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Cost per word:</span>
                    <span className="text-white ml-2">
                      ${totalWords > 0 ? (totalCost / totalWords).toFixed(6) : '0.000000'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Nodes completed:</span>
                    <span className="text-white ml-2">
                      {Object.values(executionStatuses).filter(s => s === 'completed').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Success rate:</span>
                    <span className="text-white ml-2">
                      {Object.keys(executionStatuses).length > 0 
                        ? Math.round((Object.values(executionStatuses).filter(s => s === 'completed').length / Object.keys(executionStatuses).length) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RESULTS TAB */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400" />
                Execution Results
              </h3>
              
              {executionResults ? (
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="mb-4">
                    <h4 className="text-green-400 font-medium mb-2">✅ Workflow Completed Successfully</h4>
                    <p className="text-gray-300 text-sm">Final results from the workflow execution:</p>
                  </div>
                  <pre className="text-green-400 text-sm bg-gray-800 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(executionResults, null, 2)}
                  </pre>
                </div>
              ) : executionError ? (
                <div className="space-y-4">
                  {/* ERROR DETAILS */}
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                      <h4 className="text-red-400 font-bold text-lg">🚨 Workflow Execution Failed</h4>
                    </div>
                    
                    {/* MAIN ERROR MESSAGE */}
                    <div className="bg-red-950/50 rounded-lg p-4 border border-red-500/20 mb-4">
                      <h5 className="text-red-300 font-semibold mb-2">Error Details:</h5>
                      <p className="text-red-200 font-mono text-sm">{executionError}</p>
                    </div>

                    {/* FAILED NODE INFORMATION */}
                    {currentExecutingNode && (
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50 mb-4">
                        <h5 className="text-gray-300 font-semibold mb-2">Failed Node:</h5>
                        <p className="text-white">{workflowData?.nodeName || currentExecutingNode}</p>
                        <p className="text-gray-400 text-sm">Type: {workflowData?.nodeType || 'Unknown'}</p>
                        {workflowData?.aiModel && (
                          <p className="text-gray-400 text-sm">AI Model: {workflowData.aiModel}</p>
                        )}
                      </div>
                    )}

                    {/* INTEGRITY PLEDGE */}
                    <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                        <h5 className="text-blue-300 font-semibold">✨ INTEGRITY PLEDGE</h5>
                      </div>
                      <p className="text-blue-200 text-sm mb-2">
                        <strong>NO FAKE CONTENT:</strong> This system NEVER uses templates or fake data as fallbacks.
                      </p>
                      <p className="text-blue-200 text-sm">
                        Your customers deserve REAL AI-generated content. When it fails, it fails honestly - no deception.
                      </p>
                    </div>

                    {/* RESUME WORKFLOW BUTTON */}
                    <div className="mt-6 flex items-center gap-3">
                      <button
                        onClick={async () => {
                          // Reset error states and resume from failed node
                          setExecutionError(null)
                          setExecutionStatuses(prev => {
                            const newStatuses = { ...prev }
                            if (currentExecutingNode) {
                              delete newStatuses[currentExecutingNode]
                            }
                            return newStatuses
                          })
                          
                          // Re-trigger execution from parent component
                          if (onResume) {
                            try {
                              await onResume(currentExecutingNode)
                              toast.success('🔄 Workflow resumed successfully!')
                            } catch (error) {
                              toast.error('❌ Resume failed: ' + error.message)
                            }
                          } else {
                            toast.success('🔄 Ready to resume workflow from failed node')
                          }
                        }}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Resume from Failed Node
                      </button>
                      
                      <button
                        onClick={() => {
                          // Reset all execution states for fresh start
                          setExecutionError(null)
                          setExecutionStatuses({})
                          setExecutionProgress(0)
                          setCurrentExecutingNode(null)
                          setExecutionLog([])
                          toast.success('🔄 Workflow reset - ready for fresh execution')
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Start Fresh
                      </button>
                    </div>
                  </div>

                  {/* EXECUTION LOG FOR DEBUGGING */}
                  {executionLog.length > 0 && (
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600/30">
                      <h5 className="text-gray-300 font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Execution Log (Last 5 entries)
                      </h5>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {executionLog.slice(-5).map((entry, index) => (
                          <div key={entry.id} className="text-xs">
                            <span className="text-gray-500">[{entry.timestamp}]</span>
                            <span className={`ml-2 ${
                              entry.type === 'error' ? 'text-red-300' :
                              entry.type === 'success' ? 'text-green-300' :
                              'text-gray-300'
                            }`}>
                              {entry.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">Waiting for execution results...</p>
                </div>
              )}
            </div>
          )}
          </div>
          
        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Flow ID: {flowId || 'N/A'}</span>
              <span>•</span>
              <span>User: {userId || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              {isExecuting && onForceStop && (
            <button
                  onClick={() => {
                    onForceStop()
                    toast.success('🛑 Workflow execution stopped')
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Square className="w-4 h-4 mr-1" />
                  Force Stop
            </button>
              )}
            <button
              onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  )
}

export default AlchemistWorkflowExecutionModal
