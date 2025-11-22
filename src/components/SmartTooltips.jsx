import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

const SmartTooltip = ({ 
  children, 
  content, 
  position = 'top',
  delay = 500,
  className = '',
  interactive = false,
  maxWidth = 300
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  const calculatePosition = () => {
    if (!triggerRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const scrollX = window.pageXOffset
    const scrollY = window.pageYOffset
    
    let x, y

    switch (position) {
      case 'top':
        x = triggerRect.left + scrollX + triggerRect.width / 2
        y = triggerRect.top + scrollY - 10
        break
      case 'bottom':
        x = triggerRect.left + scrollX + triggerRect.width / 2
        y = triggerRect.bottom + scrollY + 10
        break
      case 'left':
        x = triggerRect.left + scrollX - 10
        y = triggerRect.top + scrollY + triggerRect.height / 2
        break
      case 'right':
        x = triggerRect.right + scrollX + 10
        y = triggerRect.top + scrollY + triggerRect.height / 2
        break
      default:
        x = triggerRect.left + scrollX + triggerRect.width / 2
        y = triggerRect.top + scrollY - 10
    }

    setTooltipPosition({ x, y })
  }

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      calculatePosition()
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    if (!interactive) {
      setIsVisible(false)
    } else {
      // For interactive tooltips, add a small delay to allow mouse to move to tooltip
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 100)
    }
  }

  const handleTooltipMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleTooltipMouseLeave = () => {
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getTransformOrigin = () => {
    switch (position) {
      case 'top': return 'bottom center'
      case 'bottom': return 'top center'
      case 'left': return 'right center'
      case 'right': return 'left center'
      default: return 'bottom center'
    }
  }

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-0 h-0 border-solid'
    
    switch (position) {
      case 'top':
        return `${baseClasses} border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-100 top-full left-1/2 transform -translate-x-1/2`
      case 'bottom':
        return `${baseClasses} border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-900 dark:border-b-gray-100 bottom-full left-1/2 transform -translate-x-1/2`
      case 'left':
        return `${baseClasses} border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-gray-900 dark:border-l-gray-100 left-full top-1/2 transform -translate-y-1/2`
      case 'right':
        return `${baseClasses} border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-gray-900 dark:border-r-gray-100 right-full top-1/2 transform -translate-y-1/2`
      default:
        return `${baseClasses} border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-100 top-full left-1/2 transform -translate-x-1/2`
    }
  }

  const tooltip = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={tooltipRef}
          initial={{ 
            opacity: 0, 
            scale: 0.8,
            y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
            x: position === 'left' ? 10 : position === 'right' ? -10 : 0
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0,
            x: 0
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.8,
            y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
            x: position === 'left' ? 10 : position === 'right' ? -10 : 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.2
          }}
          style={{
            position: 'absolute',
            left: position === 'left' ? tooltipPosition.x - maxWidth : 
                  position === 'right' ? tooltipPosition.x : 
                  tooltipPosition.x - maxWidth / 2,
            top: position === 'top' ? tooltipPosition.y - 40 : 
                 position === 'bottom' ? tooltipPosition.y : 
                 tooltipPosition.y - 20,
            maxWidth: `${maxWidth}px`,
            transformOrigin: getTransformOrigin(),
            zIndex: 9999
          }}
          className={`bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium shadow-2xl border border-gray-700 dark:border-gray-300 ${className}`}
          onMouseEnter={interactive ? handleTooltipMouseEnter : undefined}
          onMouseLeave={interactive ? handleTooltipMouseLeave : undefined}
        >
          {/* Arrow */}
          <div className={getArrowClasses()} />
          
          {/* Content */}
          <div className="relative z-10">
            {typeof content === 'string' ? (
              <span>{content}</span>
            ) : (
              content
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  )
}

// Preset tooltip components for common use cases
export const HelpTooltip = ({ children, content, ...props }) => (
  <SmartTooltip
    content={content}
    position="top"
    delay={300}
    maxWidth={250}
    {...props}
  >
    {children}
  </SmartTooltip>
)

export const InfoTooltip = ({ children, content, ...props }) => (
  <SmartTooltip
    content={content}
    position="bottom"
    delay={500}
    maxWidth={300}
    interactive={true}
    {...props}
  >
    {children}
  </SmartTooltip>
)

export const QuickTooltip = ({ children, content, ...props }) => (
  <SmartTooltip
    content={content}
    position="top"
    delay={100}
    maxWidth={200}
    {...props}
  >
    {children}
  </SmartTooltip>
)

export default SmartTooltip
