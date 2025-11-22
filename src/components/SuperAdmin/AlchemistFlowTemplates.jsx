/**
 * ALCHEMIST FLOW TEMPLATES GALLERY
 * Beautiful UI to browse, preview, and load the 10 badass pre-built flows
 * Boss's Vision: Easy access to instant content manufacturing!
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Play, Eye, Clock, Zap, Star, ArrowRight, Download,
  FileText, Mail, Target, Share2, Newspaper, Video,
  ShoppingCart, BarChart3, Megaphone, BookOpen,
  Filter, Search, ChevronDown
} from 'lucide-react'
import { alchemistPreBuiltFlows, flowCategories, difficultyLevels } from '../../data/alchemistPreBuiltFlows'
import toast from 'react-hot-toast'

const AlchemistFlowTemplates = ({ isOpen, onClose, onLoadFlow }) => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [previewFlow, setPreviewFlow] = useState(null)

  // Filter flows based on selected criteria
  const filteredFlows = alchemistPreBuiltFlows.filter(flow => {
    const matchesCategory = selectedCategory === 'All' || flow.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'All' || flow.difficulty === selectedDifficulty
    const matchesSearch = flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flow.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesDifficulty && matchesSearch
  })

  // Get flow icon based on category
  const getFlowIcon = (category) => {
    const iconMap = {
      'Content Creation': FileText,
      'Email Marketing': Mail,
      'Sales & Marketing': Target,
      'Social Media': Share2,
      'Public Relations': Newspaper,
      'Video Content': Video,
      'E-commerce': ShoppingCart,
      'Business Content': BarChart3,
      'Advertising': Megaphone,
      'Thought Leadership': BookOpen
    }
    return iconMap[category] || FileText
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    const colorMap = {
      'Easy': 'text-green-400 bg-green-500/20',
      'Medium': 'text-yellow-400 bg-yellow-500/20', 
      'Advanced': 'text-orange-400 bg-orange-500/20',
      'Expert': 'text-red-400 bg-red-500/20'
    }
    return colorMap[difficulty] || 'text-gray-400 bg-gray-500/20'
  }

  // Load flow into canvas
  const handleLoadFlow = (flow) => {
    if (onLoadFlow) {
      onLoadFlow(flow)
      toast.success(`🚀 ${flow.name} loaded successfully!`)
      onClose()
    }
  }

  // Preview flow details
  const handlePreviewFlow = (flow) => {
    setPreviewFlow(flow)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-7xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">🚀 Alchemist Flow Templates</h2>
              <p className="text-purple-300">10 Pre-Built Content Manufacturing Powerhouses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-100px)]">
          {/* Sidebar - Filters */}
          <div className="w-80 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Search Templates</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search flows..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="All">All Categories</option>
                  {flowCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="All">All Levels</option>
                  {difficultyLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Stats */}
              <div className="bg-purple-900/20 rounded-lg p-4">
                <h3 className="text-purple-300 font-medium mb-3">Template Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Templates</span>
                    <span className="text-white">{alchemistPreBuiltFlows.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Filtered Results</span>
                    <span className="text-white">{filteredFlows.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Categories</span>
                    <span className="text-white">{flowCategories.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Flow Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {filteredFlows.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Templates Found</h3>
                <p className="text-gray-400">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFlows.map((flow, index) => {
                  const IconComponent = getFlowIcon(flow.category)
                  
                  return (
                    <motion.div
                      key={flow.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group hover:shadow-lg hover:shadow-purple-500/20"
                    >
                      {/* Flow Header */}
                      <div className="p-5 border-b border-gray-700">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <IconComponent className="w-5 h-5 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-lg mb-1">{flow.name}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{flow.description}</p>
                          </div>
                        </div>

                        {/* Flow Stats */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-3 h-3" />
                            {flow.estimatedTime}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(flow.difficulty)}`}>
                            {flow.difficulty}
                          </span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                            {flow.nodes.length} nodes
                          </span>
                        </div>
                      </div>

                      {/* Flow Details */}
                      <div className="p-5">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Output Formats:</h4>
                          <div className="flex flex-wrap gap-1">
                            {flow.outputFormats.slice(0, 3).map((format, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                                {format}
                              </span>
                            ))}
                            {flow.outputFormats.length > 3 && (
                              <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                                +{flow.outputFormats.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLoadFlow(flow)}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            Load Flow
                          </button>
                          <button
                            onClick={() => handlePreviewFlow(flow)}
                            className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                            title="Preview Flow"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Flow Preview Modal */}
      <AnimatePresence>
        {previewFlow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-60 p-4"
            onClick={() => setPreviewFlow(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl border border-gray-600 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">{previewFlow.name}</h3>
                  <button
                    onClick={() => setPreviewFlow(null)}
                    className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <p className="text-gray-300">{previewFlow.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Flow Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Category:</span>
                          <span className="text-white">{previewFlow.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Difficulty:</span>
                          <span className={getDifficultyColor(previewFlow.difficulty).split(' ')[0]}>
                            {previewFlow.difficulty}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Est. Time:</span>
                          <span className="text-white">{previewFlow.estimatedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Nodes:</span>
                          <span className="text-white">{previewFlow.nodes.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Output Formats</h4>
                      <div className="flex flex-wrap gap-1">
                        {previewFlow.outputFormats.map((format, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Flow Structure</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {previewFlow.nodes.map((node, idx) => (
                        <React.Fragment key={node.id}>
                          <div className="px-3 py-2 bg-gray-700 rounded-lg text-sm text-gray-300">
                            {node.data.label}
                          </div>
                          {idx < previewFlow.nodes.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-gray-500" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        handleLoadFlow(previewFlow)
                        setPreviewFlow(null)
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Load This Flow
                    </button>
                    <button
                      onClick={() => setPreviewFlow(null)}
                      className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AlchemistFlowTemplates
