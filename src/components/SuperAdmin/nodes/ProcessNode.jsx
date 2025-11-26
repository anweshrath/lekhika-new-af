import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { ChevronRight, ChevronDown } from 'lucide-react'

const ProcessNode = ({ data }) => {
  const [expanded, setExpanded] = useState(false)

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
    <div className={`min-w-[200px] border-2 rounded-lg p-3 ${getColorClasses(data.color)}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-400 border-2 border-gray-600"
      />
      
      {/* Node Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {data.icon && <data.icon className="w-5 h-5" />}
          <span className="font-semibold text-sm">{data.label}</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Node Type Badge */}
      <div className="text-xs opacity-75 mb-2 flex items-center gap-1">
        <span className={`px-2 py-1 rounded ${
          data.role === 'writer' ? 'bg-green-600/30 text-green-300' :
          data.role === 'researcher' ? 'bg-blue-600/30 text-blue-300' :
          data.role === 'editor' ? 'bg-purple-600/30 text-purple-300' :
          'bg-gray-600/30 text-gray-300'
        }`}>
          {data.role === 'writer' ? 'WRITER' :
           data.role === 'researcher' ? 'RESEARCHER' :
           data.role === 'editor' ? 'EDITOR' :
           'PROCESS'}
        </span>
        <span className="text-gray-300">
          {data.role === 'writer' ? 'Content Creation' :
           data.role === 'researcher' ? 'Research & Analysis' :
           data.role === 'editor' ? 'Review & Polish' :
           'Data Processing'}
        </span>
      </div>
      
      {/* Expandable Content */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <div className="space-y-2">
            {data.services && (
              <div>
                <div className="text-xs font-medium">AI Services:</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.services.map((service, index) => (
                    <span key={index} className="text-xs bg-black/20 rounded px-2 py-1">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {data.estimated_tokens && (
              <div>
                <div className="text-xs font-medium">Estimated Tokens:</div>
                <div className="text-xs bg-black/20 rounded px-2 py-1 mt-1">
                  {data.estimated_tokens.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-400 border-2 border-gray-600"
      />
    </div>
  )
}

export default ProcessNode
