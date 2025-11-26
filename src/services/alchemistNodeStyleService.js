/**
 * ALCHEMIST NODE STYLE SERVICE
 * Provides dynamic styling and color management for Alchemist Flow nodes
 * Completely isolated from main Flow system
 */

import { supabase } from '../lib/supabase'

class AlchemistNodeStyleService {
  constructor() {
    this.nodeStyleCache = new Map()
    this.isLoading = false
  }

  /**
   * Get dynamic styling for Alchemist nodes from database
   */
  async getNodeStyles() {
    if (this.nodeStyleCache.size > 0) {
      return this.mapToStyleSchemes(Array.from(this.nodeStyleCache.values()))
    }

    if (this.isLoading) {
      // Wait for existing request
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (!this.isLoading) {
            resolve(this.mapToStyleSchemes(Array.from(this.nodeStyleCache.values())))
          } else {
            setTimeout(checkLoading, 100)
          }
        }
        checkLoading()
      })
    }

    try {
      this.isLoading = true
      
      const { data: nodeData, error } = await supabase
        .from('alchemist_node_palette')
        .select('node_id, category, gradient, icon')
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching Alchemist node styles:', error)
        return this.getDefaultStyleSchemes()
      }

      // Cache the data
      nodeData.forEach(node => {
        this.nodeStyleCache.set(node.node_id, node)
      })

      return this.mapToStyleSchemes(nodeData)
    } catch (error) {
      console.error('Error in getNodeStyles:', error)
      return this.getDefaultStyleSchemes()
    } finally {
      this.isLoading = false
    }
  }

  /**
   * Map database data to style schemes matching FlowNodes.jsx pattern
   */
  mapToStyleSchemes(nodeData) {
    const schemes = {}

    nodeData.forEach(node => {
      const category = node.category || 'default'
      const gradient = node.gradient || 'from-gray-500 to-gray-700'
      
      // Extract colors from gradient for consistent theming
      const colors = this.extractColorsFromGradient(gradient)
      
      schemes[node.node_id] = {
        category,
        gradient,
        primary: colors.primary,
        light: colors.light,
        icon: node.icon || '⚙️',
        // Beautiful styling matching main Flow system
        background: `from-${colors.primary}-50 via-${colors.primary}-100 to-${colors.primary}-100/90`,
        border: `border-${colors.primary}-300`,
        borderSelected: `border-${colors.primary}-400 shadow-${colors.primary}-400/30`,
        borderHover: `hover:border-${colors.primary}-400`,
        text: `text-${colors.primary}-600`,
        textLight: `text-${colors.primary}-400`,
        handle: `from-${colors.primary}-400 to-${colors.primary}-600`,
        shadow: `shadow-${colors.primary}-300/20`,
        shadowHover: `hover:shadow-${colors.primary}-400/40`,
        glow: `from-${colors.primary}-200/10`
      }
    })

    return schemes
  }

  /**
   * Extract color information from gradient string
   */
  extractColorsFromGradient(gradient) {
    // Parse gradient like "from-blue-500 to-blue-700" 
    const matches = gradient.match(/from-(\w+)-\d+/)
    const primaryColor = matches ? matches[1] : 'gray'
    
    return {
      primary: primaryColor,
      light: primaryColor === 'yellow' ? 'amber' : primaryColor // Handle edge cases
    }
  }

  /**
   * Get category-based styles (fallback when database is unavailable)
   */
  getDefaultStyleSchemes() {
    return {
      inputMaster: {
        category: 'input',
        gradient: 'from-blue-500 to-blue-700',
        primary: 'blue',
        light: 'blue',
        icon: '📝',
        background: 'from-blue-50 via-blue-100 to-blue-100/90',
        border: 'border-blue-300',
        borderSelected: 'border-blue-400 shadow-blue-400/30',
        borderHover: 'hover:border-blue-400',
        text: 'text-blue-600',
        textLight: 'text-blue-400',
        handle: 'from-blue-400 to-blue-600',
        shadow: 'shadow-blue-300/20',
        shadowHover: 'hover:shadow-blue-400/40',
        glow: 'from-blue-200/10'
      },
      processMaster: {
        category: 'process',
        gradient: 'from-green-500 to-green-700',
        primary: 'green',
        light: 'green',
        icon: '⚙️',
        background: 'from-green-50 via-green-100 to-green-100/90',
        border: 'border-green-300',
        borderSelected: 'border-green-400 shadow-green-400/30',
        borderHover: 'hover:border-green-400',
        text: 'text-green-600',
        textLight: 'text-green-400',
        handle: 'from-green-400 to-green-600',
        shadow: 'shadow-green-300/20',
        shadowHover: 'hover:shadow-green-400/40',
        glow: 'from-green-200/10'
      },
      conditionMaster: {
        category: 'condition',
        gradient: 'from-yellow-500 to-yellow-700',
        primary: 'amber',
        light: 'amber',
        icon: '🔀',
        background: 'from-amber-50 via-amber-100 to-amber-100/90',
        border: 'border-amber-300',
        borderSelected: 'border-amber-400 shadow-amber-400/30',
        borderHover: 'hover:border-amber-400',
        text: 'text-amber-600',
        textLight: 'text-amber-400',
        handle: 'from-amber-400 to-amber-600',
        shadow: 'shadow-amber-300/20',
        shadowHover: 'hover:shadow-amber-400/40',
        glow: 'from-amber-200/10'
      },
      structuralMaster: {
        category: 'structural',
        gradient: 'from-purple-500 to-purple-700',
        primary: 'purple',
        light: 'purple',
        icon: '🏗️',
        background: 'from-purple-50 via-purple-100 to-purple-100/90',
        border: 'border-purple-300',
        borderSelected: 'border-purple-400 shadow-purple-400/30',
        borderHover: 'hover:border-purple-400',
        text: 'text-purple-600',
        textLight: 'text-purple-400',
        handle: 'from-purple-400 to-purple-600',
        shadow: 'shadow-purple-300/20',
        shadowHover: 'hover:shadow-purple-400/40',
        glow: 'from-purple-200/10'
      },
      outputMaster: {
        category: 'output',
        gradient: 'from-red-500 to-red-700',
        primary: 'red',
        light: 'red',
        icon: '📤',
        background: 'from-red-50 via-red-100 to-red-100/90',
        border: 'border-red-300',
        borderSelected: 'border-red-400 shadow-red-400/30',
        borderHover: 'hover:border-red-400',
        text: 'text-red-600',
        textLight: 'text-red-400',
        handle: 'from-red-400 to-red-600',
        shadow: 'shadow-red-300/20',
        shadowHover: 'hover:shadow-red-400/40',
        glow: 'from-red-200/10'
      }
    }
  }

  /**
   * Get minimap colors for React Flow
   */
  getMinimapColors() {
    return {
      inputMaster: '#3b82f6',
      processMaster: '#10b981',
      conditionMaster: '#f59e0b', 
      structuralMaster: '#8b5cf6',
      outputMaster: '#ef4444'
    }
  }

  /**
   * Clear cache (useful for testing or when data changes)
   */
  clearCache() {
    this.nodeStyleCache.clear()
  }
}

// Export singleton instance
export const alchemistNodeStyleService = new AlchemistNodeStyleService()
export default alchemistNodeStyleService
