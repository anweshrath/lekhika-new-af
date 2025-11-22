import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Download, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Edit3,
  Save,
  X,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Eye,
  FileText,
  Globe,
  File,
  BookOpenCheck,
  Sparkles
} from 'lucide-react'
import { dbService } from '../services/database'
import { professionalBookFormatter } from '../services/professionalBookFormatter'
import { INPUT_OPTIONS } from '../data/inputOptions'
import toast from 'react-hot-toast'

const BookReader = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [availableFormats, setAvailableFormats] = useState([])
  const [isRegeneratingFormats, setIsRegeneratingFormats] = useState(false)
  
  const audioRef = useRef(null)
  const editorRef = useRef(null)

  useEffect(() => {
    loadBook()
  }, [id])

  const loadBook = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!id) {
        throw new Error('No book ID provided')
      }

      const foundBook = await dbService.getBook(id)
      if (!foundBook) {
        throw new Error(`Book with ID ${id} not found`)
      }

      // Process book content for flip book display
      const processedBook = await processBookForDisplay(foundBook)
      setBook(processedBook)
      setAvailableFormats(processedBook.availableFormats || [])
      
    } catch (error) {
      console.error('Error loading book:', error)
      setError(error.message)
      toast.error(`Failed to load book: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const processBookForDisplay = async (rawBook) => {
    try {
      // Extract user input for formatting
      const userInput = {
        book_title: rawBook.title,
        author_name: rawBook.author || 'The Author',
        ...rawBook.metadata
      }

      // Get clean book content
      let bookContent = ''
      if (typeof rawBook.content === 'string') {
        bookContent = rawBook.content
      } else if (rawBook.content && typeof rawBook.content === 'object') {
        // Extract from workflow results
        const contentValues = Object.values(rawBook.content)
        bookContent = contentValues[contentValues.length - 1] || ''
      }

      // Generate all available formats
      const formats = ['html', 'pdf', 'epub', 'docx', 'text', 'flipbook']
      const formattedVersions = {}
      
      for (const format of formats) {
        try {
          formattedVersions[format] = professionalBookFormatter.formatCompleteBook(
            bookContent, 
            userInput, 
            format
          )
        } catch (error) {
          console.warn(`Failed to generate ${format} format:`, error)
        }
      }

      // Parse HTML content into pages for flip book
      const htmlContent = formattedVersions.html || bookContent
      const pages = parseContentIntoPages(htmlContent)

      return {
        ...rawBook,
        originalContent: bookContent,
        formattedVersions,
        pages,
        availableFormats: Object.keys(formattedVersions),
        userInput
      }
    } catch (error) {
      console.error('Error processing book:', error)
      throw error
    }
  }

  const parseContentIntoPages = (htmlContent) => {
    // Split content into logical pages for flip book
    const sections = htmlContent.split(/(?=<h[1-6]|<div class="page-break|# Chapter)/i)
    
    return sections.map((section, index) => ({
      id: index,
      content: section.trim(),
      pageNumber: index + 1
    })).filter(page => page.content.length > 0)
  }

  const playFlipSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(e => console.log('Audio play failed:', e))
    }
  }

  const handlePageFlip = (direction) => {
    if (isFlipping) return

    setIsFlipping(true)
    playFlipSound()

    const nextPage = direction === 'next' 
      ? Math.min(currentPage + 1, book.pages.length - 1)
      : Math.max(currentPage - 1, 0)

    setTimeout(() => {
      setCurrentPage(nextPage)
      setIsFlipping(false)
    }, 600)
  }

  const toggleEditMode = () => {
    if (isEditMode) {
      // Save mode - regenerate all formats
      regenerateAllFormats()
    } else {
      // Edit mode - load current content
      setEditContent(book.originalContent)
    }
    setIsEditMode(!isEditMode)
  }

  const regenerateAllFormats = async () => {
    try {
      setIsRegeneratingFormats(true)
      toast.loading('Regenerating all formats...')

      // Update book content
      const updatedBook = {
        ...book,
        content: editContent,
        originalContent: editContent
      }

      // Regenerate all formats
      const processedBook = await processBookForDisplay(updatedBook)
      setBook(processedBook)
      
      // Save to database
      await dbService.updateBook(id, { content: editContent })
      
      toast.dismiss()
      toast.success('🎉 All formats regenerated successfully!')
      
    } catch (error) {
      console.error('Error regenerating formats:', error)
      toast.error('Failed to regenerate formats')
    } finally {
      setIsRegeneratingFormats(false)
    }
  }

  const downloadFormat = (format) => {
    try {
      const content = book.formattedVersions[format]
      if (!content) {
        toast.error(`${format.toUpperCase()} format not available`)
        return
      }

      // Create and download file
      const mimeTypes = {
        html: 'text/html',
        pdf: 'application/pdf',
        epub: 'application/epub+zip',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        text: 'text/plain',
        markdown: 'text/markdown',
        flipbook: 'text/html'
      }

      const blob = new Blob([content], { type: mimeTypes[format] || 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${book.title || 'book'}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success(`📥 ${format.toUpperCase()} downloaded successfully!`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error(`Download failed: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/20 rounded-full animate-spin border-t-purple-500 mx-auto mb-6"></div>
            <Sparkles className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Your Masterpiece</h2>
          <p className="text-purple-300">Preparing your book for an amazing reading experience...</p>
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-slate-900 to-red-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <BookOpen className="w-24 h-24 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Unable to Load Book</h2>
          <p className="text-red-300 mb-6">{error || 'Book not found'}</p>
          <button
            onClick={() => navigate('/app/books')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2 inline" />
            Back to Library
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* COSMIC BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Floating cosmic orbs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-32 w-40 h-40 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* HEADER BAR */}
      <div className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/app/books')}
                className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Library
              </button>
              
              <div>
                <h1 className="text-xl font-bold text-white">{book.title}</h1>
                <p className="text-purple-300 text-sm">Page {currentPage + 1} of {book.pages?.length || 1}</p>
              </div>
            </div>

            {/* Right - Controls */}
            <div className="flex items-center space-x-3">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 hover:scale-105"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* Edit Mode Toggle */}
              <button
                onClick={toggleEditMode}
                disabled={isRegeneratingFormats}
                className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                  isEditMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isRegeneratingFormats ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : isEditMode ? (
                  <Save className="w-5 h-5 mr-2" />
                ) : (
                  <Edit3 className="w-5 h-5 mr-2" />
                )}
                {isRegeneratingFormats ? 'Saving...' : isEditMode ? 'Save Changes' : 'Edit Book'}
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 hover:scale-105"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 h-screen pt-20">
        {isEditMode ? (
          /* ADVANCED RICH TEXT EDITOR MODE */
          <div className="h-full p-6">
            <div className="h-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Editor Header */}
                <div className="px-6 py-4 border-b border-white/10 bg-black/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Advanced Editor</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-purple-300">
                        {editContent.length.toLocaleString()} characters
                      </span>
                      <button
                        onClick={() => setIsEditMode(false)}
                        className="p-2 hover:bg-white/10 text-white rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rich Text Editor */}
                <div className="flex-1 p-6">
                  <textarea
                    ref={editorRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full bg-transparent text-white placeholder-purple-300 border-none outline-none resize-none text-lg leading-relaxed font-serif"
                    placeholder="Start writing your masterpiece..."
                    style={{
                      fontFamily: 'Georgia, serif',
                      lineHeight: '1.8'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* INTERACTIVE FLIP BOOK MODE */
          <div className="h-full flex items-center justify-center p-6">
            <div className="relative w-full max-w-7xl h-full">
              {/* Book Container */}
              <div 
                className="relative w-full h-full flex items-center justify-center"
                style={{ perspective: '1200px' }}
              >
                {/* Book Spine Shadow */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4/5 bg-gradient-to-r from-amber-800 via-amber-900 to-amber-800 shadow-2xl z-20 rounded-sm opacity-80" />
                
                {/* Left Page */}
                <motion.div
                  className="absolute left-1/2 top-1/2 w-1/2 h-4/5 bg-gradient-to-br from-amber-50 to-orange-50 shadow-2xl transform -translate-x-full -translate-y-1/2 rounded-l-2xl overflow-hidden"
                  style={{
                    transformOrigin: 'right center',
                    transformStyle: 'preserve-3d',
                  }}
                  animate={isFlipping ? {
                    rotateY: currentPage > 0 ? -15 : 0,
                    z: currentPage > 0 ? 20 : 0
                  } : {
                    rotateY: 0,
                    z: 0
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                >
                  {/* Paper texture overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-100/30 to-orange-100/30 pointer-events-none" />
                  
                  {/* Left page content */}
                  <div className="h-full p-8 overflow-y-auto">
                    {currentPage > 0 && book.pages[currentPage - 1] && (
                      <div 
                        className="h-full text-gray-800 leading-relaxed"
                        style={{
                          fontFamily: 'Georgia, serif',
                          fontSize: '16px',
                          lineHeight: '1.8'
                        }}
                        dangerouslySetInnerHTML={{ 
                          __html: book.pages[currentPage - 1].content 
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Page number */}
                  {currentPage > 0 && (
                    <div className="absolute bottom-6 left-8 text-sm text-gray-500 font-medium">
                      {currentPage}
                    </div>
                  )}
                </motion.div>

                {/* Right Page */}
                <motion.div
                  className="absolute left-1/2 top-1/2 w-1/2 h-4/5 bg-gradient-to-bl from-amber-50 to-orange-50 shadow-2xl transform -translate-y-1/2 rounded-r-2xl overflow-hidden"
                  style={{
                    transformOrigin: 'left center',
                    transformStyle: 'preserve-3d',
                  }}
                  animate={isFlipping ? {
                    rotateY: currentPage < book.pages.length - 1 ? 15 : 0,
                    z: currentPage < book.pages.length - 1 ? 20 : 0
                  } : {
                    rotateY: 0,
                    z: 0
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                >
                  {/* Paper texture overlay */}
                  <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-amber-100/30 to-orange-100/30 pointer-events-none" />
                  
                  {/* Right page content */}
                  <div className="h-full p-8 overflow-y-auto">
                    {book.pages[currentPage] && (
                      <div 
                        className="h-full text-gray-800 leading-relaxed"
                        style={{
                          fontFamily: 'Georgia, serif',
                          fontSize: '16px',
                          lineHeight: '1.8'
                        }}
                        dangerouslySetInnerHTML={{ 
                          __html: book.pages[currentPage].content 
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Page number */}
                  <div className="absolute bottom-6 right-8 text-sm text-gray-500 font-medium">
                    {currentPage + 1}
                  </div>
                </motion.div>

                {/* Navigation Arrows */}
                <button
                  onClick={() => handlePageFlip('prev')}
                  disabled={currentPage === 0 || isFlipping}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={() => handlePageFlip('next')}
                  disabled={currentPage >= book.pages.length - 1 || isFlipping}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Click zones for page flipping */}
                <div 
                  className="absolute left-0 top-0 w-1/2 h-full z-20 cursor-pointer"
                  onClick={() => handlePageFlip('prev')}
                  style={{ 
                    background: 'transparent',
                    display: currentPage === 0 ? 'none' : 'block'
                  }}
                />
                
                <div 
                  className="absolute right-0 top-0 w-1/2 h-full z-20 cursor-pointer"
                  onClick={() => handlePageFlip('next')}
                  style={{ 
                    background: 'transparent',
                    display: currentPage >= book.pages.length - 1 ? 'none' : 'block'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* DOWNLOAD PANEL - FLOATING */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-4 text-center">📥 Download Formats</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
              {availableFormats.map(format => {
                const formatInfo = INPUT_OPTIONS.outputFormats.find(f => f.id === format) || 
                  { name: format.toUpperCase(), icon: '📄' }
                
                return (
                  <button
                    key={format}
                    onClick={() => downloadFormat(format)}
                    className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 group"
                  >
                    <div className="text-2xl mb-2 group-hover:animate-bounce">
                      {formatInfo.icon}
                    </div>
                    <span className="text-white text-xs font-medium">
                      {formatInfo.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* PAGE INDICATOR */}
        <div className="absolute bottom-6 right-6 z-30">
          <div className="bg-black/40 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20">
            <span className="text-white text-sm font-medium">
              {currentPage + 1} / {book.pages?.length || 1}
            </span>
          </div>
        </div>
      </div>

      {/* Audio for page flip sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTwwMUarm9LJnGgU7k9n3yHkpBSF0xe/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>

      {/* CSS for flip book animations */}
      <style jsx>{`
        .flip-book-container {
          perspective: 1200px;
        }
        
        @keyframes pageFlipLeft {
          0% { transform: rotateY(0deg) translateZ(0px); }
          50% { transform: rotateY(-90deg) translateZ(50px); }
          100% { transform: rotateY(-180deg) translateZ(0px); }
        }
        
        @keyframes pageFlipRight {
          0% { transform: rotateY(0deg) translateZ(0px); }
          50% { transform: rotateY(90deg) translateZ(50px); }
          100% { transform: rotateY(180deg) translateZ(0px); }
        }
        
        /* Smooth text rendering */
        .flip-book-content {
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Custom scrollbar for editor */
        textarea::-webkit-scrollbar {
          width: 8px;
        }
        
        textarea::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        textarea::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        
        textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  )
}

export default BookReader