class FallbackNotificationService {
  constructor() {
    this.notifications = []
    this.listeners = []
    this.isActive = false
  }

  // Initialize the notification system
  init() {
    this.isActive = true
    
    // Listen for fallback events
    if (typeof window !== 'undefined') {
      window.addEventListener('fallbackNotification', this.handleFallbackEvent.bind(this))
    }
  }

  // Handle fallback notification events
  handleFallbackEvent(event) {
    const notification = event.detail
    this.addNotification(notification)
    this.notifyListeners(notification)
  }

  // Add a notification to the queue
  addNotification(notification) {
    const enhancedNotification = {
      id: Date.now() + Math.random(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    }
    
    this.notifications.unshift(enhancedNotification)
    
    // Keep only last 10 notifications
    if (this.notifications.length > 10) {
      this.notifications = this.notifications.slice(0, 10)
    }
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.listeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  // Notify all listeners
  notifyListeners(notification) {
    this.listeners.forEach(callback => {
      try {
        callback(notification)
      } catch (error) {
        console.error('Error in notification listener:', error)
      }
    })
  }

  // Get all notifications
  getNotifications() {
    return this.notifications
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  // Clear all notifications
  clearAll() {
    this.notifications = []
  }

  // Create a user-friendly fallback notification
  createFallbackNotification(type, details = {}) {
    const notifications = {
      ai_service_unavailable: {
        title: '🤖 AI Service Temporarily Unavailable',
        message: 'Our primary AI service is experiencing high demand. We\'re using our enhanced backup system to ensure you still receive high-quality content.',
        severity: 'info',
        actionable: true,
        suggestions: [
          'Your content quality remains high with our backup system',
          'Try again in a few minutes for AI-generated content',
          'Consider upgrading to Expert tier for priority AI access'
        ]
      },
      multiple_ai_fallback: {
        title: '⚡ Multiple AI Services Busy',
        message: 'All our AI services are currently at capacity. Our intelligent backup system is generating professional-quality content for you.',
        severity: 'warning',
        actionable: true,
        suggestions: [
          'Backup content maintains professional standards',
          'AI services typically become available within 10-15 minutes',
          'Expert tier users get priority access during peak times'
        ]
      },
      api_rate_limit: {
        title: '🚦 AI Rate Limit Reached',
        message: 'We\'ve reached our AI usage limit for this period. Using enhanced fallback content to continue your book generation.',
        severity: 'info',
        actionable: true,
        suggestions: [
          'Fallback content is professionally crafted and unique',
          'AI access will resume in the next billing cycle',
          'Consider spacing out book generations to optimize AI usage'
        ]
      },
      network_error: {
        title: '🌐 Connection Issue Detected',
        message: 'Temporary network connectivity issue with AI services. Seamlessly switching to our offline content generation system.',
        severity: 'warning',
        actionable: true,
        suggestions: [
          'Your book generation continues without interruption',
          'Check your internet connection for optimal experience',
          'Offline system provides consistent quality content'
        ]
      },
      fallback_template_used: {
        title: '📝 Enhanced Template System Active',
        message: `Using professional template: "${details.templateName}". This ensures consistent, high-quality content while AI services are busy.`,
        severity: 'info',
        actionable: false,
        suggestions: [
          'Template content is professionally written and unique',
          'Multiple template variations ensure content diversity',
          'Quality remains consistent with AI-generated content'
        ]
      }
    }

    const baseNotification = notifications[type] || notifications.ai_service_unavailable
    
    return {
      ...baseNotification,
      type: 'fallback',
      timestamp: new Date().toISOString(),
      details: details,
      id: Date.now() + Math.random()
    }
  }

  // Show toast notification (for UI integration)
  showToast(notification) {
    if (typeof window !== 'undefined' && window.toast) {
      const toastConfig = {
        info: { icon: '🤖', duration: 6000 },
        warning: { icon: '⚠️', duration: 8000 },
        error: { icon: '❌', duration: 10000 }
      }

      const config = toastConfig[notification.severity] || toastConfig.info
      
      window.toast(notification.message, {
        icon: config.icon,
        duration: config.duration,
        style: {
          background: notification.severity === 'warning' ? '#f59e0b' : 
                     notification.severity === 'error' ? '#ef4444' : '#3b82f6',
          color: 'white',
          fontWeight: '500'
        }
      })
    }
  }

  // Get fallback usage statistics
  getFallbackStats() {
    const fallbackNotifications = this.notifications.filter(n => n.type === 'fallback')
    
    return {
      totalFallbacks: fallbackNotifications.length,
      recentFallbacks: fallbackNotifications.filter(n => {
        const notificationTime = new Date(n.timestamp)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        return notificationTime > oneHourAgo
      }).length,
      fallbackTypes: fallbackNotifications.reduce((acc, n) => {
        const type = n.details?.type || 'unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {}),
      lastFallback: fallbackNotifications[0]?.timestamp || null
    }
  }

  // Check if fallback system is currently active
  isFallbackActive() {
    const recentNotifications = this.notifications.filter(n => {
      const notificationTime = new Date(n.timestamp)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return notificationTime > fiveMinutesAgo && n.type === 'fallback'
    })
    
    return recentNotifications.length > 0
  }

  // Generate user-friendly status message
  getStatusMessage() {
    if (!this.isFallbackActive()) {
      return {
        status: 'optimal',
        message: '✅ All AI services operating normally',
        color: 'green'
      }
    }

    const stats = this.getFallbackStats()
    
    if (stats.recentFallbacks > 3) {
      return {
        status: 'degraded',
        message: '⚠️ AI services experiencing high demand - using enhanced backup system',
        color: 'orange'
      }
    }

    return {
      status: 'partial',
      message: '🔄 Temporarily using backup content system - quality maintained',
      color: 'blue'
    }
  }
}

export const fallbackNotificationService = new FallbackNotificationService()
