import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { 
  FileText, 
  Brain, 
  GitBranch, 
  CheckCircle, 
  Zap, 
  Settings,
  Layers,
  Sparkles,
  Target,
  Trash2,
  Eye,
  RefreshCw,
  BookOpen,
  User,
  Star,
  GripVertical
} from 'lucide-react'

// Helper function to get beautiful gradient for each role type
const getRoleGradient = (role) => {
  const roleGradients = {
    // Research roles - Dark Green shades
    'researcher': 'bg-gradient-to-r from-emerald-600 to-emerald-700',
    'market_analyst': 'bg-gradient-to-r from-emerald-700 to-emerald-800',
    'fact_checker': 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    
    // Creative roles - Bright Green shades
    'world_builder': 'bg-gradient-to-r from-green-500 to-green-600',
    'character_developer': 'bg-gradient-to-r from-green-600 to-green-700',
    'plot_architect': 'bg-gradient-to-r from-green-400 to-green-500',
    
    // Content Writers - Vibrant Green shades
    'content_writer': 'bg-gradient-to-r from-lime-600 to-green-600',
    'technical_writer': 'bg-gradient-to-r from-lime-700 to-green-700',
    'copywriter': 'bg-gradient-to-r from-lime-500 to-green-500',
    
    // Structural roles - Forest Green shades
    'story_outliner': 'bg-gradient-to-r from-green-700 to-green-800',
    'narrative_architect': 'bg-gradient-to-r from-green-800 to-green-900',
    'content_architect': 'bg-gradient-to-r from-green-600 to-green-700',
    
    // Quality roles - Teal Green shades
    'editor': 'bg-gradient-to-r from-teal-600 to-green-600',
    'quality_checker': 'bg-gradient-to-r from-teal-700 to-green-700',
    'proofreader': 'bg-gradient-to-r from-teal-500 to-green-500',
    
    // Input roles - Blue shades
    'universal_input': 'bg-gradient-to-r from-blue-600 to-blue-700',
    'story_input': 'bg-gradient-to-r from-blue-500 to-blue-600',
    'business_input': 'bg-gradient-to-r from-blue-700 to-blue-800',
    
    // Condition roles - Amber shades
    'preference_router': 'bg-gradient-to-r from-amber-600 to-amber-700',
    'quality_gate': 'bg-gradient-to-r from-amber-500 to-amber-600',
    
    // Preview roles - Cyan shades
    'customer_preview': 'bg-gradient-to-r from-cyan-600 to-cyan-700',
    'quality_preview': 'bg-gradient-to-r from-cyan-500 to-cyan-600',
    
    // Output roles - Purple shades
    'output_formatter': 'bg-gradient-to-r from-purple-600 to-purple-700',
    'final_compiler': 'bg-gradient-to-r from-purple-700 to-purple-800'
  }
  
  // Default gradient based on node type
  if (roleGradients[role]) {
    return roleGradients[role]
  }
  
  // Fallback gradients by role pattern
  if (role.includes('writer') || role.includes('content')) {
    return 'bg-gradient-to-r from-lime-600 to-green-600'
  } else if (role.includes('research') || role.includes('analyst')) {
    return 'bg-gradient-to-r from-emerald-600 to-emerald-700'
  } else if (role.includes('editor') || role.includes('quality')) {
    return 'bg-gradient-to-r from-teal-600 to-green-600'
  } else if (role.includes('input')) {
    return 'bg-gradient-to-r from-blue-600 to-blue-700'
  } else if (role.includes('output')) {
    return 'bg-gradient-to-r from-purple-600 to-purple-700'
  } else if (role.includes('preview')) {
    return 'bg-gradient-to-r from-cyan-600 to-cyan-700'
  } else if (role.includes('condition') || role.includes('router')) {
    return 'bg-gradient-to-r from-amber-600 to-amber-700'
  }
  
  // Ultimate fallback
  return 'bg-gradient-to-r from-gray-600 to-gray-700'
}

// Helper function to format role names beautifully
const formatRoleName = (role) => {
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Ai/g, 'AI')
}

// Beautiful Input Node
export function InputNode({ data, selected, onDelete }) {
  return (
    <div className={`relative transform transition-all duration-300 ${selected ? 'scale-105' : 'hover:scale-102'}`}>
      {/* Connection Handles */}
      <Handle 
        type="source" 
        position={Position.Top} 
        className="w-4 h-4 !bg-gradient-to-r !from-blue-400 !to-blue-600 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-gradient-to-r !from-blue-400 !to-blue-600 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-4 h-4 !bg-gradient-to-r !from-blue-400 !to-blue-600 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-gradient-to-r !from-blue-400 !to-blue-600 !border-2 !border-white shadow-lg" 
      />
      
      {/* Node Body */}
      <div className={`
        relative bg-gradient-to-br from-blue-50 via-blue-100 to-blue-100/90 
        rounded-2xl shadow-xl border-2 border-dashed transition-all duration-300 min-w-[240px] max-w-[280px]
        ${selected ? 'border-blue-400 shadow-blue-400/30' : 'border-blue-300 shadow-blue-300/20'}
        hover:shadow-blue-400/40 hover:border-blue-400
      `}>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/10 to-transparent rounded-2xl" />
        
        {/* Header Section */}
        <div className="relative p-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-500/90 backdrop-blur-sm rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg leading-tight">
                {data.label || 'Input Collection'}
              </h3>
              <p className="text-blue-600 text-sm font-medium">
                {data.inputFields?.length || 0} fields configured
              </p>
              {/* Beautiful Role-based label with gradient */}
              {data.role && (
                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg mt-2 ${getRoleGradient(data.role)}`}>
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse"></div>
                  {formatRoleName(data.role)}
                </div>
              )}
            </div>
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded-lg"
                title="Delete Node"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="relative px-4 pb-4">
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {data.description || 'Collect user inputs and preferences'}
          </p>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            {data.aiEnabled && (
              <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full text-xs text-yellow-700 font-medium">
                <Zap className="w-3 h-3" />
                AI Enhanced
              </span>
            )}
            {data.inputFields?.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full text-xs text-green-700 font-medium">
                <Target className="w-3 h-3" />
                {data.inputFields.length} Fields
              </span>
            )}
          </div>
        </div>
        
        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/30 via-transparent to-blue-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  )
}

// Beautiful Process Node
export function ProcessNode({ data, selected, onDelete }) {
  return (
    <div className={`relative transform transition-all duration-300 ${selected ? 'scale-105' : 'hover:scale-102'}`}>
      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-4 h-4 !bg-gradient-to-r !from-green-400 !to-green-600 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-gradient-to-r !from-green-400 !to-green-600 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-4 h-4 !bg-gradient-to-r !from-green-400 !to-green-600 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-gradient-to-r !from-green-400 !to-green-600 !border-2 !border-white shadow-lg" 
      />
      
      {/* Node Body */}
      <div className={`
        relative bg-gradient-to-br from-green-50 via-green-100 to-green-100/90 
        rounded-2xl shadow-xl border-2 border-dashed transition-all duration-300 min-w-[240px] max-w-[280px]
        ${selected ? 'border-green-400 shadow-green-400/30' : 'border-green-300 shadow-green-300/20'}
        hover:shadow-green-400/40 hover:border-green-400
      `}>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-200/10 to-transparent rounded-2xl" />
        
        {/* Header Section */}
        <div className="relative p-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-500/90 backdrop-blur-sm rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg leading-tight">
                {data.label || 'AI Processing'}
              </h3>
              <p className="text-green-600 text-sm font-medium">
                {data.selectedModels?.length || 0} models active
              </p>
              {/* Beautiful Role-based label with gradient */}
              {data.role && (
                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg mt-2 ${getRoleGradient(data.role)}`}>
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse"></div>
                  {formatRoleName(data.role)}
                </div>
              )}
            </div>
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded-lg"
                title="Delete Node"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="relative px-4 pb-4">
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {data.description || 'AI-powered content processing'}
          </p>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            {data.selectedModels?.length > 1 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-700 font-medium">
                <Layers className="w-3 h-3" />
                Multi-Model
              </span>
            )}
            {data.aiEnabled && (
              <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full text-xs text-yellow-700 font-medium">
                <Sparkles className="w-3 h-3" />
                AI Ready
              </span>
            )}
          </div>
        </div>
        
        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/30 via-transparent to-green-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  )
}

// Beautiful Condition Node
export function ConditionNode({ data, selected, onDelete }) {
  return (
    <div className={`relative transform transition-all duration-300 ${selected ? 'scale-105' : 'hover:scale-102'}`}>
      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-4 h-4 !bg-gradient-to-r !from-amber-400 !to-orange-500 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-gradient-to-r !from-amber-400 !to-orange-500 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-4 h-4 !bg-gradient-to-r !from-amber-400 !to-orange-500 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-gradient-to-r !from-amber-400 !to-orange-500 !border-2 !border-white shadow-lg" 
      />
      
      {/* Node Body */}
      <div className={`
        relative bg-gradient-to-br from-amber-50 via-amber-100 to-amber-100/90 
        rounded-2xl shadow-xl border-2 border-dashed transition-all duration-300 min-w-[240px] max-w-[280px]
        ${selected ? 'border-amber-400 shadow-amber-400/30' : 'border-amber-300 shadow-amber-300/20'}
        hover:shadow-amber-400/40 hover:border-amber-400
      `}>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-200/10 to-transparent rounded-2xl" />
        
        {/* Header Section */}
        <div className="relative p-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-amber-500/90 backdrop-blur-sm rounded-xl shadow-lg">
              <GitBranch className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg leading-tight">
                {data.label || 'Decision Logic'}
              </h3>
              <p className="text-amber-600 text-sm font-medium">
                {data.connectedNodes?.length || 0} paths connected
              </p>
              {/* Beautiful Role-based label with gradient */}
              {data.role && (
                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg mt-2 ${getRoleGradient(data.role)}`}>
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse"></div>
                  {formatRoleName(data.role)}
                </div>
              )}
            </div>
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded-lg"
                title="Delete Node"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="relative px-4 pb-4">
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {data.description || 'Conditional logic and branching'}
          </p>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            {data.conditions?.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-700 font-medium">
                <Settings className="w-3 h-3" />
                {data.conditions.length} Rules
              </span>
            )}
            {data.connectedNodes?.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full text-xs text-green-700 font-medium">
                <Target className="w-3 h-3" />
                {data.connectedNodes.length} Connected
              </span>
            )}
          </div>
        </div>
        
        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/30 via-transparent to-orange-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  )
}

// Beautiful Output Node
export function OutputNode({ data, selected, onDelete }) {
  return (
    <div className={`relative transform transition-all duration-300 ${selected ? 'scale-105' : 'hover:scale-102'}`}>
      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-4 h-4 !bg-gradient-to-r !from-purple-400 !to-purple-600 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-gradient-to-r !from-purple-400 !to-purple-600 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-4 h-4 !bg-gradient-to-r !from-purple-400 !to-purple-600 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-gradient-to-r !from-purple-400 !to-purple-600 !border-2 !border-white shadow-lg" 
      />
      
      {/* Node Body */}
      <div className={`
        relative bg-gradient-to-br from-purple-50 via-purple-100 to-purple-100/90 
        rounded-2xl shadow-xl border-2 border-dashed transition-all duration-300 min-w-[240px] max-w-[280px]
        ${selected ? 'border-purple-400 shadow-purple-400/30' : 'border-purple-300 shadow-purple-300/20'}
        hover:shadow-purple-400/40 hover:border-purple-400
      `}>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-200/10 to-transparent rounded-2xl" />
        
        {/* Header Section */}
        <div className="relative p-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-500/90 backdrop-blur-sm rounded-xl shadow-lg">
              <CheckCircle className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg leading-tight">
                {data.label || 'Final Output'}
              </h3>
              <p className="text-purple-600 text-sm font-medium">
                {data.outputFormat || 'text'} format
              </p>
              {/* Beautiful Role-based label with gradient */}
              {data.role && (
                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg mt-2 ${getRoleGradient(data.role)}`}>
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse"></div>
                  {formatRoleName(data.role)}
                </div>
              )}
            </div>
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded-lg"
                title="Delete Node"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="relative px-4 pb-4">
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {data.description || 'Generate final book output'}
          </p>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            {data.generateCover && (
              <span className="flex items-center gap-1 px-2 py-1 bg-pink-500/20 rounded-full text-xs text-pink-700 font-medium">
                <Sparkles className="w-3 h-3" />
                Cover Gen
              </span>
            )}
            {data.outputFormat && (
              <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-700 font-medium">
                <FileText className="w-3 h-3" />
                {data.outputFormat.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        
        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/30 via-transparent to-violet-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  )
}

// Beautiful Preview Node
export function PreviewNode({ data, selected, onDelete }) {
  return (
    <div className={`relative transform transition-all duration-300 ${selected ? 'scale-105' : 'hover:scale-102'}`}>
      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-4 h-4 !bg-gradient-to-r !from-cyan-400 !to-teal-500 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-gradient-to-r !from-cyan-400 !to-teal-500 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-4 h-4 !bg-gradient-to-r !from-cyan-400 !to-teal-500 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-gradient-to-r !from-cyan-400 !to-teal-500 !border-2 !border-white shadow-lg" 
      />
      
      {/* Node Body */}
      <div className={`
        relative bg-gradient-to-br from-cyan-50 via-teal-100 to-teal-100/90 
        rounded-2xl shadow-xl border-2 border-dashed transition-all duration-300 min-w-[240px] max-w-[280px]
        ${selected ? 'border-cyan-400 shadow-cyan-400/30' : 'border-cyan-300 shadow-cyan-300/20'}
        hover:shadow-cyan-400/40 hover:border-cyan-400
      `}>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/10 to-transparent rounded-2xl" />
        
        {/* Header Section */}
        <div className="relative p-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-cyan-500/90 backdrop-blur-sm rounded-xl shadow-lg">
              <Eye className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg leading-tight">
                {data.label || 'Preview & Approve'}
              </h3>
              <p className="text-cyan-600 text-sm font-medium">
                {data.maxAttempts || '∞'} max attempts
              </p>
              {/* Beautiful Role-based label with gradient */}
              {data.role && (
                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg mt-2 ${getRoleGradient(data.role)}`}>
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse"></div>
                  {formatRoleName(data.role)}
                </div>
              )}
            </div>
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded-lg"
                title="Delete Node"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="relative px-4 pb-4">
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {data.description || 'Generate preview for customer approval'}
          </p>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            {data.previewLength && (
              <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-700 font-medium">
                <FileText className="w-3 h-3" />
                {data.previewLength}
              </span>
            )}
            {data.maxAttempts && (
              <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full text-xs text-orange-700 font-medium">
                <RefreshCw className="w-3 h-3" />
                {data.maxAttempts} Attempts
              </span>
            )}
            {data.aiEnabled && (
              <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full text-xs text-yellow-700 font-medium">
                <Sparkles className="w-3 h-3" />
                AI Ready
              </span>
            )}
          </div>
        </div>
        
        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/30 via-transparent to-teal-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  )
}

// Beautiful Structural Node
export function StructuralNode({ data, selected, onDelete }) {
  const [structuralElements, setStructuralElements] = React.useState(data.structuralElements || [
    { id: 'title', name: 'Title', type: 'title', required: true, order: 1 },
    { id: 'subtitle', name: 'Subtitle', type: 'subtitle', required: false, order: 2 },
    { id: 'intro', name: 'Introduction', type: 'intro', required: true, order: 3 },
    { id: 'foreword', name: 'Foreword', type: 'foreword', required: false, order: 4 },
    { id: 'about_author', name: 'About the Author', type: 'about_author', required: true, order: 5 }
  ])

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

  const toggleElementRequired = (index) => {
    const newElements = [...structuralElements]
    newElements[index].required = !newElements[index].required
    setStructuralElements(newElements)
    
    if (data.onUpdate) {
      data.onUpdate({ ...data, structuralElements: newElements })
    }
  }

  return (
    <div className={`relative transform transition-all duration-300 ${selected ? 'scale-105' : 'hover:scale-102'}`}>
      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-4 h-4 !bg-gradient-to-r !from-indigo-400 !to-indigo-600 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-gradient-to-r !from-indigo-400 !to-indigo-600 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-4 h-4 !bg-gradient-to-r !from-indigo-400 !to-indigo-600 !border-2 !border-white shadow-lg" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-gradient-to-r !from-indigo-400 !to-indigo-600 !border-2 !border-white shadow-lg" 
      />
      
      {/* Node Body */}
      <div className={`
        relative bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-100/90 
        rounded-2xl shadow-xl border-2 border-dashed transition-all duration-300 min-w-[280px] max-w-[320px]
        ${selected ? 'border-indigo-400 shadow-indigo-400/30' : 'border-indigo-300 shadow-indigo-300/20'}
        hover:shadow-indigo-400/40 hover:border-indigo-400
      `}>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/10 to-transparent rounded-2xl" />
        
        {/* Header Section */}
        <div className="relative p-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-indigo-500/90 backdrop-blur-sm rounded-xl shadow-lg">
              <BookOpen className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg leading-tight">
                {data.label || 'Book Structure'}
              </h3>
              <p className="text-indigo-600 text-sm font-medium">
                {structuralElements.length} structural elements
              </p>
            </div>
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded-lg"
                title="Delete Node"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="relative px-4 pb-4">
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {data.description || 'Define book structure and layout'}
          </p>
          
          {/* Structural Elements Preview */}
          <div className="space-y-2 mb-3">
            {structuralElements.slice(0, 3).map((element, index) => {
              const ElementIcon = getElementIcon(element.type)
              return (
                <div key={element.id} className="flex items-center gap-2 text-indigo-700">
                  <ElementIcon className="w-3 h-3" />
                  <span className="text-xs">{element.name}</span>
                  {element.required && <span className="text-red-500 text-xs">*</span>}
                </div>
              )
            })}
            {structuralElements.length > 3 && (
              <div className="text-indigo-500 text-xs">+{structuralElements.length - 3} more...</div>
            )}
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 px-2 py-1 bg-indigo-500/20 rounded-full text-xs text-indigo-700 font-medium">
              <BookOpen className="w-3 h-3" />
              STRUCTURAL
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full text-xs text-green-700 font-medium">
              <Target className="w-3 h-3" />
              {structuralElements.filter(e => e.required).length} Required
            </span>
          </div>
        </div>
        
        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400/30 via-transparent to-indigo-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  )
}

export const nodeTypes = {
  input: InputNode,
  process: ProcessNode,
  condition: ConditionNode,
  output: OutputNode,
  preview: PreviewNode,
  structural: StructuralNode,
}
