import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BookOpen,
  Target,
  Zap,
  Eye,
  BarChart3,
  Clock,
  User,
  Lightbulb
} from 'lucide-react'
import { dbService } from '../services/database'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const TemplateChecker = () => {
  const { user } = useAuth()
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  // Template patterns to match against
  const templates = [
    {
      id: 'blog-post',
      name: 'Blog Post',
      patterns: ['introduction', 'main content', 'conclusion', 'call to action'],
      keywords: ['blog', 'article', 'post', 'content marketing'],
      structure: 'intro-body-conclusion'
    },
    {
      id: 'email-sequence',
      name: 'Email Marketing Sequence',
      patterns: ['subject line', 'greeting', 'value proposition', 'call to action'],
      keywords: ['email', 'sequence', 'marketing', 'newsletter'],
      structure: 'greeting-value-cta'
    },
    {
      id: 'sales-copy',
      name: 'Sales Page Copy',
      patterns: ['headline', 'problem', 'solution', 'benefits', 'testimonials', 'price', 'guarantee'],
      keywords: ['sales', 'conversion', 'landing page', 'offer'],
      structure: 'problem-solution-benefits-cta'
    },
    {
      id: 'social-media',
      name: 'Social Media Posts',
      patterns: ['hook', 'content', 'engagement', 'hashtags'],
      keywords: ['social', 'post', 'engagement', 'viral'],
      structure: 'hook-content-engagement'
    },
    {
      id: 'case-study',
      name: 'Case Study',
      patterns: ['challenge', 'solution', 'implementation', 'results'],
      keywords: ['case study', 'success story', 'results', 'roi'],
      structure: 'challenge-solution-results'
    },
    {
      id: 'how-to-guide',
      name: 'How-To Guide',
      patterns: ['overview', 'step-by-step', 'tips', 'conclusion'],
      keywords: ['how to', 'guide', 'tutorial', 'step by step'],
      structure: 'overview-steps-tips'
    },
    {
      id: 'product-description',
      name: 'Product Description',
      patterns: ['features', 'benefits', 'specifications', 'use cases'],
      keywords: ['product', 'features', 'benefits', 'specifications'],
      structure: 'features-benefits-specs'
    },
    {
      id: 'whitepaper',
      name: 'Whitepaper',
      patterns: ['executive summary', 'problem statement', 'methodology', 'findings', 'recommendations'],
      keywords: ['whitepaper', 'research', 'analysis', 'findings'],
      structure: 'summary-problem-methodology-findings'
    }
  ]

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      setLoading(true)
      const userBooks = await dbService.getBooks(user?.id || 1)
      setBooks(userBooks.filter(book => book.status === 'completed'))
    } catch (error) {
      console.error('Error loading books:', error)
      toast.error('Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  const analyzeBookContent = (book) => {
    if (!book || !book.content) {
      return {
        matches: [],
        confidence: 0,
        verdict: 'insufficient_data'
      }
    }

    const content = typeof book.content === 'string' ? book.content.toLowerCase() : 
                   JSON.stringify(book.content).toLowerCase()
    
    const matches = []
    
    templates.forEach(template => {
      let score = 0
      let matchedPatterns = []
      let matchedKeywords = []
      
      // Check for pattern matches
      template.patterns.forEach(pattern => {
        if (content.includes(pattern.toLowerCase())) {
          score += 2
          matchedPatterns.push(pattern)
        }
      })
      
      // Check for keyword matches
      template.keywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          score += 1
          matchedKeywords.push(keyword)
        }
      })
      
      // Calculate confidence percentage
      const maxScore = (template.patterns.length * 2) + template.keywords.length
      const confidence = Math.round((score / maxScore) * 100)
      
      if (confidence > 20) { // Only include if there's some match
        matches.push({
          template,
          confidence,
          matchedPatterns,
          matchedKeywords,
          score
        })
      }
    })
    
    // Sort by confidence
    matches.sort((a, b) => b.confidence - a.confidence)
    
    // Determine verdict
    let verdict = 'no_match'
    if (matches.length > 0) {
      const topMatch = matches[0]
      if (topMatch.confidence >= 70) {
        verdict = 'strong_match'
      } else if (topMatch.confidence >= 40) {
        verdict = 'partial_match'
      } else {
        verdict = 'weak_match'
      }
    }
    
    return {
      matches: matches.slice(0, 3), // Top 3 matches
      confidence: matches.length > 0 ? matches[0].confidence : 0,
      verdict
    }
  }

  const handleAnalyzeBook = async (book) => {
    setAnalyzing(true)
    setSelectedBook(book)
    
    try {
      // Simulate analysis delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const result = analyzeBookContent(book)
      setAnalysisResult(result)
      
      toast.success('Analysis complete!')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'strong_match': return 'text-green-600'
      case 'partial_match': return 'text-yellow-600'
      case 'weak_match': return 'text-orange-600'
      case 'no_match': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'strong_match': return CheckCircle
      case 'partial_match': return AlertCircle
      case 'weak_match': return AlertCircle
      case 'no_match': return XCircle
      default: return AlertCircle
    }
  }

  const getVerdictMessage = (verdict) => {
    switch (verdict) {
      case 'strong_match': return 'Strong template match found!'
      case 'partial_match': return 'Partial template match detected'
      case 'weak_match': return 'Weak template similarity'
      case 'no_match': return 'No clear template match'
      default: return 'Analysis incomplete'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-400">Loading your books...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          📋 Template Match Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Check if your existing books match our Copy.ai templates
        </p>
      </div>

      {/* Books List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Select a book to analyze:
        </h3>
        
        {books.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No completed books found. Create a book first to analyze it.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {books.map((book) => (
              <motion.div
                key={book.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedBook?.id === book.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
                onClick={() => handleAnalyzeBook(book)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                      📚
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {book.title}
                      </h4>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <FileText className="w-4 h-4 mr-1" />
                        <span className="capitalize">{book.type} • {book.niche}</span>
                        <Clock className="w-4 h-4 ml-3 mr-1" />
                        <span>{new Date(book.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {book.metadata?.wordCount && (
                      <span className="text-sm text-gray-500 mr-4">
                        {book.metadata.wordCount.toLocaleString()} words
                      </span>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary text-sm"
                      disabled={analyzing}
                    >
                      {analyzing && selectedBook?.id === book.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Analyze
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResult && selectedBook && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700"
        >
          <div className="flex items-center mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Analysis Results for "{selectedBook.title}"
            </h3>
          </div>

          {/* Overall Verdict */}
          <div className="mb-6 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-2">
              {React.createElement(getVerdictIcon(analysisResult.verdict), {
                className: `w-5 h-5 mr-2 ${getVerdictColor(analysisResult.verdict)}`
              })}
              <span className={`font-semibold ${getVerdictColor(analysisResult.verdict)}`}>
                {getVerdictMessage(analysisResult.verdict)}
              </span>
            </div>
            {analysisResult.confidence > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Best Match Confidence</span>
                  <span>{analysisResult.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analysisResult.confidence}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Template Matches */}
          {analysisResult.matches.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Template Matches Found:
              </h4>
              {analysisResult.matches.map((match, index) => (
                <div key={index} className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {match.template.name}
                    </h5>
                    <span className={`font-semibold ${
                      match.confidence >= 70 ? 'text-green-600' :
                      match.confidence >= 40 ? 'text-yellow-600' : 'text-orange-600'
                    }`}>
                      {match.confidence}% match
                    </span>
                  </div>
                  
                  {match.matchedPatterns.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Matched Patterns:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.matchedPatterns.map((pattern, i) => (
                          <span key={i} className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {match.matchedKeywords.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Matched Keywords:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.matchedKeywords.map((keyword, i) => (
                          <span key={i} className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No template matches found. Your book appears to have a unique structure.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default TemplateChecker
