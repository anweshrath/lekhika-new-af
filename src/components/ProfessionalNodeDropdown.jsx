import React, { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { PROFESSIONAL_NODE_PALETTE, NODE_ROLE_CONFIG } from '../data/professionalNodePalette'

const ProfessionalNodeDropdown = ({ onNodeSelect, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = {
    all: 'All Nodes',
    input: 'Input',
    research: 'Research & Analysis', 
    planning: 'Planning & Structure',
    creative: 'Creative Development',
    writing: 'Content Creation',
    refinement: 'Content Refinement',
    output: 'Output Generation'
  }

  const getAllNodes = () => {
    const allNodes = []
    
    // Input nodes
    Object.values(PROFESSIONAL_NODE_PALETTE.input || {}).forEach(node => {
      allNodes.push({ ...node, category: 'input' })
    })
    
    // Research nodes
    Object.values(PROFESSIONAL_NODE_PALETTE.research || {}).forEach(node => {
      allNodes.push({ ...node, category: 'research' })
    })
    
    // Planning nodes
    Object.values(PROFESSIONAL_NODE_PALETTE.planning || {}).forEach(node => {
      allNodes.push({ ...node, category: 'planning' })
    })
    
    // Creative nodes
    Object.values(PROFESSIONAL_NODE_PALETTE.creative || {}).forEach(node => {
      allNodes.push({ ...node, category: 'creative' })
    })
    
    // Writing nodes
    Object.values(PROFESSIONAL_NODE_PALETTE.writing || {}).forEach(node => {
      allNodes.push({ ...node, category: 'writing' })
    })
    
    // Refinement nodes
    Object.values(PROFESSIONAL_NODE_PALETTE.refinement || {}).forEach(node => {
      allNodes.push({ ...node, category: 'refinement' })
    })
    
    // Output nodes
    Object.values(PROFESSIONAL_NODE_PALETTE.output || {}).forEach(node => {
      allNodes.push({ ...node, category: 'output' })
    })
    
    return allNodes
  }

  const filteredNodes = selectedCategory === 'all' 
    ? getAllNodes()
    : getAllNodes().filter(node => node.category === selectedCategory)

  const handleNodeSelect = (node) => {
    onNodeSelect(node)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary-500 dark:hover:border-primary-400"
      >
        <div className="flex items-center space-x-3">
          {/* Logo in dropdown */}
          <div className="flex items-center justify-center">
            <img 
              src="/src/components/img/11.png" 
              alt="LEKHIKA"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white text-lg font-bold">
            <Plus className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900 dark:text-white">Add Professional Node</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Choose from 13 specialized roles</div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Category filter */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {Object.entries(categories).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedCategory === key
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Node list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredNodes.length > 0 ? (
              <div className="p-2">
                {filteredNodes.map((node, index) => {
                  const roleConfig = NODE_ROLE_CONFIG[node.role] || {}
                  
                  return (
                    <button
                      key={`${node.id}-${index}`}
                      onClick={() => handleNodeSelect(node)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
                    >
                      {/* Node icon with gradient */}
                      <div 
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg bg-gradient-to-r ${roleConfig.gradient || 'from-gray-400 to-gray-600'} group-hover:scale-105 transition-transform`}
                      >
                        {roleConfig.icon || '⚙️'}
                      </div>
                      
                      {/* Node details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {node.data.label}
                          </h4>
                          {node.role === 'content_writer' && (
                            <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-green-500 text-white text-xs rounded-full font-bold">
                              WRITER
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {node.data.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                            {categories[node.category] || node.category}
                          </span>
                          {roleConfig.canWriteContent && (
                            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full font-semibold">
                              Content Writer
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🔍</div>
                <p>No nodes found in this category</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ProfessionalNodeDropdown
