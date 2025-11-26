import React, { useState } from 'react'
import { X, CheckCircle, XCircle, RefreshCw, Eye, FileText, Clock } from 'lucide-react'

const PreviewApprovalModal = ({ 
  isOpen, 
  onClose, 
  previewContent, 
  onApprove, 
  onReject, 
  currentAttempt, 
  maxAttempts,
  nodeName 
}) => {
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      await onApprove()
      onClose()
    } catch (error) {
      console.error('Error approving preview:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback on what you would like changed.')
      return
    }
    
    setIsSubmitting(true)
    try {
      await onReject(feedback)
      setFeedback('')
      onClose()
    } catch (error) {
      console.error('Error rejecting preview:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const remainingAttempts = maxAttempts - currentAttempt

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Eye className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Preview Approval</h2>
              <p className="text-gray-400 text-sm">{nodeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attempt Counter */}
        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">
                Attempt {currentAttempt} of {maxAttempts}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-300">
                {remainingAttempts} attempts remaining
              </span>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Generated Preview</h3>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm leading-relaxed">
                  {previewContent}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/30">
          <div className="flex items-center gap-4">
            {/* Approve Button */}
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
            >
              <CheckCircle className="w-5 h-5" />
              {isSubmitting ? 'Approving...' : 'Approve & Continue'}
            </button>

            {/* Reject Button */}
            <button
              onClick={handleReject}
              disabled={isSubmitting || remainingAttempts <= 0}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25"
            >
              <XCircle className="w-5 h-5" />
              {isSubmitting ? 'Rejecting...' : 'Reject & Provide Feedback'}
            </button>
          </div>

          {/* Feedback Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What would you like changed? (Required for rejection)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please describe what you didn't like about this preview and what you'd like to see different..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Warning for max attempts */}
          {remainingAttempts <= 1 && (
            <div className="mt-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-orange-300">
                  {remainingAttempts === 1 
                    ? 'This is your last attempt. If rejected again, the workflow will continue with the current preview.'
                    : 'No more attempts remaining. The workflow will continue with the current preview.'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PreviewApprovalModal

