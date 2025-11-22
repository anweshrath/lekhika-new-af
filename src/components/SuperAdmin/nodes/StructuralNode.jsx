import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { ChevronRight, ChevronDown, GripVertical, BookOpen, FileText, User, Star } from 'lucide-react'

const StructuralNode = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(false)
  const [structuralElements, setStructuralElements] = useState(data.structuralElements || [
    { id: 'title', name: 'Title', type: 'title', required: true, order: 1 },
    { id: 'subtitle', name: 'Subtitle', type: 'subtitle', required: false, order: 2 },
    { id: 'intro', name: 'Introduction', type: 'intro', required: true, order: 3 },
    { id: 'foreword', name: 'Foreword', type: 'foreword', required: false, order: 4 },
    { id: 'about_author', name: 'About the Author', type: 'about_author', required: true, order: 5 }
  ])

  const getColorClasses = () => {
    return 'border-indigo-400 bg-indigo-900/20 text-indigo-200'
  }

  const getElementIcon = (type) => {
    switch (type) {
      case 'title':
        return Star
      case 'subtitle':
        return FileText
      case 'intro':
        return BookOpen
      case 'foreword':
        return FileText
      case 'about_author':
        return User
      default:
        return FileText
    }
  }

  const moveElement = (fromIndex, toIndex) => {
    const newElements = [...structuralElements]
    const [movedElement] = newElements.splice(fromIndex, 1)
    newElements.splice(toIndex, 0, movedElement)
    
    // Update order numbers
    const updatedElements = newElements.map((element, index) => ({
      ...element,
      order: index + 1
    }))
    
    setStructuralElements(updatedElements)
    
    // Update data
    if (data.onUpdate) {
      data.onUpdate({ ...data, structuralElements: updatedElements })
    }
  }

  const toggleElementRequired = (index) => {
    const newElements = [...structuralElements]
    newElements[index].required = !newElements[index].required
    setStructuralElements(newElements)
    
    if (data.onUpdate) {
      data.onUpdate({ ...data, structuralElements: newElements })
    }
  }

  return (
    <div className={`min-w-[280px] border-2 rounded-lg p-3 ${getColorClasses()} ${selected ? 'ring-2 ring-indigo-300' : ''}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-400 border-2 border-gray-600"
      />
      
      {/* Node Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <span className="font-semibold text-sm">{data.label || 'Structural Node'}</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-indigo-400 hover:text-indigo-200 transition-colors"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Node Type Badge */}
      <div className="text-xs opacity-75 mb-2 flex items-center gap-1">
        <span className="bg-indigo-600/30 px-2 py-1 rounded">STRUCTURAL</span>
        <span className="text-indigo-300">Book Structure</span>
      </div>
      
      {/* Structural Elements Preview */}
      <div className="text-xs space-y-1">
        {structuralElements.slice(0, 3).map((element, index) => {
          const ElementIcon = getElementIcon(element.type)
          return (
            <div key={element.id} className="flex items-center gap-2 text-indigo-300">
              <ElementIcon className="w-3 h-3" />
              <span>{element.name}</span>
              {element.required && <span className="text-red-400 text-xs">*</span>}
            </div>
          )
        })}
        {structuralElements.length > 3 && (
          <div className="text-indigo-400 text-xs">+{structuralElements.length - 3} more...</div>
        )}
      </div>
      
      {/* Expandable Content */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-indigo-400/20">
          <div className="space-y-3">
            <div className="text-xs font-medium text-indigo-300">Book Structure Elements:</div>
            
            <div className="space-y-2">
              {structuralElements.map((element, index) => {
                const ElementIcon = getElementIcon(element.type)
                return (
                  <div key={element.id} className="flex items-center gap-2 p-2 bg-indigo-800/20 rounded">
                    <GripVertical className="w-3 h-3 text-indigo-400 cursor-move" />
                    <ElementIcon className="w-4 h-4 text-indigo-300" />
                    <span className="text-xs text-indigo-200 flex-1">{element.name}</span>
                    <button
                      onClick={() => toggleElementRequired(index)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        element.required
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {element.required ? 'Required' : 'Optional'}
                    </button>
                  </div>
                )
              })}
            </div>
            
            <div className="text-xs text-indigo-400">
              Drag elements to reorder • Click Required/Optional to toggle
            </div>
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

export default StructuralNode
