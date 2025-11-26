import React, { useState, useCallback, useMemo } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Handle,
  Position
} from 'reactflow'
import 'reactflow/dist/style.css'
import { 
  Plus,
  Save,
  Trash2,
  Settings,
  Play,
  Eye,
  Copy,
  Download,
  Upload,
  Search,
  Target,
  Users,
  Crown,
  Zap,
  FileText,
  CheckCircle,
  Star,
  X,
  PenTool,
  Layout,
  ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'

// Custom CSS for modal animations and node styling
const customStyles = `
  @keyframes modalSlideIn {
    from {
      transform: scale(0.95) translateY(20px);
      opacity: 0;
    }
    to {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  .react-flow__node {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
  
  .react-flow__node.selected {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }
  
  .react-flow__node:hover {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }
  
  .react-flow__handle {
    background: #6b7280 !important;
    border: 2px solid #374151 !important;
  }
  
  .react-flow__handle:hover {
    background: #9ca3af !important;
  }

  /* Responsive modal animations */
  @media (max-width: 640px) {
    @keyframes modalSlideIn {
      from {
        transform: scale(0.9) translateY(40px);
        opacity: 0;
      }
      to {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
  }
`

// Inline Node Components to bypass caching issues
const InputNode = ({ data }) => {
  const [showModal, setShowModal] = useState(false)

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return 'border-blue-400 bg-blue-900/20 text-blue-200'
      case 'green':
        return 'border-green-400 bg-green-900/20 text-green-200'
      case 'purple':
        return 'border-purple-400 bg-purple-900/20 text-purple-200'
      case 'pink':
        return 'border-pink-400 bg-pink-900/20 text-pink-200'
      case 'orange':
        return 'border-orange-400 bg-orange-900/20 text-orange-200'
      case 'yellow':
        return 'border-yellow-400 bg-yellow-900/20 text-yellow-200'
      default:
        return 'border-gray-400 bg-gray-900/20 text-gray-200'
    }
  }

  return (
    <>
      <div 
        className={`min-w-[200px] border-2 rounded-lg p-3 cursor-pointer ${getColorClasses(data.color)}`} 
        style={{ background: 'transparent' }}
        onClick={() => setShowModal(true)}
      >
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-400 border-2 border-gray-600"
          style={{ background: '#6b7280', border: '2px solid #374151' }}
        />
        
        {/* Node Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {data.icon && <data.icon className="w-5 h-5" />}
            <span className="font-semibold text-sm">{data.label}</span>
          </div>
          <div className="text-xs opacity-75">Click to edit</div>
        </div>
        
        {/* Node Type Badge */}
        <div className="text-xs opacity-75 mb-2">Input Node</div>
        
        {/* Quick Info */}
        <div className="text-xs opacity-75">
          {data.inputs?.length || 0} inputs configured
        </div>
        
        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-gray-400 border-2 border-gray-600"
          style={{ background: '#6b7280', border: '2px solid #374151' }}
        />
      </div>

      {/* Node Editor Modal - MASSIVE BEAUTIFUL Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-2"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-gray-900 rounded-3xl shadow-2xl border-4 border-red-500 w-full max-w-[95vw] max-h-[99vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - FORCE REFRESH */}
            <div className="bg-gradient-to-r from-red-800 to-red-900 px-8 py-6 border-b-4 border-red-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/30 border-4 border-red-400 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">🚨 MASSIVE MODAL IS WORKING! 🚨</h3>
                    <p className="text-lg text-red-200">This modal is now MASSIVE and BEAUTIFUL with 4 columns!</p>
                    <p className="text-sm text-red-300">Last Updated: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-xl bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
            
            {/* Modal Content - MASSIVE SPACIOUS Layout */}
            <div className="p-10 h-full overflow-y-auto">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-10 h-full">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Basic Configuration */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-8 border-2 border-gray-600/50 shadow-2xl backdrop-blur-sm">
                    <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-blue-400" />
                      </div>
                      Basic Configuration
                    </h4>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Node Label</label>
                        <input
                          type="text"
                          defaultValue={data.label}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter descriptive node label"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Node Color Theme</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['blue', 'green', 'purple', 'pink', 'orange', 'yellow'].map((color) => (
                            <button
                              key={color}
                              className={`w-full h-10 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                                data.color === color 
                                  ? 'border-white shadow-lg' 
                                  : 'border-gray-500 hover:border-gray-400'
                              }`}
                              style={{
                                background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                                '--tw-gradient-from': `var(--color-${color}-600)`,
                                '--tw-gradient-to': `var(--color-${color}-800)`
                              }}
                            >
                              <span className="text-white font-medium text-xs capitalize">{color}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Service Configuration */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-8 border-2 border-gray-600/50 shadow-2xl backdrop-blur-sm">
                    <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center">
                        <Star className="w-5 h-5 text-yellow-400" />
                      </div>
                      AI Service Integration
                    </h4>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Primary AI Service</label>
                        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                          <option value="openai">OpenAI GPT-4</option>
                          <option value="claude">Anthropic Claude</option>
                          <option value="gemini">Google Gemini</option>
                          <option value="mistral">Mistral AI</option>
                          <option value="perplexity">Perplexity AI</option>
                          <option value="cohere">Cohere</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Fallback AI Service</label>
                        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                          <option value="claude">Anthropic Claude</option>
                          <option value="openai">OpenAI GPT-4</option>
                          <option value="gemini">Google Gemini</option>
                          <option value="mistral">Mistral AI</option>
                          <option value="perplexity">Perplexity AI</option>
                          <option value="cohere">Cohere</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Input Configuration */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-8 border-2 border-gray-600/50 shadow-2xl backdrop-blur-sm">
                    <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-green-500/20 border border-green-400/30 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-400" />
                      </div>
                      Input Configuration
                    </h4>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Required Inputs</label>
                        <div className="space-y-2">
                          {data.inputs?.map((input, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                defaultValue={input}
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Input field name"
                              />
                              <button className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center hover:bg-red-500/30 transition-colors">
                                <X className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          ))}
                          <button className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-gray-400 hover:text-white transition-colors text-sm">
                            + Add Input Field
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Validation Rules */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-8 border-2 border-gray-600/50 shadow-2xl backdrop-blur-sm">
                    <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-purple-400" />
                      </div>
                      Validation Rules
                    </h4>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Required Fields</label>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-blue-500" defaultChecked />
                          <span className="text-sm text-gray-300">Mark all inputs as required</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Input Validation</label>
                        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                          <option value="strict">Strict Validation</option>
                          <option value="moderate">Moderate Validation</option>
                          <option value="loose">Loose Validation</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Third Column - Advanced Settings */}
                <div className="space-y-8">
                  {/* Advanced Configuration */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-8 border-2 border-gray-600/50 shadow-2xl backdrop-blur-sm">
                    <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-purple-400" />
                      </div>
                      Advanced Settings
                    </h4>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Execution Priority</label>
                        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                          <option value="high">High Priority</option>
                          <option value="normal">Normal Priority</option>
                          <option value="low">Low Priority</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (seconds)</label>
                        <input
                          type="number"
                          defaultValue="30"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Retry Attempts</label>
                        <input
                          type="number"
                          defaultValue="3"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="3"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fourth Column - Quality & Performance */}
                <div className="space-y-8">
                  {/* Quality Configuration */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-8 border-2 border-gray-600/50 shadow-2xl backdrop-blur-sm">
                    <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      Quality & Performance
                    </h4>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Quality Level</label>
                        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                          <option value="draft">Draft Quality</option>
                          <option value="standard">Standard Quality</option>
                          <option value="premium">Premium Quality</option>
                          <option value="enterprise">Enterprise Quality</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Performance Mode</label>
                        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                          <option value="fast">Fast Mode</option>
                          <option value="balanced">Balanced Mode</option>
                          <option value="quality">Quality Mode</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Memory Limit (MB)</label>
                        <input
                          type="number"
                          defaultValue="512"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="512"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-800/50 px-6 py-4 border-t border-gray-600 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const ProcessNode = ({ data }) => {
  const [showModal, setShowModal] = useState(false)

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return 'border-blue-400 bg-blue-900/20 text-blue-200'
      case 'green':
        return 'border-green-400 bg-green-900/20 text-green-200'
      case 'purple':
        return 'border-purple-400 bg-purple-900/20 text-purple-200'
      case 'pink':
        return 'border-pink-400 bg-pink-900/20 text-pink-200'
      case 'orange':
        return 'border-orange-400 bg-orange-900/20 text-orange-200'
      case 'yellow':
        return 'border-yellow-400 bg-yellow-900/20 text-yellow-200'
      default:
        return 'border-gray-400 bg-gray-900/20 text-gray-200'
    }
  }

  return (
    <>
      <div 
        className={`min-w-[200px] border-2 rounded-lg p-3 cursor-pointer ${getColorClasses(data.color)}`} 
        style={{ background: 'transparent' }}
        onClick={() => setShowModal(true)}
      >
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-400 border-2 border-gray-600"
          style={{ background: '#6b7280', border: '2px solid #374151' }}
        />
        
        {/* Node Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {data.icon && <data.icon className="w-5 h-5" />}
            <span className="font-semibold text-sm">{data.label}</span>
          </div>
          <div className="text-xs opacity-75">Click to edit</div>
        </div>
        
        {/* Node Type Badge */}
        <div className="text-xs opacity-75 mb-2">Process Node</div>
        
        {/* Quick Info */}
        <div className="text-xs opacity-75">
          {data.services?.length || 0} AI services, ~{data.estimated_tokens?.toLocaleString() || 0} tokens
        </div>
        
        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-gray-400 border-2 border-gray-600"
          style={{ background: '#6b7280', border: '2px solid #374151' }}
        />
      </div>

      {/* Process Node Modal - Proper Responsive Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-600 w-full max-w-7xl max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-400/30 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Process Node Configuration</h3>
                    <p className="text-sm text-gray-400">Configure AI services, processing parameters, and quality standards</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-xl bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
            
            {/* Modal Content - Beautiful Spacious Layout */}
            <div className="p-8 h-full overflow-y-auto">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Basic Configuration */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
                    <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-400" />
                      Basic Configuration
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Node Label</label>
                        <input
                          type="text"
                          defaultValue={data.label}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter descriptive node label"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Node Color Theme</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['blue', 'green', 'purple', 'pink', 'orange', 'yellow'].map((color) => (
                            <button
                              key={color}
                              className={`w-full h-10 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                                data.color === color 
                                  ? 'border-white shadow-lg' 
                                  : 'border-gray-500 hover:border-gray-400'
                              }`}
                              style={{
                                background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                                '--tw-gradient-from': `var(--color-${color}-600)`,
                                '--tw-gradient-to': `var(--color-${color}-800)`
                              }}
                            >
                              <span className="text-white font-medium text-xs capitalize">{color}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Services */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
                    <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      AI Service Integration
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Primary AI Service</label>
                        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                          <option value="openai">OpenAI GPT-4</option>
                          <option value="claude">Anthropic Claude</option>
                          <option value="gemini">Google Gemini</option>
                          <option value="mistral">Mistral AI</option>
                          <option value="perplexity">Perplexity AI</option>
                          <option value="cohere">Cohere</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Secondary AI Service</label>
                        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                          <option value="claude">Anthropic Claude</option>
                          <option value="openai">OpenAI GPT-4</option>
                          <option value="gemini">Google Gemini</option>
                          <option value="mistral">Mistral AI</option>
                          <option value="perplexity">Perplexity AI</option>
                          <option value="cohere">Cohere</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Process Configuration */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
                    <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-green-400" />
                      Process Configuration
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Tokens</label>
                        <input
                          type="number"
                          defaultValue={data.estimated_tokens || 5000}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="5000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                          <option value="high">High Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (seconds)</label>
                        <input
                          type="number"
                          defaultValue="300"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quality Standards */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
                    <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      Quality Standards
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Quality Threshold</label>
                        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                          <option value="excellent">Excellent (90%+)</option>
                          <option value="good">Good (80%+)</option>
                          <option value="acceptable">Acceptable (70%+)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Auto-retry on Failure</label>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-blue-500" defaultChecked />
                          <span className="text-sm text-gray-300">Enable automatic retry</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-800/50 px-6 py-4 border-t border-gray-600 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const OutputNode = ({ data }) => {
  const [showModal, setShowModal] = useState(false)

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return 'border-blue-400 bg-blue-900/20 text-blue-200'
      case 'green':
        return 'border-green-400 bg-green-900/20 text-green-200'
      case 'purple':
        return 'border-purple-400 bg-purple-900/20 text-purple-200'
      case 'pink':
        return 'border-pink-400 bg-pink-900/20 text-pink-200'
      case 'orange':
        return 'border-orange-400 bg-orange-900/20 text-orange-200'
      case 'yellow':
        return 'border-yellow-400 bg-yellow-900/20 text-yellow-200'
      default:
        return 'border-gray-400 bg-gray-900/20 text-gray-200'
    }
  }

  return (
    <>
      <div 
        className={`min-w-[200px] border-2 rounded-lg p-3 cursor-pointer ${getColorClasses(data.color)}`} 
        style={{ background: 'transparent' }}
        onClick={() => setShowModal(true)}
      >
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-400 border-2 border-gray-600"
          style={{ background: '#6b7280', border: '2px solid #374151' }}
        />
        
        {/* Node Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {data.icon && <data.icon className="w-5 h-5" />}
            <span className="font-semibold text-sm">{data.label}</span>
          </div>
          <div className="text-xs opacity-75">Click to edit</div>
        </div>
        
        {/* Node Type Badge */}
        <div className="text-xs opacity-75 mb-2">Output Node</div>
        
        {/* Quick Info */}
        <div className="text-xs opacity-75">
          {data.outputs?.length || 0} output formats configured
        </div>
        
        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-gray-400 border-2 border-gray-600"
          style={{ background: '#6b7280', border: '2px solid #374151' }}
        />
      </div>

      {/* Output Node Modal - 3:4 Ratio */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-600 w-full max-w-4xl aspect-[4/3] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Output Node Configuration</h3>
                    <p className="text-sm text-gray-400">Configure output formats, delivery methods, and quality checks</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-xl bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
            
            {/* Modal Content - Beautiful Spacious Layout */}
            <div className="p-8 h-full overflow-y-auto">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Basic Configuration */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
                    <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-400" />
                      Basic Configuration
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Node Label</label>
                        <input
                          type="text"
                          defaultValue={data.label}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter descriptive node label"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Node Color Theme</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['blue', 'green', 'purple', 'pink', 'orange', 'yellow'].map((color) => (
                            <button
                              key={color}
                              className={`w-full h-10 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                                data.color === color 
                                  ? 'border-white shadow-lg' 
                                  : 'border-gray-500 hover:border-gray-400'
                              }`}
                              style={{
                                background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                                '--tw-gradient-from': `var(--color-${color}-600)`,
                                '--tw-gradient-to': `var(--color-${color}-800)`
                              }}
                            >
                              <span className="text-white font-medium text-xs capitalize">{color}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Output Formats */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
                    <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-400" />
                      Output Formats
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Available Formats</label>
                        <div className="space-y-2">
                          {data.outputs?.map((output, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                defaultValue={output}
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Output format name"
                              />
                              <button className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center hover:bg-red-500/30 transition-colors">
                                <X className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          ))}
                          <button className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-gray-400 hover:text-white transition-colors text-sm">
                            + Add Output Format
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Delivery Configuration */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
                    <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <Download className="w-4 h-4 text-purple-400" />
                      Delivery Configuration
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Method</label>
                        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                          <option value="download">Direct Download</option>
                          <option value="email">Email Delivery</option>
                          <option value="cloud">Cloud Storage</option>
                          <option value="api">API Response</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">File Compression</label>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-blue-500" defaultChecked />
                          <span className="text-sm text-gray-300">Enable compression</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quality Checks */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
                    <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      Quality Checks
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Content Validation</label>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-blue-500" defaultChecked />
                          <span className="text-sm text-gray-300">Validate content quality</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Format Verification</label>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-blue-500" defaultChecked />
                          <span className="text-sm text-gray-300">Verify output formats</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-800/50 px-6 py-4 border-t border-gray-600 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors">
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const nodeTypes = {
  input: InputNode,
  process: ProcessNode,
  output: OutputNode
}

const UnderTheHoodNew = () => {

  

    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [selectedFlow, setSelectedFlow] = useState('simplified')
    const [showNodePalette, setShowNodePalette] = useState(false)
    const [flowName, setFlowName] = useState('')
    const [flowDescription, setFlowDescription] = useState('')
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [saving, setSaving] = useState(false)

  

    // Pre-built professional flows
    const professionalFlows = useMemo(() => {
    
      return {
        simplified: {
          name: 'Streamlined Book Creator',
          description: 'Quick, high-quality book generation in 3 steps',
          nodes: [
            {
              id: 'start',
              type: 'input',
              position: { x: 100, y: 100 },
              data: { 
                label: 'Book Requirements',
                inputs: ['title', 'genre', 'target_audience', 'word_count'],
                icon: FileText,
                color: 'blue'
              }
            },
            {
              id: 'content_gen',
              type: 'process',
              position: { x: 400, y: 100 },
              data: { 
                label: 'AI Content Generation',
                services: ['openai', 'claude', 'gemini'],
                estimated_tokens: 5000,
                icon: Settings,
                color: 'green'
              }
            },
            {
              id: 'finish',
              type: 'output',
              position: { x: 700, y: 100 },
              data: { 
                label: 'Final Book',
                outputs: ['formatted_pdf', 'epub', 'print_ready'],
                icon: Star,
                color: 'yellow'
              }
            }
          ],
          edges: [
            { id: 'e1-2', source: 'start', target: 'content_gen', type: 'smoothstep' },
            { id: 'e2-3', source: 'content_gen', target: 'finish', type: 'smoothstep' }
          ]
        },
        
        advanced: {
          name: 'Advanced Content Studio',
          description: 'Professional content creation with research and optimization',
          nodes: [
            {
              id: 'research',
              type: 'input',
              position: { x: 50, y: 100 },
              data: { 
                label: 'Research & Analysis',
                inputs: ['topic', 'audience', 'competitors', 'trends'],
                icon: Search,
                color: 'purple'
              }
            },
            {
              id: 'outline',
              type: 'process',
              position: { x: 300, y: 100 },
              data: { 
                label: 'Content Outline',
                services: ['claude', 'openai'],
                estimated_tokens: 2000,
                icon: FileText,
                color: 'blue'
              }
            },
            {
              id: 'creation',
              type: 'process',
              position: { x: 550, y: 100 },
              data: { 
                label: 'Content Creation',
                services: ['openai', 'gemini', 'mistral'],
                estimated_tokens: 8000,
                icon: Settings,
                color: 'green'
              }
            },
            {
              id: 'optimization',
              type: 'process',
              position: { x: 800, y: 100 },
              data: { 
                label: 'SEO & Optimization',
                services: ['perplexity', 'claude'],
                estimated_tokens: 3000,
                icon: Target,
                color: 'orange'
              }
            },
            {
              id: 'delivery',
              type: 'output',
              position: { x: 1050, y: 100 },
              data: { 
                label: 'Multi-Format Delivery',
                outputs: ['web_content', 'pdf', 'social_media', 'email'],
                icon: Star,
                color: 'yellow'
              }
            }
          ],
          edges: [
            { id: 'e1-2', source: 'research', target: 'outline', type: 'smoothstep' },
            { id: 'e2-3', source: 'outline', target: 'creation', type: 'smoothstep' },
            { id: 'e3-4', source: 'creation', target: 'optimization', type: 'smoothstep' },
            { id: 'e4-5', source: 'optimization', target: 'delivery', type: 'smoothstep' }
          ]
        },
        
        enterprise: {
          name: 'Enterprise Content Hub',
          description: 'Full-scale content management with team collaboration',
          nodes: [
            {
              id: 'planning',
              type: 'input',
              position: { x: 50, y: 80 },
              data: { 
                label: 'Strategic Planning',
                inputs: ['business_goals', 'content_strategy', 'timeline', 'budget'],
                icon: Target,
                color: 'indigo'
              }
            },
            {
              id: 'team_setup',
              type: 'process',
              position: { x: 300, y: 80 },
              data: { 
                label: 'Team Assignment',
                services: ['claude', 'openai'],
                estimated_tokens: 1500,
                icon: Users,
                color: 'blue'
              }
            },
            {
              id: 'content_creation',
              type: 'process',
              position: { x: 550, y: 80 },
              data: { 
                label: 'Parallel Creation',
                services: ['openai', 'gemini', 'mistral', 'perplexity'],
                estimated_tokens: 12000,
                icon: Settings,
                color: 'green'
              }
            },
            {
              id: 'quality_check',
              type: 'process',
              position: { x: 800, y: 80 },
              data: { 
                label: 'Quality Assurance',
                services: ['claude', 'openai'],
                estimated_tokens: 4000,
                icon: CheckCircle,
                color: 'purple'
              }
            },
            {
              id: 'distribution',
              type: 'output',
              position: { x: 1050, y: 80 },
              data: { 
                label: 'Multi-Channel Distribution',
                outputs: ['website', 'social', 'email', 'print', 'video'],
                icon: Star,
                color: 'yellow'
              }
            }
          ],
          edges: [
            { id: 'e1-2', source: 'planning', target: 'team_setup', type: 'smoothstep' },
            { id: 'e2-3', source: 'team_setup', target: 'content_creation', type: 'smoothstep' },
            { id: 'e3-4', source: 'content_creation', target: 'quality_check', type: 'smoothstep' },
            { id: 'e4-5', source: 'quality_check', target: 'distribution', type: 'smoothstep' }
          ]
        },
        
        conditional: {
          name: 'Smart Conditional Workflow',
          description: 'Intelligent content routing based on conditions and quality scores',
          nodes: [
            {
              id: 'input_analysis',
              type: 'input',
              position: { x: 50, y: 150 },
              data: { 
                label: 'Input Analysis',
                inputs: ['content_type', 'complexity', 'urgency', 'quality_requirements'],
                icon: Search,
                color: 'blue'
              }
            },
            {
              id: 'quality_assessment',
              type: 'process',
              position: { x: 300, y: 150 },
              data: { 
                label: 'Quality Assessment',
                services: ['claude', 'openai'],
                estimated_tokens: 2500,
                icon: CheckCircle,
                color: 'purple'
              }
            },
            {
              id: 'conditional_routing',
              type: 'process',
              position: { x: 550, y: 150 },
              data: { 
                label: 'Smart Routing',
                services: ['openai', 'claude'],
                estimated_tokens: 1500,
                icon: Settings,
                color: 'orange'
              }
            },
            {
              id: 'high_quality_path',
              type: 'process',
              position: { x: 800, y: 50 },
              data: { 
                label: 'Premium Processing',
                services: ['claude', 'openai'],
                estimated_tokens: 8000,
                icon: Crown,
                color: 'gold'
              }
            },
            {
              id: 'standard_path',
              type: 'process',
              position: { x: 800, y: 150 },
              data: { 
                label: 'Standard Processing',
                services: ['gemini', 'mistral'],
                estimated_tokens: 5000,
                icon: Settings,
                color: 'green'
              }
            },
            {
              id: 'fast_path',
              type: 'process',
              position: { x: 800, y: 250 },
              data: { 
                label: 'Quick Processing',
                services: ['perplexity', 'openai'],
                estimated_tokens: 3000,
                icon: Zap,
                color: 'red'
              }
            },
            {
              id: 'final_output',
              type: 'output',
              position: { x: 1050, y: 150 },
              data: { 
                label: 'Conditional Output',
                outputs: ['premium_format', 'standard_format', 'quick_format'],
                icon: Star,
                color: 'yellow'
              }
            }
          ],
          edges: [
            { id: 'e1-2', source: 'input_analysis', target: 'quality_assessment', type: 'smoothstep' },
            { id: 'e2-3', source: 'quality_assessment', target: 'conditional_routing', type: 'smoothstep' },
            { id: 'e3-4', source: 'conditional_routing', target: 'high_quality_path', type: 'smoothstep' },
            { id: 'e3-5', source: 'conditional_routing', target: 'standard_path', type: 'smoothstep' },
            { id: 'e3-6', source: 'conditional_routing', target: 'fast_path', type: 'smoothstep' },
            { id: 'e4-7', source: 'high_quality_path', target: 'final_output', type: 'smoothstep' },
            { id: 'e5-7', source: 'standard_path', target: 'final_output', type: 'smoothstep' },
            { id: 'e6-7', source: 'fast_path', target: 'final_output', type: 'smoothstep' }
          ]
        }
      }
    }, [])

  

    // Load selected flow
    const loadFlow = useCallback((flowType) => {
  
      setSelectedFlow(flowType)
      const flow = professionalFlows[flowType]
      if (flow) {
        setNodes(flow.nodes)
        setEdges(flow.edges)
        setFlowName(flow.name)
        setFlowDescription(flow.description)
      }
    }, [professionalFlows, setNodes, setEdges])

    // Handle node changes
    const onNodeChanges = useCallback(
      (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
      [setNodes]
    )

    // Handle edge changes
    const onEdgeChanges = useCallback(
      (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
      [setEdges]
    )

    // Handle connections
    const onConnect = useCallback(
      (params) => setEdges((eds) => addEdge(params, eds)),
      [setEdges]
    )

    // Add node from palette
    const addNodeFromPalette = useCallback((nodeType, position) => {
      const newNode = {
        id: `${nodeType}_${Date.now()}`,
        type: nodeType,
        position,
        data: { 
          label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
          icon: FileText,
          color: 'blue'
        }
      }
      setNodes((nds) => [...nds, newNode])
      setShowNodePalette(false)
      toast.success(`Added ${nodeType} node`)
    }, [setNodes])

    // Load initial flow
    React.useEffect(() => {
    
      loadFlow('simplified')
    }, [loadFlow])

  

    return (
      <div className="space-y-6">
        {/* Custom CSS to remove white boxes */}
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        
        {/* Header */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Star className="w-8 h-8 text-purple-400" />
                Under The Hood
              </h2>
              <p className="text-gray-400 mt-1">
                Professional workflow engine with React Flow and smart node-based design
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNodePalette(!showNodePalette)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Node
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Flow
              </button>
            </div>
          </div>
        </div>

        {/* Flow Selector - Clean Dropdown */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white">Select Workflow</h3>
              <div className="relative">
                <select
                  value={selectedFlow}
                  onChange={(e) => loadFlow(e.target.value)}
                  className="appearance-none bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-w-[280px]"
                >
                  {Object.entries(professionalFlows).map(([key, flow]) => (
                    <option key={key} value={key} className="bg-gray-700 text-white">
                      {flow.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Current Flow Info */}
            <div className="text-right">
              <p className="text-sm text-gray-400">
                {professionalFlows[selectedFlow]?.description}
              </p>
            </div>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="h-[600px] w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodeChanges}
              onEdgesChange={onEdgeChanges}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gray-900"
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>

        {/* Node Palette Modal */}
        {showNodePalette && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Add Node</h3>
                <button
                  onClick={() => setShowNodePalette(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(nodeTypes).map(([type, Component]) => (
                  <button
                    key={type}
                    onClick={() => addNodeFromPalette(type, { x: Math.random() * 400 + 100, y: Math.random() * 200 + 100 })}
                    className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white text-sm capitalize">{type} Node</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save Flow Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Save Flow</h3>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Flow Name</label>
                  <input
                    type="text"
                    value={flowName}
                    onChange={(e) => setFlowName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    placeholder="Enter flow name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={flowDescription}
                    onChange={(e) => setFlowDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    rows="3"
                    placeholder="Enter flow description"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success(`Flow "${flowName}" saved successfully!`)
                    setShowSaveModal(false)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
                >
                  Save Flow
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    )

}

export default UnderTheHoodNew
