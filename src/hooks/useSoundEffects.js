import React, { useEffect, useRef } from 'react'

/**
 * SOUND EFFECTS SYSTEM
 * Provides audio feedback for UI interactions
 */
class SoundEffects {
  constructor() {
    this.audioContext = null
    this.sounds = {}
    this.enabled = true
    this.volume = 0.3
    
    this.init()
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.createSounds()
    } catch (error) {
      console.warn('Audio context not supported:', error)
      this.enabled = false
    }
  }

  createSounds() {
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
    }
  }

  createChord(frequencies, duration, type = 'sine') {
    return () => {
      if (!this.enabled || !this.audioContext) return
      
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
    }
  }

  play(soundName) {
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
}

// Global sound effects instance
const soundEffects = new SoundEffects()

/**
 * HAPTIC FEEDBACK SYSTEM
 * Provides vibration feedback for mobile devices
 */
class HapticFeedback {
  constructor() {
    this.enabled = 'vibrate' in navigator
  }

  light() {
    if (!this.enabled) return
    navigator.vibrate(10)
  }

  medium() {
    if (!this.enabled) return
    navigator.vibrate(50)
  }

  heavy() {
    if (!this.enabled) return
    navigator.vibrate([100, 50, 100])
  }

  success() {
    if (!this.enabled) return
    navigator.vibrate([50, 50, 50])
  }

  error() {
    if (!this.enabled) return
    navigator.vibrate([200, 100, 200])
  }
}

// Global haptic feedback instance
const hapticFeedback = new HapticFeedback()

/**
 * SOUND EFFECTS HOOK
 * React hook for using sound effects
 */
export const useSoundEffects = () => {
  const playClick = () => {
    soundEffects.play('click')
    hapticFeedback.light()
  }

  const playSuccess = () => {
    soundEffects.play('success')
    hapticFeedback.success()
  }

  const playError = () => {
    soundEffects.play('error')
    hapticFeedback.error()
  }

  const playHover = () => {
    soundEffects.play('hover')
    hapticFeedback.light()
  }

  const playNotification = () => {
    soundEffects.play('notification')
    hapticFeedback.medium()
  }

  const playStart = () => {
    soundEffects.play('start')
    hapticFeedback.medium()
  }

  const playComplete = () => {
    soundEffects.play('complete')
    hapticFeedback.heavy()
  }

  const setVolume = (volume) => {
    soundEffects.setVolume(volume)
  }

  const toggleSound = () => {
    return soundEffects.toggle()
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
    toggleSound
  }
}

export default soundEffects
