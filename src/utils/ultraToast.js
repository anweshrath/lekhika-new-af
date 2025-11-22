import toast from 'react-hot-toast'

/**
 * ULTRA TOAST - Maximum dopamine toast notifications
 * Enhanced versions of react-hot-toast with custom styling
 */

const baseToastStyle = {
  borderRadius: '16px',
  padding: '16px 24px',
  fontSize: '16px',
  fontWeight: '600',
  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(10px)'
}

export const ultraToast = {
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 4000,
      style: {
        ...baseToastStyle,
        background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        color: 'white',
        border: '2px solid #059669',
        ...options.style
      },
      icon: '✅',
      iconTheme: {
        primary: '#FFFFFF',
        secondary: '#10B981'
      },
      ...options
    })
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 5000,
      style: {
        ...baseToastStyle,
        background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
        color: 'white',
        border: '2px solid #DC2626',
        ...options.style
      },
      icon: '❌',
      iconTheme: {
        primary: '#FFFFFF',
        secondary: '#EF4444'
      },
      ...options
    })
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      style: {
        ...baseToastStyle,
        background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        color: 'white',
        border: '2px solid #2563EB',
        ...options.style
      },
      iconTheme: {
        primary: '#FFFFFF',
        secondary: '#3B82F6'
      },
      ...options
    })
  },

  info: (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      style: {
        ...baseToastStyle,
        background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
        color: 'white',
        border: '2px solid #0284C7',
        ...options.style
      },
      icon: 'ℹ️',
      iconTheme: {
        primary: '#FFFFFF',
        secondary: '#0EA5E9'
      },
      ...options
    })
  },

  warning: (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      style: {
        ...baseToastStyle,
        background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        color: 'white',
        border: '2px solid #D97706',
        ...options.style
      },
      icon: '⚠️',
      iconTheme: {
        primary: '#FFFFFF',
        secondary: '#F59E0B'
      },
      ...options
    })
  },

  celebration: (message, options = {}) => {
    return toast.success(message, {
      duration: 6000,
      style: {
        ...baseToastStyle,
        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        color: 'white',
        border: '2px solid #7C3AED',
        fontSize: '18px',
        ...options.style
      },
      icon: '🎉',
      iconTheme: {
        primary: '#FFFFFF',
        secondary: '#8B5CF6'
      },
      ...options
    })
  },

  promise: async (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error occurred'
      },
      {
        style: baseToastStyle,
        success: {
          style: {
            background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
            color: 'white',
            border: '2px solid #059669'
          },
          icon: '✅'
        },
        error: {
          style: {
            background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
            color: 'white',
            border: '2px solid #DC2626'
          },
          icon: '❌'
        },
        loading: {
          style: {
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            color: 'white',
            border: '2px solid #2563EB'
          }
        },
        ...options
      }
    )
  },

  custom: (element, options = {}) => {
    return toast.custom(element, {
      duration: 4000,
      ...options
    })
  },

  dismiss: (toastId) => {
    return toast.dismiss(toastId)
  },

  remove: (toastId) => {
    return toast.remove(toastId)
  }
}

export default ultraToast

