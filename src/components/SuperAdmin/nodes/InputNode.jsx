import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { ChevronRight, ChevronDown, Trash2 } from 'lucide-react'

const InputNode = ({ data, onDelete }) => {
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
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-400 hover:text-red-300 transition-colors ml-1"
              title="Delete Node"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      
      {/* Node Type Badge */}
      <div className="text-xs opacity-75 mb-2 flex items-center gap-1">
        <span className="bg-cyan-600/30 text-cyan-300 px-2 py-1 rounded">INPUT</span>
        <span className="text-gray-300">Data Collection</span>
      </div>
      
      {/* Expandable Content */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <div className="space-y-2">
            <div className="text-xs font-medium">Inputs:</div>
            {data.inputFields && data.inputFields.map((field, index) => (
              <div key={field.id || index} className="text-xs bg-black/20 rounded px-2 py-1">
                {field.name || field.variable || `Field ${index + 1}`}
              </div>
            ))}
            {data.inputs && data.inputs.map((input, index) => (
              <div key={index} className="text-xs bg-black/20 rounded px-2 py-1">
                {input}
              </div>
            ))}
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

export default InputNode
