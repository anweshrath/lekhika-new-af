import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  Copy, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Calendar,
  User,
  Cpu
} from 'lucide-react'
import toast from 'react-hot-toast'

const AIThinkingExport = ({ 
  executionData, 
  thinkingHistory = [], 
  executionId 
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Format AI thinking data for email
  const formatThinkingDataForEmail = () => {
    const timestamp = new Date().toISOString()
    const userInfo = executionData?.user || 'Unknown User'
    
    let emailBody = `AI Thinking Data Export
Execution ID: ${executionId}
Timestamp: ${timestamp}
User: ${userInfo}

=== EXECUTION SUMMARY ===
Status: ${executionData?.status || 'Unknown'}
Progress: ${executionData?.progress || 0}%
Current Node: ${executionData?.currentNode || 'None'}
Tokens Used: ${executionData?.tokens || 0}
Words Generated: ${executionData?.words || 0}
Duration: ${Math.round(executionData?.duration || 0)}s

=== AI THINKING HISTORY ===
`

    thinkingHistory.forEach((entry, index) => {
      emailBody += `
Step ${index + 1}: ${entry.nodeName || 'Unknown Node'}
Timestamp: ${entry.timestamp || new Date().toISOString()}
Thinking: ${entry.thinking || 'No thinking data available'}
Provider: ${entry.provider || 'Unknown'}
Model: ${entry.model || 'Unknown'}
Tokens: ${entry.tokens || 0}
---
`
    })

    emailBody += `
=== NODE RESULTS ===
`

    if (executionData?.nodeResults) {
      Object.entries(executionData.nodeResults).forEach(([nodeId, result]) => {
        emailBody += `
Node: ${nodeId}
Result: ${typeof result === 'string' ? result.substring(0, 500) : JSON.stringify(result).substring(0, 500)}
---
`
      })
    }

    emailBody += `
=== SYSTEM INFO ===
Browser: ${navigator.userAgent}
URL: ${window.location.href}
Export Time: ${new Date().toLocaleString()}
`

    return emailBody
  }

  // Format thinking data for JSON download
  const formatThinkingDataForJSON = () => {
    return {
      executionId,
      timestamp: new Date().toISOString(),
      executionData: {
        status: executionData?.status,
        progress: executionData?.progress,
        currentNode: executionData?.currentNode,
        tokens: executionData?.tokens,
        words: executionData?.words,
        duration: executionData?.duration,
        nodeResults: executionData?.nodeResults,
        user: executionData?.user
      },
      thinkingHistory: thinkingHistory.map((entry, index) => ({
        step: index + 1,
        timestamp: entry.timestamp || new Date().toISOString(),
        nodeName: entry.nodeName,
        thinking: entry.thinking,
        provider: entry.provider,
        model: entry.model,
        tokens: entry.tokens
      })),
      systemInfo: {
        browser: navigator.userAgent,
        url: window.location.href,
        exportTime: new Date().toISOString()
      }
    }
  }

  // Download as JSON
  const handleDownloadJSON = async () => {
    try {
      setIsExporting(true)
      
      const data = formatThinkingDataForJSON()
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-thinking-${executionId}-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('✅ AI Thinking data downloaded successfully!')
      
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download AI Thinking data')
    } finally {
      setIsExporting(false)
    }
  }

  // Copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      setIsExporting(true)
      
      const textData = formatThinkingDataForEmail()
      await navigator.clipboard.writeText(textData)
      
      setCopied(true)
      toast.success('📋 AI Thinking data copied to clipboard!')
      
      setTimeout(() => setCopied(false), 2000)
      
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('Failed to copy to clipboard')
    } finally {
      setIsExporting(false)
    }
  }

  // Email to support
  const handleEmailToSupport = () => {
    try {
      const emailData = {
        to: 'anweshrath@gmail.com,admin@lekhika.online',
        subject: `AI Thinking Data - Execution ${executionId}`,
        body: formatThinkingDataForEmail()
      }
      
      const mailtoLink = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`
      window.location.href = mailtoLink
      
      toast.success('📧 Email client opened with AI Thinking data!')
      
    } catch (error) {
      console.error('Email error:', error)
      toast.error('Failed to open email client')
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-6 h-6 text-blue-400" />
        <h3 className="text-white font-semibold text-lg">📤 Export AI Thinking Data</h3>
      </div>
      
      <p className="text-gray-300 text-sm mb-6">
        Export the complete AI thinking process for debugging, analysis, or sharing with support.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Download JSON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownloadJSON}
          disabled={isExporting}
          className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Download className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
            <span className="text-white font-medium">Download JSON</span>
          </div>
          <p className="text-gray-400 text-xs">
            Complete data with timestamps and metadata
          </p>
          {isExporting && (
            <div className="mt-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            </div>
          )}
        </motion.button>

        {/* Copy to Clipboard */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyToClipboard}
          disabled={isExporting}
          className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3 mb-2">
            {copied ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5 text-green-400 group-hover:text-green-300" />
            )}
            <span className="text-white font-medium">
              {copied ? 'Copied!' : 'Copy Data'}
            </span>
          </div>
          <p className="text-gray-400 text-xs">
            Formatted text for pasting anywhere
          </p>
        </motion.button>

        {/* Email to Support */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleEmailToSupport}
          className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
            <span className="text-white font-medium">Email Support</span>
          </div>
          <p className="text-gray-400 text-xs">
            Send to anweshrath@gmail.com & admin@lekhika.online
          </p>
        </motion.button>
      </div>
      
      {/* Data Summary */}
      <div className="mt-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 text-sm font-medium">Data Summary</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-gray-400">Execution ID</div>
            <div className="text-white font-mono">{executionId || 'N/A'}</div>
          </div>
          <div>
            <div className="text-gray-400">Thinking Steps</div>
            <div className="text-white font-mono">{thinkingHistory.length}</div>
          </div>
          <div>
            <div className="text-gray-400">Tokens Used</div>
            <div className="text-white font-mono">{executionData?.tokens || 0}</div>
          </div>
          <div>
            <div className="text-gray-400">Duration</div>
            <div className="text-white font-mono">{Math.round(executionData?.duration || 0)}s</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AIThinkingExport
