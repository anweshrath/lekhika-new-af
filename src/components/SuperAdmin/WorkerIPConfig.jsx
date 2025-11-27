import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Server, Plus, Edit2, Trash2, Check, X, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { getWorkerConfig, saveWorkerConfig, addWorker, updateWorker, removeWorker } from '../../utils/workerConfig'

const WorkerIPConfig = () => {
  const [config, setConfig] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = () => {
    setConfig(getWorkerConfig())
  }

  const handleEdit = (worker) => {
    setEditingId(worker.id)
    setEditForm({ ...worker })
  }

  const handleSave = () => {
    updateWorker(editingId, editForm)
    setEditingId(null)
    loadConfig()
    toast.success('Worker configuration updated')
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleAdd = () => {
    if (!editForm.id || !editForm.name || !editForm.ip || !editForm.port) {
      toast.error('All fields required')
      return
    }

    addWorker({
      ...editForm,
      enabled: true
    })
    setShowAddForm(false)
    setEditForm({})
    loadConfig()
    toast.success('Worker added')
  }

  const handleDelete = (workerId) => {
    if (confirm('Remove this worker configuration?')) {
      removeWorker(workerId)
      loadConfig()
      toast.success('Worker removed')
    }
  }

  if (!config) return null

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Worker IP Configuration</h3>
            <p className="text-gray-400 text-sm">Configure worker connection settings</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditForm({ id: '', name: '', ip: '', port: 3001, type: 'standard' })
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Worker
        </button>
      </div>

      <div className="space-y-3">
        {/* Add Form */}
        {showAddForm && (
          <div className="bg-gray-900 rounded-lg border border-green-500/30 p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
              <input
                type="text"
                placeholder="ID (e.g., worker-2)"
                value={editForm.id || ''}
                onChange={(e) => setEditForm({ ...editForm, id: e.target.value })}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
              <input
                type="text"
                placeholder="Name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
              <input
                type="text"
                placeholder="IP Address"
                value={editForm.ip || ''}
                onChange={(e) => setEditForm({ ...editForm, ip: e.target.value })}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
              <input
                type="number"
                placeholder="Port"
                value={editForm.port || ''}
                onChange={(e) => setEditForm({ ...editForm, port: parseInt(e.target.value) })}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
              <select
                value={editForm.type || 'standard'}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              >
                <option value="standard">Standard</option>
                <option value="lean">Lean</option>
                <option value="queue">Queue</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
              >
                <X className="w-3 h-3" />
              </button>
              <button
                onClick={handleAdd}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Add
              </button>
            </div>
          </div>
        )}

        {/* Worker List */}
        {config.workers.map((worker) => (
          <div
            key={worker.id}
            className={`bg-gray-900 rounded-lg border p-4 ${
              editingId === worker.id ? 'border-blue-500/50' : 'border-gray-700'
            }`}
          >
            {editingId === worker.id ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
                <input
                  type="text"
                  value={editForm.ip || ''}
                  onChange={(e) => setEditForm({ ...editForm, ip: e.target.value })}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
                <input
                  type="number"
                  value={editForm.port || ''}
                  onChange={(e) => setEditForm({ ...editForm, port: parseInt(e.target.value) })}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
                <select
                  value={editForm.type || 'standard'}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                >
                  <option value="standard">Standard</option>
                  <option value="lean">Lean</option>
                  <option value="queue">Queue</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Server className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="font-semibold text-white">{worker.name}</p>
                    <p className="text-sm text-gray-400 font-mono">
                      {worker.ip}:{worker.port} • {worker.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    worker.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {worker.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => handleEdit(worker)}
                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  {config.workers.length > 1 && (
                    <button
                      onClick={() => handleDelete(worker.id)}
                      className="p-2 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-300">
          💡 Configure worker IPs here. Components will use these settings to connect to workers on different VPSes.
        </p>
      </div>
    </div>
  )
}

export default WorkerIPConfig

