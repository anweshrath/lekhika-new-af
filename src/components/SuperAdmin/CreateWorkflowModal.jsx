import React, { useState } from 'react'
import { X, Plus, Workflow } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const CreateWorkflowModal = ({ isOpen, onClose, onWorkflowCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Workflow name is required')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ai_workflows')
        .insert({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          nodes: JSON.stringify([]),
          connections: JSON.stringify([]),
          is_active: true,
          metadata: JSON.stringify({
            estimated_time: '1-2 hours',
            complexity: 'basic',
            success_rate: 0.85
          })
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Workflow created successfully!')
      setFormData({ name: '', description: '', category: 'general' })
      onWorkflowCreated(data)
      onClose()
    } catch (error) {
      console.error('Error creating workflow:', error)
      toast.error('Failed to create workflow')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Workflow className="w-5 h-5 text-blue-500" />
            <span>Create Workflow</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Workflow Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="Enter workflow name"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              rows="3"
              placeholder="Enter workflow description"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="general">General</option>
              <option value="book_creation">Book Creation</option>
              <option value="copy_creation">Copy Creation</option>
              <option value="content_analysis">Content Analysis</option>
              <option value="social_media">Social Media</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Workflow</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateWorkflowModal
