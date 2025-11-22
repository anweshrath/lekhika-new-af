import React from 'react'
import { motion } from 'framer-motion'

// Stagger animation container
export const StaggerContainer = ({ children, className = "", delay = 0.1 }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
        delayChildren: 0.1
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Individual stagger item
export const StaggerItem = ({ children, className = "" }) => {
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }

  return (
    <motion.div
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Floating animation
export const FloatingElement = ({ children, className = "", intensity = 10, duration = 3 }) => {
  return (
    <motion.div
      animate={{
        y: [-intensity, intensity, -intensity],
        rotate: [-1, 1, -1]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Pulse animation
export const PulseElement = ({ children, className = "", scale = 1.05, duration = 2 }) => {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Shimmer effect
export const ShimmerElement = ({ children, className = "" }) => {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </motion.div>
  )
}

// Typewriter effect
export const TypewriterText = ({ text, className = "", delay = 0.05 }) => {
  const letters = Array.from(text)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
        delayChildren: 0.1
      }
    }
  }

  const letterVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.1
      }
    }
  }

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.span>
  )
}

// Magnetic hover effect
export const MagneticElement = ({ children, className = "", strength = 0.3 }) => {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    e.currentTarget.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translate(0px, 0px)'
  }

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}

// Morphing shape
export const MorphingShape = ({ className = "", shapes = ['circle', 'square'] }) => {
  const shapeVariants = {
    circle: { borderRadius: '50%' },
    square: { borderRadius: '0%' },
    rounded: { borderRadius: '25%' }
  }

  return (
    <motion.div
      className={className}
      animate={shapeVariants[shapes[0]]}
      whileHover={shapeVariants[shapes[1]] || shapeVariants.circle}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    />
  )
}

// Particle system
export const ParticleSystem = ({ count = 20, className = "" }) => {
  const particles = Array.from({ length: count }, (_, i) => i)

  return (
    <div className={`relative ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
          initial={{
            x: Math.random() * 400,
            y: Math.random() * 400,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{
            x: Math.random() * 400,
            y: Math.random() * 400,
            scale: Math.random() * 0.5 + 0.5
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}

// Reveal animation
export const RevealElement = ({ children, className = "", direction = 'up' }) => {
  const directionVariants = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: 50, opacity: 0 },
    right: { x: -50, opacity: 0 }
  }

  return (
    <motion.div
      initial={directionVariants[direction]}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.8
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Count up animation
export const CountUpNumber = ({ 
  end, 
  start = 0, 
  duration = 2, 
  className = "",
  suffix = "",
  prefix = ""
}) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ textContent: start }}
        animate={{ textContent: end }}
        transition={{
          duration: duration,
          ease: "easeOut"
        }}
        onUpdate={(latest) => {
          if (typeof latest.textContent === 'number') {
            return `${prefix}${Math.round(latest.textContent)}${suffix}`
          }
        }}
      >
        {prefix}{start}{suffix}
      </motion.span>
    </motion.span>
  )
}

export default {
  StaggerContainer,
  StaggerItem,
  FloatingElement,
  PulseElement,
  ShimmerElement,
  TypewriterText,
  MagneticElement,
  MorphingShape,
  ParticleSystem,
  RevealElement,
  CountUpNumber
}
