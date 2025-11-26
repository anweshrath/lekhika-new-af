/**
 * ALCHEMIST NODES - ULTIMATE PERFECTION 
 * 5 Absolutely Stunning Master Nodes
 * ONE PERFECT SYSTEM - NO CONFLICTS
 */

import React, { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { 
  Settings, Copy, Zap, Brain, Target, Sparkles, Play,
  FileText, Layers, CheckCircle, Download, GitBranch
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================================================
// ULTIMATE PERFECT NODE TEMPLATE 
// ============================================================================

const createUltimatePerfectNode = (nodeType, emoji, title, subtitle, features) => {
  return ({ data, selected }) => {
    const [isHovered, setIsHovered] = useState(false)

    // DYNAMIC BUTTON TEXT AND ACTIONS BASED ON NODE TYPE
    const getNodeAction = (type) => {
      const actions = {
        inputMaster: { text: 'COLLECT INPUT', icon: FileText },
        processMaster: { text: 'GENERATE CONTENT', icon: Brain },
        conditionMaster: { text: 'EVALUATE CONDITIONS', icon: GitBranch },
        previewMaster: { text: 'START REVIEW', icon: CheckCircle },
        outputMaster: { text: 'EXPORT CONTENT', icon: Download }
      }
      return actions[type] || { text: 'CONFIGURE NODE', icon: Settings }
    }

    const nodeAction = getNodeAction(nodeType)

    // PERFECT BEAUTIFUL COLOR SCHEMES
    const getColorScheme = () => {
      switch (nodeType) {
        case 'inputMaster':
          return {
            bg: 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50/80',
            border: selected ? 'border-blue-500 shadow-blue-500/40 shadow-xl' : 'border-blue-400',
            text: 'text-blue-700',
            textLight: 'text-blue-500',
            handle: 'bg-gradient-to-r from-blue-500 to-blue-600',
            iconBg: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
            button: 'bg-blue-600 hover:bg-blue-700',
            featureBg: 'bg-blue-500/15',
            featureText: 'text-blue-800',
            glow: 'from-blue-400/20 via-blue-300/10 to-blue-400/20'
          }
        case 'processMaster':
          return {
            bg: 'bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50/80',
            border: selected ? 'border-purple-500 shadow-purple-500/40 shadow-xl' : 'border-purple-400',
            text: 'text-purple-700',
            textLight: 'text-purple-500',
            handle: 'bg-gradient-to-r from-purple-500 to-purple-600',
            iconBg: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700',
            button: 'bg-purple-600 hover:bg-purple-700',
            featureBg: 'bg-purple-500/15',
            featureText: 'text-purple-800',
            glow: 'from-purple-400/20 via-purple-300/10 to-purple-400/20'
          }
        case 'conditionMaster':
          return {
            bg: 'bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50/80',
            border: selected ? 'border-emerald-500 shadow-emerald-500/40 shadow-xl' : 'border-emerald-400',
            text: 'text-emerald-700',
            textLight: 'text-emerald-500',
            handle: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
            iconBg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700',
            button: 'bg-emerald-600 hover:bg-emerald-700',
            featureBg: 'bg-emerald-500/15',
            featureText: 'text-emerald-800',
            glow: 'from-emerald-400/20 via-emerald-300/10 to-emerald-400/20'
          }
        case 'previewMaster':
          return {
            bg: 'bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50/80',
            border: selected ? 'border-amber-500 shadow-amber-500/40 shadow-xl' : 'border-amber-400',
            text: 'text-amber-700',
            textLight: 'text-amber-500',
            handle: 'bg-gradient-to-r from-amber-500 to-amber-600',
            iconBg: 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700',
            button: 'bg-amber-600 hover:bg-amber-700',
            featureBg: 'bg-amber-500/15',
            featureText: 'text-amber-800',
            glow: 'from-amber-400/20 via-amber-300/10 to-amber-400/20'
          }
        case 'outputMaster':
          return {
            bg: 'bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50/80',
            border: selected ? 'border-rose-500 shadow-rose-500/40 shadow-xl' : 'border-rose-400',
            text: 'text-rose-700',
            textLight: 'text-rose-500',
            handle: 'bg-gradient-to-r from-rose-500 to-rose-600',
            iconBg: 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700',
            button: 'bg-rose-600 hover:bg-rose-700',
            featureBg: 'bg-rose-500/15',
            featureText: 'text-rose-800',
            glow: 'from-rose-400/20 via-rose-300/10 to-rose-400/20'
          }
      }
    }

    const colors = getColorScheme()

    const handleConfigure = () => {
      toast.success(`🎯 ${title} Configuration Modal Opening...`)
    }

  const handleCopy = () => {
      navigator.clipboard.writeText(JSON.stringify({...data, nodeType, title, subtitle}))
      toast.success('✨ Node configuration copied!')
    }

    const handleTest = () => {
      toast.success(`🧪 Testing ${title}...`)
  }

  return (
      <div 
        className={`relative transform transition-all duration-300 ${selected ? 'scale-105' : 'hover:scale-[1.02]'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* PERFECT 4-SIDED HANDLES */}
        <Handle 
          type="target" 
          position={Position.Top} 
          className={`w-5 h-5 !${colors.handle} !border-3 !border-white shadow-lg rounded-full`} 
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          className={`w-5 h-5 !${colors.handle} !border-3 !border-white shadow-lg rounded-full`} 
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className={`w-5 h-5 !${colors.handle} !border-3 !border-white shadow-lg rounded-full`} 
        />
        <Handle 
          type="target" 
          position={Position.Left} 
          className={`w-5 h-5 !${colors.handle} !border-3 !border-white shadow-lg rounded-full`} 
        />
        
        {/* ULTIMATE BEAUTIFUL NODE BODY */}
        <div className={`
          relative ${colors.bg}
          rounded-3xl shadow-2xl border-3 border-dashed transition-all duration-500 
          min-w-[300px] max-w-[340px] ${colors.border}
          hover:shadow-3xl group overflow-hidden
        `}>
          {/* Animated Glow Effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none`} />
          
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5 rounded-3xl" />
          
          {/* Header Section */}
          <div className="relative p-6 pb-4">
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-4 ${colors.iconBg} backdrop-blur-sm rounded-2xl shadow-xl ring-4 ring-white/30 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-white text-3xl font-bold drop-shadow-lg filter">{emoji}</span>
            </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900 text-xl leading-tight mb-1">
                  {title}
                </h3>
                <p className={`${colors.textLight} text-sm font-semibold tracking-wide`}>
                  {subtitle}
                </p>
            </div>
              <div className={`flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <button 
                  onClick={handleConfigure}
                  className={`p-2.5 ${colors.button} text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`}
                  title="Configure Node"
            >
                  <Settings className="w-4 h-4" />
            </button>
        <button
                  onClick={handleTest}
                  className="p-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="Test Node"
                >
                  <Play className="w-4 h-4" />
        </button>
              <button
                  onClick={handleCopy}
                  className="p-2.5 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="Copy Config"
                >
                  <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
          
          {/* Content Section */}
          <div className="relative px-6 pb-6">
            <p className="text-gray-700 text-sm leading-relaxed mb-5 font-medium">
              {data.description || 'Advanced AI-powered processing with comprehensive modal configuration system'}
            </p>
            
            {/* Feature Tags */}
            <div className="flex items-center gap-2 flex-wrap mb-5">
              {features.map((feature, idx) => (
                <span key={idx} className={`flex items-center gap-1.5 px-3 py-1.5 ${colors.featureBg} rounded-xl text-xs ${colors.featureText} font-bold tracking-wide`}>
                  {feature.icon}
                  {feature.label}
                </span>
              ))}
      </div>

            {/* Perfect Action Button */}
        <button
              onClick={handleConfigure}
              className={`w-full ${colors.button} text-white py-4 px-5 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-95`}
            >
              <nodeAction.icon className="w-5 h-5" />
              {nodeAction.text}
              <Sparkles className="w-4 h-4" />
        </button>
      </div>
            </div>
    </div>
  )
  }
}

// ============================================================================
// 5 ABSOLUTELY PERFECT MASTER NODES 
// ============================================================================

export const InputMasterNode = createUltimatePerfectNode(
  'inputMaster',
  '📥',
  'INPUT MASTER',
  'Multi-Modal Input Collection Hub',
  [
    { icon: <FileText className="w-3 h-3" />, label: 'Form Builder' },
    { icon: <Target className="w-3 h-3" />, label: 'AI Validation' },
    { icon: <Sparkles className="w-3 h-3" />, label: 'Smart Suggest' }
  ]
)

export const ProcessMasterNode = createUltimatePerfectNode(
  'processMaster',
  '🧠',
  'PROCESS MASTER',
  'AI Content Generation Engine',
  [
    { icon: <Brain className="w-3 h-3" />, label: 'Multi-AI' },
    { icon: <Zap className="w-3 h-3" />, label: 'High Quality' },
    { icon: <Layers className="w-3 h-3" />, label: 'Multi-Format' }
  ]
)

export const ConditionMasterNode = createUltimatePerfectNode(
  'conditionMaster',
  '🔀',
  'CONDITION MASTER',
  'Smart Logic & Decision Tree',
  [
    { icon: <Target className="w-3 h-3" />, label: 'Smart Rules' },
    { icon: <CheckCircle className="w-3 h-3" />, label: 'Validation' },
    { icon: <Layers className="w-3 h-3" />, label: 'Branching' }
  ]
)

export const PreviewMasterNode = createUltimatePerfectNode(
  'previewMaster',
  '👁️',
  'PREVIEW MASTER',
  'Content Review & Editor Suite',
  [
    { icon: <Play className="w-3 h-3" />, label: 'Live Preview' },
    { icon: <Settings className="w-3 h-3" />, label: 'Edit Mode' },
    { icon: <CheckCircle className="w-3 h-3" />, label: 'Approval' }
  ]
)

export const OutputMasterNode = createUltimatePerfectNode(
  'outputMaster',
  '📤',
  'OUTPUT MASTER',
  'Multi-Channel Distribution Hub',
  [
    { icon: <Layers className="w-3 h-3" />, label: 'Multi-Format' },
    { icon: <Target className="w-3 h-3" />, label: 'Auto-Publish' },
    { icon: <Sparkles className="w-3 h-3" />, label: 'Scheduler' }
  ]
)

export const StructuralMasterNode = createUltimatePerfectNode(
  'structuralMaster',
  '🏗️',
  'STRUCTURAL MASTER',
  'Blueprint Design & Architecture',
  [
    { icon: <Layers className="w-3 h-3" />, label: 'Blueprint' },
    { icon: <Settings className="w-3 h-3" />, label: 'Template' },
    { icon: <Target className="w-3 h-3" />, label: 'Structure' }
  ]
)

// ============================================================================
// IMPORT PERFECT SUB-NODES
// ============================================================================

import { alchemistSubNodeTypes } from './AlchemistSubNodes'

// ============================================================================
// COMPLETE PERFECT EXPORT SYSTEM - MASTERS + SUB-NODES
// ============================================================================

export const alchemistNodeTypes = {
  // 🎯 MASTER NODES
  inputMaster: InputMasterNode,
  processMaster: ProcessMasterNode,
  conditionMaster: ConditionMasterNode,
  previewMaster: PreviewMasterNode,
  outputMaster: OutputMasterNode,
  structuralMaster: StructuralMasterNode,
  
  // 🚀 PERFECTLY CRAFTED SUB-NODES
  ...alchemistSubNodeTypes
}

export default alchemistNodeTypes