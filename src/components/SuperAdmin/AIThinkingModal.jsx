import React, { useState, useEffect } from 'react'
import { X, Brain, Eye, EyeOff, Copy, Download, RefreshCw, Zap, Clock, AlertCircle, ArrowRight, Target } from 'lucide-react'

const AIThinkingModal = ({ isOpen, onClose, thinkingData = [] }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set())
  const [showRawData, setShowRawData] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)

  useEffect(() => {
    if (isOpen && thinkingData.length > 0) {
      // Auto-expand the latest node
      const latestIndex = thinkingData.length - 1
      setExpandedNodes(new Set([latestIndex]))
    }
  }, [isOpen, thinkingData])

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedNodes(newExpanded)
  }

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadData = () => {
    const dataStr = JSON.stringify(thinkingData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ai-thinking-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'executing': return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'executing': return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      default: return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Thinking Process</h2>
              <p className="text-sm text-gray-400">Real-time AI decision making and responses</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg transition-all duration-300"
            >
              {showRawData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showRawData ? 'Hide Raw' : 'Show Raw'}</span>
            </button>
            <button
              onClick={downloadData}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-300"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {thinkingData.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No AI Activity Yet</h3>
              <p className="text-gray-500">AI thinking data will appear here when workflow execution starts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {thinkingData.map((item, index) => (
                <div key={index} className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                  {/* Node Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-700/30 transition-all duration-300"
                    onClick={() => toggleExpanded(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <h3 className="font-semibold text-white text-lg">{item.nodeName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{item.timestamp}</span>
                            </span>
                            {item.providerName && (
                              <span className="flex items-center space-x-1">
                                <Zap className="w-3 h-3" />
                                <span>{item.providerName}</span>
                              </span>
                            )}
                            {item.actualTokens > 0 && (
                              <span className="text-purple-400">{item.actualTokens.toLocaleString()} tokens</span>
                            )}
                            {item.actualCost > 0 && (
                              <span className="text-emerald-400">${item.actualCost.toFixed(4)}</span>
                            )}
                            {item.modelCostPer1k && (
                              <span className="text-blue-400">${item.modelCostPer1k}/1k</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {item.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                        <div className="text-sm text-gray-400">
                          {expandedNodes.has(index) ? '▼' : '▶'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedNodes.has(index) && (
                    <div className="border-t border-gray-700/50 p-4 space-y-4">
                      {/* Input Received */}
                      {item.inputReceived && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-white flex items-center space-x-2">
                            <ArrowRight className="w-4 h-4 text-blue-400" />
                            <span>Input Received</span>
                          </h4>
                          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                              {JSON.stringify(item.inputReceived, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Dynamic Inputs */}
                      {item.dynamicInputs && item.dynamicInputs.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-white flex items-center space-x-2">
                            <Target className="w-4 h-4 text-green-400" />
                            <span>Dynamic Inputs Sent to AI</span>
                          </h4>
                          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                              {item.dynamicInputs.join('\n')}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* AI Response */}
                      {item.aiResponse && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-white flex items-center space-x-2">
                              <Brain className="w-4 h-4 text-purple-400" />
                              <span>AI Response</span>
                            </h4>
                            <button
                              onClick={() => copyToClipboard(item.aiResponse, index)}
                              className="flex items-center space-x-1 px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded text-sm transition-all duration-300"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedIndex === index ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                              {typeof item.aiResponse === 'string' ? item.aiResponse : JSON.stringify(item.aiResponse, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Processed Content */}
                      {item.processedContent && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-white flex items-center space-x-2">
                            <RefreshCw className="w-4 h-4 text-blue-400" />
                            <span>Processed Content</span>
                          </h4>
                          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                              {item.processedContent}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Error */}
                      {item.error && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-white flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span>Error</span>
                          </h4>
                          <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                            <p className="text-sm text-red-300">{item.error}</p>
                          </div>
                        </div>
                      )}

                      {/* Raw Data */}
                      {showRawData && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-white">Raw Data</h4>
                          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                            <pre className="text-xs text-gray-400 whitespace-pre-wrap overflow-x-auto">
                              {JSON.stringify(item, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIThinkingModal
