import React, { useState, useEffect } from 'react'
import { Search, Copy, Plus, Edit, Trash2, Eye, EyeOff, Tag, Filter, Star, BookOpen, Zap, Image, FileText, Brain, Database, Code, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const AlchemistStash = () => {
  const [templates, setTemplates] = useState([])
  const [filteredTemplates, setFilteredTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedNodeType, setSelectedNodeType] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showMigrationModal, setShowMigrationModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [expandedTemplate, setExpandedTemplate] = useState(null)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'outline',
    node_type: 'input',
    system_prompt: '',
    user_prompt: '',
    variables: [],
    tags: [],
    is_public: false
  })

  const categories = [
    { id: 'all', name: 'All Categories', icon: Filter },
    { id: 'outline', name: 'Outline', icon: BookOpen },
    { id: 'manuscript', name: 'Manuscript', icon: FileText },
    { id: 'visual', name: 'Visual', icon: Image },
    { id: 'editing', name: 'Editing', icon: Edit },
    { id: 'research', name: 'Research', icon: Brain },
    { id: 'marketing', name: 'Marketing', icon: Zap },
    { id: 'migration', name: 'Migration', icon: Database }
  ]

  const nodeTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'input', name: 'Input' },
    { id: 'process', name: 'Process' },
    { id: 'output', name: 'Output' },
    { id: 'condition', name: 'Condition' }
  ]

  useEffect(() => {
    fetchTemplates()
    addMigrationTemplate()
  }, [])

  const addMigrationTemplate = async () => {
    try {
      // Check if migration template already exists
      const { data: existingTemplate } = await supabase
        .from('prompt_templates')
        .select('id')
        .eq('name', 'Add New Feature Column Migration')

      // If template exists, return early
      if (existingTemplate && existingTemplate.length > 0) {
        return // Template already exists
      }

      const migrationTemplate = {
        name: 'Add New Feature Column Migration',
        description: 'Professional migration template for adding new feature columns to level_access table',
        category: 'migration',
        node_type: 'process',
        system_prompt: 'You are a database migration expert. Generate professional SQL migrations.',
        user_prompt: `-- =====================================================
-- ADD NEW FEATURE COLUMN TO LEVEL_ACCESS TABLE
-- Professional, triple-checked migration for adding new features
-- =====================================================

-- STEP 1: Add the new feature column to level_access table
-- Replace 'NEW_FEATURE_NAME' with the actual feature name (e.g., 'video_generation')
ALTER TABLE public.level_access 
ADD COLUMN NEW_FEATURE_NAME BOOLEAN DEFAULT false;

-- STEP 2: Add comment for documentation
COMMENT ON COLUMN public.level_access.NEW_FEATURE_NAME IS 'Access to NEW_FEATURE_NAME feature';

-- STEP 3: Create index for performance (optional, only if needed for queries)
-- CREATE INDEX idx_level_access_NEW_FEATURE_NAME ON public.level_access(NEW_FEATURE_NAME);

-- STEP 4: Update existing level_access rows with default values
-- Set access based on level tier (customize as needed)
UPDATE public.level_access 
SET NEW_FEATURE_NAME = CASE 
    WHEN level_name = 'freemium' THEN false  -- Freemium: no access
    WHEN level_name = 'hobby' THEN false     -- Hobby: no access  
    WHEN level_name = 'pro' THEN true        -- Pro: has access
    WHEN level_name = 'macdaddy' THEN true  -- MacDaddy: has access
    WHEN level_name = 'byok' THEN true      -- BYOK: has access
    ELSE false                               -- Default: no access
END;

-- STEP 5: Verify the column was added successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'level_access' 
    AND table_schema = 'public'
    AND column_name = 'NEW_FEATURE_NAME';

-- STEP 6: Show updated level_access data for verification
SELECT 
    level_name,
    NEW_FEATURE_NAME,
    CASE 
        WHEN NEW_FEATURE_NAME THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END as access_status
FROM public.level_access 
ORDER BY 
    CASE level_name
        WHEN 'freemium' THEN 0
        WHEN 'hobby' THEN 1
        WHEN 'pro' THEN 2
        WHEN 'macdaddy' THEN 3
        WHEN 'byok' THEN 4
        ELSE 5
    END;

-- =====================================================
-- USAGE INSTRUCTIONS:
-- =====================================================
-- 1. Replace 'NEW_FEATURE_NAME' with your actual feature name
-- 2. Adjust the default access levels in STEP 4 as needed
-- 3. Run this migration in Supabase SQL Editor
-- 4. Verify the results using the SELECT statements
-- 5. Update your application code to use the new feature column
-- =====================================================`,
        variables: ['NEW_FEATURE_NAME'],
        tags: ['migration', 'database', 'level_access', 'feature'],
        is_public: true,
        version: 1,
        usage_count: 0,
        is_active: true,
        created_at: new Date().toISOString()
      }

      await supabase
        .from('prompt_templates')
        .insert([migrationTemplate])

      fetchTemplates()

    } catch (error) {
      console.error('Error adding migration template:', error)
    }
  }


  useEffect(() => {
    filterTemplates()
  }, [templates, searchTerm, selectedCategory, selectedNodeType])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      console.log('Fetching templates...')
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false })
        .order('created_at', { ascending: false })

      console.log('Fetch result:', { data, error })
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      setTemplates(data || [])
      console.log('Templates set:', data?.length || 0)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to load prompt templates')
    } finally {
      setLoading(false)
    }
  }

  const filterTemplates = () => {
    let filtered = templates

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    if (selectedNodeType !== 'all') {
      filtered = filtered.filter(template => template.node_type === selectedNodeType)
    }

    setFilteredTemplates(filtered)
  }

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${type} copied to clipboard!`)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const incrementUsage = async (templateId) => {
    try {
      const { error } = await supabase
        .from('prompt_templates')
        .update({ usage_count: templates.find(t => t.id === templateId).usage_count + 1 })
        .eq('id', templateId)

      if (error) throw error
      fetchTemplates() // Refresh to update usage count
    } catch (error) {
      console.error('Error updating usage count:', error)
    }
  }

  const createTemplate = async () => {
    try {
      const { error } = await supabase
        .from('prompt_templates')
        .insert([{
          ...newTemplate,
          version: 1,
          usage_count: 0,
          is_active: true,
          created_at: new Date().toISOString()
        }])

      if (error) throw error
      
      toast.success('Template created successfully!')
      setShowCreateModal(false)
      setNewTemplate({
        name: '',
        description: '',
        category: 'outline',
        node_type: 'input',
        system_prompt: '',
        user_prompt: '',
        variables: [],
        tags: [],
        is_public: false
      })
      fetchTemplates()
    } catch (error) {
      console.error('Error creating template:', error)
      toast.error('Failed to create template')
    }
  }

  const deleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const { error } = await supabase
        .from('prompt_templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error
      
      toast.success('Template deleted successfully!')
      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    }
  }


  const getCategoryIcon = (category) => {
    const categoryData = categories.find(c => c.id === category)
    return categoryData ? categoryData.icon : BookOpen
  }

  const getCategoryColor = (category) => {
    const colors = {
      outline: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      manuscript: 'bg-green-500/20 text-green-300 border-green-500/30',
      visual: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      editing: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      research: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      marketing: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      migration: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    }
    return colors[category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">The Alchemist's Stash</h1>
            <p className="text-purple-300">Master prompt templates for AI workflows</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-800/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-200">{templates.length}</div>
            <div className="text-sm text-purple-400">Total Templates</div>
          </div>
          <div className="bg-blue-800/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-200">{templates.filter(t => t.is_public).length}</div>
            <div className="text-sm text-blue-400">Public Templates</div>
          </div>
          <div className="bg-green-800/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-200">
              {templates.reduce((sum, t) => sum + (t.usage_count || 0), 0)}
            </div>
            <div className="text-sm text-green-400">Total Uses</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          {/* Node Type Filter */}
          <select
            value={selectedNodeType}
            onChange={(e) => setSelectedNodeType(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {nodeTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>

          {/* Create Template Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const CategoryIcon = getCategoryIcon(template.category)
          const categoryColor = getCategoryColor(template.category)
          
          return (
            <div key={template.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-colors">
              {/* Template Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${categoryColor}`}>
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                      <p className="text-sm text-gray-400">{template.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template)
                        setShowTemplateModal(true)
                        incrementUsage(template.id)
                      }}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-300" />
                    </button>
                    <button
                      onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {expandedTemplate === template.id ? <EyeOff className="w-4 h-4 text-gray-300" /> : <Eye className="w-4 h-4 text-gray-300" />}
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
                    {template.category}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                    {template.node_type}
                  </span>
                  {template.tags?.map((tag, index) => (
                    <span key={index} className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Usage Stats */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {template.usage_count || 0} uses
                    </span>
                    <span>v{template.version}</span>
                  </div>
                  <span>{template.is_public ? 'Public' : 'Private'}</span>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedTemplate === template.id && (
                <div className="border-t border-gray-700 p-6 bg-gray-900/50">
                  <div className="space-y-4">
                    {/* System Prompt */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-300">System Prompt</h4>
                        <button
                          onClick={() => copyToClipboard(template.system_prompt, 'System Prompt')}
                          className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 font-mono max-h-32 overflow-y-auto">
                        {template.system_prompt}
                      </div>
                    </div>

                    {/* User Prompt */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-300">User Prompt</h4>
                        <button
                          onClick={() => copyToClipboard(template.user_prompt, 'User Prompt')}
                          className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 font-mono max-h-32 overflow-y-auto">
                        {template.user_prompt}
                      </div>
                    </div>

                    {/* Variables */}
                    {template.variables && template.variables.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Variables</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map((variable, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-800/30 text-purple-300 rounded text-xs font-mono">
                              {'{'}{variable}{'}'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No templates found</h3>
          <p className="text-gray-500">Try adjusting your filters or create a new template</p>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Create New Template</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Template name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Template description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">System Prompt</label>
                <textarea
                  value={newTemplate.system_prompt}
                  onChange={(e) => setNewTemplate({...newTemplate, system_prompt: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="System prompt..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">User Prompt</label>
                <textarea
                  value={newTemplate.user_prompt}
                  onChange={(e) => setNewTemplate({...newTemplate, user_prompt: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="4"
                  placeholder="User prompt..."
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newTemplate.is_public}
                    onChange={(e) => setNewTemplate({...newTemplate, is_public: e.target.checked})}
                    className="w-4 h-4 text-purple-600 border-gray-600 rounded focus:ring-purple-500 bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-300">Public Template</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-700">
              <button
                onClick={createTemplate}
                disabled={!newTemplate.name || !newTemplate.system_prompt || !newTemplate.user_prompt}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Template
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlchemistStash
