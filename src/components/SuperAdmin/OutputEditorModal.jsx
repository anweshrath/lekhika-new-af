import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Download, 
  Edit3, 
  Save, 
  RefreshCw, 
  Eye, 
  Code, 
  FileText, 
  Image, 
  Video,
  Settings,
  Copy,
  Share2,
  Printer,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Zap,
  Sparkles,
  BookOpen,
  File,
  Globe,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  Link,
  Quote,
  CheckCircle,
  AlertCircle,
  Info,
  Lock,
  Unlock,
  EyeOff,
  Layers,
  Grid,
  List as ListIcon,
  Columns,
  Layout,
  RotateCcw,
  Undo,
  Redo,
  Scissors,
  Clipboard,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Star,
  Heart,
  ThumbsUp,
  MessageCircle,
  Send,
  Upload,
  FolderOpen,
  Archive,
  Trash2,
  Plus,
  Minus,
  MoreHorizontal,
  MoreVertical
} from 'lucide-react'
import toast from 'react-hot-toast'

const OutputEditorModal = ({ 
  isOpen, 
  onClose, 
  content = '', 
  title = 'Generated Content',
  formats = {},
  onSave,
  onExport,
  isReadOnly = false,
  showEditControls = true,
  showExportControls = true,
  showFormatControls = true
}) => {
  const [activeTab, setActiveTab] = useState('preview')
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState('Inter')
  const [lineHeight, setLineHeight] = useState(1.6)
  const [theme, setTheme] = useState('light')
  const [showSettings, setShowSettings] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [readabilityScore, setReadabilityScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  const editorRef = useRef(null)
  const previewRef = useRef(null)

  // Available formats
  const availableFormats = [
    { id: 'preview', name: 'Preview', icon: Eye, color: 'blue' },
    { id: 'html', name: 'HTML', icon: Code, color: 'orange' },
    { id: 'markdown', name: 'Markdown', icon: FileText, color: 'green' },
    { id: 'pdf', name: 'PDF', icon: File, color: 'red' },
    { id: 'docx', name: 'DOCX', icon: FileText, color: 'blue' },
    { id: 'epub', name: 'EPUB', icon: BookOpen, color: 'purple' },
    { id: 'txt', name: 'Text', icon: Type, color: 'gray' }
  ]

  // Font families
  const fontFamilies = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { name: 'Lato', value: 'Lato, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Source Code Pro', value: 'Source Code Pro, monospace' }
  ]

  // Themes
  const themes = [
    { name: 'Light', value: 'light', bg: 'bg-white', text: 'text-gray-900' },
    { name: 'Dark', value: 'dark', bg: 'bg-gray-900', text: 'text-white' },
    { name: 'Sepia', value: 'sepia', bg: 'bg-amber-50', text: 'text-amber-900' },
    { name: 'High Contrast', value: 'high-contrast', bg: 'bg-black', text: 'text-white' },
    { name: 'Blue Light', value: 'blue-light', bg: 'bg-blue-50', text: 'text-blue-900' }
  ]

  useEffect(() => {
    setEditedContent(content)
    setHasChanges(false)
  }, [content])

  useEffect(() => {
    // Calculate word and character count
    const text = editedContent.replace(/<[^>]*>/g, '') // Remove HTML tags
    setWordCount(text.split(/\s+/).filter(word => word.length > 0).length)
    setCharCount(text.length)
    
    // Simple readability score (words per sentence)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0
    setReadabilityScore(Math.min(100, Math.max(0, 100 - (avgWordsPerSentence - 10) * 5)))
  }, [editedContent])

  const handleSave = async () => {
    try {
      setIsLoading(true)
      await onSave?.(editedContent)
      setHasChanges(false)
      toast.success('Content saved successfully!')
    } catch (error) {
      toast.error('Failed to save content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (format) => {
    try {
      setIsLoading(true)
      await onExport?.(format, editedContent)
      toast.success(`${format.toUpperCase()} exported successfully!`)
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent.replace(/<[^>]*>/g, ''))
    toast.success('Content copied to clipboard!')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleUndo = () => {
    // Implement undo functionality
    toast.info('Undo functionality coming soon!')
  }

  const handleRedo = () => {
    // Implement redo functionality
    toast.info('Redo functionality coming soon!')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'preview':
        return (
          <div 
            ref={previewRef}
            className="prose prose-lg max-w-none p-6"
            style={{
              fontFamily: fontFamily,
              fontSize: fontSize + 'px',
              lineHeight: lineHeight,
              color: theme === 'dark' ? '#ffffff' : '#000000',
              backgroundColor: 'transparent'
            }}
            dangerouslySetInnerHTML={{ __html: editedContent }}
          />
        )
      
      case 'html':
        return (
          <pre className="p-6 bg-gray-100 dark:bg-gray-800 text-sm overflow-auto">
            <code>{editedContent}</code>
          </pre>
        )
      
      case 'markdown':
        const markdownContent = editedContent
          .replace(/<h1>/g, '# ')
          .replace(/<\/h1>/g, '\n\n')
          .replace(/<h2>/g, '## ')
          .replace(/<\/h2>/g, '\n\n')
          .replace(/<h3>/g, '### ')
          .replace(/<\/h3>/g, '\n\n')
          .replace(/<p>/g, '')
          .replace(/<\/p>/g, '\n\n')
          .replace(/<strong>/g, '**')
          .replace(/<\/strong>/g, '**')
          .replace(/<em>/g, '*')
          .replace(/<\/em>/g, '*')
          .replace(/<br\s*\/?>/g, '\n')
          .replace(/<[^>]*>/g, '')
        return (
          <pre className="p-6 bg-gray-100 dark:bg-gray-800 text-sm overflow-auto whitespace-pre-wrap">
            {markdownContent}
          </pre>
        )
      
      case 'txt':
        return (
          <pre className="p-6 bg-gray-100 dark:bg-gray-800 text-sm overflow-auto whitespace-pre-wrap">
            {editedContent.replace(/<[^>]*>/g, '')}
          </pre>
        )
      
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Export format not available</p>
          </div>
        )
    }
  }

  const renderEditor = () => {
    if (!isEditing) return null

    return (
      <div className="h-full flex flex-col">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-4">
            {/* Format Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => document.execCommand('bold')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.execCommand('italic')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.execCommand('underline')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            {/* Alignment */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => document.execCommand('justifyLeft')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.execCommand('justifyCenter')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.execCommand('justifyRight')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            {/* Lists */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => document.execCommand('insertOrderedList')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Numbered List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.execCommand('insertUnorderedList')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Bullet List"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Editor Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUndo}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 p-4">
          <div
            ref={editorRef}
            contentEditable
            className="w-full h-full outline-none resize-none"
            style={{
              fontFamily: fontFamily,
              fontSize: fontSize + 'px',
              lineHeight: lineHeight,
              color: theme === 'dark' ? '#ffffff' : '#000000',
              backgroundColor: 'transparent'
            }}
            onInput={(e) => {
              setEditedContent(e.target.innerHTML)
              setHasChanges(true)
            }}
            dangerouslySetInnerHTML={{ __html: editedContent }}
          />
        </div>
      </div>
    )
  }

  const renderSettings = () => {
    if (!showSettings) return null

    return (
      <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Font Settings */}
            <div>
              <label className="block text-sm font-medium mb-2">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              >
                {fontFamilies.map(font => (
                  <option key={font.value} value={font.value}>{font.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Font Size: {fontSize}px</label>
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Line Height: {lineHeight}</label>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <div className="grid grid-cols-1 gap-2">
                {themes.map(themeOption => (
                  <button
                    key={themeOption.value}
                    onClick={() => setTheme(themeOption.value)}
                    className={`p-3 rounded border text-left ${
                      theme === themeOption.value 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium">{themeOption.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium mb-3">Content Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Words:</span>
                  <span className="font-medium">{wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Characters:</span>
                  <span className="font-medium">{charCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Readability:</span>
                  <span className="font-medium">{Math.round(readabilityScore)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ${
            isFullscreen ? 'w-full h-full' : 'w-full max-w-7xl h-[90vh]'
          } flex flex-col`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold">{title}</h2>
              </div>
              
              {hasChanges && (
                <div className="flex items-center space-x-1 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1">
              {availableFormats.map(format => (
                <button
                  key={format.id}
                  onClick={() => setActiveTab(format.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === format.id
                      ? `bg-${format.color}-100 dark:bg-${format.color}-900 text-${format.color}-600`
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <format.icon className="w-4 h-4" />
                  <span>{format.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              {/* Edit Toggle */}
              {showEditControls && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isEditing
                      ? 'bg-green-100 dark:bg-green-900 text-green-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditing ? 'Preview' : 'Edit'}</span>
                </button>
              )}

              {/* Save */}
              {hasChanges && (
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? 'Saving...' : 'Save'}</span>
                </button>
              )}

              {/* Export */}
              {showExportControls && (
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  
                  {/* Export Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    {['pdf', 'docx', 'epub', 'html', 'txt'].map(format => (
                      <button
                        key={format}
                        onClick={() => handleExport(format)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                      >
                        Export as {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy */}
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                title="Copy to Clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 relative overflow-hidden">
            {isEditing ? renderEditor() : renderContent()}
            {renderSettings()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <span>{wordCount.toLocaleString()} words</span>
              <span>{charCount.toLocaleString()} characters</span>
              <span>Readability: {Math.round(readabilityScore)}%</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Last saved: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default OutputEditorModal
