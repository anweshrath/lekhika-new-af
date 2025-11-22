import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical,
  Calendar,
  FileText,
  BarChart3,
  ExternalLink,
  Star,
  Clock,
  Play,
  ChevronRight,
  BookOpenCheck,
  Zap,
  Loader2
} from 'lucide-react'
import { dbService } from '../services/database'
import { downloadBookFormat, getAvailableFormats, fetchFullBook } from '../services/bookDownloadService'
// import exportService from '../services/exportService' // REMOVED: Rogue client-side export service
import { useUserAuth } from '../contexts/UserAuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import UltraButton from '../components/UltraButton'
import UltraCard from '../components/UltraCard'
import UltraInput from '../components/UltraInput'
import UltraLoader from '../components/UltraLoader'
import { ultraToast } from '../utils/ultraToast'
// SURGICAL STRIKE: Import the new modal.
import BookReaderModal from '../components/BookReaderModal'
import { AnimatePresence } from 'framer-motion';

const Books = () => {
  const { user, loading: authLoading } = useUserAuth()
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selectedBook, setSelectedBook] = useState(null) // State to control the modal
  const [modalHtmlContent, setModalHtmlContent] = useState('')
  const [isModalLoading, setIsModalLoading] = useState(false)
  // SURGICAL CLEANUP: All state related to the buggy dropdown has been exterminated.
  const [downloadingBookId, setDownloadingBookId] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      loadBooks()
    }
  }, [authLoading])

  useEffect(() => {
    filterBooks()
  }, [books, searchTerm, filterStatus, filterType])

  const loadBooks = async () => {
    try {
      setLoading(true)
      
      if (!user || !user.id) {
        console.error('❌ No user ID available', 'User object:', user)
        setBooks([])
        setLoading(false)
        return
      }
      
      // Use consistent user_id field for database queries
      const userId = user.user_id || user.id
      console.log('Loading books for user:', userId, 'User object:', user)
      
      const userBooks = await dbService.getBooks(userId)
      console.log('Loaded books:', userBooks)
      
      setBooks(userBooks || [])
    } catch (error) {
      console.error('Error loading books:', error)
      ultraToast.error('Failed to load books')
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  /*
    SURGICAL STRIKE: This is the new, unified, intelligent export function.
    It is now the single source of truth for all downloads from the library.
    It will first attempt to use a pre-signed URL. If that fails, it will
    fall back to generating a download on-the-fly from the raw book content.
    This guarantees a download is always available if the content exists.
  */
  const handleUnifiedExport = async (book, format) => {
    const displayFormat = String(format || '').toUpperCase();
    const loadingToastId = ultraToast.loading(`[1/N] Preparing ${displayFormat}...`);

    try {
      const { source, format: normalizedFormat } = await downloadBookFormat(book, format);
      const successVerb = source === 'url' ? 'Downloaded' : 'Generated';
      ultraToast.update(loadingToastId, `✅ ${successVerb} ${String(normalizedFormat || displayFormat).toUpperCase()}`);
    } catch (error) {
      console.error(`Download error for ${format}:`, error);
      ultraToast.update(loadingToastId, `❌ ${displayFormat || 'FORMAT'} failed: ${error.message}`);
    }
  };

  /*
    SURGICAL STRIKE: The download button logic is now a single, powerful "Download All" function.
    It finds all available formats and triggers a download for each one sequentially.
  */
  const handleDownloadAllClick = async (e, book) => {
    e.stopPropagation();
    setDownloadingBookId(book.id);
    const mainToastId = ultraToast.loading('Gathering all book formats...');

    try {
      const fullBook = await fetchFullBook(book);
      if (!fullBook) throw new Error("Could not find book data.");

      const allAvailableFormats = getAvailableFormats(fullBook);

      if (allAvailableFormats.length === 0) {
        throw new Error("No download formats found for this book.");
      }

      ultraToast.update(mainToastId, `Found ${allAvailableFormats.length} formats. Starting downloads...`);

      // Trigger all downloads one after another
      for (const format of allAvailableFormats) {
        await downloadBookFormat(fullBook, format);
      }

      ultraToast.update(mainToastId, '✅ All downloads initiated!');

      // FUTURE: This is where we would trigger the backend function to permanently save all formats.
      // supabase.functions.invoke('save-all-book-formats', { body: { bookId: book.id } });

    } catch (error) {
      console.error("Error during 'Download All':", error);
      ultraToast.update(mainToastId, `Error: ${error.message}`);
    } finally {
      setDownloadingBookId(null);
    }
  };

  const filterBooks = () => {
    let filtered = books || []

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.niche?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(book => book.status === filterStatus)
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(book => book.type === filterType)
    }

    setFilteredBooks(filtered)
  }

  const deleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await dbService.deleteBook(bookId)
        setBooks(books.filter(book => book.id !== bookId))
        ultraToast.success('🗑️ Book deleted successfully')
      } catch (error) {
        console.error('Error deleting book:', error)
        ultraToast.error('Failed to delete book')
      }
    }
  }

  // SURGICAL STRIKE: This function is now guaranteed to open the modal.
  const openBookReader = async (book) => {
    if (book.status !== 'completed') {
      toast.error('Book is still being generated. Please wait for completion.')
      return
    }

    setIsModalLoading(true)
    try {
      const fullBook = await dbService.getBook(book.id)
      if (fullBook) {
        const content = extractHtmlContent(fullBook)
        setModalHtmlContent(content)
        setSelectedBook(fullBook)
      } else {
        ultraToast.error('Could not load book content.')
      }
    } catch (error) {
      console.error("Error loading book content for modal:", error)
      ultraToast.error('Failed to load book.')
    } finally {
      setIsModalLoading(false)
    }
  }

  const closeBookReader = () => {
    setSelectedBook(null)
    setModalHtmlContent('')
  }
  
  const goToFullScreen = (bookId) => {
    closeBookReader();
    navigate(`/app/books/${bookId}`)
  }
  
  // Helper to extract content, as it can be in different formats
  const extractHtmlContent = (bookData) => {
    if (!bookData) return ""

    const content = bookData.content

    // 1) New canonical shape: formats bucket on the content object
    if (content && typeof content === 'object') {
      const formats = content.formats || {}
      if (typeof formats.html === 'string') {
        return formats.html
      }
    }

    // 2) Legacy helper: top-level html field on the content object
    if (content && typeof content.html === 'string') {
      return content.html
    }

    // 3) Old shape: content is a JSON string that may contain an html field
    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content)
        if (parsed && typeof parsed.html === 'string') return parsed.html
      } catch (e) {
        // Fallback: treat raw string as HTML
        return content
    }
  }

    return ""
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'generating':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ebook':
        return '📚'
      case 'report':
        return '📊'
      case 'guide':
        return '📋'
      case 'whitepaper':
        return '📄'
      case 'manual':
        return '📖'
      case 'case-study':
        return '🔍'
      default:
        return '📝'
    }
  }

  if (authLoading || loading) {
    return <UltraLoader type="pulse" size="xl" message="Loading your masterpiece library..." />
  }

  return (
    <div className="space-y-6">
        {/* Header - ULTRA VERSION */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-center md:justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl font-black text-gradient-animated mb-2">
              📚 My Library
            </h1>
            <p className="text-lg font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Your AI-generated masterpieces ✨
            </p>
          </div>
          <motion.div 
            className="mt-4 md:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <UltraButton
              onClick={() => navigate('/app/create')}
              icon={BookOpen}
              size="lg"
              variant="primary"
            >
              Create New Book
            </UltraButton>
          </motion.div>
        </motion.div>

        {/* Stats Overview - ULTRA VERSION */}
        {books.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-fade-in">
            <UltraCard hover={false} glow className="text-center">
              <div className="text-4xl font-black text-gradient mb-2">
                {books.length}
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                Total Books
              </p>
              <div className="mt-2 text-xs font-bold" style={{ color: 'var(--theme-primary)' }}>
                📚
              </div>
            </UltraCard>
            
            <UltraCard hover={false} glow className="text-center">
              <div className="text-4xl font-black text-gradient mb-2">
                {books.filter(book => book.status === 'completed').length}
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                Completed
              </p>
              <div className="mt-2 text-xs font-bold" style={{ color: 'var(--theme-success)' }}>
                ✅
              </div>
            </UltraCard>
            
            <UltraCard hover={false} glow className="text-center">
              <div className="text-4xl font-black text-gradient mb-2">
                {books.reduce((total, book) => total + (book.word_count || 0), 0).toLocaleString()}
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                Total Words
              </p>
              <div className="mt-2 text-xs font-bold" style={{ color: 'var(--theme-secondary)' }}>
                📝
              </div>
            </UltraCard>
            
            <UltraCard hover={false} glow className="text-center">
              <div className="text-4xl font-black text-gradient mb-2">
                {Math.round(books.reduce((total, book) => total + (book.quality_score || 0), 0) / books.length) || 0}%
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                Avg Quality
              </p>
              <div className="mt-2 text-xs font-bold" style={{ color: 'var(--theme-accent)' }}>
                ⭐
              </div>
            </UltraCard>
          </div>
        )}

        {/* Filters - ULTRA VERSION */}
        <UltraCard hover={false}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <UltraInput
                type="text"
                placeholder="Search your library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-ultra px-4 py-3 rounded-xl font-medium transition-smooth"
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '2px solid var(--color-border)'
                }}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="generating">Generating</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-ultra px-4 py-3 rounded-xl font-medium transition-smooth"
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '2px solid var(--color-border)'
                }}
              >
                <option value="all">All Types</option>
                <option value="ebook">eBook</option>
                <option value="report">Report</option>
                <option value="guide">Guide</option>
                <option value="whitepaper">Whitepaper</option>
                <option value="manual">Manual</option>
                <option value="case-study">Case Study</option>
              </select>
            </div>
          </div>
        </UltraCard>

        {/* Books Grid - ULTRA VERSION */}
        {filteredBooks.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade-in">
            {filteredBooks.map((book, index) => (
              <UltraCard
                key={book.id}
                hover={true}
                glow={book.quality_score >= 90}
                className="group"
              >
                {/* Header with Icon and Badge */}
                <div className="flex items-start justify-between mb-4">
                  <motion.div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                    style={{
                      background: 'var(--theme-gradient-primary)'
                    }}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {getTypeIcon(book.type)}
                  </motion.div>
                  
                  <div className="flex items-center gap-2">
                    {book.quality_score && book.quality_score >= 90 && (
                      <motion.div
                        className="badge-pop"
                        whileHover={{ scale: 1.2, rotate: 15 }}
                      >
                        <Star className="w-5 h-5" style={{ color: 'var(--theme-accent)', fill: 'var(--theme-accent)' }} />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 line-clamp-2 text-gradient" style={{
                  color: 'var(--color-text)'
                }}>
                  {book.title || 'Untitled Book'}
                </h3>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    <FileText className="w-4 h-4" />
                    <span className="capitalize">{book.type} • {book.niche || 'General'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(book.created_at).toLocaleDateString()}</span>
                  </div>
                  {book.word_count && (
                    <div className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--theme-primary)' }}>
                      <BarChart3 className="w-4 h-4" />
                      <span>{book.word_count.toLocaleString()} words</span>
                    </div>
                  )}
                  {book.status === 'generating' && (
                    <div className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--theme-warning)' }}>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>AI agents working...</span>
                    </div>
                  )}
                </div>

                {/* Status & Quality */}
                <div className="flex items-center justify-between mb-4">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                    style={{
                      background: book.status === 'completed' 
                        ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                        : book.status === 'generating'
                        ? 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)'
                        : 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
                      color: 'white'
                    }}
                  >
                    {book.status}
                  </span>
                  {book.quality_score && (
                    <span className="text-sm font-black text-gradient">
                      {book.quality_score}% ⭐
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <UltraButton
                    onClick={() => openBookReader(book)} // This now opens the modal
                    disabled={book.status !== 'completed' || isModalLoading}
                    icon={isModalLoading && selectedBook?.id === book.id ? Loader2 : BookOpenCheck}
                    size="sm"
                    variant="primary"
                    fullWidth
                  >
                    {isModalLoading && selectedBook?.id === book.id ? 'Loading...' : 'Read'}
                  </UltraButton>

                  {/* SURGICAL CLEANUP: This is the one and only download button. No dropdowns, no ambiguity. */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleDownloadAllClick(e, book)}
                    disabled={book.status !== 'completed' || downloadingBookId === book.id}
                    className="px-4 py-2 rounded-lg transition-smooth icon-bounce"
                    style={{
                      background: 'var(--color-surface-hover)',
                      border: '2px solid var(--color-border)',
                      opacity: book.status !== 'completed' || downloadingBookId === book.id ? 0.5 : 1
                    }}
                  >
                    {downloadingBookId === book.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                    <Download className="w-4 h-4" style={{ color: 'var(--theme-secondary)' }} />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteBook(book.id)}
                    className="px-4 py-2 rounded-lg transition-smooth icon-bounce"
                    style={{
                      background: 'var(--color-surface-hover)',
                      border: '2px solid var(--theme-error)'
                    }}
                  >
                    <Trash2 className="w-4 h-4" style={{ color: 'var(--theme-error)' }} />
                  </motion.button>
                </div>
              </UltraCard>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-12"
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                ? 'No books match your filters' 
                : 'Your library awaits your first masterpiece'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for'
                : 'Create your first AI-powered book and watch the magic happen'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/app/create')}
                className="btn-primary text-lg px-8 py-4"
              >
                🚀 Create Your First Book
              </motion.button>
            )}
          </motion.div>
        )}
        
        {/* SURGICAL STRIKE: The AnimatePresence component is now correctly placed here, in the parent.
        It wraps the conditional rendering of the modal, giving it proper control over the
        modal's entry and exit animations. This is the correct architecture. */}
        <AnimatePresence>
          {selectedBook && (
            <BookReaderModal 
              key={selectedBook.id} // Add key for AnimatePresence to track the component
              book={selectedBook}
              htmlContent={modalHtmlContent}
              onClose={closeBookReader}
              onGoFullScreen={() => goToFullScreen(selectedBook.id)}
            />
          )}
        </AnimatePresence>
    </div>
  )
}

export default Books
