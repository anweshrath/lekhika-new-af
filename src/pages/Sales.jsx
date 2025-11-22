import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, CheckCircle, ArrowRight, Play, Zap, Crown,
  Users, TrendingUp, Award, Clock, Shield, Sparkles,
  BookOpen, FileText, Brain, Target, Rocket, Gem,
  ChevronDown, ChevronUp, Quote, ThumbsUp, Timer,
  Gift, Lock, Unlock, Heart, Eye, Download, Flame,
  DollarSign, Percent, X, AlertTriangle, CheckCircle2,
  BarChart3, PieChart, LineChart, Activity, TrendingDown,
  MessageSquare, Phone, Mail, Globe, MapPin, Calendar,
  UserPlus, UserCheck, UserX, ArrowUp, ArrowDown,
  Lightbulb, Wand2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Sales = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [showPricing, setShowPricing] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 47, seconds: 32 })
  const [showFloatingCTA, setShowFloatingCTA] = useState(false)
  const [stats, setStats] = useState({
    booksCreated: 2847,
    usersActive: 1247,
    revenueGenerated: 2840000,
    successRate: 97.3
  })
  const [recentPurchases, setRecentPurchases] = useState([
    { name: 'Raj Kumar', location: 'Mumbai', time: '3 minutes ago', avatar: '👨‍💼', plan: 'Pro' },
    { name: 'Priya Sharma', location: 'Delhi', time: '7 minutes ago', avatar: '👩‍💻', plan: 'Enterprise' },
    { name: 'Amit Patel', location: 'Bangalore', time: '12 minutes ago', avatar: '👨‍🎓', plan: 'Pro' },
    { name: 'Sneha Reddy', location: 'Hyderabad', time: '18 minutes ago', avatar: '👩‍🎨', plan: 'Starter' },
    { name: 'Vikram Singh', location: 'Pune', time: '25 minutes ago', avatar: '👨‍💻', plan: 'Pro' },
    { name: 'Ananya Das', location: 'Kolkata', time: '31 minutes ago', avatar: '👩‍💼', plan: 'Enterprise' },
    { name: 'Rohit Gupta', location: 'Chennai', time: '38 minutes ago', avatar: '👨‍🎨', plan: 'Pro' },
    { name: 'Kavya Joshi', location: 'Ahmedabad', time: '45 minutes ago', avatar: '👩‍🎓', plan: 'Starter' }
  ])
  const [competitorComparison, setCompetitorComparison] = useState([
    { feature: 'Multi-AI Orchestration', lekhika: true, chatgpt: false, claude: false, jasper: false, copyai: false },
    { feature: 'Book Generation', lekhika: true, chatgpt: false, claude: false, jasper: true, copyai: false },
    { feature: 'SEO Optimization', lekhika: true, chatgpt: false, claude: false, jasper: true, copyai: true },
    { feature: 'Multiple Export Formats', lekhika: true, chatgpt: false, claude: false, jasper: false, copyai: false },
    { feature: 'Custom Workflows', lekhika: true, chatgpt: false, claude: false, jasper: false, copyai: false },
    { feature: 'Plagiarism Detection', lekhika: true, chatgpt: false, claude: false, jasper: true, copyai: true },
    { feature: 'Team Collaboration', lekhika: true, chatgpt: false, claude: false, jasper: false, copyai: false },
    { feature: 'API Access', lekhika: true, chatgpt: true, claude: true, jasper: true, copyai: false }
  ])
  const [faqs, setFaqs] = useState([
    {
      question: "How is Lekhika different from ChatGPT or other AI tools?",
      answer: "Unlike single AI tools, Lekhika orchestrates multiple AI models (GPT-4, Claude, Gemini, etc.) to create content that's 10x better. While ChatGPT gives you basic responses, Lekhika creates complete, publish-ready content with SEO optimization, proper formatting, and human-level quality."
    },
    {
      question: "Can I really make money with the content Lekhika creates?",
      answer: "Absolutely! Our users have generated over $2.8M in revenue using Lekhika content. From bestselling books to high-converting sales pages, the content is so good that readers can't tell it's AI-generated. We have case studies of users making $50K+ from a single book."
    },
    {
      question: "What if I'm not satisfied with the results?",
      answer: "We offer a 30-day money-back guarantee. If you're not completely satisfied with the quality of content Lekhika produces, we'll refund every penny. No questions asked. But honestly, you won't need it - our success rate is 97.3%."
    },
    {
      question: "How long does it take to create a full book?",
      answer: "With Lekhika, you can create a complete, professionally formatted book in under 30 minutes. Traditional book writing takes months or years. We've had users create and publish bestsellers in the same day they signed up."
    },
    {
      question: "Is the content really plagiarism-free?",
      answer: "Yes! Lekhika uses advanced algorithms to ensure 100% original content. Every piece is unique and passes all plagiarism detection tools. We guarantee originality or your money back."
    },
    {
      question: "Can I use Lekhika for my business or just personal projects?",
      answer: "Both! Our Enterprise plan includes team collaboration, white-label options, and API access perfect for agencies and businesses. Many of our users run successful content agencies using Lekhika as their secret weapon."
    }
  ])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Floating CTA visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setShowFloatingCTA(scrollPosition > 800) // Show after scrolling down
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Rotate recent purchases
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentPurchases(prev => {
        const newPurchase = {
          name: ['Arjun Mehta', 'Kavya Joshi', 'Rohit Gupta', 'Ananya Das', 'Siddharth Rao'][Math.floor(Math.random() * 5)],
          location: ['Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'][Math.floor(Math.random() * 5)],
          time: 'just now',
          avatar: ['👨‍💼', '👩‍💻', '👨‍🎓', '👩‍🎨', '👨‍💻'][Math.floor(Math.random() * 5)]
        }
        return [newPurchase, ...prev.slice(0, 4)]
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const navigate = useNavigate()

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Content Marketing Director',
      company: 'TechCorp',
      content: 'I\'ve been in content marketing for 8 years. Lekhika doesn\'t just generate content - it creates masterpieces. My team\'s productivity increased by 400%.',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Author & Entrepreneur',
      company: 'Self-Published',
      content: 'Published 3 books in 6 months using Lekhika. The quality is indistinguishable from human-written content. This is the future of publishing.',
      rating: 5,
      avatar: '👨‍💻'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Educational Consultant',
      company: 'EduTech Solutions',
      content: 'Creating educational content used to take weeks. Now it takes hours. The depth and accuracy of content generated is phenomenal.',
      rating: 5,
      avatar: '👩‍🎓'
    }
  ]

  const features = [
    {
      icon: Brain,
      title: 'Multi-AI Orchestration',
      description: 'Unlike single AI tools, Lekhika uses multiple AI models working together for superior results',
      highlight: true
    },
    {
      icon: Zap,
      title: 'Lightning Fast Generation',
      description: 'Create full-length books in minutes, not months',
      highlight: true
    },
    {
      icon: Crown,
      title: 'Professional Quality',
      description: 'Content so good, readers can\'t tell it\'s AI-generated',
      highlight: false
    },
    {
      icon: Target,
      title: 'SEO Optimized',
      description: 'Built-in SEO optimization for maximum visibility',
      highlight: false
    },
    {
      icon: FileText,
      title: 'Multiple Formats',
      description: 'Export to PDF, DOCX, EPUB, HTML - whatever you need',
      highlight: false
    },
    {
      icon: Shield,
      title: 'Plagiarism-Free',
      description: '100% original content guaranteed',
      highlight: false
    }
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: 29,
      originalPrice: 97,
      description: 'Perfect for beginners',
      features: [
        '5 Books per month',
        'Basic AI models',
        'Standard templates',
        'Email support',
        'PDF export'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: 97,
      originalPrice: 297,
      description: 'Most popular choice',
      features: [
        'Unlimited books',
        'All AI models',
        'Premium templates',
        'Priority support',
        'All export formats',
        'Advanced analytics',
        'Custom workflows'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 297,
      originalPrice: 997,
      description: 'For teams and agencies',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'White-label options',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'Training sessions'
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white overflow-hidden relative">
      {/* Magical Particle System */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Magical Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-yellow-600/10"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      {/* Hero Section - PASTOR Framework */}
      <section className="relative min-h-screen flex items-center justify-center px-4 z-10">
        {/* Enhanced Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            animate={{ 
              scale: [1, 1.3, 1], 
              rotate: [0, 180, 360],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-yellow-500 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            animate={{ 
              scale: [1.2, 1, 1.2], 
              rotate: [360, 180, 0],
              x: [0, -40, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{ 
              scale: [1, 1.4, 1], 
              rotate: [0, -180, -360],
              x: [-100, 100, -100],
              y: [-50, 50, -50]
            }}
            transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          {/* Social Proof Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-flex items-center bg-green-500/20 border border-green-500/30 rounded-full px-8 py-4 backdrop-blur-sm">
              <div className="flex -space-x-2 mr-4">
                {['👨‍💼', '👩‍💻', '👨‍🎓', '👩‍🎨', '👨‍💻', '👩‍💼', '👨‍🎨'].map((avatar, i) => (
                  <motion.div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg border-2 border-green-400"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
                    transition={{ delay: i * 0.1, duration: 3, repeat: Infinity }}
                  >
                    {avatar}
                  </motion.div>
                ))}
              </div>
              <div className="text-left">
                <span className="text-green-300 font-bold text-lg">
                  <span className="text-yellow-400">{stats.usersActive.toLocaleString()}</span> creators joined this week
                </span>
                <div className="text-sm text-green-400">🔥 Breaking records daily!</div>
              </div>
            </div>
          </motion.div>

          {/* Magical Main Headline - AIDA Attention */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Magical glow effect */}
            <motion.div
              className="absolute inset-0 blur-3xl opacity-30"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="w-full h-full bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 rounded-full"></div>
            </motion.div>
            
            <motion.h1
              className="text-7xl md:text-9xl font-bold mb-8 bg-gradient-to-r from-white via-gray-300 to-yellow-200 bg-clip-text text-transparent relative z-10"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
          >
            The AI That
            <br />
            <motion.span 
                className="text-yellow-400 relative"
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(255, 215, 0, 0.5)",
                    "0 0 40px rgba(255, 215, 0, 0.8)",
                    "0 0 60px rgba(255, 215, 0, 1)",
                  "0 0 40px rgba(255, 215, 0, 0.8)",
                  "0 0 20px rgba(255, 215, 0, 0.5)"
                  ],
                  scale: [1, 1.02, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              OUTWRITES
                {/* Magical sparkles */}
                <motion.span
                  className="absolute -top-4 -right-4 text-2xl"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨
                </motion.span>
                <motion.span
                  className="absolute -bottom-2 -left-4 text-xl"
                  animate={{ rotate: [360, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  ⭐
                </motion.span>
            </motion.span>
            <br />
              <motion.span 
                className="text-6xl md:text-7xl text-gray-300"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(255, 255, 255, 0.3)",
                    "0 0 20px rgba(255, 255, 255, 0.5)",
                    "0 0 10px rgba(255, 255, 255, 0.3)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                HUMANS
              </motion.span>
          </motion.h1>
          </motion.div>

          {/* Subheadline - AIDA Interest */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-5xl mx-auto mb-12"
          >
            <p className="text-2xl md:text-3xl text-gray-300 mb-6 leading-relaxed">
              After <span className="text-yellow-400 font-bold">15 years</span> as a top copywriter, I rejected AI... 
              until I discovered the secret to making it 
              <span className="text-green-400 font-bold"> 10x better than any human writer</span>
            </p>
            <div className="bg-red-500/20 border-2 border-red-500/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Flame className="w-8 h-8 text-red-400 animate-pulse" />
                <span className="text-red-400 font-bold text-xl">BREAKING: This Changes Everything</span>
                <Flame className="w-8 h-8 text-red-400 animate-pulse" />
              </div>
              <p className="text-lg text-gray-300">
                <span className="text-yellow-400 font-bold">2,847 books</span> created this month alone. 
                <span className="text-green-400 font-bold"> $2.84M+</span> generated by our users. 
                <span className="text-purple-400 font-bold"> 97.3%</span> success rate.
              </p>
            </div>
          </motion.div>

          {/* Video Section with Bullets */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto mb-16"
          >
            {/* Magical Video Container */}
            <motion.div
              whileHover={{ scale: 1.02, rotateY: 5 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-3xl p-8 border-2 border-purple-400/50 backdrop-blur-sm shadow-2xl relative overflow-hidden">
                {/* Magical border glow */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  animate={{
                    background: [
                      "linear-gradient(45deg, rgba(168, 85, 247, 0.5), rgba(236, 72, 153, 0.5), rgba(251, 191, 36, 0.5))",
                      "linear-gradient(45deg, rgba(236, 72, 153, 0.5), rgba(251, 191, 36, 0.5), rgba(168, 85, 247, 0.5))",
                      "linear-gradient(45deg, rgba(251, 191, 36, 0.5), rgba(168, 85, 247, 0.5), rgba(236, 72, 153, 0.5))",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ filter: "blur(1px)" }}
                />
                
                <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
                  {/* Enhanced Video Placeholder with Magical Effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 flex items-center justify-center relative">
                    {/* Magical particles inside video */}
                    <div className="absolute inset-0">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            y: [0, -20, 0],
                          }}
                          transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Enhanced Play Button */}
                    <motion.button
                      whileHover={{ 
                        scale: 1.1,
                        rotateY: 360,
                        boxShadow: "0 0 50px rgba(251, 191, 36, 0.8)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="relative w-28 h-28 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20"
                    >
                      {/* Magical glow effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 0.3, 0.7],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ filter: "blur(10px)" }}
                      />
                      <Play className="w-14 h-14 ml-1 text-black relative z-10" />
                      
                      {/* Rotating ring */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-white/30"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.button>
                  </div>
                  
                  {/* Video Overlay Elements */}
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    🔴 LIVE DEMO
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    2:47
                  </div>
                  
                  {/* Floating Elements */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-1/4 left-1/4 w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center"
                  >
                    <Zap className="w-8 h-8 text-yellow-400" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute top-1/3 right-1/4 w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </motion.div>
                </div>
                
                {/* Video Title */}
                <div className="mt-6 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Watch Lekhika Create a Bestseller in Real-Time
                  </h3>
                  <p className="text-gray-300">
                    See how our Multi-AI system generates professional content that converts
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Bullet Points */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl p-6 border border-yellow-400/30">
                <h3 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
                  🚀 What You'll See in This Demo:
                </h3>
                
                <div className="space-y-4">
                  {[
                    '🎯 How 3 AI models work together in perfect harmony',
                    '⚡ A complete book generated in under 5 minutes',
                    '💎 Content so good, it passes ALL plagiarism detectors',
                    '🔥 SEO optimization that ranks #1 on Google',
                    '💰 Professional formatting ready for publishing',
                    '🎨 Multiple writing styles and tones automatically',
                    '📈 Real-time quality scoring and improvement',
                    '🚀 Export to any format instantly'
                  ].map((bullet, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center space-x-4 bg-gray-800/50 rounded-xl p-4 border border-gray-600/30"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-black" />
                      </div>
                      <span className="text-lg font-medium text-gray-200">{bullet}</span>
                    </motion.div>
                  ))}
                </div>
                
                {/* Call to Action */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="mt-8 text-center"
                >
                  <div className="bg-gradient-to-r from-green-500/30 to-blue-500/30 rounded-xl p-6 border-2 border-green-500/50">
                    <h4 className="text-xl font-bold text-green-400 mb-3">
                      ⚡ This Demo Changed 2,847+ Lives This Month
                    </h4>
                    <p className="text-gray-300 mb-4">
                      After watching this, users went on to generate over <span className="text-yellow-400 font-bold">$2.84 MILLION</span> in revenue
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-3 mx-auto"
                    >
                      <Play className="w-6 h-6" />
                      <span>Watch The Demo Now</span>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced CTA Buttons - AIDA Desire/Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-12"
          >
            <motion.button
              whileHover={{ 
                scale: 1.1, 
                boxShadow: "0 25px 50px rgba(255, 215, 0, 0.6)",
                rotateY: 5,
                y: -5
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="relative bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 px-20 py-10 rounded-3xl text-3xl font-black flex items-center space-x-6 shadow-2xl border-4 border-yellow-300 text-black overflow-hidden"
            >
              {/* Magical shimmer effect */}
              <motion.div
                animate={{ x: [-100, 100] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                style={{ width: "200%", height: "100%" }}
              />
              
              {/* Magical particles around button */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      y: [0, -20, 0],
                    }}
                    transition={{
                      duration: Math.random() * 2 + 1,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
              
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="relative z-10"
              >
                <Rocket className="w-10 h-10 animate-bounce" />
              </motion.div>
              <span className="relative z-10">START CREATING NOW</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="relative z-10"
              >
                <ArrowRight className="w-10 h-10" />
              </motion.div>
              
              {/* Enhanced pulsing ring effect */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 border-4 border-yellow-300 rounded-3xl"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 border-2 border-yellow-200 rounded-3xl"
              />
            </motion.button>
            
            <motion.div
              whileHover={{ scale: 1.05, rotateX: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="flex items-center space-x-6 text-gray-300 hover:text-white transition-colors bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl px-10 py-8 border-2 border-gray-500/50 shadow-xl">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl">
                    <Play className="w-12 h-12 ml-1 text-black" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 border-2 border-yellow-400 rounded-full"
                  />
              </div>
              <div className="text-left">
                  <div className="text-2xl font-bold">Watch Demo</div>
                  <div className="text-lg text-gray-400">See the magic in action</div>
                  <div className="text-sm text-yellow-400 font-bold">⚡ 2:47 min • 2.8M+ views</div>
              </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center items-center gap-8 mb-12 text-gray-400"
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-green-400" />
              <span className="text-lg font-semibold">30-Day Money Back</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-6 h-6 text-blue-400" />
              <span className="text-lg font-semibold">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-purple-400" />
              <span className="text-lg font-semibold">2,847+ Happy Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-6 h-6 text-yellow-400" />
              <span className="text-lg font-semibold">97.3% Success Rate</span>
            </div>
          </motion.div>

          {/* Magical Enhanced Urgency Timer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative bg-gradient-to-r from-red-600/30 to-orange-600/30 border-4 border-red-400/70 rounded-3xl p-10 backdrop-blur-sm max-w-4xl mx-auto shadow-2xl overflow-hidden"
          >
            {/* Magical animated background */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1], 
                opacity: [0.3, 0.6, 0.3],
                background: [
                  "radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.2) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.2) 0%, transparent 50%)",
                  "radial-gradient(circle at 50% 80%, rgba(239, 68, 68, 0.2) 0%, transparent 50%)",
                  "radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.2) 0%, transparent 50%)",
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl"
            />
            
            {/* Magical particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-red-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [0, -30, 0],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center space-x-4 mb-8">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Flame className="w-12 h-12 text-red-400" />
                </motion.div>
                <span className="text-red-400 font-black text-3xl animate-pulse">⚡ FLASH SALE: 70% OFF ⚡</span>
                <motion.div
                  animate={{ rotate: [360, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Flame className="w-12 h-12 text-red-400" />
                </motion.div>
            </div>
              
              <div className="text-center mb-6">
                <span className="text-yellow-400 font-black text-2xl">🎯 ENDS IN:</span>
              </div>
              
              <div className="flex justify-center space-x-8 text-4xl font-black">
              <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="bg-gradient-to-b from-red-800 to-red-600 rounded-2xl px-6 py-4 border-4 border-red-400 shadow-xl"
                  >
                    {String(timeLeft.hours).padStart(2, '0')}
                  </motion.div>
                  <div className="text-lg text-gray-300 mt-3 font-bold">HOURS</div>
              </div>
                <div className="text-red-400 text-5xl animate-pulse">:</div>
              <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                    className="bg-gradient-to-b from-red-800 to-red-600 rounded-2xl px-6 py-4 border-4 border-red-400 shadow-xl"
                  >
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </motion.div>
                  <div className="text-lg text-gray-300 mt-3 font-bold">MIN</div>
              </div>
                <div className="text-red-400 text-5xl animate-pulse">:</div>
              <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                    className="bg-gradient-to-b from-red-800 to-red-600 rounded-2xl px-6 py-4 border-4 border-red-400 shadow-xl"
                  >
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </motion.div>
                  <div className="text-lg text-gray-300 mt-3 font-bold">SEC</div>
              </div>
            </div>
              
              <div className="text-center mt-8 space-y-4">
                <div className="bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-2xl p-6 border-2 border-yellow-400/50">
                  <p className="text-yellow-400 font-black text-xl mb-2">
                    💥 PRICE GOES BACK TO $997 TOMORROW! 💥
                  </p>
                  <p className="text-gray-300 text-lg">
                    <span className="text-green-400 font-bold">Save $700+</span> today only - This offer will NEVER be repeated!
                  </p>
                </div>
                
                <div className="flex justify-center space-x-8 text-lg text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-6 h-6 text-purple-400" />
                    <span className="font-bold">+ FREE Bonus Worth $297</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    <span className="font-bold">+ Lifetime Updates</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center space-y-2"
          >
            <span className="text-gray-400 text-sm">Scroll to see more</span>
            <ChevronDown className="w-10 h-10 text-gray-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section - Social Proof */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              The Numbers Don't Lie
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              Join thousands of creators who are already building empires with Lekhika
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, label: 'Books Created', value: stats.booksCreated, suffix: '+', color: 'from-blue-500 to-cyan-500' },
              { icon: Users, label: 'Active Users', value: stats.usersActive, suffix: '+', color: 'from-green-500 to-emerald-500' },
              { icon: DollarSign, label: 'Revenue Generated', value: `$${(stats.revenueGenerated / 1000000).toFixed(1)}M`, suffix: '+', color: 'from-yellow-500 to-orange-500' },
              { icon: TrendingUp, label: 'Success Rate', value: stats.successRate, suffix: '%', color: 'from-purple-500 to-pink-500' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 text-center"
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-gray-400 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Story Section with Images - PASTOR Story */}
      <section className="py-24 px-4 bg-gradient-to-br from-red-900/30 via-purple-900/30 to-black backdrop-blur-sm relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-red-400/10 rounded-full -translate-x-48 -translate-y-48 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-400/10 to-pink-400/10 rounded-full translate-x-48 translate-y-48 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block bg-red-500/20 border-2 border-red-500/50 rounded-full px-8 py-4 mb-8">
              <span className="text-red-400 font-bold text-xl">🔥 BREAKING: The AI Revolution That Almost Didn't Happen 🔥</span>
            </div>
            <h2 className="text-7xl font-bold mb-8 bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              The Copywriter Who HATED AI
            </h2>
            <p className="text-3xl text-gray-300 max-w-5xl mx-auto font-bold">
              Until I discovered the secret that made me <span className="text-yellow-400">$2.84 MILLION</span> in 6 months...
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Story Timeline with Images */}
              <div className="space-y-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-3xl p-8 border-2 border-yellow-500/50 shadow-2xl relative overflow-hidden"
                >
                  {/* Background image placeholder */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full -translate-y-16 translate-x-16"></div>
                  
                  <div className="flex items-center space-x-3 mb-6">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity }}
                    >
                      <Crown className="w-10 h-10 text-yellow-400" />
                    </motion.div>
                    <span className="text-yellow-400 font-bold text-3xl">THE EMPIRE BUILDER</span>
                  </div>
                  
                  {/* Before/After Image Placeholder */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-600">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <div className="text-sm text-gray-400">Before AI</div>
                        <div className="text-xs text-red-400">$0 Revenue</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-4 border border-green-600">
                      <div className="text-center">
                        <div className="text-4xl mb-2">💰</div>
                        <div className="text-sm text-gray-400">After Lekhika</div>
                        <div className="text-xs text-green-400">$2.84M Revenue</div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-xl leading-relaxed">
                    <span className="text-yellow-400 font-bold text-2xl">Since 2009</span>, I've been the <span className="text-green-400 font-bold">secret weapon</span> behind some of the biggest marketing campaigns in history. 
                    I've made <span className="text-purple-400 font-bold">Fortune 500 companies</span> billions, helped startups raise <span className="text-red-400 font-bold">$500M+</span>, and built campaigns that generated <span className="text-yellow-400 font-bold">$2.8 BILLION</span> in revenue.
                  </p>
                  <div className="mt-6 p-6 bg-black/40 rounded-xl border border-yellow-400/30">
                    <p className="text-green-400 font-bold text-center text-lg">🏆 I WAS THE COPYWRITER EVERYONE WANTED TO HIRE</p>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-r from-red-500/30 to-pink-500/30 rounded-3xl p-8 border-2 border-red-500/50 shadow-2xl relative overflow-hidden"
                >
                  {/* Background elements */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full -translate-y-12 -translate-x-12"></div>
                  
                  <div className="flex items-center space-x-3 mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <X className="w-10 h-10 text-red-400" />
                    </motion.div>
                    <span className="text-red-400 font-bold text-3xl">THE AI HATER</span>
                </div>
                
                  {/* Frustration Visual */}
                  <div className="bg-gradient-to-r from-red-800/40 to-pink-800/40 rounded-2xl p-6 mb-6 border border-red-400/30">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="text-6xl animate-bounce">😤</div>
                      <div className="text-center">
                        <div className="text-red-400 font-bold text-lg">ChatGPT Launches</div>
                        <div className="text-gray-400 text-sm">"This is garbage!"</div>
                  </div>
                      <div className="text-6xl animate-bounce">💥</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-xl leading-relaxed">
                    When ChatGPT first dropped, I <span className="text-red-400 font-bold text-2xl">LAUGHED IN ITS FACE</span>. 
                    "This is garbage!" I screamed at my screen. "No AI will EVER replace human creativity!" 
                    I was <span className="text-yellow-400 font-bold">DEAD WRONG</span>... but only because I was thinking like everyone else.
                  </p>
                  <div className="mt-6 p-6 bg-black/40 rounded-xl border border-red-400/30">
                    <p className="text-red-400 font-bold text-center text-lg">💀 I ALMOST MISSED THE BIGGEST OPPORTUNITY OF MY LIFE</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-3xl p-8 border-2 border-green-500/50 shadow-2xl relative overflow-hidden"
                >
                  {/* Lightbulb background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-400/20 to-emerald-400/20 rounded-full -translate-y-16 translate-x-16"></div>
                  
                  <div className="flex items-center space-x-3 mb-6">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Lightbulb className="w-10 h-10 text-green-400" />
                    </motion.div>
                    <span className="text-green-400 font-bold text-3xl">THE BREAKTHROUGH</span>
                </div>

                  {/* Multi-AI Visual */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-center border border-blue-400">
                      <div className="text-3xl mb-2">🧠</div>
                      <div className="text-xs text-blue-300">Claude</div>
                      <div className="text-xs text-gray-400">Research</div>
                  </div>
                    <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 text-center border border-purple-400">
                      <div className="text-3xl mb-2">⚡</div>
                      <div className="text-xs text-purple-300">GPT-4</div>
                      <div className="text-xs text-gray-400">Creativity</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 text-center border border-green-400">
                      <div className="text-3xl mb-2">🚀</div>
                      <div className="text-xs text-green-300">Gemini</div>
                      <div className="text-xs text-gray-400">Speed</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-xl leading-relaxed">
                    Then I had the <span className="text-green-400 font-bold text-2xl">CRAZIEST IDEA</span>: 
                    What if I didn't use just ONE AI? What if I used <span className="text-purple-400 font-bold">MULTIPLE AIs working together</span>? 
                    Like having a team of genius writers, each with their own superpower. 
                    The result was <span className="text-yellow-400 font-bold">MIND-BLOWING</span>.
                  </p>
                  <div className="mt-6 p-6 bg-black/40 rounded-xl border border-green-400/30">
                    <p className="text-green-400 font-bold text-center text-lg">🚀 THIS CHANGED EVERYTHING FOREVER</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-3xl p-8 border-2 border-purple-500/50 shadow-2xl relative overflow-hidden"
                >
                  {/* Success visual elements */}
                  <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-yellow-400/20 to-purple-400/20 rounded-full -translate-y-14 -translate-x-14"></div>
                  
                  <div className="flex items-center space-x-3 mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Gem className="w-10 h-10 text-purple-400" />
                    </motion.div>
                    <span className="text-purple-400 font-bold text-3xl">THE GOLDMINE</span>
                </div>

                  {/* Revenue Timeline */}
                  <div className="bg-gradient-to-r from-yellow-500/20 to-purple-500/20 rounded-2xl p-6 mb-6 border border-yellow-400/30">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-yellow-400">Month 1</div>
                        <div className="text-sm text-gray-300">$50K</div>
                  </div>
                      <div>
                        <div className="text-2xl font-bold text-green-400">Month 3</div>
                        <div className="text-sm text-gray-300">$500K</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-400">Month 6</div>
                        <div className="text-sm text-gray-300">$2.84M</div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-xl leading-relaxed">
                    In <span className="text-purple-400 font-bold text-2xl">6 MONTHS</span>, I made <span className="text-yellow-400 font-bold">$2.84 MILLION</span> using this secret. 
                    My content was <span className="text-green-400 font-bold">10x better</span> than anything humans or single AIs could create. 
                    Now I'm sharing this <span className="text-red-400 font-bold">BILLION-DOLLAR SECRET</span> with you.
                  </p>
                  <div className="mt-6 p-6 bg-black/40 rounded-xl border border-purple-400/30">
                    <p className="text-purple-400 font-bold text-center text-lg">💰 YOUR TURN TO GET RICH</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative space-y-8"
            >
              {/* Main Secret Formula Card */}
              <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl border-4 border-yellow-400/50 relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-black px-6 py-2 rounded-full text-sm font-bold z-10">
                  🔥 SECRET FORMULA 🔥
                </div>
                
                <div className="bg-black/60 rounded-2xl p-8 backdrop-blur-sm relative z-10">
                  <div className="flex items-center space-x-4 mb-8">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity }}
                      className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
                    >
                      <Crown className="w-10 h-10 text-black" />
                    </motion.div>
                    <div>
                      <h3 className="text-3xl font-bold text-yellow-400">The Multi-AI Death Star</h3>
                      <p className="text-gray-400 text-lg">Why this destroys everything else</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {[
                      { icon: Brain, text: 'Claude\'s research depth (like having Einstein on your team)', color: 'text-blue-400', bg: 'bg-blue-500/20' },
                      { icon: Zap, text: 'GPT-4\'s creativity (like having Shakespeare + Jobs combined)', color: 'text-green-400', bg: 'bg-green-500/20' },
                      { icon: Zap, text: 'Gemini\'s speed (like having Usain Bolt writing for you)', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
                      { icon: Crown, text: 'My 15 years of expertise orchestrating it all', color: 'text-purple-400', bg: 'bg-purple-500/20' }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center space-x-4 p-4 rounded-xl ${item.bg} border border-white/10`}
                      >
                        <item.icon className={`w-10 h-10 ${item.color}`} />
                        <span className="text-lg font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-green-500/30 to-blue-500/30 rounded-xl border-2 border-green-500/50">
                    <p className="text-center font-bold text-green-400 text-xl">
                      🚀 RESULT: Content so good, people PAY ME $10K+ per piece! 🚀
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Screenshot Mockup */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border-2 border-gray-600/50 shadow-2xl"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400 text-sm ml-4">Lekhika Dashboard</span>
                </div>
                
                {/* Mock dashboard interface */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-400/30">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">AI Models Active</div>
                      <div className="text-lg font-bold text-green-400">3 Models</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Books Generated</div>
                      <div className="text-lg font-bold text-blue-400">2,847</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-sm text-gray-300 mb-2">🎯 Current Project: "The AI Revolution"</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full w-4/5"></div>
                      </div>
                      <span className="text-xs text-green-400">80% Complete</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <span className="text-yellow-400 font-bold text-sm">📱 Live Demo Interface</span>
              </div>
            </motion.div>

              {/* Success Metrics Visual */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-3xl p-6 border-2 border-green-400/50"
              >
                <h4 className="text-2xl font-bold text-green-400 mb-6 text-center">📊 The Proof is in the Numbers</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">10x</div>
                    <div className="text-sm text-gray-300">Better than single AI</div>
          </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">97.3%</div>
                    <div className="text-sm text-gray-300">Success rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">5 min</div>
                    <div className="text-sm text-gray-300">Per book</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">$2.84M</div>
                    <div className="text-sm text-gray-300">Revenue</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NICHE-SPECIFIC VALUE PROPOSITIONS */}
      <section className="py-24 px-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-sm relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              opacity: [0.6, 0.3, 0.6]
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-3 border-blue-400/70 rounded-full px-12 py-6 mb-8">
              <span className="text-blue-300 font-bold text-3xl">🎯 EVERY NICHE, EVERY PROFESSION</span>
            </div>
            <h2 className="text-8xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              WHO NEEDS <span className="text-white">LEKHIKA?</span>
            </h2>
            <p className="text-4xl text-gray-300 max-w-6xl mx-auto font-bold leading-relaxed">
              <span className="text-blue-400">EVERYONE!</span> From affiliate marketers to SEO experts, 
              <span className="text-purple-400"> Lekhika transforms your content game</span> regardless of your profession.
            </p>
          </motion.div>

          {/* Niche Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                niche: 'Affiliate Marketers',
                icon: '💰',
                problem: 'Spending hours hunting for the perfect bonus to promote products',
                solution: 'Create custom books in 30 minutes that perfectly complement any product',
                value: 'Never worry about finding bonuses again - create them instantly',
                example: 'Promoting a $297 course? Create a 50-page "Advanced Strategies Guide" as your bonus',
                color: 'green'
              },
              {
                niche: 'Email Marketers',
                icon: '📧',
                problem: 'Struggling to create valuable lead magnets and email content',
                solution: 'Generate complete email sequences, lead magnets, and follow-up content',
                value: 'Build massive email lists with high-value content that converts',
                example: 'Create a 30-page "Email Marketing Mastery" guide as your lead magnet',
                color: 'blue'
              },
              {
                niche: 'SEO Experts',
                icon: '🔍',
                problem: 'Need high-quality, long-form content for better rankings',
                solution: 'Generate comprehensive, SEO-optimized content that ranks',
                value: 'Dominate search results with content that both users and Google love',
                example: 'Create 100+ page pillar content that ranks #1 for competitive keywords',
                color: 'purple'
              },
              {
                niche: 'Course Creators',
                icon: '🎓',
                problem: 'Spending months creating course materials and workbooks',
                solution: 'Generate complete course content, workbooks, and supplementary materials',
                value: 'Launch courses 10x faster with professional-quality materials',
                example: 'Create a complete 200-page workbook for your $997 course in hours',
                color: 'orange'
              },
              {
                niche: 'Agency Owners',
                icon: '🏢',
                problem: 'Delivering consistent, high-quality content for multiple clients',
                solution: 'Scale content production without hiring more writers',
                value: 'Serve more clients with better content at lower costs',
                example: 'Deliver 20+ pieces of content per client per month without breaking a sweat',
                color: 'red'
              },
              {
                niche: 'Coaches & Consultants',
                icon: '💼',
                problem: 'Creating valuable resources and case studies for clients',
                solution: 'Generate case studies, guides, and resources that build authority',
                value: 'Establish yourself as the go-to expert with valuable content',
                example: 'Create detailed case studies and implementation guides for each client',
                color: 'teal'
              },
              {
                niche: 'E-commerce Sellers',
                icon: '🛒',
                problem: 'Need product descriptions, guides, and marketing content',
                solution: 'Create compelling product content and buyer guides',
                value: 'Increase conversions with better product descriptions and guides',
                example: 'Generate detailed product guides that turn browsers into buyers',
                color: 'pink'
              },
              {
                niche: 'SaaS Founders',
                icon: '💻',
                problem: 'Creating documentation, tutorials, and marketing content',
                solution: 'Generate comprehensive docs, tutorials, and content marketing materials',
                value: 'Reduce support tickets and increase user adoption with better content',
                example: 'Create complete user guides and marketing content for your SaaS',
                color: 'indigo'
              },
              {
                niche: 'Real Estate Agents',
                icon: '🏠',
                problem: 'Creating market reports, guides, and client materials',
                solution: 'Generate market reports, buyer guides, and client education materials',
                value: 'Stand out with valuable content that builds trust and authority',
                example: 'Create comprehensive market reports and buyer guides for your area',
                color: 'yellow'
              }
            ].map((niche, index) => (
              <motion.div
                key={niche.niche}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className={`bg-gradient-to-br from-${niche.color}-900/30 to-${niche.color}-800/20 border-2 border-${niche.color}-400/30 rounded-2xl p-8 hover:border-${niche.color}-400/60 transition-all duration-300 group`}
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{niche.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{niche.niche}</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                    <h4 className="text-red-300 font-bold text-sm mb-2">❌ THE PROBLEM:</h4>
                    <p className="text-gray-300 text-sm">{niche.problem}</p>
                  </div>

                  <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                    <h4 className="text-green-300 font-bold text-sm mb-2">✅ LEKHIKA SOLUTION:</h4>
                    <p className="text-gray-300 text-sm">{niche.solution}</p>
                  </div>

                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-bold text-sm mb-2">💎 THE VALUE:</h4>
                    <p className="text-gray-300 text-sm">{niche.value}</p>
                  </div>

                  <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
                    <h4 className="text-yellow-300 font-bold text-sm mb-2">🚀 REAL EXAMPLE:</h4>
                    <p className="text-gray-300 text-sm italic">{niche.example}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-purple-500/40 to-pink-500/40 border-4 border-purple-400/80 rounded-3xl p-12 max-w-5xl mx-auto">
              <h3 className="text-5xl font-bold text-purple-300 mb-6">
                🎯 NO MATTER YOUR PROFESSION...
              </h3>
              <p className="text-3xl text-white font-bold leading-relaxed mb-8">
                <span className="text-yellow-400">LEKHIKA GIVES YOU THE CONTENT EDGE</span>
                <br />
                <span className="text-green-400">THAT MAKES YOU UNSTOPPABLE</span>
                <br />
                <span className="text-blue-400">IN ANY NICHE, ANY MARKET</span>
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-6 rounded-2xl text-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl"
              >
                GET LEKHIKA NOW - DOMINATE YOUR NICHE! 🚀
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Competitor Comparison Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-gray-800/30 to-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-yellow-400/20 border-2 border-yellow-400/50 rounded-full px-8 py-4 mb-8">
              <span className="text-yellow-400 font-bold text-xl">🔥 THE COMPARISON THAT CHANGES EVERYTHING 🔥</span>
            </div>
            <h2 className="text-7xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              Why Lekhika <span className="text-red-400">DESTROYS</span> the Competition
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              See why thousands are switching from ChatGPT, Claude, and other tools to Lekhika every single day
            </p>
          </motion.div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-600/30 overflow-x-auto shadow-2xl relative">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-400/10 to-orange-400/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <table className="w-full relative z-10">
              <thead>
                <tr className="border-b border-gray-600/50">
                  <th className="text-left py-6 px-8 font-bold text-2xl text-gray-300">Feature</th>
                  <th className="text-center py-6 px-8">
                    <div className="flex flex-col items-center bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-2xl p-4 border border-yellow-400/50 relative overflow-hidden">
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse"></div>
                      <span className="font-bold text-2xl text-yellow-400 relative z-10">Lekhika</span>
                      <span className="text-sm text-yellow-400 font-bold relative z-10">🏆 CHAMPION</span>
                      <span className="text-xs text-gray-400 relative z-10">Multi-AI Power</span>
                      {/* Floating crown */}
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-2 -right-2 text-yellow-400"
                      >
                        👑
                      </motion.div>
                    </div>
                  </th>
                  <th className="text-center py-6 px-8 font-bold text-xl text-gray-400">
                    <div className="bg-gray-700/50 rounded-xl p-3">
                      <span>ChatGPT</span>
                      <div className="text-xs text-gray-500 mt-1">Single AI</div>
                    </div>
                  </th>
                  <th className="text-center py-6 px-8 font-bold text-xl text-gray-400">
                    <div className="bg-gray-700/50 rounded-xl p-3">
                      <span>Claude</span>
                      <div className="text-xs text-gray-500 mt-1">Single AI</div>
                    </div>
                  </th>
                  <th className="text-center py-6 px-8 font-bold text-xl text-gray-400">
                    <div className="bg-gray-700/50 rounded-xl p-3">
                      <span>Jasper</span>
                      <div className="text-xs text-gray-500 mt-1">Limited</div>
                    </div>
                  </th>
                  <th className="text-center py-6 px-8 font-bold text-xl text-gray-400">
                    <div className="bg-gray-700/50 rounded-xl p-3">
                      <span>Copy.ai</span>
                      <div className="text-xs text-gray-500 mt-1">Basic</div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {competitorComparison.map((row, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-all"
                  >
                    <td className="py-6 px-8 font-medium text-xl text-gray-200">{row.feature}</td>
                    <td className="text-center py-6 px-8">
                      {row.lekhika ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                          <span className="text-xs text-yellow-400 font-bold">EXCELLENT</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <X className="w-10 h-10 text-red-400 mx-auto mb-2" />
                          <span className="text-xs text-red-400 font-bold">NONE</span>
                        </div>
                      )}
                    </td>
                    <td className="text-center py-6 px-8">
                      {row.chatgpt ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-xs text-gray-400">BASIC</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
                          <span className="text-xs text-red-400">NO</span>
                        </div>
                      )}
                    </td>
                    <td className="text-center py-6 px-8">
                      {row.claude ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-xs text-gray-400">BASIC</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
                          <span className="text-xs text-red-400">NO</span>
                        </div>
                      )}
                    </td>
                    <td className="text-center py-6 px-8">
                      {row.jasper ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-xs text-gray-400">LIMITED</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
                          <span className="text-xs text-red-400">NO</span>
                        </div>
                      )}
                    </td>
                    <td className="text-center py-6 px-8">
                      {row.copyai ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-xs text-gray-400">LIMITED</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
                          <span className="text-xs text-red-400">NO</span>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 rounded-3xl p-12 border border-yellow-400/50 max-w-5xl mx-auto">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Crown className="w-12 h-12 text-yellow-400" />
                <h3 className="text-4xl font-bold text-yellow-400">THE UNDISPUTED CHAMPION</h3>
                <Crown className="w-12 h-12 text-yellow-400" />
              </div>
              <p className="text-2xl text-gray-300 mb-6">
                While others give you basic AI responses, Lekhika gives you <span className="text-yellow-400 font-bold">complete content ecosystems</span>.
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600/30">
                  <h4 className="text-xl font-bold text-yellow-400 mb-3">🏆 WIN RATE</h4>
                  <p className="text-3xl font-bold text-white">100%</p>
                  <p className="text-gray-400">Lekhika beats ALL competitors</p>
                </div>
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600/30">
                  <h4 className="text-xl font-bold text-yellow-400 mb-3">⚡ SPEED</h4>
                  <p className="text-3xl font-bold text-white">10x</p>
                  <p className="text-gray-400">Faster than single AI tools</p>
                </div>
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600/30">
                  <h4 className="text-xl font-bold text-yellow-400 mb-3">💎 QUALITY</h4>
                  <p className="text-3xl font-bold text-white">97.3%</p>
                  <p className="text-gray-400">Success rate guaranteed</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Recent Purchases - Social Proof */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-3xl p-10 border-2 border-green-400/30 shadow-2xl"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                </motion.div>
                <span className="text-green-400 font-black text-3xl">🔥 LIVE PURCHASE ACTIVITY 🔥</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [360, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                </motion.div>
            </div>
            
              <h2 className="text-4xl font-bold text-white mb-4">
                Join <span className="text-green-400">2,847+</span> Creators Who Already Made <span className="text-yellow-400">$2.84M+</span>
              </h2>
              <p className="text-xl text-gray-300">
                Real people, real results, real time
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6 mb-12">
              <AnimatePresence>
                {recentPurchases.map((purchase, index) => (
                  <motion.div
                    key={`${purchase.name}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05, rotateY: 5 }}
                    className="bg-gradient-to-br from-green-500/30 to-blue-500/30 rounded-2xl p-6 border-2 border-green-400/40 hover:border-yellow-400/60 transition-all shadow-xl backdrop-blur-sm"
                  >
                    <div className="flex flex-col items-center space-y-3 text-center">
                      <div className="text-4xl animate-bounce">{purchase.avatar}</div>
                      <div>
                        <div className="font-bold text-lg text-white">{purchase.name}</div>
                        <div className="text-sm text-gray-300">{purchase.location}</div>
                        <div className="text-sm text-green-400 font-bold bg-green-500/20 rounded-full px-3 py-1 mt-1">
                          {purchase.plan} Plan
                        </div>
                        <div className="text-sm text-yellow-400 font-bold">{purchase.time}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Success Metrics */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30 text-center"
              >
                <div className="text-4xl font-bold text-purple-400 mb-2">$2.84M+</div>
                <div className="text-lg text-gray-300">Revenue Generated</div>
                <div className="text-sm text-purple-400 font-bold">By Our Users</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-400/30 text-center"
              >
                <div className="text-4xl font-bold text-yellow-400 mb-2">2,847+</div>
                <div className="text-lg text-gray-300">Books Created</div>
                <div className="text-sm text-yellow-400 font-bold">This Month</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30 text-center"
              >
                <div className="text-4xl font-bold text-green-400 mb-2">97.3%</div>
                <div className="text-lg text-gray-300">Success Rate</div>
                <div className="text-sm text-green-400 font-bold">Guaranteed</div>
              </motion.div>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500/30 to-blue-500/30 rounded-2xl p-8 border-2 border-green-400/50">
                <p className="text-green-400 font-bold text-2xl mb-4">
                ⚡ {stats.usersActive.toLocaleString()}+ creators joined this week alone! ⚡
              </p>
                <p className="text-gray-300 text-lg">
                  Don't be left behind - Join the content revolution now!
              </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* PLR/MRR KILLER SECTION */}
      <section className="py-24 px-4 bg-gradient-to-r from-red-900/50 via-orange-900/50 to-yellow-900/50 backdrop-blur-sm relative overflow-hidden">
        {/* Revolutionary background effects */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0] 
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block bg-gradient-to-r from-red-500/30 to-orange-500/30 border-3 border-red-400/70 rounded-full px-12 py-6 mb-8">
              <span className="text-red-300 font-bold text-2xl">💀 PLR/MRR IS DEAD 💀</span>
            </div>
            <h2 className="text-8xl font-bold mb-8 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              THE <span className="text-white">REVOLUTION</span> IS HERE
            </h2>
            <p className="text-4xl text-gray-300 max-w-6xl mx-auto font-bold leading-relaxed">
              <span className="text-red-400">GONE ARE THE DAYS</span> when you had to pay $100/month for PLR/MRR ebooks to read, sell, giveaway... 
              <br /><br />
              <span className="text-yellow-400">TODAY</span> you don't have to find anything. 
              <span className="text-orange-400">Whatever pops up in your mind</span> becomes 
              <span className="text-white font-extrabold"> YOUR OWN BOOK</span> in the next 30 minutes.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className="text-6xl font-bold mb-8 text-red-400 text-center">
                💀 THE OLD WAY IS DEAD:
              </h3>

          <div className="space-y-6">
                {[
                  {
                    icon: '💸',
                    title: 'PAY $100/MONTH FOR PLR',
                    description: 'Spending hundreds on generic, outdated PLR content that everyone else has access to. No uniqueness, no originality, no competitive advantage.',
                    problem: true
                  },
                  {
                    icon: '🔍',
                    title: 'SEARCH FOR HOURS',
                    description: 'Wasting time hunting for the right PLR content, only to find it\'s already been used by thousands of others. No exclusivity, no uniqueness.',
                    problem: true
                  },
                  {
                    icon: '📚',
                    title: 'GENERIC CONTENT',
                    description: 'Using the same boring PLR templates that everyone else uses. Your content looks like everyone else\'s - no brand differentiation.',
                    problem: true
                  },
                  {
                    icon: '⏰',
                    title: 'WASTE TIME CUSTOMIZING',
                    description: 'Spending hours trying to make generic PLR content fit your needs. Still looks generic and unprofessional in the end.',
                    problem: true
                  },
                  {
                    icon: '💔',
                    title: 'NO OWNERSHIP',
                    description: 'You don\'t own the content. You can\'t claim it as yours. You can\'t build a brand around generic PLR content.',
                    problem: true
                  }
                ].map((problem, index) => (
              <motion.div
                key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-red-500/30 to-pink-500/30 border-2 border-red-400/60 rounded-2xl p-6 shadow-2xl"
                  >
                    <div className="flex items-start space-x-4">
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        className="text-5xl flex-shrink-0"
                      >
                        {problem.icon}
                      </motion.div>
                      <div>
                        <h4 className="text-2xl font-bold mb-3 text-red-300">
                          {problem.title}
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-lg">
                          {problem.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className="text-6xl font-bold mb-8 text-green-400 text-center">
                🚀 THE NEW REVOLUTION:
              </h3>
              
              <div className="space-y-6">
                {[
                  {
                    icon: '💡',
                    title: 'ANY IDEA = YOUR BOOK',
                    description: 'Whatever pops up in your mind becomes YOUR OWN BOOK in 30 minutes. No searching, no buying, no generic content.',
                    revolutionary: true
                  },
                  {
                    icon: '⚡',
                    title: '30 MINUTES TO PUBLISH',
                    description: 'From idea to complete, professional book in 30 minutes. No waiting, no delays, no frustration.',
                    revolutionary: true
                  },
                  {
                    icon: '👑',
                    title: '100% YOUR CONTENT',
                    description: 'You own it completely. No one else has access to it. Build your brand around YOUR unique content.',
                    revolutionary: true
                  },
                  {
                    icon: '🎯',
                    title: 'FACT-CHECKED & VERIFIED',
                    description: 'Every word is fact-checked using our proprietary algorithm. No AI hallucinations, no false information.',
                    revolutionary: true
                  },
                  {
                    icon: '🔥',
                    title: 'AI DETECTION IMMUNE',
                    description: 'Your content passes ALL AI detection tools. It\'s so good, no one will know AI created it.',
                    revolutionary: true
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-green-500/30 to-blue-500/30 border-2 border-green-400/60 rounded-2xl p-6 shadow-2xl relative"
                  >
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-blue-400 text-black px-4 py-2 rounded-full text-sm font-bold">
                      🔥 REVOLUTIONARY
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 360]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                        className="text-5xl flex-shrink-0"
                      >
                        {feature.icon}
                      </motion.div>
                      <div>
                        <h4 className="text-2xl font-bold mb-3 text-green-300">
                          {feature.title}
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-lg">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Revolutionary Comparison */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-3 border-yellow-400/70 rounded-3xl p-8 text-center"
              >
                <h4 className="text-4xl font-bold text-yellow-300 mb-6">
                  🏆 THE REVOLUTION IS CLEAR
                </h4>
                <div className="grid grid-cols-2 gap-8 text-2xl">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-red-400 mb-3">$100/MONTH</div>
                    <div className="text-gray-400">Old PLR Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-green-400 mb-3">$0</div>
                    <div className="text-gray-400">Your Own Books</div>
                  </div>
                </div>
                <p className="text-2xl text-white font-bold mt-6">
                  <span className="text-red-400">STOP PAYING</span> for generic content. 
                  <span className="text-green-400">START CREATING</span> your own unique books in 30 minutes.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MONTHLY INCOME STREAM SECTION */}
      <section className="py-24 px-4 bg-gradient-to-r from-green-900/50 via-blue-900/50 to-purple-900/50 backdrop-blur-sm relative overflow-hidden">
        {/* Money-making background effects */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 5, 0] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block bg-gradient-to-r from-green-500/30 to-blue-500/30 border-3 border-green-400/70 rounded-full px-12 py-6 mb-8">
              <span className="text-green-300 font-bold text-2xl">💰 MONTHLY INCOME STREAM 💰</span>
            </div>
            <h2 className="text-8xl font-bold mb-8 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              BUILD YOUR <span className="text-white">DAILY BOOK FACTORY</span>
            </h2>
            <p className="text-4xl text-gray-300 max-w-6xl mx-auto font-bold leading-relaxed">
              <span className="text-green-400">CRANK OUT ONE BOOK A DAY</span> in whichever topic you want and add to your 
              <span className="text-blue-400"> membership site</span> that people would 
              <span className="text-yellow-400 font-extrabold"> happily pay</span> to get so much resource for cheap.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className="text-6xl font-bold mb-8 text-green-400 text-center">
                🏭 THE DAILY BOOK FACTORY:
              </h3>
              
              <div className="space-y-6">
                {[
                  {
                    icon: '📚',
                    title: '1 BOOK EVERY SINGLE DAY',
                    description: '30 books per month. 365 books per year. Your membership site becomes the ultimate resource library that no one can compete with.',
                    income: true
                  },
                  {
                    icon: '🎯',
                    title: 'ANY TOPIC YOU WANT',
                    description: 'Fitness, business, cooking, parenting, technology, relationships - whatever your audience wants, you create it in 30 minutes.',
                    income: true
                  },
                  {
                    icon: '👥',
                    title: 'MEMBERSHIP GOLDMINE',
                    description: 'People will gladly pay $47-97/month for access to 30+ new books every month. That\'s incredible value they can\'t get anywhere else.',
                    income: true
                  },
                  {
                    icon: '⚡',
                    title: '30 MINUTES = $1000+',
                    description: 'Spend 30 minutes creating a book, add it to your membership site, and watch your recurring revenue explode month after month.',
                    income: true
                  },
                  {
                    icon: '🔥',
                    title: 'COMPETITIVE MOAT',
                    description: 'No one can compete with someone who adds 30 new books to their membership site every month. You become the go-to resource.',
                    income: true
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-green-500/30 to-blue-500/30 border-2 border-green-400/60 rounded-2xl p-6 shadow-2xl relative"
                  >
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-blue-400 text-black px-4 py-2 rounded-full text-sm font-bold">
                      💰 INCOME
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 360]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                        className="text-5xl flex-shrink-0"
                      >
                        {feature.icon}
                  </motion.div>
                      <div>
                        <h4 className="text-2xl font-bold mb-3 text-green-300">
                          {feature.title}
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-lg">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

                    <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className="text-6xl font-bold mb-8 text-blue-400 text-center">
                💵 INCOME PROJECTIONS:
              </h3>
              
              <div className="space-y-6">
                {[
                  {
                    icon: '📊',
                    title: '30 BOOKS/MONTH',
                    description: '1 book per day = 30 books added to your membership site every single month. Unprecedented value.',
                    projection: true
                  },
                  {
                    icon: '💎',
                    title: '$47/MONTH MEMBERSHIP',
                    description: 'With 30+ new books monthly, you can easily charge $47-97/month. People will pay for this incredible value.',
                    projection: true
                  },
                  {
                    icon: '👥',
                    title: '500 MEMBERS = $23,500/MONTH',
                    description: 'Just 500 paying members at $47/month = $23,500 monthly recurring revenue. That\'s $282,000 per year!',
                    projection: true
                  },
                  {
                    icon: '🚀',
                    title: '1000 MEMBERS = $47,000/MONTH',
                    description: 'Scale to 1000 members = $47,000 monthly = $564,000 annually. All from 30 minutes of work per day.',
                    projection: true
                  },
                  {
                    icon: '🎯',
                    title: 'ZERO COMPETITION',
                    description: 'No one else can create 30 books per month. You become the only game in town for comprehensive topic coverage.',
                    projection: true
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-2 border-blue-400/60 rounded-2xl p-6 shadow-2xl relative"
                  >
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-400 to-purple-400 text-black px-4 py-2 rounded-full text-sm font-bold">
                      💵 PROJECTION
                      </div>
                    
                    <div className="flex items-start space-x-4">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 4, repeat: Infinity, delay: index * 0.4 }}
                        className="text-5xl flex-shrink-0"
                      >
                        {feature.icon}
                    </motion.div>
                      <div>
                        <h4 className="text-2xl font-bold mb-3 text-blue-300">
                          {feature.title}
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-lg">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Income Calculator */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-3 border-yellow-400/70 rounded-3xl p-8 text-center"
              >
                <h4 className="text-4xl font-bold text-yellow-300 mb-6">
                  💰 MONTHLY INCOME CALCULATOR
                </h4>
                <div className="grid grid-cols-3 gap-6 text-2xl mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-green-400 mb-2">30</div>
                    <div className="text-gray-400">Books/Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-400 mb-2">500</div>
                    <div className="text-gray-400">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-yellow-400 mb-2">$47</div>
                    <div className="text-gray-400">Monthly Fee</div>
                  </div>
                </div>
                <div className="text-6xl font-bold text-white mb-4">
                  $23,500/MONTH
                </div>
                <div className="text-4xl font-bold text-green-400">
                  $282,000/YEAR
                </div>
                <p className="text-xl text-gray-300 mt-4">
                  All from <span className="text-yellow-400 font-bold">30 minutes per day</span> creating books with Lekhika!
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* EXCLUSIVE FEATURES - What No Other Bitch Gives */}
      <section className="py-24 px-4 bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-red-900/40 backdrop-blur-sm relative overflow-hidden">
        {/* Magical background elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-400/50 rounded-full px-8 py-4 mb-8">
              <span className="text-red-400 font-bold text-xl">🔥 EXCLUSIVE: What NO Other Bitch Gives 🔥</span>
            </div>
            <h2 className="text-7xl font-bold mb-8 bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              The <span className="text-white">REVOLUTIONARY</span> Features
            </h2>
            <p className="text-3xl text-gray-300 max-w-5xl mx-auto font-bold">
              While others give you basic AI responses, <span className="text-yellow-400">WE GIVE YOU THE FUTURE</span>
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className="text-5xl font-bold mb-8 text-yellow-400 text-center">
                🚀 EXCLUSIVE FEATURES:
              </h3>
              <div className="space-y-6">
                {[
                  {
                    icon: '🔍',
                    title: 'PROPRIETARY FACT-CHECKING ALGORITHM',
                    description: 'For Non-Fiction Books: Our system doesn\'t just find info - it FACT-CHECKS every single word using our proprietary algorithm and prompts, ensuring every claim is backed by actual facts. NO other AI does this.',
                    exclusive: true
                  },
                  {
                    icon: '🧠',
                    title: 'UNLIMITED AI PROVIDER SYSTEM',
                    description: 'Support for UNLIMITED AI providers - I usually use 2-5 LLMs and various models working in perfect harmony. Claude, GPT-4, Gemini, plus any other AI you want. Orchestrated by our 15-year copywriting expertise.',
                    exclusive: true
                  },
                  {
                    icon: '⚡',
                    title: 'REAL-TIME QUALITY SCORING',
                    description: 'Every piece of content gets a quality score in real-time. We tell you EXACTLY how good your content is before you even finish.',
                    exclusive: true
                  },
                  {
                    icon: '🎯',
                    title: 'AI DETECTION IMMUNITY',
                    description: 'Advanced algorithms ensure your content passes ALL AI detection tools. We guarantee 100% human-like quality or your money back.',
                    exclusive: true
                  },
                  {
                    icon: '📚',
                    title: 'COMPLETE BOOK ECOSYSTEM',
                    description: 'Not just writing - formatting, SEO optimization, plagiarism checking, and publishing-ready exports. Everything in one place.',
                    exclusive: true
                  },
                  {
                    icon: '💎',
                    title: 'PERSONALIZED AI TRAINING',
                    description: 'Our AI learns YOUR writing style and preferences. Every book gets better than the last because it\'s trained on YOUR success patterns.',
                    exclusive: true
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`relative p-6 rounded-2xl border-2 ${
                      feature.exclusive 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50 shadow-2xl' 
                        : 'bg-gray-800/50 border-gray-600/30'
                    }`}
                  >
                    {feature.exclusive && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                        🔥 EXCLUSIVE
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        className="text-4xl flex-shrink-0"
                      >
                        {feature.icon}
                      </motion.div>
                      <div>
                        <h4 className={`text-xl font-bold mb-2 ${
                          feature.exclusive ? 'text-yellow-400' : 'text-white'
                        }`}>
                          {feature.title}
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
              </motion.div>
            ))}
          </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className="text-5xl font-bold mb-8 text-red-400 text-center">
                💀 What Others Give You:
              </h3>
              
              <div className="space-y-6">
                {[
                  {
                    icon: '❌',
                    title: 'BASIC AI RESPONSES',
                    description: 'Single AI giving you generic, unverified content that sounds like every other AI-generated piece.',
                    problem: true
                  },
                  {
                    icon: '❌',
                    title: 'NO FACT CHECKING',
                    description: 'They just make stuff up and hope it\'s right. No verification, no fact-checking, no guarantees.',
                    problem: true
                  },
                  {
                    icon: '❌',
                    title: 'GENERIC TEMPLATES',
                    description: 'Same boring templates everyone uses. No personalization, no learning, no improvement over time.',
                    problem: true
                  },
                  {
                    icon: '❌',
                    title: 'AI DETECTION VULNERABLE',
                    description: 'Your content gets flagged as AI-generated, destroying your credibility and authority.',
                    problem: true
                  },
                  {
                    icon: '❌',
                    title: 'FRAGMENTED WORKFLOW',
                    description: 'Write here, format there, check somewhere else. Multiple tools, multiple subscriptions, multiple headaches.',
                    problem: true
                  },
                  {
                    icon: '❌',
                    title: 'NO QUALITY GUARANTEE',
                    description: 'No idea if your content is good until after you\'ve wasted time and money on it.',
                    problem: true
                  }
                ].map((problem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-400/50 rounded-2xl p-6 shadow-xl"
                  >
                    <div className="flex items-start space-x-4">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        className="text-4xl flex-shrink-0"
                      >
                        {problem.icon}
                      </motion.div>
                      <div>
                        <h4 className="text-xl font-bold mb-2 text-red-400">
                          {problem.title}
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          {problem.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Comparison Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
                className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-400/50 rounded-3xl p-8 text-center"
              >
                <h4 className="text-3xl font-bold text-green-400 mb-4">
                  🏆 THE DIFFERENCE IS CLEAR
                </h4>
                <p className="text-xl text-gray-300 mb-6">
                  While others give you <span className="text-red-400 font-bold">basic AI responses</span>, 
                  we give you <span className="text-yellow-400 font-bold">REVOLUTIONARY TECHNOLOGY</span>
                </p>
                <div className="grid grid-cols-2 gap-6 text-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-400 mb-2">0</div>
                    <div className="text-gray-400">Fact-Checking Others Do</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">100%</div>
                    <div className="text-gray-400">Fact-Checking We Do</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BRUTAL HONESTY - Why We're Different from Copy.ai & Others */}
      <section className="py-24 px-4 bg-gradient-to-r from-gray-900/60 via-black/60 to-gray-900/60 backdrop-blur-sm relative overflow-hidden">
        {/* Honest background effects */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1] 
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              opacity: [0.6, 0.3, 0.6],
              scale: [1.1, 1, 1.1] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-400/50 rounded-full px-10 py-4 mb-8">
              <span className="text-blue-300 font-bold text-xl">💯 BRUTAL HONESTY 💯</span>
            </div>
            <h2 className="text-7xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Why We're <span className="text-white">DIFFERENT</span> from Copy.ai & Others
            </h2>
            <p className="text-3xl text-gray-300 max-w-5xl mx-auto font-bold">
              We're going to <span className="text-red-400">BARE EVERYTHING</span> - our <span className="text-green-400">MASSIVE STRENGTHS</span> and <span className="text-yellow-400">HONEST SHORTCOMINGS</span>
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* OUR MASSIVE STRENGTHS */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className="text-5xl font-bold mb-8 text-green-400 text-center">
                🚀 OUR MASSIVE STRENGTHS:
              </h3>
              
              <div className="space-y-6">
                {[
                  {
                    icon: '🔥',
                    title: 'COMPLETE BOOKS IN 30 MINUTES',
                    description: 'Copy.ai gives you blog posts. We give you COMPLETE, PROFESSIONAL BOOKS. That\'s like comparing a bicycle to a Ferrari.',
                    strength: true
                  },
                  {
                    icon: '🧠',
                    title: 'UNLIMITED AI PROVIDERS',
                    description: 'Copy.ai uses ONE AI model. We support UNLIMITED AI providers - I usually use 2-5 LLMs and various models working together. Claude for research, GPT-4 for creativity, Gemini for speed, plus any other AI you want. It\'s like having an entire AI publishing army vs. one writer.',
                    strength: true
                  },
                  {
                    icon: '🔍',
                    title: 'PROPRIETARY FACT-CHECKING',
                    description: 'Copy.ai makes stuff up. We FACT-CHECK every single word using our proprietary algorithm. Your non-fiction books are 100% accurate.',
                    strength: true
                  },
                  {
                    icon: '📚',
                    title: 'PUBLISHING-READY EXPORTS',
                    description: 'Copy.ai gives you text. We give you PDF, EPUB, DOCX - ready for Amazon, Apple Books, Google Play. Complete publishing ecosystem.',
                    strength: true
                  },
                  {
                    icon: '🎯',
                    title: 'AI DETECTION IMMUNITY',
                    description: 'Copy.ai content gets flagged as AI. Ours passes ALL detection tools. Your content looks 100% human-written.',
                    strength: true
                  },
                  {
                    icon: '💎',
                    title: 'PERSONALIZED AI TRAINING',
                    description: 'Copy.ai is generic. Our AI learns YOUR writing style and gets better with every book. It\'s like having a personal ghostwriter.',
                    strength: true
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-400/50 rounded-2xl p-6 shadow-2xl relative"
                  >
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-blue-400 text-black px-4 py-2 rounded-full text-sm font-bold">
                      💪 STRENGTH
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 360]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                        className="text-4xl flex-shrink-0"
                      >
                        {feature.icon}
                      </motion.div>
                      <div>
                        <h4 className="text-xl font-bold mb-2 text-green-300">
                          {feature.title}
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* HONEST SHORTCOMINGS & COMPARISON */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className="text-5xl font-bold mb-8 text-yellow-400 text-center">
                ⚠️ HONEST SHORTCOMINGS:
              </h3>
              
              <div className="space-y-6">
                {[
                  {
                    icon: '⏱️',
                    title: 'NOT FOR QUICK BLOG POSTS',
                    description: 'If you just need a 500-word blog post, Copy.ai is faster. We\'re built for COMPLETE BOOKS, not quick content.',
                    shortcoming: true
                  },
                  {
                    icon: '💰',
                    title: 'HIGHER PRICE POINT',
                    description: 'We\'re more expensive than Copy.ai because we deliver COMPLETE BOOKS, not just snippets. You get what you pay for.',
                    shortcoming: true
                  },
                  {
                    icon: '🎓',
                    title: 'LEARNING CURVE',
                    description: 'Copy.ai is simpler to use. We have more features because we do MORE. Takes 5 minutes to learn, but worth it.',
                    shortcoming: true
                  },
                  {
                    icon: '🔧',
                    title: 'MORE COMPLEX SYSTEM',
                    description: 'We have multiple AI models, fact-checking, publishing tools. It\'s more complex because we deliver more value.',
                    shortcoming: true
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-2xl p-6 shadow-2xl relative"
                  >
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-2 rounded-full text-sm font-bold">
                      ⚠️ HONEST
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        className="text-4xl flex-shrink-0"
                      >
                        {item.icon}
                      </motion.div>
                      <div>
                        <h4 className="text-xl font-bold mb-2 text-yellow-300">
                          {item.title}
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* BRUTAL COMPARISON TABLE */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-gray-800/50 to-black/50 border-2 border-gray-600/50 rounded-3xl p-8"
              >
                <h4 className="text-3xl font-bold text-white mb-6 text-center">
                  💀 BRUTAL COMPARISON TABLE
                </h4>
                <div className="space-y-4">
                  {[
                    {
                      feature: 'Complete Books (30+ pages)',
                      copyai: '❌ No',
                      lekhika: '✅ Yes - in 30 minutes'
                    },
                    {
                      feature: 'Fact-Checking',
                      copyai: '❌ No - makes stuff up',
                      lekhika: '✅ Yes - proprietary algorithm'
                    },
                    {
                      feature: 'Multi-AI Models',
                      copyai: '❌ Single model',
                      lekhika: '✅ 3 models working together'
                    },
                    {
                      feature: 'Publishing-Ready Files',
                      copyai: '❌ Just text',
                      lekhika: '✅ PDF, EPUB, DOCX'
                    },
                    {
                      feature: 'AI Detection Immunity',
                      copyai: '❌ Gets flagged',
                      lekhika: '✅ Passes all tests'
                    },
                    {
                      feature: 'Personalized Training',
                      copyai: '❌ Generic responses',
                      lekhika: '✅ Learns your style'
                    },
                    {
                      feature: 'Price for Book Creation',
                      copyai: '❌ Not possible',
                      lekhika: '✅ One-time purchase'
                    }
                  ].map((row, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="grid grid-cols-3 gap-4 p-4 bg-gray-800/30 rounded-xl"
                    >
                      <div className="font-bold text-gray-300">{row.feature}</div>
                      <div className="text-center text-red-400 font-bold">{row.copyai}</div>
                      <div className="text-center text-green-400 font-bold">{row.lekhika}</div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-r from-red-500/20 to-green-500/20 border-2 border-gray-400/50 rounded-2xl text-center">
                  <p className="text-2xl text-white font-bold">
                    <span className="text-red-400">COPY.AI:</span> Good for quick blog posts
                    <br />
                    <span className="text-green-400">LEKHIKA:</span> The ONLY solution for complete, professional books
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 15 YEARS OF MARKET EXPERIENCE - UNDISPUTABLE ADVANTAGES */}
      <section className="py-24 px-4 bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-blue-900/50 backdrop-blur-sm relative overflow-hidden">
        {/* Experience background effects */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1] 
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/3 left-1/3 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-indigo-500/15 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1.2, 1, 1.2] 
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border-3 border-purple-400/70 rounded-full px-12 py-6 mb-8">
              <span className="text-purple-300 font-bold text-2xl">🏆 15 YEARS OF MARKET MASTERY 🏆</span>
            </div>
            <h2 className="text-8xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              THE <span className="text-white">UNDISPUTABLE</span> ADVANTAGES
            </h2>
            <p className="text-4xl text-gray-300 max-w-6xl mx-auto font-bold leading-relaxed">
              My algorithm can't be replaced because it's my <span className="text-purple-400 font-extrabold">15 YEARS OF MARKET EXPERIENCE</span> and knowledge of 
              <span className="text-indigo-400"> what works and what doesn't</span>. Here are the <span className="text-blue-400">HARD-HITTING UNDISPUTABLE ITEMS</span> that justify everything we do.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className="text-5xl font-bold mb-8 text-purple-400 text-center">
                🧠 15 YEARS OF MARKET INTELLIGENCE:
              </h3>
              
              <div className="space-y-6">
                {[
                  {
                    icon: '🎯',
                    title: 'PROVEN CONVERSION ALGORITHMS',
                    description: '15 years of testing what converts vs. what doesn\'t. My algorithms are built on REAL market data, not theoretical AI responses. Every prompt is battle-tested.',
                    experience: true
                  },
                  {
                    icon: '📈',
                    title: 'MARKET TREND PREDICTION',
                    description: 'I know what topics will be hot 6 months from now. My AI doesn\'t just write - it writes what the market WILL WANT, not what it wants today.',
                    experience: true
                  },
                  {
                    icon: '💰',
                    title: 'REVENUE-OPTIMIZED STRUCTURE',
                    description: 'Every book structure I create is designed to maximize revenue potential. Chapter flow, topic selection, call-to-actions - all optimized from 15 years of data.',
                    experience: true
                  },
                  {
                    icon: '🔥',
                    title: 'VIRAL CONTENT FORMULAS',
                    description: 'I know exactly what makes content go viral. My AI doesn\'t guess - it implements proven viral formulas that I\'ve refined over 15 years.',
                    experience: true
                  },
                  {
                    icon: '🎨',
                    title: 'AUDIENCE PSYCHOLOGY MASTERY',
                    description: 'I understand buyer psychology at a deep level. My AI doesn\'t just write words - it triggers the exact psychological responses that drive sales.',
                    experience: true
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-2 border-purple-400/50 rounded-2xl p-6 shadow-2xl relative"
                  >
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-400 to-indigo-400 text-white px-4 py-2 rounded-full text-sm font-bold">
                      🏆 EXPERIENCE
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 360]
                        }}
                        transition={{ duration: 4, repeat: Infinity, delay: index * 0.4 }}
                        className="text-4xl flex-shrink-0"
                      >
                        {feature.icon}
                      </motion.div>
                      <div>
                        <h4 className="text-xl font-bold mb-2 text-purple-300">
                          {feature.title}
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className="text-5xl font-bold mb-8 text-indigo-400 text-center">
                ⚡ HARD-HITTING UNDISPUTABLE ITEMS:
              </h3>
              
              <div className="space-y-6">
                {[
                  {
                    icon: '🚀',
                    title: 'BATTLE-TESTED PROMPT ENGINEERING',
                    description: 'Every prompt has been refined through thousands of real-world tests. My AI doesn\'t use generic prompts - it uses prompts that have generated MILLIONS in revenue.',
                    undisputable: true
                  },
                  {
                    icon: '🎪',
                    title: 'PROVEN HOOK FORMULAS',
                    description: 'I know exactly what hooks work in every niche. My AI opens every book with hooks that have been proven to grab attention and keep readers engaged.',
                    undisputable: true
                  },
                  {
                    icon: '💎',
                    title: 'OPTIMAL CHAPTER FLOW',
                    description: '15 years of A/B testing has taught me the perfect chapter progression. My AI doesn\'t guess the flow - it implements the exact sequence that maximizes engagement.',
                    undisputable: true
                  },
                  {
                    icon: '🎯',
                    title: 'CONVERSION-OPTIMIZED CTAs',
                    description: 'Every call-to-action is placed exactly where it needs to be for maximum conversion. My AI doesn\'t randomly place CTAs - it follows proven conversion patterns.',
                    undisputable: true
                  },
                  {
                    icon: '🔥',
                    title: 'EMOTION-TRIGGERING LANGUAGE',
                    description: 'I know exactly which words trigger which emotions in readers. My AI doesn\'t use generic language - it uses emotion-triggering words that drive action.',
                    undisputable: true
                  },
                  {
                    icon: '📊',
                    title: 'DATA-DRIVEN TOPIC SELECTION',
                    description: 'Every topic is chosen based on 15 years of market data. My AI doesn\'t guess what topics will sell - it selects topics that have proven to generate revenue.',
                    undisputable: true
                  },
                  {
                    icon: '🎨',
                    title: 'PERFECT PACING ALGORITHMS',
                    description: 'I know exactly when to speed up, slow down, add suspense, or create urgency. My AI doesn\'t write monotonously - it varies pacing for maximum impact.',
                    undisputable: true
                  },
                  {
                    icon: '💪',
                    title: 'AUTHORITY-BUILDING STRUCTURE',
                    description: 'Every book is structured to build the author\'s authority. My AI doesn\'t just inform - it positions the author as the go-to expert in their field.',
                    undisputable: true
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border-2 border-indigo-400/50 rounded-2xl p-6 shadow-2xl relative"
                  >
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-indigo-400 to-blue-400 text-white px-4 py-2 rounded-full text-sm font-bold">
                      ⚡ UNDISPUTABLE
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                        className="text-4xl flex-shrink-0"
                      >
                        {feature.icon}
                      </motion.div>
                      <div>
                        <h4 className="text-xl font-bold mb-2 text-indigo-300">
                          {feature.title}
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Experience Summary */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border-3 border-purple-400/70 rounded-3xl p-8 text-center"
              >
                <h4 className="text-4xl font-bold text-purple-300 mb-6">
                  🏆 THE UNDISPUTABLE TRUTH
                </h4>
                <div className="grid grid-cols-2 gap-8 text-2xl mb-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-purple-400 mb-2">15</div>
                    <div className="text-gray-400">Years of Market Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-indigo-400 mb-2">100%</div>
                    <div className="text-gray-400">Battle-Tested Methods</div>
                  </div>
                </div>
                <p className="text-2xl text-white font-bold">
                  <span className="text-purple-400">MY ALGORITHM CAN'T BE REPLACED</span> because it's built on 
                  <span className="text-indigo-400"> REAL MARKET DATA</span>, not theoretical AI responses.
                </p>
                <p className="text-xl text-gray-300 mt-4">
                  While others guess, <span className="text-yellow-400 font-bold">I KNOW WHAT WORKS</span> because I've tested it for 15 years.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Bullet List */}
      <section className="py-20 px-4 bg-gradient-to-r from-gray-800/30 to-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              Why <span className="text-gray-300">Lekhika</span> is Different
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              This isn't just another AI writing tool. It's a complete content creation ecosystem that combines multiple AI models with human expertise.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold mb-8 text-yellow-400">🚀 What You Get:</h3>
              <div className="space-y-6">
                {[
                  '💰 Make $10K+ per month from content alone',
                  '⚡ Create full books in under 30 minutes',
                  '🎯 Generate SEO-optimized content that ranks #1',
                  '🔥 Write copy that converts 10x better than humans',
                  '📚 Build entire libraries of content automatically',
                  '💎 Create content so good, people can\'t tell it\'s AI',
                  '🚀 Scale your content business to 7-figures',
                  '⚡ Never run out of content ideas again',
                  '🎨 Generate content in any style or tone',
                  '📈 Increase your revenue by 400% in 90 days',
                  '🏆 Become the go-to expert in your niche',
                  '💪 Build an empire of content assets',
                  '🎯 Create personalized content for every audience',
                  '⚡ Automate your entire content workflow',
                  '💰 Turn one idea into 100+ pieces of content'
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-4 bg-gray-800/50 rounded-xl p-4 border border-gray-600/30"
                  >
                    <CheckCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                    <span className="text-lg font-medium text-gray-200">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-yellow-400/30"
            >
              <h3 className="text-3xl font-bold mb-6 text-yellow-400">💎 The Multi-AI Advantage</h3>
              
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`flex items-center space-x-4 p-4 rounded-xl ${
                      feature.highlight ? 'bg-yellow-400/20 border border-yellow-400/50' : 'bg-gray-700/50 border border-gray-600/30'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      feature.highlight ? 'bg-yellow-400 text-black' : 'bg-gray-600'
                    }`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{feature.title}</h4>
                      <p className="text-gray-300 text-sm">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who Can Access Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-black/50 to-gray-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              Who Can Access This Power?
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
              From solo entrepreneurs to Fortune 500 companies, thousands are already using Lekhika to dominate their markets.
            </p>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Whether you're a beginner just starting out or an established business looking to scale, Lekhika adapts to your needs and grows with your ambitions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: '👨‍💼 Solo Entrepreneurs',
                description: 'Build your personal brand and create content that establishes you as the go-to expert in your field.',
                list: ['Personal branding', 'Social media content', 'Email marketing', 'Course creation', 'Book publishing']
              },
              {
                title: '🏢 Small Businesses',
                description: 'Scale your content marketing without hiring expensive writers or agencies.',
                list: ['Website content', 'Blog posts', 'Sales copy', 'Product descriptions', 'Marketing materials']
              },
              {
                title: '📈 Marketing Agencies',
                description: 'Deliver premium content to clients at scale while maximizing your profit margins.',
                list: ['Client content', 'Campaign copy', 'SEO content', 'Social media', 'Email sequences']
              },
              {
                title: '📚 Content Creators',
                description: 'Never run out of ideas and create content that engages and converts your audience.',
                list: ['YouTube scripts', 'Podcast content', 'Blog posts', 'Newsletters', 'Social media']
              },
              {
                title: '💰 E-commerce Sellers',
                description: 'Create compelling product descriptions and marketing copy that drives sales.',
                list: ['Product descriptions', 'Ad copy', 'Email marketing', 'Landing pages', 'Reviews']
              },
              {
                title: '🎓 Course Creators',
                description: 'Develop comprehensive educational content and marketing materials for your courses.',
                list: ['Course content', 'Lesson plans', 'Marketing copy', 'Email sequences', 'Sales pages']
              },
              {
                title: '📰 Bloggers & Writers',
                description: 'Overcome writer\'s block and create engaging content that keeps readers coming back.',
                list: ['Article writing', 'SEO content', 'Guest posts', 'Newsletters', 'Social media']
              },
              {
                title: '🏆 Fortune 500 Companies',
                description: 'Enterprise-level content creation with team collaboration and white-label options.',
                list: ['Corporate content', 'Team collaboration', 'API access', 'Custom integrations', 'Dedicated support']
              },
              {
                title: '🎯 Affiliate Marketers',
                description: 'Create high-converting content that drives traffic and maximizes your affiliate commissions.',
                list: ['Review content', 'Comparison guides', 'Email sequences', 'Landing pages', 'Social media']
              }
            ].map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-600/30 hover:border-yellow-400/50 transition-all"
              >
                <h3 className="text-2xl font-bold mb-4 text-yellow-400">{category.title}</h3>
                <p className="text-gray-300 mb-6">{category.description}</p>
                <div className="space-y-2">
                  {category.list.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-3xl p-8 border border-yellow-400/30 max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-yellow-400 mb-4">🎯 Perfect for ANYONE Who Wants to:</h3>
              <p className="text-xl text-gray-300">
                Make money from content, build authority, scale their business, or simply create amazing content without the hassle. 
                <span className="text-yellow-400 font-bold"> Lekhika adapts to YOUR goals and helps you achieve them faster than ever before.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Testimonials - PASTOR Testimonials */}
      <section className="py-24 px-4 bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-400/50 rounded-full px-8 py-4 mb-8">
              <span className="text-green-400 font-bold text-xl">🔥 REAL RESULTS FROM REAL PEOPLE 🔥</span>
            </div>
            <h2 className="text-7xl font-bold mb-8 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              What <span className="text-yellow-400">Creators</span> Are Saying
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              Don't just take our word for it - See how Lekhika is transforming lives and businesses
            </p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 100, rotateY: 15 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -100, rotateY: -15 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-3xl p-16 border-2 border-purple-400/50 backdrop-blur-sm shadow-2xl relative overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full translate-y-24 -translate-x-24"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-8 lg:space-y-0 lg:space-x-12 mb-12">
                    <div className="flex-shrink-0">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-8xl"
                      >
                        {testimonials[activeTestimonial].avatar}
                      </motion.div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <h3 className="text-4xl font-bold text-white">{testimonials[activeTestimonial].name}</h3>
                        <div className="flex space-x-1">
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <Star className="w-8 h-8 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
                            </motion.div>
                      ))}
                    </div>
                      </div>
                      <p className="text-2xl text-gray-300 mb-4">{testimonials[activeTestimonial].role}</p>
                      <p className="text-xl text-purple-400 font-bold">{testimonials[activeTestimonial].company}</p>
                  </div>
                </div>
                
                  <div className="relative">
                    <Quote className="w-16 h-16 text-purple-400 mb-8 opacity-60" />
                    <p className="text-3xl leading-relaxed text-gray-200 font-medium italic">
                  "{testimonials[activeTestimonial].content}"
                </p>
                    
                    {/* Quote decoration */}
                    <div className="absolute -top-4 -left-4 w-8 h-8 border-l-4 border-t-4 border-purple-400 rounded-tl-lg"></div>
                    <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-4 border-b-4 border-purple-400 rounded-br-lg"></div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Enhanced navigation */}
            <div className="flex justify-center space-x-6 mt-12">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-6 h-6 rounded-full transition-all duration-300 ${
                    index === activeTestimonial 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125 shadow-lg' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
            
            {/* Auto-play indicator */}
            <div className="text-center mt-8">
              <div className="inline-flex items-center space-x-2 text-gray-400">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Auto-playing testimonials</span>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          </div>
            </div>
          </div>
          
          {/* Additional social proof */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-3xl p-12 border-2 border-green-400/30 max-w-5xl mx-auto">
              <h3 className="text-3xl font-bold text-green-400 mb-6">
                🏆 Join Thousands of Successful Creators
              </h3>
              <div className="grid md:grid-cols-2 gap-8 text-lg text-gray-300">
                <div>
                  <p className="mb-4">
                    <span className="text-yellow-400 font-bold">Average user</span> creates 
                    <span className="text-green-400 font-bold"> 12 books per month</span>
                  </p>
                  <p>
                    <span className="text-purple-400 font-bold">Top 1% users</span> generate 
                    <span className="text-yellow-400 font-bold"> $50K+ monthly</span>
                  </p>
                </div>
                <div>
                  <p className="mb-4">
                    <span className="text-blue-400 font-bold">97.3%</span> of users see results within 
                    <span className="text-green-400 font-bold"> 24 hours</span>
                  </p>
                  <p>
                    <span className="text-pink-400 font-bold">Average ROI</span> is 
                    <span className="text-yellow-400 font-bold"> 1,400%</span> in first month
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SCROLL-STOPPING MOMENT #1 - THE SHOCK */}
      <section className="py-24 px-4 bg-gradient-to-r from-red-900/60 via-black/60 to-red-900/60 backdrop-blur-sm relative overflow-hidden">
        {/* Shock background effects */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring", bounce: 0.5 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="inline-block bg-gradient-to-r from-red-500/40 to-orange-500/40 border-3 border-red-400/80 rounded-full px-12 py-6 mb-8">
              <span className="text-red-300 font-bold text-3xl">😱 WAIT... HOLD UP! 😱</span>
            </div>
            <h2 className="text-9xl font-bold mb-8 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              WAIT... <span className="text-white">WHAT?!</span>
            </h2>
            <p className="text-5xl text-gray-300 max-w-6xl mx-auto font-bold leading-relaxed">
              You've seen the <span className="text-red-400">$1,297 ENTERPRISE</span> price tag...
              <br /><br />
              You've seen the <span className="text-orange-400">UNLIMITED AI PROVIDERS</span>...
              <br /><br />
              You've seen the <span className="text-yellow-400">15 YEARS OF EXPERIENCE</span>...
              <br /><br />
              <span className="text-white font-extrabold text-6xl">BUT WAIT... THERE'S MORE!</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-3 border-yellow-400/70 rounded-3xl p-12 max-w-5xl mx-auto"
          >
            <h3 className="text-6xl font-bold text-yellow-300 mb-8">
              🚨 DON'T STOP NOW... 🚨
            </h3>
            <p className="text-3xl text-white font-bold">
              The <span className="text-red-400">BEST PART</span> is coming...
              <br />
              <span className="text-yellow-400">KEEP READING</span> to see what happens next!
            </p>
          </motion.div>
        </div>
      </section>

      {/* THE BUILD-UP */}
      <section className="py-24 px-4 bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-red-900/60 backdrop-blur-sm relative overflow-hidden">
        {/* Build-up background effects */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1.3, 1, 1.3]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="inline-block bg-gradient-to-r from-purple-500/40 to-pink-500/40 border-3 border-purple-400/80 rounded-full px-12 py-6 mb-8">
              <span className="text-purple-300 font-bold text-3xl">🔥 THE TENSION BUILDS... 🔥</span>
            </div>
            <h2 className="text-8xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              THE <span className="text-white">TENSION</span> BUILDS...
            </h2>
            <p className="text-4xl text-gray-300 max-w-6xl mx-auto font-bold leading-relaxed">
              You're probably thinking: <span className="text-purple-400">"This is amazing but expensive..."</span>
              <br /><br />
              You're probably calculating: <span className="text-pink-400">"Is $1,297 worth it?"</span>
              <br /><br />
              You're probably wondering: <span className="text-red-400">"What's the catch?"</span>
              <br /><br />
              <span className="text-white font-extrabold text-5xl">WELL... KEEP SCROLLING!</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            {[
              { icon: '💰', text: 'You think it\'s expensive...' },
              { icon: '🤔', text: 'You\'re calculating value...' },
              { icon: '😤', text: 'You\'re getting frustrated...' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 rounded-2xl p-8"
              >
                <div className="text-6xl mb-4">{item.icon}</div>
                <p className="text-2xl text-white font-bold">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-orange-500/30 to-red-500/30 border-3 border-orange-400/70 rounded-3xl p-12 max-w-5xl mx-auto"
          >
            <h3 className="text-5xl font-bold text-orange-300 mb-8">
              🎭 THE PLOT THICKENS... 🎭
            </h3>
            <p className="text-3xl text-white font-bold">
              What if I told you there's a <span className="text-yellow-400">TWIST</span> coming?
              <br />
              <span className="text-red-400">KEEP SCROLLING</span> to find out what it is!
            </p>
          </motion.div>
        </div>
      </section>

      {/* KILLER 3-PLAN PRICING TABLE */}
      <section className="py-24 px-4 bg-gradient-to-r from-gray-800/30 to-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-400/50 rounded-full px-8 py-4 mb-8">
              <span className="text-red-400 font-bold text-xl">🔥 LIMITED TIME OFFER 🔥</span>
            </div>
            <h2 className="text-7xl font-bold mb-8 bg-gradient-to-r from-yellow-400 via-red-400 to-orange-400 bg-clip-text text-transparent">
              Choose Your <span className="text-white">SUCCESS LEVEL</span>
            </h2>
            <p className="text-3xl text-gray-300 max-w-5xl mx-auto font-bold">
              <span className="text-yellow-400">ONE-TIME PURCHASE</span> - No monthly fees, no hidden costs, no BS. 
              <span className="text-red-400">Start creating PROFESSIONAL BOOKS today!</span>
            </p>
          </motion.div>

          {/* KILLER 3-PLAN PRICING TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-3 gap-8 mb-16"
          >
            {/* STARTER PLAN */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-b from-gray-800/50 to-black/50 border-2 border-gray-600/50 rounded-3xl p-8 relative"
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-300 mb-4">STARTER</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-400 line-through">$497</span>
                  <span className="text-6xl font-bold text-white ml-4">$297</span>
                </div>
                <p className="text-gray-400 text-lg">Perfect for testing the waters</p>
              </div>
              
              <div className="space-y-4 mb-8">
                {[
                  '✅ 10 Complete Books',
                  '✅ Basic AI Models',
                  '✅ PDF Export',
                  '✅ Email Support',
                  '✅ 30-Day Money Back'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-2xl font-bold text-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300"
              >
                GET STARTED
              </motion.button>
            </motion.div>

            {/* PRO PLAN - MOST POPULAR */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-b from-yellow-500/20 to-orange-500/20 border-3 border-yellow-400/70 rounded-3xl p-8 relative transform scale-105"
            >
              {/* MOST POPULAR BADGE */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-6 py-2 rounded-full font-bold text-lg">
                  🔥 MOST POPULAR 🔥
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-4xl font-bold text-yellow-400 mb-4">PRO</h3>
                <div className="mb-4">
                  <span className="text-6xl font-bold text-gray-400 line-through">$997</span>
                  <span className="text-7xl font-bold text-yellow-400 ml-4">$597</span>
                </div>
                <p className="text-yellow-300 text-xl font-bold">Best Value - Most Popular!</p>
              </div>
              
              <div className="space-y-4 mb-8">
                {[
                  '✅ UNLIMITED Books',
                  '✅ Multi-AI Orchestration',
                  '✅ PDF, EPUB, DOCX Export',
                  '✅ Fact-Checking Algorithm',
                  '✅ AI Detection Immunity',
                  '✅ Priority Support',
                  '✅ 15-Year Experience Algorithms',
                  '✅ 60-Day Money Back'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <span className="text-gray-300 font-bold">{feature}</span>
                  </div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black py-4 px-6 rounded-2xl font-bold text-xl hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 shadow-2xl"
              >
                GET PRO NOW
              </motion.button>
            </motion.div>

            {/* ENTERPRISE PLAN */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-b from-purple-800/50 to-indigo-800/50 border-2 border-purple-600/50 rounded-3xl p-8 relative"
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-purple-400 mb-4">ENTERPRISE</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-400 line-through">$1,997</span>
                  <span className="text-6xl font-bold text-purple-400 ml-4">$1,297</span>
                </div>
                <p className="text-purple-300 text-lg font-bold">For serious content creators</p>
              </div>
              
              <div className="space-y-4 mb-8">
                {[
                  '✅ Everything in PRO',
                  '✅ White-Label Rights',
                  '✅ Commercial License',
                  '✅ Custom AI Training',
                  '✅ API Access',
                  '✅ 1-on-1 Setup Call',
                  '✅ Lifetime Updates',
                  '✅ 90-Day Money Back'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold text-xl hover:from-purple-500 hover:to-indigo-500 transition-all duration-300"
              >
                GO ENTERPRISE
              </motion.button>
            </motion.div>
          </motion.div>

          {/* URGENCY TIMER */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-400/50 rounded-3xl p-8 max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-red-400 mb-4">⏰ LIMITED TIME OFFER</h3>
              <p className="text-xl text-gray-300 mb-6">
                These prices are <span className="text-red-400 font-bold">TEMPORARY</span>. Once we launch officially, prices will 
                <span className="text-yellow-400 font-bold"> DOUBLE</span>. Get in now before it's too late!
              </p>
              <div className="text-2xl text-white font-bold">
                <span className="text-green-400">Save $200-$700</span> by getting in today!
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section - PASTOR Offer */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6">
              Choose Your <span className="text-yellow-400">Creative</span> Power Level
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Limited time: Get 70% OFF your first year
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPricing(!showPricing)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 mx-auto"
            >
              <span>{showPricing ? 'Hide' : 'Show'} Pricing</span>
              {showPricing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {showPricing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="grid md:grid-cols-3 gap-8"
              >
                {pricingPlans.map((plan, index) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className={`relative rounded-3xl p-8 ${
                      plan.popular 
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-purple-400 scale-105' 
                        : 'bg-white/5 backdrop-blur-sm border border-white/10'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-yellow-400 text-black px-6 py-2 rounded-full text-sm font-bold">
                          MOST POPULAR
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-gray-400 mb-4">{plan.description}</p>
                      
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <span className="text-5xl font-bold">${plan.price}</span>
                        <div className="text-left">
                          <div className="text-lg text-gray-400 line-through">${plan.originalPrice}</div>
                          <div className="text-sm text-green-400">70% OFF</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/login')}
                      className={`w-full py-4 rounded-2xl font-bold text-lg ${
                        plan.popular
                          ? 'bg-white text-purple-600'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600'
                      }`}
                    >
                      Get Started Now
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Final CTA - PASTOR Response */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">
              Ready to Create <span className="text-yellow-400">Amazing</span> Content?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of creators who are already using Lekhika to build their content empire.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="bg-white text-purple-600 px-12 py-6 rounded-2xl text-2xl font-bold flex items-center space-x-3 mx-auto shadow-2xl"
            >
              <Rocket className="w-8 h-8" />
              <span>Start Your Journey Now</span>
              <ArrowRight className="w-8 h-8" />
            </motion.button>
            
            <p className="text-sm mt-6 opacity-75">
              30-day money-back guarantee • Cancel anytime • No questions asked
            </p>
          </motion.div>
        </div>
      </section>

      {/* Magical Floating CTA Button */}
      <AnimatePresence>
        {showFloatingCTA && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, rotateY: -180 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, y: 100, scale: 0.8, rotateY: 180 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <motion.button
              whileHover={{ 
                scale: 1.1, 
                rotateY: 10,
                y: -5,
                boxShadow: "0 20px 40px rgba(255, 215, 0, 0.6)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="relative bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 px-8 py-6 rounded-2xl text-xl font-black flex items-center space-x-4 shadow-2xl border-4 border-yellow-300 text-black overflow-hidden"
            >
              {/* Magical shimmer effect */}
              <motion.div
                animate={{ x: [-100, 100] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                style={{ width: "200%", height: "100%" }}
              />
              
              {/* Magical particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      y: [0, -15, 0],
                    }}
                    transition={{
                      duration: Math.random() * 2 + 1,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
              
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="relative z-10"
              >
                <Rocket className="w-8 h-8 animate-bounce" />
              </motion.div>
              <span className="relative z-10">GET STARTED NOW</span>
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="relative z-10"
              >
                <ArrowRight className="w-8 h-8" />
              </motion.div>
              
              {/* Enhanced pulsing ring effects */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 border-4 border-yellow-300 rounded-2xl"
              />
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 border-2 border-yellow-200 rounded-2xl"
              />
              
              {/* Magical glow */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255, 215, 0, 0.3)",
                    "0 0 40px rgba(255, 215, 0, 0.6)",
                    "0 0 20px rgba(255, 215, 0, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl"
                style={{ filter: "blur(2px)" }}
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THE FREE OFFER MADNESS */}
      <section className="py-24 px-4 bg-gradient-to-r from-green-900/60 via-yellow-900/60 to-orange-900/60 backdrop-blur-sm relative overflow-hidden">
        {/* Madness background effects */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              scale: [1, 2, 1],
              rotate: [0, 180, 360],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-green-500/20 to-yellow-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [2, 1, 2],
              rotate: [360, 180, 0],
              opacity: [0.8, 0.2, 0.8]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, type: "spring", bounce: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="inline-block bg-gradient-to-r from-green-500/50 to-yellow-500/50 border-4 border-green-400/90 rounded-full px-16 py-8 mb-8">
              <span className="text-green-300 font-bold text-4xl">🤯 FREE?! 🤯</span>
            </div>
            <h2 className="text-[12rem] font-bold mb-8 bg-gradient-to-r from-green-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
              FREE?!
            </h2>
            <p className="text-6xl text-gray-300 max-w-7xl mx-auto font-bold leading-relaxed">
              <span className="text-green-400">YES... I SAID</span> 
              <br />
              <span className="text-yellow-400 font-extrabold text-8xl">FREE!</span>
              <br /><br />
              <span className="text-orange-400">ALL OF THIS...</span>
              <br />
              <span className="text-white">UNLIMITED AI PROVIDERS</span>
              <br />
              <span className="text-white">15 YEARS OF EXPERIENCE</span>
              <br />
              <span className="text-white">FACT-CHECKING ALGORITHMS</span>
              <br />
              <span className="text-white">COMPLETE BOOKS IN 30 MINUTES</span>
              <br /><br />
              <span className="text-green-400 font-extrabold text-7xl">FOR FREE?!</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-green-500/40 to-yellow-500/40 border-4 border-green-400/80 rounded-3xl p-16 max-w-6xl mx-auto mb-16"
          >
            <h3 className="text-7xl font-bold text-green-300 mb-8">
              🎉 YOU'RE GOING MAD, RIGHT? 🎉
            </h3>
            <p className="text-4xl text-white font-bold leading-relaxed">
              After seeing <span className="text-yellow-400">$1,297 ENTERPRISE</span>...
              <br />
              After seeing all the <span className="text-green-400">AMAZING FEATURES</span>...
              <br />
              After seeing the <span className="text-orange-400">15 YEARS OF EXPERIENCE</span>...
              <br /><br />
              <span className="text-red-400 font-extrabold text-5xl">AND NOW IT'S FREE?!</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            {[
              { icon: '😱', text: 'You can\'t believe it...' },
              { icon: '🤯', text: 'Your mind is blown...' },
              { icon: '😵', text: 'You\'re going MAD...' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotate: -10 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: index * 0.3, type: "spring", bounce: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-green-500/30 to-yellow-500/30 border-3 border-green-400/60 rounded-2xl p-8 transform hover:scale-105 transition-transform"
              >
                <div className="text-8xl mb-4">{item.icon}</div>
                <p className="text-3xl text-white font-bold">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-red-500/40 to-orange-500/40 border-4 border-red-400/80 rounded-3xl p-16 max-w-6xl mx-auto"
          >
            <h3 className="text-6xl font-bold text-red-300 mb-8">
              🚨 BUT WAIT... THERE'S A CATCH! 🚨
            </h3>
            <p className="text-4xl text-white font-bold leading-relaxed">
              This <span className="text-yellow-400">FREE OFFER</span> is only available for the 
              <span className="text-red-400 font-extrabold"> FIRST 100 PEOPLE</span> who scroll this far!
              <br /><br />
              <span className="text-green-400">KEEP READING</span> to see the final details and 
              <span className="text-orange-400 font-extrabold">CLAIM YOUR FREE ACCESS!</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* PS/PPS SECTIONS */}
      <section className="py-24 px-4 bg-gradient-to-r from-yellow-900/40 via-orange-900/40 to-red-900/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          {/* PS Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-4 border-yellow-400/80 rounded-3xl p-12 mb-8"
          >
            <h3 className="text-6xl font-bold text-yellow-300 mb-8 text-center">
              💰 P.S. - THE MONEY IS REAL 💰
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-3xl font-bold text-white mb-4">What Our Users Are Making:</h4>
                <ul className="space-y-3 text-xl text-gray-300">
                  <li>• <span className="text-green-400 font-bold">$50K+</span> from single book sales</li>
                  <li>• <span className="text-blue-400 font-bold">$100K+</span> monthly recurring revenue</li>
                  <li>• <span className="text-purple-400 font-bold">$500K+</span> annual content business</li>
                  <li>• <span className="text-yellow-400 font-bold">$1M+</span> total revenue generated</li>
                </ul>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-white mb-4">What You Get Today:</h4>
                <ul className="space-y-3 text-xl text-gray-300">
                  <li>• <span className="text-green-400 font-bold">Unlimited</span> book generation</li>
                  <li>• <span className="text-blue-400 font-bold">All AI providers</span> included</li>
                  <li>• <span className="text-purple-400 font-bold">15 years</span> of market experience</li>
                  <li>• <span className="text-yellow-400 font-bold">30-day</span> money-back guarantee</li>
                </ul>
              </div>
            </div>
            <div className="text-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-12 py-6 rounded-2xl text-2xl font-bold hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 shadow-2xl"
              >
                CLAIM YOUR SPOT NOW! 🚀
              </motion.button>
            </div>
          </motion.div>

          {/* PPS Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-red-500/30 to-pink-500/30 border-4 border-red-400/80 rounded-3xl p-12"
          >
            <h3 className="text-6xl font-bold text-red-300 mb-8 text-center">
              ⚡ P.P.S. - DON'T WAIT! ⚡
            </h3>
            <div className="text-center mb-8">
              <p className="text-4xl text-white font-bold mb-4">
                <span className="text-red-400">EVERY DAY YOU WAIT</span> is another day your competitors are getting ahead!
              </p>
              <p className="text-3xl text-gray-300">
                While you're thinking about it, others are already making <span className="text-green-400 font-bold">$10K, $20K, $50K+</span> with Lekhika!
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-red-400 mb-2">23:47:32</div>
                <div className="text-gray-400">Time Left</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-400 mb-2">47</div>
                <div className="text-gray-400">Spots Left</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-yellow-400 mb-2">$1,297</div>
                <div className="text-gray-400">One-Time Price</div>
              </div>
            </div>

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-16 py-8 rounded-2xl text-3xl font-bold hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-2xl"
              >
                GET LEKHIKA NOW - BEFORE IT'S TOO LATE! 🔥
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer with Lekhika Logo */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-900 to-black">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-8 mb-8">
            <img 
              src="https://www.copyalche.my/premium/lekhika.png" 
              alt="Lekhika Logo" 
              className="h-20 w-auto"
            />
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">ACreaova Consulting LLC</h3>
              <p className="text-gray-400">Certified Partner</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 Lekhika. All rights reserved. | Powered by AI Technology
          </p>
        </div>
      </section>

      {/* FAQ Section - Moved to End */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              Everything you need to know about Lekhika
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: "How does Lekhika's AI book generation actually work?",
                answer: "Lekhika uses a sophisticated multi-AI orchestration system. Our AI research agent gathers comprehensive information about your topic, our writing agent creates engaging content using proven copywriting formulas, and our editing agent polishes everything to perfection. The entire process is guided by 15+ years of market experience and battle-tested algorithms."
              },
              {
                question: "Can I really create a complete book in just 30 minutes?",
                answer: "Absolutely! Our AI system is specifically designed for speed and efficiency. While traditional book writing takes months, our AI agents work in parallel to research, write, and edit your content simultaneously. Most users see their complete book generated within 25-35 minutes, depending on the length and complexity."
              },
              {
                question: "What makes Lekhika different from other AI writing tools?",
                answer: "Unlike other tools that give you generic content, Lekhika creates complete, professional books with proper structure, engaging narratives, and publication-ready formatting. Our AI doesn't just write - it applies proven copywriting formulas, psychological triggers, and market-tested frameworks that have generated millions in revenue."
              },
              {
                question: "Do I own the rights to the books I create with Lekhika?",
                answer: "Yes, you have complete ownership and commercial rights to all books created with Lekhika. You can publish them, sell them, use them for marketing, or do anything else you want. We don't claim any rights to your content - it's 100% yours."
              },
              {
                question: "What file formats can I export my books in?",
                answer: "Lekhika supports multiple professional formats: PDF for print and digital distribution, EPUB for e-readers and online stores, DOCX for further editing in Word, and TXT for maximum compatibility. All formats are optimized for different publishing platforms."
              },
              {
                question: "Is there a money-back guarantee?",
                answer: "Yes! We offer a 30-day money-back guarantee. If you're not completely satisfied with Lekhika, simply contact our support team within 30 days of purchase for a full refund. No questions asked."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setShowFAQ(showFAQ === index ? null : index)}
                  className="w-full p-8 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <h3 className="text-xl font-bold text-white pr-8">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: showFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-8 h-8 text-purple-400" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {showFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 text-gray-300 text-lg leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border border-blue-500/30 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Still have questions?</h3>
              <p className="text-lg text-gray-300 mb-6">
                Our support team is here to help you succeed. Get answers within 24 hours.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 rounded-2xl font-bold text-lg flex items-center space-x-3 mx-auto"
              >
                <MessageSquare className="w-6 h-6" />
                <span>Contact Support</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Sales
