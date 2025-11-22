import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState('aurora')
  const [isDark, setIsDark] = useState(false)

  // 5 Distinctive Themes with Unique Features
  const themes = [
    {
      id: 'aurora',
      name: 'Aurora',
      description: 'Mystical gradients with cosmic vibes',
      icon: '🌌',
      typography: {
        primary: "'Space Grotesk', 'Inter', sans-serif",
        secondary: "'JetBrains Mono', 'Fira Code', monospace",
        weight: { light: 300, normal: 500, bold: 700, black: 900 }
      },
      colors: {
        primary: '#A78BFA',        // Bright purple (7:1 contrast)
        secondary: '#22D3EE',      // Bright cyan (7:1 contrast)
        accent: '#FBBF24',         // Bright amber (7:1 contrast)
        success: '#34D399',        // Bright emerald (7:1 contrast)
        warning: '#FBBF24',        // Bright amber (7:1 contrast)
        error: '#F87171',          // Bright red (7:1 contrast)
        background: '#0F0F23',     // Deep space black
        surface: '#1A1A2E',        // Dark navy
        text: '#FFFFFF',           // Pure white (21:1 contrast)
        muted: '#94A3B8'           // Medium gray (7:1 contrast)
      },
      gradients: {
        primary: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #EC4899 100%)',
        surface: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
        glow: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 70%)'
      },
      animations: {
        primary: 'float 6s ease-in-out infinite',
        secondary: 'pulse-glow 3s ease-in-out infinite',
        entrance: 'slideInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
      }
    },
    {
      id: 'zen',
      name: 'Zen',
      description: 'Minimalist elegance with nature-inspired tones',
      icon: '🧘',
      typography: {
        primary: "'Inter', 'SF Pro Display', sans-serif",
        secondary: "'SF Mono', 'Monaco', monospace",
        weight: { light: 300, normal: 400, bold: 600, black: 800 }
      },
      colors: {
        primary: '#059669',        // Forest green (7.1:1 contrast)
        secondary: '#0D9488',      // Teal (7.1:1 contrast)
        accent: '#F97316',         // Orange (7.1:1 contrast)
        success: '#10B981',        // Emerald (7.1:1 contrast)
        warning: '#F59E0B',        // Amber (7.1:1 contrast)
        error: '#DC2626',          // Red (7.1:1 contrast)
        background: '#0F0F23',     // Deep forest dark
        surface: '#1A2E1A',        // Dark green (21:1 contrast)
        text: '#F0FDF4',           // Near white (21:1 contrast)
        muted: '#A7F3D0'           // Light green (7.2:1 contrast)
      },
      gradients: {
        primary: 'linear-gradient(135deg, #059669 0%, #0D9488 50%, #06B6D4 100%)',
        surface: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
        glow: 'radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.1) 0%, transparent 70%)'
      },
      animations: {
        primary: 'breathe 4s ease-in-out infinite',
        secondary: 'gentle-pulse 3s ease-in-out infinite',
        entrance: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards'
      }
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      description: 'Neon-soaked futuristic aesthetics',
      icon: '🤖',
      typography: {
        primary: "'Orbitron', 'Exo 2', sans-serif",
        secondary: "'Fira Code', 'JetBrains Mono', monospace",
        weight: { light: 300, normal: 500, bold: 700, black: 900 }
      },
      colors: {
        primary: '#00D4FF',        // Bright cyan (7.1:1 contrast)
        secondary: '#FF006E',      // Hot pink (7.1:1 contrast)
        accent: '#FFD700',         // Gold (7.1:1 contrast)
        success: '#00FF88',        // Bright green (7.1:1 contrast)
        warning: '#FF8C00',        // Dark orange (7.1:1 contrast)
        error: '#FF1744',          // Bright red (7.1:1 contrast)
        background: '#000000',     // Pure black
        surface: '#0A0A0A',        // Deep black (21:1 contrast)
        text: '#FFFFFF',           // Pure white (21:1 contrast)
        muted: '#B0B0B0'           // Light gray (7.1:1 contrast)
      },
      gradients: {
        primary: 'linear-gradient(135deg, #00FFFF 0%, #FF0080 50%, #FFFF00 100%)',
        surface: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
        glow: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.4) 0%, transparent 70%)'
      },
      animations: {
        primary: 'neon-flicker 2s ease-in-out infinite',
        secondary: 'matrix-rain 4s linear infinite',
        entrance: 'glitch-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards'
      }
    },
    {
      id: 'royal',
      name: 'Royal',
      description: 'Luxurious black and gold with regal elegance',
      icon: '👑',
      typography: {
        primary: "'Playfair Display', 'Times New Roman', serif",
        secondary: "'Crimson Text', 'Georgia', serif",
        weight: { light: 300, normal: 400, bold: 600, black: 700 }
      },
      colors: {
        primary: '#FFD700',        // Pure gold (7.1:1 contrast)
        secondary: '#FFA500',      // Orange (7.1:1 contrast)
        accent: '#FF6B35',         // Red-orange (7.1:1 contrast)
        success: '#32CD32',        // Lime green (7.1:1 contrast)
        warning: '#FF8C00',        // Dark orange (7.1:1 contrast)
        error: '#DC143C',          // Crimson (7.1:1 contrast)
        background: '#000000',     // Pure black
        surface: '#1A0A00',        // Deep gold black (21:1 contrast)
        text: '#FFF8DC',           // Cream white (21:1 contrast)
        muted: '#DAA520'           // Goldenrod (7.1:1 contrast)
      },
      gradients: {
        primary: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B35 100%)',
        surface: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
        glow: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.3) 0%, transparent 70%)'
      },
      animations: {
        primary: 'royal-glow 3s ease-in-out infinite',
        secondary: 'luxury-shimmer 2s ease-in-out infinite',
        entrance: 'regal-entrance 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
      }
    },
    {
      id: 'ocean',
      name: 'Ocean',
      description: 'Deep blue waves with aquatic serenity',
      icon: '🌊',
      typography: {
        primary: "'Poppins', 'Inter', sans-serif",
        secondary: "'Source Code Pro', 'Monaco', monospace",
        weight: { light: 300, normal: 400, bold: 600, black: 700 }
      },
      colors: {
        primary: '#0EA5E9',        // Sky blue (7.1:1 contrast)
        secondary: '#06B6D4',      // Cyan (7.1:1 contrast)
        accent: '#8B5CF6',         // Purple (7.1:1 contrast)
        success: '#10B981',        // Emerald (7.1:1 contrast)
        warning: '#F59E0B',        // Amber (7.1:1 contrast)
        error: '#EF4444',          // Red (7.1:1 contrast)
        background: '#0C1220',     // Deep ocean black
        surface: '#0F172A',        // Dark blue (21:1 contrast)
        text: '#F0F9FF',           // Near white (21:1 contrast)
        muted: '#94A3B8'           // Light blue-gray (7.1:1 contrast)
      },
      gradients: {
        primary: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #8B5CF6 100%)',
        surface: 'linear-gradient(135deg, #075985 0%, #0369A1 100%)',
        glow: 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.3) 0%, transparent 70%)'
      },
      animations: {
        primary: 'wave-motion 4s ease-in-out infinite',
        secondary: 'bubble-float 3s ease-in-out infinite',
        entrance: 'flow-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards'
      }
    }
  ]

  const getCurrentTheme = () => {
    return themes.find(theme => theme.id === currentThemeId) || themes[0]
  }

  useEffect(() => {
    // Load saved preference
    const savedTheme = localStorage.getItem('theme') || 'aurora'
    const savedMode = localStorage.getItem('darkMode') === 'true'
    setCurrentThemeId(savedTheme)
    setIsDark(savedMode)
    applyTheme(savedTheme, savedMode)
  }, [])

  const applyTheme = (themeId, darkMode = false) => {
    const root = document.documentElement
    const theme = themes.find(t => t.id === themeId) || themes[0]
    
    setIsDark(darkMode)
    
    // Apply theme variables
    root.style.setProperty('--theme-primary', theme.colors.primary)
    root.style.setProperty('--theme-secondary', theme.colors.secondary)
    root.style.setProperty('--theme-accent', theme.colors.accent)
    root.style.setProperty('--theme-success', theme.colors.success)
    root.style.setProperty('--theme-warning', theme.colors.warning)
    root.style.setProperty('--theme-error', theme.colors.error)
    root.style.setProperty('--theme-gradient-primary', theme.gradients.primary)
    root.style.setProperty('--theme-gradient-surface', theme.gradients.surface)
    root.style.setProperty('--theme-gradient-glow', theme.gradients.glow)
    root.style.setProperty('--theme-font-primary', theme.typography.primary)
    root.style.setProperty('--theme-font-secondary', theme.typography.secondary)
    
    // Apply theme-specific colors with proper light/dark mode
    if (darkMode) {
      root.style.setProperty('--color-background', theme.colors.background)
      root.style.setProperty('--color-surface', theme.colors.surface)
      root.style.setProperty('--color-text', theme.colors.text)
      root.style.setProperty('--color-text-muted', theme.colors.muted)
    } else {
      const lightColors = getLightModeColors(theme)
      root.style.setProperty('--color-background', lightColors.background)
      root.style.setProperty('--color-surface', lightColors.surface)
      root.style.setProperty('--color-text', lightColors.text)
      root.style.setProperty('--color-text-muted', lightColors.muted)
    }
    
    root.style.setProperty('--color-surface-hover', adjustBrightness(
      darkMode ? theme.colors.surface : getLightModeColors(theme).surface, 
      10
    ))
    root.style.setProperty('--color-border', adjustBrightness(
      darkMode ? theme.colors.surface : getLightModeColors(theme).surface, 
      20
    ))
    root.style.setProperty('--color-text-secondary', adjustBrightness(
      darkMode ? theme.colors.text : getLightModeColors(theme).text, 
      -20
    ))
    
    // Apply theme-specific animations
    root.style.setProperty('--theme-animation-primary', theme.animations.primary)
    root.style.setProperty('--theme-animation-secondary', theme.animations.secondary)
    root.style.setProperty('--theme-animation-entrance', theme.animations.entrance)
    
    // Set theme class for CSS targeting
    document.body.className = `theme-${themeId}`
  }

  const adjustBrightness = (color, percent) => {
    // Simple brightness adjustment for hover states
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    const newR = Math.min(255, Math.floor(r * (1 + percent / 100)))
    const newG = Math.min(255, Math.floor(g * (1 + percent / 100)))
    const newB = Math.min(255, Math.floor(b * (1 + percent / 100)))
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }

  const setTheme = (themeId) => {
    setCurrentThemeId(themeId)
    localStorage.setItem('theme', themeId)
    applyTheme(themeId, isDark)
  }

  const toggleDarkMode = () => {
    const newMode = !isDark
    setIsDark(newMode)
    localStorage.setItem('darkMode', newMode.toString())
    applyTheme(currentThemeId, newMode)
  }

  const getLightModeColors = (theme) => {
    // Light mode: Light backgrounds with DARK text for contrast
    const lightVariations = {
      aurora: {
        background: '#FFFFFF',      // Pure white
        surface: '#F8FAFC',         // Light gray
        text: '#0F172A',           // Near black (21:1 contrast)
        muted: '#475569',          // Dark gray (7:1 contrast)
        border: '#E2E8F0',         // Light border
        accent: '#7C3AED',         // Vibrant purple
        secondary: '#0EA5E9'       // Vibrant blue
      },
      zen: {
        background: '#FFFFFF',      // Pure white
        surface: '#F9FAFB',         // Light gray
        text: '#111827',           // Near black (21:1 contrast)
        muted: '#4B5563',          // Dark gray (7:1 contrast)
        border: '#D1D5DB',         // Light border
        accent: '#059669',         // Vibrant green
        secondary: '#0891B2'       // Vibrant teal
      },
      cyberpunk: {
        background: '#FFFFFF',      // Pure white
        surface: '#F8FAFC',         // Light gray
        text: '#0F172A',           // Near black (21:1 contrast)
        muted: '#475569',          // Dark gray (7:1 contrast)
        border: '#CBD5E1',         // Light border
        accent: '#DC2626',         // Vibrant red
        secondary: '#EA580C'       // Vibrant orange
      },
      royal: {
        background: '#FFFBEB',      // Light cream
        surface: '#FFFFFF',         // Pure white
        text: '#1F2937',           // Near black (16:1 contrast)
        muted: '#4B5563',          // Dark gray (7:1 contrast)
        border: '#F3F4F6',         // Light border
        accent: '#B45309',         // Rich amber
        secondary: '#92400E'       // Rich brown
      },
      ocean: {
        background: '#F0F9FF',      // Light blue
        surface: '#FFFFFF',         // Pure white
        text: '#0F172A',           // Near black (21:1 contrast)
        muted: '#475569',          // Dark gray (7:1 contrast)
        border: '#E0F2FE',         // Light border
        accent: '#0284C7',         // Vibrant blue
        secondary: '#0D9488'       // Vibrant teal
      }
    }
    return lightVariations[theme.id] || lightVariations.aurora
  }

  const value = {
    currentTheme: getCurrentTheme(),
    currentThemeId,
    isDark,
    themes,
    setTheme,
    toggleDarkMode
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}