import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Users, Image, Settings } from 'lucide-react'

const ProvelyPopups = () => {
  const [popups, setPopups] = useState([])
  const [settings, setSettings] = useState({
    enabled: true,
    frequency: 30000, // 30 seconds
    maxPerSession: 3,
    delay: 5000, // 5 seconds after page load
    showPurchasePopups: true,
    showTestimonialPopups: true,
    showUrgencyPopups: true
  })

  // Sample popup data - this would come from SuperAdmin settings
  const samplePopups = [
    {
      id: 1,
      type: 'purchase',
      title: '🔥 Sarah just created a book!',
      message: 'Sarah M. from New York just created "AI Marketing Strategies" using Lekhika!',
      image: '👩‍💼',
      time: '2 minutes ago',
      showFor: 8000 // 8 seconds
    },
    {
      id: 2,
      type: 'testimonial',
      title: '💬 Amazing results!',
      message: '"I made $50K in my first month using Lekhika!" - Mike R.',
      image: '👨‍💻',
      time: '5 minutes ago',
      showFor: 6000 // 6 seconds
    },
    {
      id: 3,
      type: 'urgency',
      title: '⏰ Limited Time!',
      message: 'Only 47 spots left at this price! Don\'t miss out!',
      image: '🚨',
      time: 'Just now',
      showFor: 10000 // 10 seconds
    }
  ]

  useEffect(() => {
    if (!settings.enabled) return

    const startPopups = () => {
      let popupCount = 0
      
      const showNextPopup = () => {
        if (popupCount >= settings.maxPerSession) return

        const randomPopup = samplePopups[Math.floor(Math.random() * samplePopups.length)]
        const popup = {
          ...randomPopup,
          id: Date.now() + Math.random(),
          timestamp: Date.now()
        }

        setPopups(prev => [...prev, popup])

        // Auto-remove popup after showFor duration
        setTimeout(() => {
          setPopups(prev => prev.filter(p => p.id !== popup.id))
        }, popup.showFor)

        popupCount++

        // Schedule next popup
        if (popupCount < settings.maxPerSession) {
          setTimeout(showNextPopup, settings.frequency)
        }
      }

      // Start first popup after delay
      setTimeout(showNextPopup, settings.delay)
    }

    startPopups()
  }, [settings])

  const removePopup = (id) => {
    setPopups(prev => prev.filter(p => p.id !== id))
  }

  const getPopupStyles = (type) => {
    switch (type) {
      case 'purchase':
        return 'bg-gradient-to-r from-green-500/90 to-blue-500/90 border-green-400'
      case 'testimonial':
        return 'bg-gradient-to-r from-purple-500/90 to-pink-500/90 border-purple-400'
      case 'urgency':
        return 'bg-gradient-to-r from-red-500/90 to-orange-500/90 border-red-400'
      default:
        return 'bg-gradient-to-r from-gray-500/90 to-blue-500/90 border-gray-400'
    }
  }

  return (
    <>
      {/* Provely-style Popups */}
      <AnimatePresence>
        {popups.map((popup, index) => (
          <motion.div
            key={popup.id}
            initial={{ 
              opacity: 0, 
              x: 400, 
              scale: 0.8,
              rotateY: 90
            }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
              rotateY: 0
            }}
            exit={{ 
              opacity: 0, 
              x: 400, 
              scale: 0.8,
              rotateY: -90
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.5
            }}
            style={{
              position: 'fixed',
              top: `${20 + (index * 120)}px`,
              right: '20px',
              zIndex: 9999,
              width: '350px',
              maxWidth: '90vw'
            }}
            className={`${getPopupStyles(popup.type)} backdrop-blur-md rounded-2xl border-2 shadow-2xl overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{popup.image}</div>
                <div>
                  <h4 className="text-white font-bold text-sm">{popup.title}</h4>
                  <p className="text-white/80 text-xs">{popup.time}</p>
                </div>
              </div>
              <button
                onClick={() => removePopup(popup.id)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-white text-sm leading-relaxed">{popup.message}</p>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-white/20">
              <motion.div
                className="h-full bg-white/60"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: popup.showFor / 1000, ease: "linear" }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  )
}

// SuperAdmin Controls Component
export const ProvelySettings = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    frequency: 30000,
    maxPerSession: 3,
    delay: 5000,
    showPurchasePopups: true,
    showTestimonialPopups: true,
    showUrgencyPopups: true
  })

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onSettingsChange(newSettings)
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Settings className="w-6 h-6 mr-3" />
        Provely Popup Settings
      </h3>

      <div className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <label className="text-white font-semibold">Enable Popups</label>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => handleSettingChange('enabled', e.target.checked)}
            className="w-5 h-5"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="text-white font-semibold flex items-center mb-2">
            <Clock className="w-4 h-4 mr-2" />
            Frequency (seconds)
          </label>
          <input
            type="number"
            value={settings.frequency / 1000}
            onChange={(e) => handleSettingChange('frequency', e.target.value * 1000)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            min="5"
            max="300"
          />
        </div>

        {/* Max Per Session */}
        <div>
          <label className="text-white font-semibold flex items-center mb-2">
            <Users className="w-4 h-4 mr-2" />
            Max Popups Per Session
          </label>
          <input
            type="number"
            value={settings.maxPerSession}
            onChange={(e) => handleSettingChange('maxPerSession', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            min="1"
            max="10"
          />
        </div>

        {/* Delay */}
        <div>
          <label className="text-white font-semibold mb-2 block">Initial Delay (seconds)</label>
          <input
            type="number"
            value={settings.delay / 1000}
            onChange={(e) => handleSettingChange('delay', e.target.value * 1000)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            min="1"
            max="60"
          />
        </div>

        {/* Popup Types */}
        <div>
          <label className="text-white font-semibold mb-3 block">Popup Types</label>
          <div className="space-y-2">
            {[
              { key: 'showPurchasePopups', label: 'Purchase Notifications' },
              { key: 'showTestimonialPopups', label: 'Testimonials' },
              { key: 'showUrgencyPopups', label: 'Urgency Messages' }
            ].map((type) => (
              <div key={type.key} className="flex items-center justify-between">
                <label className="text-white">{type.label}</label>
                <input
                  type="checkbox"
                  checked={settings[type.key]}
                  onChange={(e) => handleSettingChange(type.key, e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProvelyPopups
