import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Users, 
  Settings, 
  Zap, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Download,
  FileText,
  Globe,
  Loader2,
  Edit3,
  Brain,
  Sparkles,
  Clock,
  Target,
  Layers,
  Type,
  Hash,
  Play,
  Pause,
  RotateCcw,
  Quote,
  Wand2,
  Send,
  Image,
  Mail,
  Crown,
  Star,
  Search,
  Lightbulb,
  FileSearch,
  PenTool,
  Eye,
  AlertCircle,
  Wifi,
  WifiOff,
  Rocket,
  Gem,
  Zap as ZapIcon,
  ChevronDown,
  ChevronUp,
  Plus,
  User,
  Briefcase,
  GraduationCap,
  Heart,
  Palette,
  Code,
  Stethoscope,
  Building,
  Camera,
  Music,
  Plane,
  Home,
  ShoppingCart,
  TrendingUp,
  Globe2,
  Mic,
  Volume2,
  Shield,
  BarChart3
} from 'lucide-react'
import { dbService } from '../services/database'
// import { improvedRealBookGenerator } from '../services/improvedRealBookGenerator' // REMOVED
// import { professionalFormatter } from '../services/professionalFormatter' // REMOVED - using professionalBookFormatter
import { useUserAuth } from '../contexts/UserAuthContext'
import MagicalLoader from '../components/MagicalLoader'
import FallbackNotificationBanner from '../components/FallbackNotificationBanner'
import CopyAITemplates from '../components/CopyAITemplates'
import AIUsageReport from '../components/AIUsageReport'
import toast from 'react-hot-toast'

const CreateBookImproved = () => {
  const { user } = useUserAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedBook, setGeneratedBook] = useState(null)
  const [apiConnectionStatus, setApiConnectionStatus] = useState('connected')
  const [selectedTier, setSelectedTier] = useState('expert')
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [expandedAvatar, setExpandedAvatar] = useState(null)
  const [showCustomAvatarForm, setShowCustomAvatarForm] = useState(false)
  const [showAIUsageReport, setShowAIUsageReport] = useState(false)
  const [customAvatarData, setCustomAvatarData] = useState({
    name: '',
    demographics: {
      age: '',
      profession: '',
      experience: '',
      location: '',
      income: '',
      education: ''
    },
    painPoints: [''],
    goals: [''],
    preferences: [''],
    interests: [''],
    challenges: [''],
    motivations: ['']
  })
  const [generationProgress, setGenerationProgress] = useState({
    phase: 'idle',
    progress: 0,
    message: '',
    currentSection: '',
    sectionsComplete: 0,
    totalSections: 0
  })
  
  const [config, setConfig] = useState({
    type: 'ebook',
    niche: 'business',
    tone: 'professional',
    accent: 'american',
    bookTitle: '',
    customTopics: [],
    numberOfChapters: 5,
    targetWordCount: 15000,
    avatar: {
      name: 'Business Professional',
      demographics: {
        age: '30-45',
        profession: 'Manager',
        experience: 'Intermediate'
      },
      painPoints: ['Time management', 'Team leadership', 'Strategic planning'],
      goals: ['Career advancement', 'Skill development', 'Better results'],
      preferences: ['Practical advice', 'Real examples', 'Actionable steps']
    },
    customPrompts: ''
  })

  const [advancedFeatures, setAdvancedFeatures] = useState({
    includeQuotes: false,
    humanizeContent: false,
    createCover: false,
    setupEmailMarketing: false,
    publishToMarketplaces: false
  })

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const bookTypes = [
    { id: 'ebook', name: 'eBook', description: 'Comprehensive digital book', chapters: '5-8', words: '15,000-25,000', icon: '📚' },
    { id: 'report', name: 'Report', description: 'Research-based analysis', chapters: '4-6', words: '8,000-15,000', icon: '📊' },
    { id: 'guide', name: 'Guide', description: 'Step-by-step instructions', chapters: '6-10', words: '10,000-20,000', icon: '🗺️' },
    { id: 'whitepaper', name: 'Whitepaper', description: 'Technical deep-dive', chapters: '3-5', words: '5,000-12,000', icon: '📄' },
    { id: 'manual', name: 'Manual', description: 'Detailed how-to document', chapters: '8-12', words: '20,000-35,000', icon: '📖' },
    { id: 'case-study', name: 'Case Study', description: 'Real-world analysis', chapters: '4-6', words: '6,000-12,000', icon: '🔍' }
  ]

  const niches = [
    { id: 'business', name: 'Business & Leadership', topics: ['Strategy', 'Management', 'Innovation', 'Growth', 'Leadership'], icon: '💼' },
    { id: 'health', name: 'Health & Wellness', topics: ['Nutrition', 'Fitness', 'Mental Health', 'Prevention', 'Recovery'], icon: '🏥' },
    { id: 'technology', name: 'Technology', topics: ['AI', 'Cloud', 'Security', 'Development', 'Innovation'], icon: '💻' },
    { id: 'education', name: 'Education', topics: ['Learning', 'Teaching', 'Assessment', 'Technology', 'Development'], icon: '🎓' },
    { id: 'lifestyle', name: 'Lifestyle', topics: ['Productivity', 'Habits', 'Relationships', 'Goals', 'Balance'], icon: '🌟' },
    { id: 'finance', name: 'Finance', topics: ['Investment', 'Planning', 'Risk', 'Wealth', 'Markets'], icon: '💰' },
    { id: 'marketing', name: 'Marketing', topics: ['Digital', 'Content', 'Brand', 'Analytics', 'Strategy'], icon: '📈' },
    { id: 'self-help', name: 'Self-Help', topics: ['Growth', 'Mindset', 'Success', 'Motivation', 'Achievement'], icon: '🚀' }
  ]

  const tones = [
    { id: 'professional', name: 'Professional', description: 'Formal and authoritative', icon: '👔' },
    { id: 'conversational', name: 'Conversational', description: 'Friendly and approachable', icon: '😊' },
    { id: 'academic', name: 'Academic', description: 'Scholarly and detailed', icon: '🎓' },
    { id: 'inspirational', name: 'Inspirational', description: 'Motivational and uplifting', icon: '✨' },
    { id: 'technical', name: 'Technical', description: 'Detailed and precise', icon: '⚙️' },
    { id: 'casual', name: 'Casual', description: 'Relaxed and informal', icon: '😄' },
    { id: 'authoritative', name: 'Authoritative', description: 'Expert and commanding', icon: '👑' },
    { id: 'empathetic', name: 'Empathetic', description: 'Understanding and supportive', icon: '❤️' },
    { id: 'persuasive', name: 'Persuasive', description: 'Compelling and action-oriented', icon: '🎯' },
    { id: 'humorous', name: 'Humorous', description: 'Light-hearted and engaging', icon: '😂' },
    { id: 'storytelling', name: 'Storytelling', description: 'Narrative-driven and engaging', icon: '📖' },
    { id: 'analytical', name: 'Analytical', description: 'Data-driven and logical', icon: '📊' },
    { id: 'creative', name: 'Creative', description: 'Innovative and imaginative', icon: '🎨' },
    { id: 'direct', name: 'Direct', description: 'Straightforward and concise', icon: '🎯' }
  ]

  // Rest of the component code remains the same...
  // Just adding the AI Usage Report functionality

  const handleGenerateBook = async () => {
    if (!config.bookTitle.trim()) {
      toast.error('Please enter a book title')
      return
    }

    setIsGenerating(true)
    setCurrentStep(6)

    try {
      const bookConfig = {
        ...config,
        title: config.bookTitle,
        userId: user?.id || 1,
        tier: selectedTier,
        targetAudience: config.avatar?.name || 'professionals'
      }

      console.log('🚀 Starting book generation with config:', bookConfig)

      const result = await improvedRealBookGenerator.generateBook(
        bookConfig,
        (progress) => {
          setGenerationProgress(progress)
        }
      )

      console.log('📖 Book generation completed:', result)
      setGeneratedBook(result)
      setCurrentStep(7)

    } catch (error) {
      console.error('❌ Book generation failed:', error)
      toast.error('Book generation failed. Please try again.')
      setCurrentStep(5)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* AI Usage Report Modal */}
      {showAIUsageReport && (
        <AIUsageReport onClose={() => setShowAIUsageReport(false)} />
      )}

      {/* Header with AI Verification Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Create Your Book</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* AI Usage Verification Button */}
              <button
                onClick={() => setShowAIUsageReport(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Verify AI Usage</span>
              </button>

              {/* Step indicator */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Step {currentStep} of 7</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 7) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same... */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Your existing step content goes here */}
        <div className="text-center py-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Book Creation Steps</h2>
          <p className="text-gray-600 mb-8">Follow the steps to create your book</p>
          
          <div className="space-y-4">
            <button
              onClick={() => setShowAIUsageReport(true)}
              className="w-full max-w-md mx-auto flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Eye className="w-5 h-5" />
              <span className="font-medium">Check AI vs Template Usage</span>
            </button>
            
            <p className="text-sm text-gray-500">
              Click above to verify whether your books are using real AI or fallback templates
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateBookImproved
