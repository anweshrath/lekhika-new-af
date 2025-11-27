import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Terminal,
  Send,
  Trash2,
  Clock,
  Star,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const RedisCommandPalette = () => {
  const [command, setCommand] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isExecuting, setIsExecuting] = useState(false)
  const [favorites, setFavorites] = useState([])

  // Common Redis commands for quick access
  const quickCommands = [
    { label: 'Queue Stats', command: 'QUEUE STATS' },
    { label: 'Queue Length', command: 'QUEUE LEN workflow' },
    { label: 'List Keys', command: 'KEYS lekhika:*' },
    { label: 'Queue Info', command: 'INFO queue' },
    { label: 'Active Jobs', command: 'QUEUE ACTIVE' },
    { label: 'Failed Jobs', command: 'QUEUE FAILED' },
    { label: 'Clear Failed', command: 'QUEUE CLEAR failed' },
    { label: 'Memory Info', command: 'INFO memory' }
  ]

  useEffect(() => {
    // Load favorites from localStorage
    const saved = localStorage.getItem('redis_command_favorites')
    if (saved) {
      try {
        setFavorites(JSON.parse(saved))
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  const executeCommand = async (cmd = command) => {
    if (!cmd.trim()) {
      toast.error('Enter a command first')
      return
    }

    setIsExecuting(true)
    try {
      // For now, use queue API endpoints (in future, add generic Redis executor)
      // This is a simplified implementation - full Redis command execution would need a dedicated endpoint
      
      let response
      const cmdLower = cmd.toLowerCase()
      
      if (cmdLower.includes('queue stats')) {
        response = await fetch('http://103.190.93.28:3001/queue/stats')
      } else if (cmdLower.includes('queue len')) {
        response = await fetch('http://103.190.93.28:3001/queue/stats')
      } else {
        // Generic placeholder for future Redis executor endpoint
        toast.info('Generic Redis command execution coming soon! For now, use Queue Stats.')
        setIsExecuting(false)
        return
      }

      if (response.ok) {
        const data = await response.json()
        setResult({
          success: true,
          data: data,
          command: cmd,
          timestamp: new Date()
        })
        
        // Add to history
        setHistory(prev => {
          const newHistory = [cmd, ...prev.filter(h => h !== cmd)]
          return newHistory.slice(0, 50) // Keep last 50
        })
        setHistoryIndex(-1)
      } else {
        const error = await response.json()
        setResult({
          success: false,
          error: error.error || 'Command failed',
          command: cmd,
          timestamp: new Date()
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
        command: cmd,
        timestamp: new Date()
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleKeyDown = (e) => {
    // Up arrow - previous command
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCommand(history[newIndex])
      }
    }
    // Down arrow - next command
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCommand(history[newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCommand('')
      }
    }
    // Enter - execute
    else if (e.key === 'Enter') {
      e.preventDefault()
      executeCommand()
    }
  }

  const addToFavorites = (cmd) => {
    const newFavorites = [...favorites, cmd]
    setFavorites(newFavorites)
    localStorage.setItem('redis_command_favorites', JSON.stringify(newFavorites))
    toast.success('Added to favorites')
  }

  const removeFromFavorites = (cmd) => {
    const newFavorites = favorites.filter(f => f !== cmd)
    setFavorites(newFavorites)
    localStorage.setItem('redis_command_favorites', JSON.stringify(newFavorites))
    toast.success('Removed from favorites')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-teal-500/20 rounded-lg">
            <Terminal className="w-6 h-6 text-teal-400" />
          </div>
          Redis Command Palette
        </h2>
        <p className="text-gray-400 mt-1">
          Execute Redis commands directly (Queue commands supported, full Redis coming soon)
        </p>
      </div>

      {/* Command Input */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-black rounded-lg border border-gray-700 px-4 py-3">
            <span className="text-green-400 font-mono">$</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter Redis command (e.g., QUEUE STATS)"
              className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none placeholder-gray-600"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => executeCommand()}
            disabled={isExecuting}
            className="px-5 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2"
          >
            {isExecuting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Executing
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Execute
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCommand('')
              setResult(null)
            }}
            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>

        <p className="text-xs text-gray-500">
          Tip: Use ↑/↓ arrow keys to navigate command history, Enter to execute
        </p>
      </div>

      {/* Quick Commands */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Quick Commands</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quickCommands.map((qc) => (
            <button
              key={qc.label}
              onClick={() => {
                setCommand(qc.command)
                executeCommand(qc.command)
              }}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white transition-colors text-left"
            >
              {qc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
        >
          <div className={`p-4 flex items-center justify-between border-b ${
            result.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.success ? 'Success' : 'Error'}
              </span>
              <span className="text-gray-500 text-xs">
                {result.timestamp.toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(result.data, null, 2))
                  toast.success('Result copied to clipboard')
                }}
                className="p-1.5 rounded hover:bg-gray-700 transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => addToFavorites(result.command)}
                className="p-1.5 rounded hover:bg-gray-700 transition-colors"
              >
                <Star className="w-4 h-4 text-yellow-400" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <p className="text-gray-400 text-xs mb-2 font-mono">$ {result.command}</p>
            <pre className="bg-black rounded-lg p-4 overflow-x-auto">
              <code className={`text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.success 
                  ? JSON.stringify(result.data, null, 2)
                  : result.error
                }
              </code>
            </pre>
          </div>
        </motion.div>
      )}

      {/* Command History */}
      {history.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Command History
            </h3>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-1 max-h-32 overflow-y-auto">
            {history.slice(0, 10).map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCommand(cmd)
                  executeCommand(cmd)
                }}
                className="w-full px-3 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 text-left text-xs font-mono text-gray-300 transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RedisCommandPalette

