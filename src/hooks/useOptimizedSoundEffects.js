import React, { useEffect, useRef, useState } from 'react'
import { useUserPreferences } from '../contexts/UserPreferencesContext'

/**
 * OPTIMIZED SOUND EFFECTS SYSTEM
 * Features: Volume controls, graceful degradation, performance optimization
 */
class OptimizedSoundEffects {
  constructor() {
    this.audioContext = null
    this.sounds = {}
    this.enabled = true
    this.volume = 0.3
    this.isInitialized = false
    
    this.init()
  }

  async init() {
    try {
      // Check if audio is supported
      if (!window.AudioContext && !window.webkitAudioContext) {
        console.warn('Web Audio API not supported')
        this.enabled = false
        return
      }

      // Initialize audio context on user interaction
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.createSounds()
      this.isInitialized = true
    } catch (error) {
      console.warn('Audio context initialization failed:', error)
      this.enabled = false
    }
  }

  // Initialize audio context on first user interaction
  async ensureAudioContext() {
    if (!this.isInitialized && this.enabled) {
      try {
        await this.init()
      } catch (error) {
        console.warn('Failed to initialize audio context:', error)
        this.enabled = false
      }
    }
  }

  createSounds() {
    if (!this.audioContext) return

    // Button click sound
    this.sounds.click = this.createTone(800, 0.1, 'sine')
    
    // Success sound
    this.sounds.success = this.createChord([523, 659, 784], 0.3, 'sine')
    
    // Error sound
    this.sounds.error = this.createTone(200, 0.5, 'sawtooth')
    
    // Hover sound
    this.sounds.hover = this.createTone(600, 0.05, 'sine')
    
    // Notification sound
    this.sounds.notification = this.createTone(1000, 0.2, 'triangle')
    
    // Book generation start
    this.sounds.start = this.createChord([440, 554, 659], 0.2, 'sine')
    
    // Book generation complete
    this.sounds.complete = this.createChord([523, 659, 784, 1047], 0.5, 'sine')
  }

  createTone(frequency, duration, type = 'sine') {
    return () => {
      if (!this.enabled || !this.audioContext) return
      
      try {
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
        oscillator.type = type
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)
        
        oscillator.start(this.audioContext.currentTime)
        oscillator.stop(this.audioContext.currentTime + duration)
      } catch (error) {
        console.warn('Sound playback failed:', error)
      }
    }
  }

  createChord(frequencies, duration, type = 'sine') {
    return () => {
      if (!this.enabled || !this.audioContext) return
      
      try {
        frequencies.forEach((freq, index) => {
          const oscillator = this.audioContext.createOscillator()
          const gainNode = this.audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(this.audioContext.destination)
          
          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime)
          oscillator.type = type
          
          const delay = index * 0.05
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay)
          gainNode.gain.linearRampToValueAtTime(this.volume * 0.7, this.audioContext.currentTime + delay + 0.01)
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + delay + duration)
          
          oscillator.start(this.audioContext.currentTime + delay)
          oscillator.stop(this.audioContext.currentTime + delay + duration)
        })
      } catch (error) {
        console.warn('Chord playback failed:', error)
      }
    }
  }

  async play(soundName) {
    await this.ensureAudioContext()
    
    if (this.sounds[soundName]) {
      this.sounds[soundName]()
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  toggle() {
    this.enabled = !this.enabled
    return this.enabled
  }

  // Graceful degradation for unsupported browsers
  isSupported() {
    return this.enabled && this.isInitialized
  }
}

// Global sound effects instance
const optimizedSoundEffects = new OptimizedSoundEffects()

/**
 * OPTIMIZED HAPTIC FEEDBACK SYSTEM
 * Features: Graceful degradation, user preferences
 */
class OptimizedHapticFeedback {
  constructor() {
    this.enabled = 'vibrate' in navigator
  }

  light() {
    if (!this.enabled) return
    try {
      navigator.vibrate(10)
    } catch (error) {
      console.warn('Haptic feedback failed:', error)
    }
  }

  medium() {
    if (!this.enabled) return
    try {
      navigator.vibrate(50)
    } catch (error) {
      console.warn('Haptic feedback failed:', error)
    }
  }

  heavy() {
    if (!this.enabled) return
    try {
      navigator.vibrate([100, 50, 100])
    } catch (error) {
      console.warn('Haptic feedback failed:', error)
    }
  }

  success() {
    if (!this.enabled) return
    try {
      navigator.vibrate([50, 50, 50])
    } catch (error) {
      console.warn('Haptic feedback failed:', error)
    }
  }

  error() {
    if (!this.enabled) return
    try {
      navigator.vibrate([200, 100, 200])
    } catch (error) {
      console.warn('Haptic feedback failed:', error)
    }
  }

  isSupported() {
    return this.enabled
  }
}

// Global haptic feedback instance
const optimizedHapticFeedback = new OptimizedHapticFeedback()

/**
 * OPTIMIZED SOUND EFFECTS HOOK
 * React hook for using optimized sound effects
 */
export const useOptimizedSoundEffects = () => {
  const { preferences } = useUserPreferences()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize on first user interaction
    const handleFirstInteraction = async () => {
      if (!isInitialized) {
        await optimizedSoundEffects.ensureAudioContext()
        setIsInitialized(true)
      }
    }

    const events = ['click', 'touchstart', 'keydown']
    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction)
      })
    }
  }, [isInitialized])

  const playClick = async () => {
    if (!preferences.soundEffects) return
    await optimizedSoundEffects.play('click')
    if (preferences.hapticFeedback) {
      optimizedHapticFeedback.light()
    }
  }

  const playSuccess = async () => {
    if (!preferences.soundEffects) return
    await optimizedSoundEffects.play('success')
    if (preferences.hapticFeedback) {
      optimizedHapticFeedback.success()
    }
  }

  const playError = async () => {
    if (!preferences.soundEffects) return
    await optimizedSoundEffects.play('error')
    if (preferences.hapticFeedback) {
      optimizedHapticFeedback.error()
    }
  }

  const playHover = async () => {
    if (!preferences.soundEffects) return
    await optimizedSoundEffects.play('hover')
    if (preferences.hapticFeedback) {
      optimizedHapticFeedback.light()
    }
  }

  const playNotification = async () => {
    if (!preferences.soundEffects) return
    await optimizedSoundEffects.play('notification')
    if (preferences.hapticFeedback) {
      optimizedHapticFeedback.medium()
    }
  }

  const playStart = async () => {
    if (!preferences.soundEffects) return
    await optimizedSoundEffects.play('start')
    if (preferences.hapticFeedback) {
      optimizedHapticFeedback.medium()
    }
  }

  const playComplete = async () => {
    if (!preferences.soundEffects) return
    await optimizedSoundEffects.play('complete')
    if (preferences.hapticFeedback) {
      optimizedHapticFeedback.heavy()
    }
  }

  const setVolume = (volume) => {
    optimizedSoundEffects.setVolume(volume)
  }

  const toggleSound = () => {
    return optimizedSoundEffects.toggle()
  }

  return {
    playClick,
    playSuccess,
    playError,
    playHover,
    playNotification,
    playStart,
    playComplete,
    setVolume,
    toggleSound,
    isSupported: optimizedSoundEffects.isSupported(),
    hapticSupported: optimizedHapticFeedback.isSupported()
  }
}

export default optimizedSoundEffects
