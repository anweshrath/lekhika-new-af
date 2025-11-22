import React, { useState, useEffect } from 'react'
import { 
  Workflow, 
  Plus, 
  Save, 
  Play, 
  Pause, 
  Settings, 
  Copy, 
  Trash2, 
  Download, 
  Upload,
  GitBranch,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Eye,
  Edit3
} from 'lucide-react'
// Legacy workflowDesignerService removed
import toast from 'react-hot-toast'

const WorkflowDesigner = ({ serviceStatus }) => {
  const [workflows, setWorkflows] = useState([])
  const [templates, setTemplates] = useState([])
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Legacy workflowDesignerService removed - using empty arrays
      const workflowsData = []
      const templatesData = []
      
      setWorkflows(workflowsData)
      setTemplates(templatesData)
    } catch (error) {
      console.error('Error loading workflow data:', error)
      toast.error('Failed to load workflow data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkflow = async (workflowData) => {
    try {
      // Legacy workflowDesignerService removed - using mock response
      const newWorkflow = { id: Date.now(), ...workflowData }
      setWorkflows(prev => [...prev, newWorkflow])
      setShowCreateModal(false)
      toast.success('Workflow created successfully!')
    } catch (error) {
      console.error('Error creating workflow:', error)
      toast.error('Failed to create workflow')
    }
  }

  const handleCreateFromTemplate = async (templateId, customizations) => {
    try {
      const newWorkflow = await workflowDesignerService.createFromTemplate(templateId, customizations)
      setWorkflows(prev => [...prev, newWorkflow])
      setShowTemplateModal(false)
      toast.success('Workflow created from template!')
    } catch (error) {
      console.error('Error creating workflow from template:', error)
      toast.error('Failed to create workflow from template')
    }
  }

  const handleDeleteWorkflow = async (workflowId) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return
    
    try {
      await workflowDesignerService.deleteWorkflow(workflowId)
      setWorkflows(prev => prev.filter(w => w.id !== workflowId))
      toast.success('Workflow deleted successfully!')
    } catch (error) {
      console.error('Error deleting workflow:', error)
      toast.error('Failed to delete workflow')
    }
  }

  const handleToggleActive = async (workflowId, isActive) => {
    try {
      const updatedWorkflow = await workflowDesignerService.updateWorkflow(workflowId, { isActive })
      setWorkflows(prev => prev.map(w => w.id === workflowId ? updatedWorkflow : w))
      toast.success(`Workflow ${isActive ? 'activated' : 'deactivated'}!`)
    } catch (error) {
      console.error('Error updating workflow:', error)
      toast.error('Failed to update workflow')
    }
  }

  const getNodeTypeIcon = (type) => {
    switch (type) {
      case 'start': return <Play className="w-4 h-4 text-green-400" />
      case 'end': return <CheckCircle className="w-4 h-4 text-blue-400" />
      case 'condition': return <GitBranch className="w-4 h-4 text-yellow-400" />
      case 'process': return <Zap className="w-4 h-4 text-purple-400" />
      case 'quality': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'analysis': return <BarChart3 className="w-4 h-4 text-blue-400" />
      default: return <Settings className="w-4 h-4 text-gray-400" />
    }
  }

  const getNodeTypeColor = (type) => {
    switch (type) {
      case 'start': return 'border-green-500 bg-green-900/20'
      case 'end': return 'border-blue-500 bg-blue-900/20'
      case 'condition': return 'border-yellow-500 bg-yellow-900/20'
      case 'process': return 'border-purple-500 bg-purple-900/20'
      case 'quality': return 'border-green-500 bg-green-900/20'
      case 'analysis': return 'border-blue-500 bg-blue-900/20'
      default: return 'border-gray-500 bg-gray-900/20'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              {/* Lekhika Logo */}
              <div className="flex items-center justify-center">
                <img 
                  src="/src/components/img/11.png" 
                  alt="LEKHIKA Logo"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <Workflow className="w-8 h-8 text-blue-400" />
              Workflow Designer
            </h2>
            <p className="text-gray-400 mt-1">
              Create and manage AI content generation workflows
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              From Template
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Workflow
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{workflows.length}</div>
            <div className="text-sm text-blue-300">Total Workflows</div>
          </div>
          <div className="p-4 bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {workflows.filter(w => w.isActive).length}
            </div>
            <div className="text-sm text-green-300">Active Workflows</div>
          </div>
          <div className="p-4 bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{templates.length}</div>
            <div className="text-sm text-purple-300">Templates Available</div>
          </div>
          <div className="p-4 bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {workflows.reduce((sum, w) => sum + (w.usageCount || 0), 0)}
            </div>
            <div className="text-sm text-yellow-300">Total Executions</div>
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Copy className="w-5 h-5 text-purple-400" />
          Workflow Templates
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <div key={template.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-white">{template.name}</h4>
                <button
                  onClick={() => handleCreateFromTemplate(template.id, { name: `${template.name} - Custom` })}
                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-gray-400 text-sm mb-3">{template.description}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-500">{template.nodes?.length || 0} nodes</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">{template.connections?.length || 0} connections</span>
              </div>
              
              {/* Node Preview */}
              <div className="flex flex-wrap gap-1">
                {template.nodes?.slice(0, 5).map(node => (
                  <div 
                    key={node.id}
                    className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getNodeTypeColor(node.type)}`}
                  >
                    {getNodeTypeIcon(node.type)}
                    {node.data.label}
                  </div>
                ))}
                {template.nodes?.length > 5 && (
                  <div className="px-2 py-1 rounded text-xs bg-gray-600 text-gray-300">
                    +{template.nodes.length - 5} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Workflows */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Custom Workflows
        </h3>

        {workflows.length === 0 ? (
          <div className="text-center py-8">
            <Workflow className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No custom workflows created yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Workflow
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map(workflow => (
              <div key={workflow.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">{workflow.name}</h4>
                      <div className="flex items-center gap-2">
                        {workflow.isActive ? (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Active</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">Inactive</span>
                        )}
                        <span className="text-xs text-gray-500">
                          Used {workflow.usageCount || 0} times
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{workflow.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedWorkflow(workflow)}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(workflow.id, !workflow.isActive)}
                      className={`p-2 transition-colors ${
                        workflow.isActive 
                          ? 'text-green-400 hover:text-green-300' 
                          : 'text-gray-400 hover:text-green-400'
                      }`}
                      title={workflow.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {workflow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Workflow Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <span>{workflow.nodes?.length || 0} nodes</span>
                  <span>•</span>
                  <span>{workflow.connections?.length || 0} connections</span>
                  <span>•</span>
                  <span>Created {new Date(workflow.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Node Preview */}
                <div className="flex flex-wrap gap-1">
                  {workflow.nodes?.slice(0, 6).map(node => (
                    <div 
                      key={node.id}
                      className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getNodeTypeColor(node.type)}`}
                    >
                      {getNodeTypeIcon(node.type)}
                      {node.data.label}
                    </div>
                  ))}
                  {workflow.nodes?.length > 6 && (
                    <div className="px-2 py-1 rounded text-xs bg-gray-600 text-gray-300">
                      +{workflow.nodes.length - 6} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <WorkflowDetailModal
          workflow={selectedWorkflow}
          onClose={() => setSelectedWorkflow(null)}
          serviceStatus={serviceStatus}
        />
      )}

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <CreateWorkflowModal
          onSave={handleCreateWorkflow}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <TemplateSelectionModal
          templates={templates}
          onSelect={handleCreateFromTemplate}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  )
}

// Workflow Detail Modal Component
const WorkflowDetailModal = ({ workflow, onClose, serviceStatus }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{workflow.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Workflow Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={workflow.isActive ? 'text-green-400' : 'text-gray-400'}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Nodes:</span>
                  <span className="text-white">{workflow.nodes?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Connections:</span>
                  <span className="text-white">{workflow.connections?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Usage:</span>
                  <span className="text-white">{workflow.usageCount || 0} times</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Timestamps</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{new Date(workflow.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Updated:</span>
                  <span className="text-white">{new Date(workflow.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nodes */}
          <div>
            <h4 className="font-semibold text-white mb-4">Workflow Nodes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workflow.nodes?.map(node => (
                <div key={node.id} className={`p-3 rounded-lg border ${getNodeTypeColor(node.type)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getNodeTypeIcon(node.type)}
                    <span className="font-medium text-white">{node.data.label}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Type: {node.type} • ID: {node.id}
                  </div>
                  {node.data.services && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-400 mb-1">Services:</div>
                      <div className="flex flex-wrap gap-1">
                        {node.data.services.map(service => (
                          <span 
                            key={service}
                            className={`px-2 py-1 rounded text-xs ${
                              serviceStatus[service]?.status === 'active'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-600 text-gray-300'
                            }`}
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Connections */}
          {workflow.connections && workflow.connections.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-4">Connections</h4>
              <div className="space-y-2">
                {workflow.connections.map((conn, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-700 rounded text-sm">
                    <span className="text-blue-400">{conn.source}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-green-400">{conn.target}</span>
                    {conn.condition && (
                      <span className="text-yellow-400 text-xs">({conn.condition})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Create Workflow Modal Component
const CreateWorkflowModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Workflow name is required')
      return
    }
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Create Workflow</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Workflow Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter workflow name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Describe your workflow"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-300">
              Activate immediately
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Template Selection Modal Component
const TemplateSelectionModal = ({ templates, onSelect, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [customName, setCustomName] = useState('')

  const handleSelect = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template')
      return
    }
    
    onSelect(selectedTemplate.id, {
      name: customName || `${selectedTemplate.name} - Custom`
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Select Template</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {templates.map(template => (
            <div 
              key={template.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white">{template.name}</h4>
                <div className="text-xs text-gray-400">
                  {template.nodes?.length || 0} nodes
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-3">{template.description}</p>
              
              {/* Node Preview */}
              <div className="flex flex-wrap gap-1">
                {template.nodes?.slice(0, 4).map(node => (
                  <div 
                    key={node.id}
                    className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getNodeTypeColor(node.type)}`}
                  >
                    {getNodeTypeIcon(node.type)}
                    {node.data.label}
                  </div>
                ))}
                {template.nodes?.length > 4 && (
                  <div className="px-2 py-1 rounded text-xs bg-gray-600 text-gray-300">
                    +{template.nodes.length - 4} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedTemplate && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Name (Optional)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder={`${selectedTemplate.name} - Custom`}
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedTemplate}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create from Template
          </button>
        </div>
      </div>
    </div>
  )
}

export default WorkflowDesigner
