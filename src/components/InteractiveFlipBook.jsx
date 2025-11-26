import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'

const InteractiveFlipBook = ({ 
  content, 
  currentSection, 
  onSectionChange, 
  readerSettings,
  totalSections 
}) => {
  const [isFlipping, setIsFlipping] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioRef = useRef(null)
  const bookRef = useRef(null)

  // Page flip sound effect
  const playFlipSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(e => console.log('Audio play failed:', e))
    }
  }

  const handlePageFlip = async (direction) => {
    if (isFlipping) return

    setIsFlipping(true)
    playFlipSound()

    // Calculate next section
    const nextSection = direction === 'next' 
      ? Math.min(currentSection + 1, totalSections - 1)
      : Math.max(currentSection - 1, 0)

    // Wait for animation to complete
    setTimeout(() => {
      onSectionChange(nextSection)
      setIsFlipping(false)
    }, 600)
  }

  const currentContent = content[currentSection]
  const nextContent = content[currentSection + 1]

  return (
    <div className="flip-book-container relative w-full h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 z-20 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
      >
        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </button>

      {/* Audio element for page flip sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTwwMUarm9LJnGgU7k9n3yHkpBSF0xe/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>

      {/* Book container */}
      <div 
        ref={bookRef}
        className="flex items-center justify-center h-full p-8"
      >
        <div className="relative w-full max-w-6xl h-full">
          {/* Book spine shadow */}
          <div className="absolute left-1/2 top-0 h-full w-2 bg-gradient-to-r from-amber-800 to-amber-900 transform -translate-x-1/2 shadow-2xl z-10 rounded-sm" />
          
          {/* Left page */}
          <motion.div
            className={`absolute left-0 top-0 w-1/2 h-full bg-white dark:bg-gray-100 shadow-2xl rounded-l-lg ${isFlipping && currentSection > 0 ? 'flip-left' : ''}`}
            style={{
              transformOrigin: 'right center',
              transformStyle: 'preserve-3d',
            }}
            animate={isFlipping && currentSection > 0 ? {
              rotateY: -180,
              z: 50
            } : {
              rotateY: 0,
              z: 0
            }}
            transition={{
              duration: 0.6,
              ease: [0.23, 1, 0.32, 1]
            }}
          >
            {/* Left page content */}
            <div className="p-8 h-full overflow-y-auto">
              <div 
                className="h-full flex flex-col"
                style={{
                  fontFamily: readerSettings.fontFamily,
                  fontSize: `${Math.max(readerSettings.fontSize - 2, 12)}px`,
                  lineHeight: readerSettings.lineHeight,
                  color: readerSettings.theme === 'dark' ? '#374151' : '#1f2937',
                }}
              >
                {currentSection > 0 && (
                  <div dangerouslySetInnerHTML={{ 
                    __html: content[currentSection - 1]?.content || content[currentSection - 1]?.html || '' 
                  }} />
                )}
              </div>
              
              {/* Page number */}
              <div className="absolute bottom-4 left-8 text-sm text-gray-500">
                {currentSection > 0 ? currentSection : ''}
              </div>
            </div>

            {/* Page curl effect on hover */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent via-white/20 to-gray-200/40 transform rotate-45 translate-x-8 -translate-y-8 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.div>

          {/* Right page */}
          <motion.div
            className={`absolute right-0 top-0 w-1/2 h-full bg-white dark:bg-gray-100 shadow-2xl rounded-r-lg ${isFlipping && currentSection < totalSections - 1 ? 'flip-right' : ''}`}
            style={{
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
            }}
            animate={isFlipping && currentSection < totalSections - 1 ? {
              rotateY: 180,
              z: 50
            } : {
              rotateY: 0,
              z: 0
            }}
            transition={{
              duration: 0.6,
              ease: [0.23, 1, 0.32, 1]
            }}
          >
            {/* Right page content */}
            <div className="p-8 h-full overflow-y-auto">
              <div 
                className="h-full flex flex-col"
                style={{
                  fontFamily: readerSettings.fontFamily,
                  fontSize: `${Math.max(readerSettings.fontSize - 2, 12)}px`,
                  lineHeight: readerSettings.lineHeight,
                  color: readerSettings.theme === 'dark' ? '#374151' : '#1f2937',
                }}
              >
                <div dangerouslySetInnerHTML={{ 
                  __html: currentContent?.content || currentContent?.html || '<p>No content available</p>' 
                }} />
              </div>
              
              {/* Page number */}
              <div className="absolute bottom-4 right-8 text-sm text-gray-500">
                {currentSection + 1}
              </div>
            </div>

            {/* Page curl effect on hover */}
            <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-bl from-transparent via-white/20 to-gray-200/40 transform -rotate-45 -translate-x-8 -translate-y-8 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.div>

          {/* Navigation arrows */}
          <button
            onClick={() => handlePageFlip('prev')}
            disabled={currentSection === 0 || isFlipping}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => handlePageFlip('next')}
            disabled={currentSection >= totalSections - 1 || isFlipping}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Interactive hotspots for page clicking */}
          <div 
            className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer"
            onClick={() => handlePageFlip('prev')}
            style={{ 
              background: 'transparent',
              display: currentSection === 0 ? 'none' : 'block'
            }}
          />
          
          <div 
            className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer"
            onClick={() => handlePageFlip('next')}
            style={{ 
              background: 'transparent',
              display: currentSection >= totalSections - 1 ? 'none' : 'block'
            }}
          />
        </div>
      </div>

      {/* Page indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
        {currentSection + 1} of {totalSections}
      </div>

      <style jsx>{`
        .flip-book-container {
          perspective: 1000px;
        }
        
        .flip-left {
          animation: flipLeft 0.6s ease-in-out;
        }
        
        .flip-right {
          animation: flipRight 0.6s ease-in-out;
        }
        
        @keyframes flipLeft {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(-90deg) translateZ(50px); }
          100% { transform: rotateY(-180deg); }
        }
        
        @keyframes flipRight {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(90deg) translateZ(50px); }
          100% { transform: rotateY(180deg); }
        }
        
        /* Paper texture */
        .flip-book-container .absolute:nth-child(3),
        .flip-book-container .absolute:nth-child(4) {
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(120, 119, 109, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(120, 119, 109, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(120, 119, 109, 0.3) 0%, transparent 50%);
        }
      `}</style>
    </div>
  )
}

export default InteractiveFlipBook
