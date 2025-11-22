import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * PARTICLE SYSTEM COMPONENT
 * Creates floating particles with physics simulation
 */
const ParticleSystem = ({
  particleCount = 50,
  speed = 1,
  size = 2,
  color = 'var(--theme-primary)',
  opacity = 0.6,
  className = ''
}) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * size + 1,
      opacity: Math.random() * opacity + 0.2,
      life: Math.random() * 100
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Update life
        particle.life += 0.5
        if (particle.life > 100) {
          particle.life = 0
          particle.x = Math.random() * canvas.width
          particle.y = Math.random() * canvas.height
        }

        // Draw particle
        ctx.save()
        ctx.globalAlpha = particle.opacity * (1 - particle.life / 100)
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particleCount, speed, size, color, opacity])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    />
  )
}

/**
 * CONFETTI COMPONENT
 * Celebration confetti animation
 */
const Confetti = ({ 
  active = false, 
  duration = 3000,
  particleCount = 100,
  colors = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
  className = ''
}) => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!active) return

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -10,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      life: 100
    }))

    setParticles(newParticles)

    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          rotation: particle.rotation + particle.rotationSpeed,
          life: particle.life - 1,
          vy: particle.vy + 0.1 // gravity
        })).filter(particle => particle.life > 0 && particle.y < window.innerHeight + 50)
      )
    }, 16)

    const timeout = setTimeout(() => {
      setParticles([])
    }, duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [active, duration, particleCount, colors])

  if (!active || particles.length === 0) return null

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.life / 100
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        />
      ))}
    </div>
  )
}

/**
 * FLOATING PARTICLES BACKGROUND
 * Subtle background particle effect
 */
const FloatingParticles = ({ 
  theme = 'light',
  intensity = 'medium',
  className = ''
}) => {
  const configs = {
    light: {
      particleCount: 30,
      speed: 0.5,
      size: 1,
      color: '#3B82F6',
      opacity: 0.3
    },
    dark: {
      particleCount: 50,
      speed: 0.8,
      size: 2,
      color: '#00D4FF',
      opacity: 0.4
    },
    neon: {
      particleCount: 80,
      speed: 1.2,
      size: 2,
      color: '#FF0080',
      opacity: 0.6
    },
    cosmic: {
      particleCount: 60,
      speed: 0.6,
      size: 1.5,
      color: '#9D4EDD',
      opacity: 0.5
    }
  }

  const intensityMultipliers = {
    low: 0.5,
    medium: 1,
    high: 1.5
  }

  const config = configs[theme] || configs.light
  const multiplier = intensityMultipliers[intensity] || 1

  return (
    <ParticleSystem
      particleCount={Math.floor(config.particleCount * multiplier)}
      speed={config.speed * multiplier}
      size={config.size * multiplier}
      color={config.color}
      opacity={config.opacity * multiplier}
      className={className}
    />
  )
}

/**
 * MICRO-INTERACTION COMPONENT
 * Adds subtle animations to elements
 */
const MicroInteraction = ({ 
  children, 
  type = 'hover',
  intensity = 'medium',
  className = ''
}) => {
  const animations = {
    hover: {
      scale: 1.02,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    tap: {
      scale: 0.98,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    focus: {
      scale: 1.01,
      transition: { type: "spring", stiffness: 200, damping: 15 }
    }
  }

  const intensityMultipliers = {
    low: 0.5,
    medium: 1,
    high: 1.5
  }

  const multiplier = intensityMultipliers[intensity] || 1
  const animation = animations[type] || animations.hover

  return (
    <motion.div
      className={className}
      whileHover={type === 'hover' ? { 
        scale: animation.scale * multiplier,
        transition: animation.transition
      } : {}}
      whileTap={type === 'tap' ? { 
        scale: animation.scale * multiplier,
        transition: animation.transition
      } : {}}
      whileFocus={type === 'focus' ? { 
        scale: animation.scale * multiplier,
        transition: animation.transition
      } : {}}
    >
      {children}
    </motion.div>
  )
}

export { ParticleSystem, Confetti, FloatingParticles, MicroInteraction }
