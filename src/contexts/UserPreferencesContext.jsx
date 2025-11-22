import React, { createContext, useContext, useState, useEffect } from 'react'

/**
 * USER PREFERENCES CONTEXT
 * Manages user preferences for effects, sounds, and accessibility
 */
const UserPreferencesContext = createContext()

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider')
  }
  return context
}

export const UserPreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    // Visual Effects
    animations: true,
    particles: true,
    gradients: true,
    reducedMotion: false,
    
    // Audio
    soundEffects: true,
    soundVolume: 0.3,
    
    // Haptic
    hapticFeedback: true,
    
    // Accessibility
    highContrast: false,
    largeText: false,
    screenReader: false,
    
    // Performance
    particleDensity: 'medium', // low, medium, high
    animationQuality: 'high', // low, medium, high
    
    // Theme
    theme: 'auto', // light, dark, neon, cosmic, auto
    themeIntensity: 'medium' // low, medium, high
  })

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('userPreferences')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPreferences(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.warn('Failed to load user preferences:', error)
      }
    }
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences))
  }, [preferences])

  // Detect system preferences
  useEffect(() => {
    // Detect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e) => {
      setPreferences(prev => ({ ...prev, reducedMotion: e.matches }))
    }
    
    handleChange(mediaQuery)
    mediaQuery.addEventListener('change', handleChange)
    
    // Detect color scheme preference
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleColorChange = (e) => {
      if (preferences.theme === 'auto') {
        setPreferences(prev => ({ 
          ...prev, 
          theme: e.matches ? 'dark' : 'light' 
        }))
      }
    }
    
    handleColorChange(colorSchemeQuery)
    colorSchemeQuery.addEventListener('change', handleColorChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      colorSchemeQuery.removeEventListener('change', handleColorChange)
    }
  }, [preferences.theme])

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const resetPreferences = () => {
    setPreferences({
      animations: true,
      particles: true,
      gradients: true,
      reducedMotion: false,
      soundEffects: true,
      soundVolume: 0.3,
      hapticFeedback: true,
      highContrast: false,
      largeText: false,
      screenReader: false,
      particleDensity: 'medium',
      animationQuality: 'high',
      theme: 'auto',
      themeIntensity: 'medium'
    })
  }

  const value = {
    preferences,
    updatePreference,
    resetPreferences
  }

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  )
}
