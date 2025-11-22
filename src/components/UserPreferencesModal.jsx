import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Volume2, VolumeX, Vibrate, Eye, EyeOff, Palette, Zap, ZapOff } from 'lucide-react'
import { useUserPreferences } from '../contexts/UserPreferencesContext'
import UltraButton from './UltraButton'
import UltraCard from './UltraCard'

/**
 * USER PREFERENCES MODAL
 * Professional settings panel with accessibility controls
 */
const UserPreferencesModal = ({ isOpen, onClose }) => {
  const { preferences, updatePreference } = useUserPreferences()
  const [activeTab, setActiveTab] = useState('visual')

  const tabs = [
    { id: 'visual', label: 'Visual', icon: Palette },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'performance', label: 'Performance', icon: Zap }
  ]

  const handlePreferenceChange = (key, value) => {
    updatePreference(key, value)
  }

  const renderVisualSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UltraCard className="p-4">
          <h3 className="text-lg font-semibold mb-4">Effects</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>Animations</span>
              <input
                type="checkbox"
                checked={preferences.animations}
                onChange={(e) => handlePreferenceChange('animations', e.target.checked)}
                className="w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Particles</span>
              <input
                type="checkbox"
                checked={preferences.particles}
                onChange={(e) => handlePreferenceChange('particles', e.target.checked)}
                className="w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Gradients</span>
              <input
                type="checkbox"
                checked={preferences.gradients}
                onChange={(e) => handlePreferenceChange('gradients', e.target.checked)}
                className="w-4 h-4"
              />
            </label>
          </div>
        </UltraCard>

        <UltraCard className="p-4">
          <h3 className="text-lg font-semibold mb-4">Theme</h3>
          <div className="space-y-3">
            <label className="block">
              <span className="block text-sm font-medium mb-2">Theme</span>
              <select
                value={preferences.theme}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="auto">Auto</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="neon">Neon</option>
                <option value="cosmic">Cosmic</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-2">Intensity</span>
              <select
                value={preferences.themeIntensity}
                onChange={(e) => handlePreferenceChange('themeIntensity', e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
        </UltraCard>
      </div>
    </div>
  )

  const renderAudioSettings = () => (
    <div className="space-y-6">
      <UltraCard className="p-4">
        <h3 className="text-lg font-semibold mb-4">Audio Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span>Sound Effects</span>
            <input
              type="checkbox"
              checked={preferences.soundEffects}
              onChange={(e) => handlePreferenceChange('soundEffects', e.target.checked)}
              className="w-4 h-4"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-2">Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={preferences.soundVolume}
              onChange={(e) => handlePreferenceChange('soundVolume', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-600 mt-1">
              {Math.round(preferences.soundVolume * 100)}%
            </div>
          </label>
          <label className="flex items-center justify-between">
            <span>Haptic Feedback</span>
            <input
              type="checkbox"
              checked={preferences.hapticFeedback}
              onChange={(e) => handlePreferenceChange('hapticFeedback', e.target.checked)}
              className="w-4 h-4"
            />
          </label>
        </div>
      </UltraCard>
    </div>
  )

  const renderAccessibilitySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UltraCard className="p-4">
          <h3 className="text-lg font-semibold mb-4">Visual Accessibility</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>High Contrast</span>
              <input
                type="checkbox"
                checked={preferences.highContrast}
                onChange={(e) => handlePreferenceChange('highContrast', e.target.checked)}
                className="w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Large Text</span>
              <input
                type="checkbox"
                checked={preferences.largeText}
                onChange={(e) => handlePreferenceChange('largeText', e.target.checked)}
                className="w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Screen Reader</span>
              <input
                type="checkbox"
                checked={preferences.screenReader}
                onChange={(e) => handlePreferenceChange('screenReader', e.target.checked)}
                className="w-4 h-4"
              />
            </label>
          </div>
        </UltraCard>

        <UltraCard className="p-4">
          <h3 className="text-lg font-semibold mb-4">Motion</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>Reduced Motion</span>
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(e) => handlePreferenceChange('reducedMotion', e.target.checked)}
                className="w-4 h-4"
              />
            </label>
            <p className="text-sm text-gray-600">
              Reduces animations and motion effects for better accessibility
            </p>
          </div>
        </UltraCard>
      </div>
    </div>
  )

  const renderPerformanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UltraCard className="p-4">
          <h3 className="text-lg font-semibold mb-4">Particle Density</h3>
          <div className="space-y-3">
            <label className="block">
              <span className="block text-sm font-medium mb-2">Density</span>
              <select
                value={preferences.particleDensity}
                onChange={(e) => handlePreferenceChange('particleDensity', e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="low">Low (Better Performance)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Best Visual)</option>
              </select>
            </label>
          </div>
        </UltraCard>

        <UltraCard className="p-4">
          <h3 className="text-lg font-semibold mb-4">Animation Quality</h3>
          <div className="space-y-3">
            <label className="block">
              <span className="block text-sm font-medium mb-2">Quality</span>
              <select
                value={preferences.animationQuality}
                onChange={(e) => handlePreferenceChange('animationQuality', e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="low">Low (Better Performance)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Best Visual)</option>
              </select>
            </label>
          </div>
        </UltraCard>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'visual':
        return renderVisualSettings()
      case 'audio':
        return renderAudioSettings()
      case 'accessibility':
        return renderAccessibilitySettings()
      case 'performance':
        return renderPerformanceSettings()
      default:
        return renderVisualSettings()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
          
          <motion.div
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Preferences</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                aria-label="Close preferences"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {renderTabContent()}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t">
              <UltraButton
                variant="ghost"
                onClick={onClose}
              >
                Close
              </UltraButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UserPreferencesModal
