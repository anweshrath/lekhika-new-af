import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Key, 
  Code, 
  BookOpen, 
  FolderOpen,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  ExternalLink,
  Upload,
  Trash2,
  FileText,
  Image as ImageIcon,
  Lock
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { storageService } from '../services/storageService'
import toast from 'react-hot-toast'
import UltraButton from './UltraButton'
import UltraCard from './UltraCard'

const EngineSettingsModal = ({ isOpen, onClose, engine, user }) => {
  const [activeTab, setActiveTab] = useState('api-key')
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [referenceFiles, setReferenceFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [selectedFormStyle, setSelectedFormStyle] = useState('minimal')

  useEffect(() => {
    if (isOpen && engine) {
      loadApiKey()
      loadReferenceFiles()
    }
  }, [isOpen, engine])

  const loadApiKey = async () => {
    try {
      setLoading(true)
      const engineId = engine.id || engine.engine_id
      const { data, error } = await supabase
        .from('user_engines')
        .select('api_key')
        .eq('id', engineId)
        .single()

      if (error) throw error
      setApiKey(data?.api_key || '')
    } catch (error) {
      console.error('Error loading API key:', error)
      toast.error('Failed to load API key')
    } finally {
      setLoading(false)
    }
  }

  const loadReferenceFiles = () => {
    try {
      const engineId = engine.id || engine.engine_id
      const storageKey = `engine_${engineId}_files`
      const stored = localStorage.getItem(storageKey)
      setReferenceFiles(stored ? JSON.parse(stored) : [])
    } catch (error) {
      console.error('Error loading reference files:', error)
    }
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    toast.success('API key copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerateApiKey = async () => {
    if (!confirm('Are you sure? This will invalidate the current API key.')) return

    try {
      setLoading(true)
      // Generate new API key
      const newKey = `LEKH-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      
      const engineId = engine.id || engine.engine_id
      const { error } = await supabase
        .from('user_engines')
        .update({ api_key: newKey })
        .eq('id', engineId)

      if (error) throw error
      
      setApiKey(newKey)
      toast.success('API key regenerated!')
    } catch (error) {
      console.error('Error regenerating API key:', error)
      toast.error('Failed to regenerate API key')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      const engineId = engine.id || engine.engine_id
      const storageKey = `engine_${engineId}_files`
      
      const newFiles = files.map(file => ({
        id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        notes: ''
      }))

      const updatedFiles = [...referenceFiles, ...newFiles]
      localStorage.setItem(storageKey, JSON.stringify(updatedFiles))
      setReferenceFiles(updatedFiles)
      
      toast.success(`${files.length} file(s) added!`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleDeleteFile = (fileId) => {
    try {
      const engineId = engine.id || engine.engine_id
      const storageKey = `engine_${engineId}_files`
      const updatedFiles = referenceFiles.filter(f => f.id !== fileId)
      localStorage.setItem(storageKey, JSON.stringify(updatedFiles))
      setReferenceFiles(updatedFiles)
      toast.success('File removed')
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('Failed to remove file')
    }
  }

  const getEmbedCode = (style) => {
    const engineId = engine.id || engine.engine_id
    const engineName = engine.name || engine.ai_engines?.name
    
    const styles = {
      minimal: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: system-ui;">
  <h2 style="margin-bottom: 20px;">${engineName}</h2>
  <form id="lekhika-form" style="display: flex; flex-direction: column; gap: 15px;">
    <input type="text" name="title" placeholder="Title" required style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;" />
    <textarea name="description" placeholder="Description" rows="4" style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;"></textarea>
    <button type="submit" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">Generate</button>
  </form>
  <script>
    document.getElementById('lekhika-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      const response = await fetch('https://oglmncodldqiafmxpwdw.supabase.co/functions/v1/engines-api/${engineId}/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '${apiKey}'
        },
        body: JSON.stringify({ input: data })
      });
      
      const result = await response.json();
      alert('Generation started! ID: ' + result.executionId);
    });
  </script>
</div>`,
      modern: `<!-- Modern Glassmorphism Form -->
<div style="max-width: 700px; margin: 50px auto; padding: 40px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);">
  <h2 style="font-size: 32px; font-weight: bold; margin-bottom: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${engineName}</h2>
  <form id="lekhika-modern-form" style="display: flex; flex-direction: column; gap: 20px;">
    <div>
      <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">Title</label>
      <input type="text" name="title" required style="width: 100%; padding: 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; transition: all 0.3s;" />
    </div>
    <div>
      <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">Description</label>
      <textarea name="description" rows="5" style="width: 100%; padding: 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px;"></textarea>
    </div>
    <button type="submit" style="padding: 18px 36px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">🚀 Generate Content</button>
  </form>
</div>`,
      gradient: `<!-- Gradient Animated Form -->
<div style="max-width: 650px; margin: 50px auto; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); border-radius: 30px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
  <h2 style="font-size: 36px; font-weight: 900; margin-bottom: 30px; color: white; text-align: center;">${engineName}</h2>
  <form id="lekhika-gradient-form" style="display: flex; flex-direction: column; gap: 20px;">
    <input type="text" name="title" placeholder="✨ Your Title Here" required style="padding: 18px; border: none; border-radius: 15px; font-size: 16px; background: rgba(255, 255, 255, 0.9);" />
    <textarea name="description" placeholder="📝 Describe what you want..." rows="5" style="padding: 18px; border: none; border-radius: 15px; font-size: 16px; background: rgba(255, 255, 255, 0.9);"></textarea>
    <button type="submit" style="padding: 20px 40px; background: white; color: #667eea; border: none; border-radius: 15px; font-size: 20px; font-weight: 900; cursor: pointer; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);">✨ CREATE MAGIC ✨</button>
  </form>
</div>`
    }

    return styles[style] || styles.minimal
  }

  const tabs = [
    { id: 'api-key', name: 'API Key', icon: Key },
    { id: 'embed', name: 'Embed Forms', icon: Code },
    { id: 'docs', name: 'API Docs', icon: BookOpen },
    { id: 'files', name: 'Reference Files', icon: FolderOpen }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden"
          style={{
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xl)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Engine Settings
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {engine?.name || engine?.ai_engines?.name}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-hover transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative px-6 py-4 flex items-center gap-2 font-medium transition-colors"
                  style={{
                    color: activeTab === tab.id ? 'var(--theme-primary)' : 'var(--text-muted)',
                    background: activeTab === tab.id ? 'var(--bg-subtle)' : 'transparent'
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {tab.name}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: 'var(--theme-primary)' }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <AnimatePresence mode="wait">
              {/* API Key Tab */}
              {activeTab === 'api-key' && (
                <motion.div
                  key="api-key"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Your API Key
                    </h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                      Use this key to authenticate API requests for this engine.
                    </p>
                    
                    <div className="flex gap-2">
                      <div 
                        className="flex-1 p-4 rounded-xl font-mono text-sm flex items-center justify-between"
                        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}
                      >
                        <span style={{ color: 'var(--text-primary)' }}>
                          {showApiKey ? apiKey : '••••••••••••••••••••••••••••••••'}
                        </span>
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="p-1 hover:bg-hover rounded"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <UltraButton
                          onClick={handleCopyApiKey}
                          variant="secondary"
                          icon={copied ? Check : Copy}
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </UltraButton>
                      </motion.div>
                    </div>
                  </div>

                  {(user?.tier === 'enterprise' || user?.tier === 'ENTERPRISE') && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Regenerate Key
                      </h3>
                      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                        Generate a new API key. This will invalidate the current key.
                      </p>
                      
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <UltraButton
                          onClick={handleRegenerateApiKey}
                          variant="secondary"
                          icon={RefreshCw}
                          disabled={loading}
                        >
                          Regenerate API Key
                        </UltraButton>
                      </motion.div>
                    </div>
                  )}

                  <div 
                    className="p-4 rounded-xl"
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}
                  >
                    <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Lock className="w-4 h-4" />
                      Security Best Practices
                    </h4>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--text-muted)' }}>
                      <li>• Never share your API key publicly</li>
                      <li>• Store keys securely in environment variables</li>
                      <li>• Regenerate keys if compromised</li>
                      <li>• Monitor usage in your dashboard</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Embed Forms Tab */}
              {activeTab === 'embed' && (
                <motion.div
                  key="embed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                      Embed Forms
                    </h3>
                    
                    {/* Style Selector */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {['minimal', 'modern', 'gradient'].map((style) => (
                        <motion.button
                          key={style}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedFormStyle(style)}
                          className="p-4 rounded-xl border-2 transition-all"
                          style={{
                            borderColor: selectedFormStyle === style ? 'var(--theme-primary)' : 'var(--border-subtle)',
                            background: selectedFormStyle === style ? 'var(--bg-subtle)' : 'transparent'
                          }}
                        >
                          <div className="text-sm font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
                            {style}
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Code Block */}
                    <div className="relative">
                      <pre 
                        className="p-4 rounded-xl overflow-x-auto text-xs"
                        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}
                      >
                        <code style={{ color: 'var(--text-primary)' }}>
                          {getEmbedCode(selectedFormStyle)}
                        </code>
                      </pre>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          navigator.clipboard.writeText(getEmbedCode(selectedFormStyle))
                          toast.success('Code copied!')
                        }}
                        className="absolute top-4 right-4 p-2 rounded-lg"
                        style={{ background: 'var(--bg-elevated)' }}
                      >
                        <Copy className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* API Docs Tab */}
              {activeTab === 'docs' && (
                <motion.div
                  key="docs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                      API Documentation
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Execute Engine
                        </h4>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                          POST /engines-api/{`{engineId}`}/execute
                        </p>
                        <pre 
                          className="p-4 rounded-xl text-xs"
                          style={{ background: 'var(--bg-subtle)' }}
                        >
                          <code style={{ color: 'var(--text-primary)' }}>
{`curl -X POST \\
  https://oglmncodldqiafmxpwdw.supabase.co/functions/v1/engines-api/${engine?.id || '{engineId}'}/execute \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey || 'YOUR_API_KEY'}" \\
  -d '{
    "input": {
      "title": "My Book Title",
      "description": "A great story..."
    }
  }'`}
                          </code>
                        </pre>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Check Status
                        </h4>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                          GET /engines-api/status/{`{executionId}`}
                        </p>
                        <pre 
                          className="p-4 rounded-xl text-xs"
                          style={{ background: 'var(--bg-subtle)' }}
                        >
                          <code style={{ color: 'var(--text-primary)' }}>
{`curl -X GET \\
  https://oglmncodldqiafmxpwdw.supabase.co/functions/v1/engines-api/status/{executionId} \\
  -H "x-api-key: ${apiKey || 'YOUR_API_KEY'}"`}
                          </code>
                        </pre>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Response Format
                        </h4>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                          Successful execution returns:
                        </p>
                        <pre 
                          className="p-4 rounded-xl text-xs"
                          style={{ background: 'var(--bg-subtle)' }}
                        >
                          <code style={{ color: 'var(--text-primary)' }}>
{`{
  "executionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "progress": 100,
  "result": {
    "content": "Generated content...",
    "metadata": {
      "tokens": 2500,
      "cost": 0.0125,
      "duration": 45000
    }
  },
  "completedAt": "2025-10-17T12:34:56Z"
}`}
                          </code>
                        </pre>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Status Values
                        </h4>
                        <div 
                          className="p-4 rounded-xl"
                          style={{ background: 'var(--bg-subtle)' }}
                        >
                          <ul className="text-sm space-y-2" style={{ color: 'var(--text-muted)' }}>
                            <li><strong className="text-blue-500">pending</strong> - Execution queued</li>
                            <li><strong className="text-yellow-500">running</strong> - Currently processing</li>
                            <li><strong className="text-green-500">completed</strong> - Successfully finished</li>
                            <li><strong className="text-red-500">failed</strong> - Execution error occurred</li>
                            <li><strong className="text-gray-500">cancelled</strong> - User cancelled execution</li>
                          </ul>
                        </div>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }}>
                        <UltraButton
                          onClick={() => window.open('https://docs.lekhika.com', '_blank')}
                          variant="secondary"
                          icon={ExternalLink}
                        >
                          View Full Documentation
                        </UltraButton>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Files Tab */}
              {activeTab === 'files' && (
                <motion.div
                  key="files"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Reference Files
                    </h3>
                    <div 
                      className="p-4 rounded-xl mb-4"
                      style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                    >
                      <p className="text-sm flex items-start gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Lock className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                        <span>
                          Your files are stored locally in your browser for privacy. They never touch our servers.
                        </span>
                      </p>
                    </div>

                    {/* Upload Area */}
                    <label className="block">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-8 border-2 border-dashed rounded-xl cursor-pointer text-center"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                        <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {uploading ? 'Uploading...' : 'Click to upload files'}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          PDF, DOC, TXT, Images (Max 10MB each)
                        </p>
                      </motion.div>
                    </label>

                    {/* File List */}
                    {referenceFiles.length > 0 && (
                      <div className="mt-6 space-y-3">
                        {referenceFiles.map((file) => (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-4 rounded-xl"
                            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {file.type?.startsWith('image/') ? (
                                <ImageIcon className="w-5 h-5 text-purple-500 flex-shrink-0" />
                              ) : (
                                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                  {file.name}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteFile(file.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default EngineSettingsModal

