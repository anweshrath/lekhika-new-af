import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useUserPreferences } from '../contexts/UserPreferencesContext'

/**
 * PERFORMANCE-OPTIMIZED PARTICLE SYSTEM
 * Features: Lazy loading, reduced motion support, density controls
 */
const OptimizedParticleSystem = ({
  particleCount = 50,
  speed = 1,
  size = 2,
  color = 'var(--theme-primary)',
  opacity = 0.6,
  className = '',
  lazy = true,
  intersectionThreshold = 0.1
}) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])
  const observerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(!lazy)
  const [isLoaded, setIsLoaded] = useState(false)
  const { preferences } = useUserPreferences()

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) return

    const canvas = canvasRef.current
    if (!canvas) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observerRef.current?.disconnect()
          }
        })
      },
      { threshold: intersectionThreshold }
    )

    observerRef.current.observe(canvas)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [lazy, intersectionThreshold])

  // Performance optimization based on preferences
  const getOptimizedConfig = useCallback(() => {
    const densityMultipliers = {
      low: 0.3,
      medium: 0.7,
      high: 1
    }

    const qualityMultipliers = {
      low: 0.5,
      medium: 0.8,
      high: 1
    }

    const density = densityMultipliers[preferences.particleDensity] || 0.7
    const quality = qualityMultipliers[preferences.animationQuality] || 1

    return {
      particleCount: Math.floor(particleCount * density),
      speed: speed * quality,
      size: size * quality,
      opacity: opacity * quality,
      frameRate: preferences.animationQuality === 'low' ? 30 : 60
    }
  }, [preferences.particleDensity, preferences.animationQuality, particleCount, speed, size, opacity])

  // Initialize particles
  useEffect(() => {
    if (!isVisible || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const config = getOptimizedConfig()

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles
    particlesRef.current = Array.from({ length: config.particleCount }, () => ({
      x: Math.random() * canvas.width / window.devicePixelRatio,
      y: Math.random() * canvas.height / window.devicePixelRatio,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      size: Math.random() * config.size + 1,
      opacity: Math.random() * config.opacity + 0.2,
      life: Math.random() * 100
    }))

    setIsLoaded(true)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [isVisible, getOptimizedConfig])

  // Animation loop with performance optimization
  useEffect(() => {
    if (!isLoaded || !canvasRef.current || preferences.reducedMotion) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const config = getOptimizedConfig()
    
    let lastTime = 0
    const targetFPS = config.frameRate
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime) => {
      if (currentTime - lastTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      lastTime = currentTime

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around screen
        const canvasWidth = canvas.width / window.devicePixelRatio
        const canvasHeight = canvas.height / window.devicePixelRatio
        
        if (particle.x < 0) particle.x = canvasWidth
        if (particle.x > canvasWidth) particle.x = 0
        if (particle.y < 0) particle.y = canvasHeight
        if (particle.y > canvasHeight) particle.y = 0

        // Update life
        particle.life += 0.5
        if (particle.life > 100) {
          particle.life = 0
          particle.x = Math.random() * canvasWidth
          particle.y = Math.random() * canvasHeight
        }

        // Draw particle with performance optimization
        if (config.animationQuality !== 'low') {
          ctx.save()
          ctx.globalAlpha = particle.opacity * (1 - particle.life / 100)
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        } else {
          // Low quality mode - simpler rendering
          ctx.fillStyle = color
          ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isLoaded, preferences.reducedMotion, getOptimizedConfig, color])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ 
        zIndex: 1,
        opacity: preferences.particles ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
      aria-hidden="true"
      role="presentation"
    />
  )
}

/**
 * ACCESSIBLE CONFETTI COMPONENT
 * Features: Screen reader support, reduced motion, volume controls
 */
const AccessibleConfetti = ({ 
  active = false, 
  duration = 3000,
  particleCount = 100,
  colors = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
  className = '',
  announceToScreenReader = true
}) => {
  const [particles, setParticles] = useState([])
  const [announcement, setAnnouncement] = useState('')
  const { preferences } = useUserPreferences()

  useEffect(() => {
    if (!active || preferences.reducedMotion) return

    const config = {
      particleCount: preferences.particleDensity === 'low' ? particleCount * 0.5 : 
                   preferences.particleDensity === 'high' ? particleCount * 1.5 : particleCount,
      duration: preferences.animationQuality === 'low' ? duration * 0.7 : duration
    }

    const newParticles = Array.from({ length: config.particleCount }, (_, i) => ({
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

    // Screen reader announcement
    if (announceToScreenReader && preferences.screenReader) {
      setAnnouncement('Celebration animation started')
      setTimeout(() => setAnnouncement(''), 1000)
    }

    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          rotation: particle.rotation + particle.rotationSpeed,
          life: particle.life - 1,
          vy: particle.vy + 0.1
        })).filter(particle => particle.life > 0 && particle.y < window.innerHeight + 50)
      )
    }, 16)

    const timeout = setTimeout(() => {
      setParticles([])
      if (announceToScreenReader && preferences.screenReader) {
        setAnnouncement('Celebration animation completed')
        setTimeout(() => setAnnouncement(''), 1000)
      }
    }, config.duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [active, duration, particleCount, colors, announceToScreenReader, preferences])

  if (!active || particles.length === 0) return null

  return (
    <>
      {/* Screen reader announcement */}
      {announcement && (
        <div 
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
        >
          {announcement}
        </div>
      )}
      
      {/* Confetti animation */}
      <div 
        className={`fixed inset-0 pointer-events-none z-50 ${className}`}
        aria-hidden="true"
        role="presentation"
      >
        {particles.map(particle => (
          <div
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
          />
        ))}
      </div>
    </>
  )
}

/**
 * PERFORMANCE-OPTIMIZED FLOATING PARTICLES
 * Features: Intersection observer, reduced motion, density controls
 */
const OptimizedFloatingParticles = ({ 
  theme = 'light',
  intensity = 'medium',
  className = '',
  lazy = true
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
    <OptimizedParticleSystem
      particleCount={Math.floor(config.particleCount * multiplier)}
      speed={config.speed * multiplier}
      size={config.size * multiplier}
      color={config.color}
      opacity={config.opacity * multiplier}
      className={className}
      lazy={lazy}
    />
  )
}

export { OptimizedParticleSystem, AccessibleConfetti, OptimizedFloatingParticles }
