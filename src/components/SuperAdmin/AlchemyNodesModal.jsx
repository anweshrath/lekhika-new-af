/**
 * ALCHEMY NODES MODAL
 * Shows the 5 Master Nodes for Alchemist Flows
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, FileText, Settings, GitBranch, Building2, Download,
  Copy, Search, Eye, Zap, Plus
} from 'lucide-react'
import toast from 'react-hot-toast'

const AlchemyNodesModal = ({ isOpen, onClose, onNodeSelect }) => {
  const [searchTerm, setSearchTerm] = useState('')

  // 5 Master Nodes data
  const masterNodes = [
    {
      id: 'input',
      name: 'Input Master',
      description: 'Dynamic input collection with AI validation',
      icon: FileText,
      gradient: 'from-blue-500 to-blue-700',
      features: ['Dynamic Fields', 'AI Validation', 'Auto Suggestions', 'Test Input Tab'],
      color: 'blue'
    },
    {
      id: 'process',
      name: 'Process Master',
      description: 'AI-powered content processing',
      icon: Settings,
      gradient: 'from-purple-500 to-purple-700',
      features: ['Multi-Mode Processing', 'AI Integration', 'Quality Control', 'Token Management'],
      color: 'purple'
    },
    {
      id: 'condition',
      name: 'Condition Master',
      description: 'Logical gates and conditional processing',
      icon: GitBranch,
      gradient: 'from-green-500 to-green-700',
      features: ['Logical Gates', 'AI Logic', 'Fallback Actions', 'Retry Logic'],
      color: 'green'
    },
    {
      id: 'structural',
      name: 'Structural Master',
      description: 'Blueprint and content organization',
      icon: Building2,
      gradient: 'from-orange-500 to-orange-700',
      features: ['Blueprint Management', 'Dynamic Structure', 'Auto Arrange', 'Custom Elements'],
      color: 'orange'
    },
    {
      id: 'output',
      name: 'Output Master',
      description: 'Multi-format output delivery',
      icon: Download,
      gradient: 'from-gray-500 to-gray-700',
      features: ['Multi-Format', 'AI Optimization', 'Platform Integration', 'Scheduling'],
      color: 'gray'
    }
  ]

  // Filter nodes based on search
  const filteredNodes = masterNodes.filter(node => 
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle node selection
  const handleNodeSelect = (node) => {
    if (onNodeSelect) {
      onNodeSelect(node)
    }
    toast.success(`${node.name} selected!`)
    onClose()
  }

  // Handle copy node
  const handleCopyNode = (node) => {
    navigator.clipboard.writeText(JSON.stringify(node))
    toast.success(`${node.name} configuration copied!`)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
            <div>
              <h2 className="text-3xl font-bold text-white">Alchemy Nodes</h2>
              <p className="text-gray-400 text-sm">5 Master Nodes for Alchemist Flows</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search alchemy nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="text-sm text-gray-400">
                {filteredNodes.length} master nodes
              </div>
            </div>
          </div>

          {/* Master Nodes Grid */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNodes.map((node) => {
                const IconComponent = node.icon
                
                return (
                  <motion.div
                    key={node.id}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleNodeSelect(node)}
                  >
                    {/* Node Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${node.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg group-hover:text-purple-300 transition-colors">
                            {node.name.toUpperCase()}
                          </h3>
                          <p className="text-gray-400 text-sm">{node.description}</p>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyNode(node)
                          }}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-300" />
                        </button>
                      </div>
                    </div>

                    {/* Node Features */}
                    <div className="space-y-3">
                      {/* AI Integration Status */}
                      <div className="flex items-center gap-2 text-xs">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400">AI-Powered Processing</span>
                      </div>

                      {/* Features List */}
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-2">Features</div>
                        <div className="space-y-1">
                          {node.features.map((feature, idx) => (
                            <div key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Node Type Badge */}
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${node.gradient} text-white`}>
                          MASTER
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                          AI ENABLED
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Click on any node to add it to the canvas
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AlchemyNodesModal
