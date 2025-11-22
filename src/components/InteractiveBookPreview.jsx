import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Eye, 
  Download, 
  Share2, 
  Heart, 
  Star,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Bookmark,
  MoreHorizontal,
  FileText,
  Image,
  BarChart3
} from 'lucide-react'

const InteractiveBookPreview = ({ 
  book,
  onExport,
  onShare,
  className = ""
}) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [showStats, setShowStats] = useState(false)

  // Mock book pages for preview
  const pages = [
    {
      type: 'cover',
      title: book?.title || 'Your Amazing Book',
      author: book?.authorName || 'Author Name',
      subtitle: book?.subtitle || 'A comprehensive guide to success'
    },
    {
      type: 'toc',
      title: 'Table of Contents',
      chapters: book?.chapters || [
        'Introduction',
        'Chapter 1: Getting Started',
        'Chapter 2: Advanced Concepts',
        'Chapter 3: Best Practices',
        'Conclusion'
      ]
    },
    {
      type: 'content',
      title: 'Introduction',
      content: book?.introduction || 'Welcome to this comprehensive guide. In this book, you will discover powerful strategies and insights that will transform your understanding of the subject matter. Our journey begins with fundamental concepts and progresses to advanced applications that you can implement immediately.'
    },
    {
      type: 'content',
      title: 'Chapter 1: Getting Started',
      content: 'This chapter introduces the core concepts you need to understand before diving deeper. We will explore the foundational principles that underpin everything else in this book, providing you with a solid base for the advanced topics that follow.'
    }
  ]

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % pages.length)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + pages.length) % pages.length)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    if (!isLiked) {
      // Add heart animation
      const hearts = document.createElement('div')
      hearts.innerHTML = '❤️'
      hearts.style.position = 'fixed'
      hearts.style.top = '50%'
      hearts.style.left = '50%'
      hearts.style.fontSize = '2rem'
      hearts.style.pointerEvents = 'none'
      hearts.style.zIndex = '9999'
      document.body.appendChild(hearts)
      
      setTimeout(() => {
        document.body.removeChild(hearts)
      }, 1000)
    }
  }

  const currentPageData = pages[currentPage]

  const renderPage = () => {
    switch (currentPageData.type) {
      case 'cover':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-blue-600 to-purple-700 text-white"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-24 h-24 mb-6 bg-white/20 rounded-2xl flex items-center justify-center"
            >
              <BookOpen className="w-12 h-12" />
            </motion.div>
            <motion.h1 
              className="text-4xl font-bold mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentPageData.title}
            </motion.h1>
            <motion.p 
              className="text-xl mb-6 opacity-90"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {currentPageData.subtitle}
            </motion.p>
            <motion.p 
              className="text-lg opacity-80"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              by {currentPageData.author}
            </motion.p>
          </motion.div>
        )
      
      case 'toc':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              {currentPageData.title}
            </h2>
            <div className="space-y-4">
              {currentPageData.chapters.map((chapter, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 10, scale: 1.02 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {chapter}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )
      
      case 'content':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full p-8"
          >
            <motion.h2 
              className="text-3xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentPageData.title}
            </motion.h2>
            <motion.div 
              className="prose prose-lg dark:prose-invert max-w-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentPageData.content}
              </p>
            </motion.div>
          </motion.div>
        )
      
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''} ${className}`}
    >
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden ${
        isFullscreen ? 'h-full' : 'h-96 md:h-[500px]'
      }`}>
        {/* Header Controls */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleLike}
              className={`p-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                audioEnabled 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </motion.button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentPage + 1} / {pages.length}
            </span>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowStats(!showStats)}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Book Content */}
        <div className="relative flex-1 h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevPage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextPage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </motion.button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            {pages.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentPage 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 dark:bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onShare?.(book)}
              className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onExport?.(book)}
              className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-16 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700 min-w-[200px]"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Book Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Pages:</span>
                <span className="font-medium">{pages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Words:</span>
                <span className="font-medium">{book?.wordCount || '~15,000'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Reading Time:</span>
                <span className="font-medium">~45 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Likes:</span>
                <span className="font-medium">{isLiked ? '1' : '0'}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default InteractiveBookPreview
