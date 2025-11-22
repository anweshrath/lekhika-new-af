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
  Lightbulb, Wand2, GraduationCap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Live = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 47, seconds: 32 })
  const [activeAgent, setActiveAgent] = useState(0)

  const navigate = useNavigate()

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

  const brutalStrengths = [
    {
      icon: Brain,
      title: 'Multi-AI Orchestration',
      detail: 'GPT-4, Claude, Gemini, and niche specialists riff together so you never ship single-model mush.'
    },
    {
      icon: Sparkles,
      title: 'Conversion Psychology Baked In',
      detail: 'Decades of human copy chops embedded into every flow—hooks, stakes, proof, and CTA logic wired-in.'
    },
    {
      icon: Target,
      title: 'Battle-Tested Workflows',
      detail: 'The same book, launch, and funnel blueprints that generated $2.84M for users—no Canva templates here.'
    },
    {
      icon: Rocket,
      title: 'Publish-Ready Outputs',
      detail: 'You walk away with voice-calibrated assets, SEO tuned and formatted to ship today, not “prompt + edit + pray”.'
    }
  ]

  const brutalTruths = [
    {
      icon: AlertTriangle,
      title: 'Premium, Not Cheap',
      detail: 'Yes, we cost more than prompt toys—because we give you a multi-agent team, not a text box.'
    },
    {
      icon: Clock,
      title: 'Requires Direction',
      detail: 'Bring your vision. We amplify it. If you want done-for-you without clarity, this isn’t your playground.'
    },
    {
      icon: Shield,
      title: 'Zero Fluff Policy',
      detail: 'We cut gimmicks fast. If a feature doesn’t move revenue or authority, it never ships—and you’ll hear why.'
    },
    {
      icon: Activity,
      title: 'Built for Builders',
      detail: 'Our flows assume you’re here to launch, lead, and profit. Dabblers burn out. Operators scale.'
    }
  ]

  const squadProfiles = [
    {
      name: 'Agent Ora',
      codename: 'The Oracle of Truth',
      emoji: '🛰️',
      headline: 'Research • Fact-Check • Analysis',
      description: 'She hunts primary sources, crushes myths, and gives every claim receipts so trolls tap out.',
      weapons: ['Live intel sweeps', 'Competitor dossiers', 'Cited research briefs', 'Red-team fact audits'],
      signature: 'Drops a bulletproof narrative map with verified proof-points before a single headline is written.'
    },
    {
      name: 'Agent Flux',
      codename: 'Conversion Architect',
      emoji: '🧪',
      headline: 'Funnels • Offers • Monetization',
      description: 'The revenue addict. She threads stories, stakes, and offers so every asset sells while it educates.',
      weapons: ['Psychological sequencing', 'Upsell ladders', 'Offer risk reversals', 'Scarcity choreography'],
      signature: 'Ships launch stacks that turn cold leads into high-ticket buyers in under 24 hours.'
    },
    {
      name: 'Agent Nova',
      codename: 'Voice Forger',
      emoji: '🎙️',
      headline: 'Brand Voice • Story • Dialogue',
      description: 'Your ghost in the machine. She mimics your cadence, slang, and swagger better than your own team.',
      weapons: ['Voice cloning matrices', 'Emotion pacing', 'Persona narratives', 'Story-driven intros'],
      signature: 'Delivers scripts, chapters, and emails that feel impossibly personal—because they are.'
    },
    {
      name: 'Agent Vexa',
      codename: 'Visual Alchemist',
      emoji: '🖼️',
      headline: 'Imagery • Covers • Layouts',
      description: 'Pixel dominatrix. She crafts cinematic covers, data visuals, and interior layouts that scream authority.',
      weapons: ['AI art direction', 'Ecover stacks', 'Infographic labs', 'Publishing-ready formatting'],
      signature: 'Hands you Kindle, print, and slide decks that look like you hired a Madison Avenue studio.'
    },
    {
      name: 'Agent Pulse',
      codename: 'Audience Amplifier',
      emoji: '📡',
      headline: 'Distribution • Community • Hype',
      description: 'Your buzz engine. She spins launch calendars, omnichannel posts, and PR hooks that keep feeds obsessed.',
      weapons: ['Omni-channel scheduling', 'Share-trigger copy', 'Retention loops', 'Launch war rooms'],
      signature: 'Turns every asset into a movement with scripts, shorts, and drip campaigns that never sleep.'
    }
  ]

  const activeAgentProfile = squadProfiles[activeAgent]

  const competitorColumns = [
    { key: 'lekhika', label: 'Lekhika', tagline: 'Multi-AI War Room', highlight: true, badge: 'CHAMPION' },
    { key: 'chatgpt', label: 'ChatGPT', tagline: 'Single Model', highlight: false },
    { key: 'claude', label: 'Claude', tagline: 'Single Model', highlight: false },
    { key: 'jasper', label: 'Jasper', tagline: 'Template-First', highlight: false },
    { key: 'copyai', label: 'Copy.ai', tagline: 'Template Library', highlight: false }
  ]

  const statusLegend = {
    max: {
      label: 'Full Stack',
      icon: Crown,
      container: 'bg-gradient-to-br from-yellow-500/15 via-yellow-400/10 to-yellow-500/15 border border-yellow-400/40',
      primaryContainer: 'bg-gradient-to-br from-yellow-500/35 via-yellow-400/25 to-yellow-500/35 border border-yellow-300/70 shadow-[0_20px_50px_rgba(250,204,21,0.35)]',
      textClass: 'text-yellow-100',
      iconClass: 'text-yellow-200',
      subtitle: 'Done-for-you automation'
    },
    strong: {
      label: 'Elite',
      icon: Sparkles,
      container: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/30',
      primaryContainer: 'bg-gradient-to-br from-emerald-500/25 to-teal-500/25 border border-emerald-300/60 shadow-[0_18px_40px_rgba(16,185,129,0.25)]',
      textClass: 'text-emerald-100',
      iconClass: 'text-emerald-200',
      subtitle: 'Advanced automation'
    },
    limited: {
      label: 'Limited',
      icon: Activity,
      container: 'bg-gradient-to-br from-gray-700/50 to-gray-800/60 border border-gray-600/40',
      primaryContainer: 'bg-gradient-to-br from-gray-600/50 to-gray-700/60 border border-gray-500/50 shadow-[0_12px_30px_rgba(148,163,184,0.2)]',
      textClass: 'text-gray-200',
      iconClass: 'text-gray-300',
      subtitle: 'Partial coverage'
    },
    basic: {
      label: 'Basic',
      icon: ChevronDown,
      container: 'bg-gradient-to-br from-slate-800/60 to-slate-900/70 border border-slate-700/50',
      primaryContainer: 'bg-gradient-to-br from-slate-700/60 to-slate-900/70 border border-slate-600/50 shadow-[0_12px_28px_rgba(100,116,139,0.25)]',
      textClass: 'text-slate-300',
      iconClass: 'text-slate-400',
      subtitle: 'Manual polish required'
    },
    none: {
      label: 'None',
      icon: X,
      container: 'bg-gradient-to-br from-red-900/20 to-red-900/30 border border-red-500/40',
      primaryContainer: 'bg-gradient-to-br from-red-900/35 to-red-900/45 border border-red-400/60 shadow-[0_16px_35px_rgba(248,113,113,0.25)]',
      textClass: 'text-red-200',
      iconClass: 'text-red-300',
      subtitle: 'Not supported'
    }
  }

  const competitorMatrix = [
    {
      feature: 'Multi-AI Orchestration',
      detail: 'Coordinated GPT-4, Claude, Gemini, and custom agents composing in the same pass.',
      status: { lekhika: 'max', chatgpt: 'none', claude: 'none', jasper: 'limited', copyai: 'limited' }
    },
    {
      feature: 'Revenue-Stack Templates',
      detail: 'Launch funnels, nurture flows, upsell ladders, and monetization baked in.',
      status: { lekhika: 'max', chatgpt: 'basic', claude: 'basic', jasper: 'limited', copyai: 'basic' }
    },
    {
      feature: 'Human Voice Cloning',
      detail: 'Persona-level tonality, slang, and cadence across books, emails, and scripts.',
      status: { lekhika: 'strong', chatgpt: 'basic', claude: 'basic', jasper: 'limited', copyai: 'basic' }
    },
    {
      feature: 'Publish-Ready Formatting',
      detail: 'Print + Kindle layouts, ecovers, TOCs, metadata, and compliance done in minutes.',
      status: { lekhika: 'strong', chatgpt: 'none', claude: 'none', jasper: 'limited', copyai: 'limited' }
    },
    {
      feature: 'AI Detection Immunity',
      detail: 'Quality scoring, fact-check sweeps, and detector testing before you export.',
      status: { lekhika: 'strong', chatgpt: 'none', claude: 'none', jasper: 'basic', copyai: 'basic' }
    },
    {
      feature: 'Team + Workflow Ops',
      detail: 'Agent personas, collaborative workspaces, and API hooks for agencies.',
      status: { lekhika: 'strong', chatgpt: 'basic', claude: 'basic', jasper: 'limited', copyai: 'limited' }
    }
  ]

  const renderStatusCell = (statusKey = 'basic', isPrimary = false) => {
    const status = statusLegend[statusKey] || statusLegend.basic
    const StatusIcon = status.icon
    const containerClass = isPrimary && status.primaryContainer ? status.primaryContainer : status.container

    return (
      <div className={`relative rounded-2xl px-4 py-5 border transition-all duration-300 ${containerClass}`}>
        <div className="flex items-center justify-center">
          <div className={`mr-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${status.iconClass}`}>
            <StatusIcon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold uppercase tracking-[0.35em] ${status.textClass}`}>{status.label}</p>
            <p className="text-xs text-gray-300/80">{status.subtitle}</p>
          </div>
        </div>
        {isPrimary && (
          <motion.div
            className="absolute inset-0 rounded-2xl border border-yellow-200/30"
            animate={{ opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-800 to-gray-700 text-white overflow-hidden">
      {/* Warning Bar - Top */}
      <div className="bg-red-600 text-white text-center py-2 px-4 relative z-50">
        <div className="flex items-center justify-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-bold">
            WARNING: This page contains content so powerful, it may change your life forever. 
            Proceed with caution if you're not ready to make $10K+ per month from content.
          </span>
          <AlertTriangle className="w-4 h-4" />
        </div>
      </div>

      {/* Sticky Discount Bar */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-3 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Timer className="w-5 h-5" />
              <span className="font-bold text-lg">70% OFF ENDS IN:</span>
            </div>
            <div className="flex items-center space-x-2 text-xl font-bold">
              <div className="bg-black text-yellow-400 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</div>
              <span>:</span>
              <div className="bg-black text-yellow-400 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <span>:</span>
              <div className="bg-black text-yellow-400 px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}</div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="bg-black text-yellow-400 px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
          >
            GET FREE ACCESS NOW
          </motion.button>
        </div>
      </div>

      {/* Hero Section - Proper Structure */}
      <section className="relative py-20 px-4">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-50"
            animate={{ scale: [1, 1.3, 1], rotate: [0, -180, -360] }}
            transition={{ duration: 30, repeat: Infinity }}
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          {/* Social Proof Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex justify-center"
          >
            <div className="inline-flex items-center space-x-4 bg-emerald-500/15 border border-emerald-400/40 rounded-full px-6 py-3 backdrop-blur-sm">
              <div className="flex -space-x-2">
                {['👩‍💻', '👨‍🎨', '👩‍🎓', '👨‍💼', '👩‍💼'].map((avatar, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg border border-emerald-400/50"
                  >
                    {avatar}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-emerald-300 text-sm font-semibold uppercase tracking-wide">2,847 OPERATORS DEPLOYED</p>
                <p className="text-white font-bold text-lg">
                  <span className="text-yellow-300">$2.84M</span> minted from assets built inside Lekhika last quarter
                </p>
                <p className="text-emerald-200/80 text-xs uppercase tracking-[0.35em]">Books • Launch Funnels • Evergreen Engines</p>
              </div>
            </div>
          </motion.div>

          {/* Pre-headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-6"
          >
            <span className="bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-bold border border-yellow-400/30 uppercase tracking-[0.35em]">
              ⚡ BUILT FOR OPERATORS WHO REFUSE GENERIC AI
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-300 to-yellow-200 bg-clip-text text-transparent"
          >
            Meet the AI Copy Command Center
            <br />
            <motion.span
              className="text-yellow-400"
              animate={{
                textShadow: [
                  "0 0 20px rgba(255, 215, 0, 0.5)",
                  "0 0 40px rgba(255, 215, 0, 0.8)",
                  "0 0 20px rgba(255, 215, 0, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              That Turns Strategy Into Revenue On Demand
            </motion.span>
            <br />
            <span className="text-5xl md:text-6xl text-gray-300">Without Babysitting Prompts Or Agencies</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Your backlog isn’t ideas—it’s the bottleneck of wrangling prompts, freelancers, and rewrites. After <span className="text-yellow-400 font-bold">15 years driving $2.8B in copy wins</span>, I fused GPT-4, Claude, Gemini, and bespoke agents into one war room. Lekhika doesn’t “assist”; it orchestrates research, story, psychology, and formatting so you ship finished assets while competitors are still editing drafts.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto italic"
          >
            Promise: plug in once, and you’ll build campaigns that feel handcrafted and sell like they were engineered by a 20-person team.
          </motion.p>

          {/* Video Section with Bullet Points */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Video */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                  {/* Video Thumbnail Background */}
                  <div className="absolute inset-0 bg-cover bg-center" style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'
                  }} />
                  
                  {/* Dark Overlay for better contrast */}
                  <div className="absolute inset-0 bg-black/40" />
                  
                  {/* Play Button - MASSIVE and CENTERED */}
                  <motion.button
                    whileHover={{ 
                      scale: 1.2,
                      boxShadow: "0 0 50px rgba(255, 215, 0, 0.8)"
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="relative z-10 w-32 h-32 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-400"
                  >
                    <Play className="w-16 h-16 ml-2 text-black" />
                  </motion.button>
                  
                  {/* Floating Elements - More Visible */}
                  <motion.div
                    animate={{ 
                      y: [0, -15, 0],
                      rotate: [0, 10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-6 right-6 text-yellow-400 text-3xl drop-shadow-lg"
                  >
                    💰
                  </motion.div>
                  <motion.div
                    animate={{ 
                      y: [0, 15, 0],
                      rotate: [0, -10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute bottom-6 right-6 text-yellow-400 text-3xl drop-shadow-lg"
                  >
                    🚀
                  </motion.div>
                  
                  {/* Additional floating elements */}
                  <motion.div
                    animate={{ 
                      y: [0, -8, 0],
                      x: [0, 5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-1/4 left-6 text-yellow-400 text-2xl"
                  >
                    ⚡
                  </motion.div>
                  <motion.div
                    animate={{ 
                      y: [0, 8, 0],
                      x: [0, -5, 0]
                    }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    className="absolute bottom-1/4 left-6 text-yellow-400 text-2xl"
                  >
                    🔥
                  </motion.div>
                </div>
                
                {/* Video Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="text-white">
                    <p className="text-lg font-bold mb-1">🎥 Watch the War Room Build a Launch</p>
                    <p className="text-sm opacity-90 mb-3">See the agents research, write, design, and format a full campaign in one pass</p>
                    
                    {/* Video Stats */}
                    <div className="flex items-center space-x-6 text-xs">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-yellow-400" />
                        <span>3.2M views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-4 h-4 text-yellow-400" />
                        <span>99% loved</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span>3:47 min</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Video Badge */}
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>LIVE BUILD</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/login')}
                className="mt-5 inline-flex items-center space-x-2 rounded-full border border-yellow-400/50 bg-yellow-400/10 px-6 py-2 text-xs font-semibold text-yellow-200 uppercase tracking-[0.35em]"
              >
                <Play className="w-4 h-4" />
                <span>Watch the 3:47 build</span>
              </motion.button>
            </motion.div>

            {/* Bullet Points */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-bold text-yellow-400 mb-8">What You’ll Finish In One Session:</h3>
              {[
                '⚙️ Trigger a flagship book, premium sales page, launch emails, and socials in a single run.',
                '🧬 Clone your voice so every hook, story, and CTA sounds like the sharpest version of you.',
                '🎯 Demand-led research and fact-checking baked in before you ever touch the draft.',
                '💥 Conversion frameworks pre-wire stakes, proof, and irresistible offer math automatically.',
                '📦 Export polished Kindle, PDF, DOCX, EPUB, and slide decks the second you’re done.',
                '🚨 Built-in plagiarism sweeps and AI-detector stress tests keep assets untouchable.',
                '📈 Growth telemetry tells you which book, campaign, or funnel to launch next for max upside.',
                '🔥 Compress months of agency work into hours without adding headcount or freelancers.'
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center space-x-4 bg-gray-800/50 rounded-xl p-4 border border-gray-600/30"
                >
                  <CheckCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                  <span className="text-lg font-medium text-gray-200">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Main CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="space-y-6"
          >
            <motion.button
              whileHover={{
                scale: 1.1,
                boxShadow: "0 25px 50px rgba(255, 215, 0, 0.6)",
                rotateY: 5
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 px-16 py-8 rounded-3xl text-2xl font-bold flex items-center space-x-4 shadow-2xl border-2 border-yellow-400 text-black mx-auto"
            >
              <Rocket className="w-8 h-8 animate-bounce" />
              <span>DEPLOY YOUR AI WAR ROOM – 70% OFF</span>
              <ArrowRight className="w-8 h-8 animate-pulse" />
            </motion.button>
            
            <p className="text-gray-400 text-lg">
              ⚡ Join the operators graduating from “prompt engineer” to revenue architect inside Lekhika
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section - The Dangerous Connection Place */}
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
              I Was Paid Millions To Hate AI—Until I Weaponized It
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              If you’ve ever stared at a blinking cursor wondering whether robots can actually sell, that was me. Here’s how the switch flipped.
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
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30 relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'
                }} />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/90 to-gray-900/90" />
                
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center">
                    <span className="mr-3 text-4xl">😤</span>
                    Chapter 1 — The Copy Snob Era
                  </h3>
                  <p className="text-lg text-gray-300 mb-4">
                    2009: I’m the go-to gun for Fortune 500 launches. AI tools are spitting out bland, lifeless paragraphs and I’m billing five-figure retainers laughing at anyone who thinks “robots” can sell.
                  </p>
                  <p className="text-lg text-gray-300">
                    The work was brutal—no sleep, client fire drills, 40 tabs of research open—but the results were undeniable. I swore I’d never let a machine touch my copy.
                  </p>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-4 right-4 text-3xl"
                  >
                    😏
                  </motion.div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30 relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80")'
                }} />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/90 to-gray-900/90" />
                
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center">
                    <span className="mr-3 text-4xl">💡</span>
                    Chapter 2 — The Breakdown
                  </h3>
                  <p className="text-lg text-gray-300 mb-4">
                    Then the volume exploded. Clients wanted books, nurture sequences, sales pages, webinars—yesterday. My team was drowning. Burnout was real. I tested every “AI assistant” on the market. They gave me mediocre drafts and new headaches.
                  </p>
                  <p className="text-lg text-gray-300">
                    The wake-up call: it wasn’t about one AI model. It was about orchestrating multiple models like a production crew—research, voice, strategy, formatting—each executing their specialty in sync.
                  </p>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-4 right-4 text-3xl"
                  >
                    🤯
                  </motion.div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-yellow-400/30 relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'
                }} />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/90 to-gray-900/90" />
                
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center">
                    <span className="mr-3 text-4xl">🏆</span>
                    Chapter 3 — The War Room
                  </h3>
                  <p className="text-lg text-gray-300 mb-4">
                    I codified a war room of agents—GPT-4 for narrative velocity, Claude for logic, Gemini for intel, bespoke checkers for formatting and compliance. Overnight, we stopped shipping drafts; we shipped full experiences.
                  </p>
                  <p className="text-lg text-gray-300">
                    The result? <span className="text-yellow-400 font-bold">$2.84M in client revenue</span> built inside the system, 40%+ conversion funnels, bestselling books created in hours, and a team that finally slept. That system became Lekhika—the unstoppable command center we’re handing you now.
                  </p>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 15, 0]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute top-4 right-4 text-3xl"
                  >
                    🚀
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-3xl p-8 border border-yellow-400/50">
                <h3 className="text-2xl font-bold text-yellow-400 mb-6">📊 Proof The War Room Stays Unstoppable</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Revenue Run Through Lekhika:</span>
                    <span className="text-yellow-400 font-bold text-xl">$2,847,000+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">High-ticket Assets Shipped:</span>
                    <span className="text-yellow-400 font-bold text-xl">2,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Operators Inside:</span>
                    <span className="text-yellow-400 font-bold text-xl">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Launch Success Rate:</span>
                    <span className="text-yellow-400 font-bold text-xl">97.3%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30">
                <h3 className="text-2xl font-bold text-yellow-400 mb-6">🎯 What Happens When You Plug In</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">R</div>
                    <div>
                      <p className="text-gray-300 font-medium">Raj Kumar</p>
                      <p className="text-gray-400 text-sm">Used the “Authority Book + High-Ticket Funnel” blueprint → $50K collected in 30 days.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">P</div>
                    <div>
                      <p className="text-gray-300 font-medium">Priya Sharma</p>
                      <p className="text-gray-400 text-sm">Spun up 12 courses + nurture sequences in a month → $100K/month predictable income.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">A</div>
                    <div>
                      <p className="text-gray-300 font-medium">Amit Patel</p>
                      <p className="text-gray-400 text-sm">Agency owner who replaced six freelancers with Lekhika → 7-figure retainer roster.</p>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-3xl p-8 border border-yellow-400/50"
              >
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">🔥 The Dangerous Truth</h3>
                <p className="text-lg text-gray-300">
                  Everyone has access to AI. Almost nobody has a <span className="text-white font-semibold">system</span>. Lekhika is the orchestration layer—the way you fuse research, story, psychology, visuals, and formatting without losing your voice or your margin.
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Connection CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 rounded-3xl p-12 border border-yellow-400/50 max-w-4xl mx-auto">
              <h3 className="text-4xl font-bold text-yellow-400 mb-6">You’re Either Shipping Or Watching</h3>
              <p className="text-2xl text-gray-300 mb-8">
                You can keep duct-taping single-model prompts together… or you can plug into the system operators use to create assets that launch, close, and renew. If not now, when?
              </p>
              <motion.button
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0 25px 50px rgba(255, 215, 0, 0.6)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 px-16 py-8 rounded-3xl text-2xl font-bold flex items-center space-x-4 shadow-2xl border-2 border-yellow-400 text-black mx-auto"
              >
                <Crown className="w-8 h-8" />
                <span>DEPLOY THE COMMAND CENTER</span>
                <ArrowRight className="w-8 h-8" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3 Killer Use Cases */}
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
              Pick Your Revenue Campaign
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              These aren’t hypotheticals—they’re the exact blueprints operators run inside Lekhika to stack cash, authority, and audience.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Use Case 1: Book Empire */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, rotateY: 5 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30 hover:border-yellow-400/50 transition-all"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-yellow-400 mb-4">📚 The Book Empire</h3>
                <p className="text-gray-300 text-lg">Spin up authority assets that open doors and deals</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-700/50 rounded-2xl p-6">
                  <h4 className="text-xl font-bold text-white mb-3">💰 The Play:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Full book drafted in:</span>
                      <span className="text-yellow-400 font-bold">30 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Offer stack with bonuses worth:</span>
                      <span className="text-yellow-400 font-bold">$5,000 - $50,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Books you can ship each month:</span>
                      <span className="text-yellow-400 font-bold">10 - 20</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-2">
                      <span className="text-white">Monthly upside:</span>
                      <span className="text-yellow-400">$50K - $1M</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-2xl p-6 relative overflow-hidden">
                  {/* Background Image */}
                  <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2128&q=80")'
                  }} />
                  <div className="relative z-10">
                    <h4 className="text-xl font-bold text-white mb-3 flex items-center">
                      <span className="mr-2">🎯</span>
                      Real Example:
                    </h4>
                    <p className="text-gray-300 mb-3">
                      <strong className="text-yellow-400">Sarah — marketer, zero publishing experience.</strong> One run through Lekhika → a 180-page book, audiobook script, launch emails, and bonus workbook. #1 in her category and $75K collected in 90 days.
                    </p>
                    <p className="text-gray-300 text-sm italic">
                      “I thought AI would give me a draft. Instead it delivered an entire product suite in my voice. My audience thinks I spent six months on it.”
                    </p>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-2 right-2 text-2xl"
                    >
                      😍
                    </motion.div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-2xl p-6 border border-yellow-400/30">
                  <h4 className="text-lg font-bold text-yellow-400 mb-3">🚀 Run This:</h4>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Feed Lekhika your positioning + outcomes.</li>
                    <li>• Approve the table of contents and voice profile.</li>
                    <li>• Receive book, audiobook script, lead magnets, and launch emails.</li>
                    <li>• Publish and route to a high-ticket offer or membership.</li>
                    <li>• Repeat with different hooks to dominate your niche.</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Use Case 2: Content Agency */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, rotateY: 5 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30 hover:border-yellow-400/50 transition-all"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-yellow-400 mb-4">🏢 The Content Agency</h3>
                <p className="text-gray-300 text-lg">Sell premium retainers without hiring an army</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-700/50 rounded-2xl p-6">
                  <h4 className="text-xl font-bold text-white mb-3">💰 The Play:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Active clients serviced:</span>
                      <span className="text-yellow-400 font-bold">50+ simultaneously</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Average retainer:</span>
                      <span className="text-yellow-400 font-bold">$2,000 - $10,000/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Profit margin:</span>
                      <span className="text-yellow-400 font-bold">80-90%</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-2">
                      <span className="text-white">Monthly revenue ceiling:</span>
                      <span className="text-yellow-400">$100K - $500K</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-2xl p-6">
                  <h4 className="text-xl font-bold text-white mb-3">🎯 Real Example:</h4>
                  <p className="text-gray-300 mb-3">
                    <strong className="text-yellow-400">Raj, agency founder.</strong> Started with three local clients. With Lekhika running fulfillment, he now handles 47 retainers, delivers 3x better conversion metrics, and still sleeps.
                  </p>
                  <p className="text-gray-300 text-sm italic">
                    “Clients think I hired twenty writers. It’s me, Lekhika, and two account managers.”
                  </p>
                </div>

                <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-2xl p-6 border border-yellow-400/30">
                  <h4 className="text-lg font-bold text-yellow-400 mb-3">🚀 Run This:</h4>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Productize deliverables—blogs, socials, emails, scripts, sales assets.</li>
                    <li>• Load client intel into shared workspaces.</li>
                    <li>• Let the agent squad generate, polish, and format each deliverable.</li>
                    <li>• Review, approve, and deliver under your brand.</li>
                    <li>• Scale retainers with zero new payroll.</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Use Case 3: Course Creator */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, rotateY: 5 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30 hover:border-yellow-400/50 transition-all"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-yellow-400 mb-4">🎓 The Course Empire</h3>
                <p className="text-gray-300 text-lg">Monetize expertise instantly and on repeat</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-700/50 rounded-2xl p-6">
                  <h4 className="text-xl font-bold text-white mb-3">💰 The Play:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Course creation time:</span>
                      <span className="text-yellow-400 font-bold">2-3 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Course price:</span>
                      <span className="text-yellow-400 font-bold">$297 - $2,997</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Students per month:</span>
                      <span className="text-yellow-400 font-bold">50-200</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-2">
                      <span className="text-white">Monthly recurring:</span>
                      <span className="text-yellow-400">$15K - $600K</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-2xl p-6">
                  <h4 className="text-xl font-bold text-white mb-3">🎯 Real Example:</h4>
                    <p className="text-gray-300 mb-3">
                      <strong className="text-yellow-400">Priya — consultant turned educator.</strong> Built 12 offer-aligned courses in four weeks, complete with workbooks, slides, and funnels. Now pulls $45K every month—on autopilot.
                  </p>
                  <p className="text-gray-300 text-sm italic">
                    “It’s like having a faculty of specialists writing, designing, and launching for me 24/7.”
                  </p>
                </div>

                <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-2xl p-6 border border-yellow-400/30">
                  <h4 className="text-lg font-bold text-yellow-400 mb-3">🚀 Run This:</h4>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Upload your frameworks or pillar lessons.</li>
                    <li>• Approve curriculum structure, lesson sequencing, and tone.</li>
                    <li>• Receive scripts, slides, workbooks, promo sequences, and sales page.</li>
                    <li>• Launch across cohorts, evergreen, or licensing models.</li>
                    <li>• Clone the process for every micro-niche you own.</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 rounded-3xl p-12 border border-yellow-400/50 max-w-5xl mx-auto">
              <h3 className="text-4xl font-bold text-yellow-400 mb-6">🤔 What Happens If You Don’t Pick?</h3>
              <p className="text-2xl text-gray-300 mb-8">
                The market is already moving with these plays. Every week another competitor drops a “brand-new” book, course, or funnel—and most of them are powered by Lekhika. <span className="text-yellow-400 font-bold">You can own the narrative or watch it happen.</span>
              </p>
              <motion.button
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0 25px 50px rgba(255, 215, 0, 0.6)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 px-16 py-8 rounded-3xl text-2xl font-bold flex items-center space-x-4 shadow-2xl border-2 border-yellow-400 text-black mx-auto"
              >
                <Crown className="w-8 h-8" />
                <span>LAUNCH YOUR CAMPAIGN NOW</span>
                <ArrowRight className="w-8 h-8" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brutally Honest Reality Check */}
      <section className="py-20 px-4 bg-gradient-to-r from-black/60 via-gray-900/60 to-black/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center bg-gray-800/70 border border-gray-600/50 rounded-full px-8 py-3">
              <span className="text-sm uppercase tracking-[0.4em] text-gray-400">BRUTALLY HONEST MODE</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mt-6 mb-6 bg-gradient-to-r from-yellow-400 via-white to-yellow-500 bg-clip-text text-transparent">
              We Do Everything Copy.ai Does—And Everything They Won’t Touch
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
              Here’s the unfiltered truth about how we build, launch, and scale content machines—and what it demands from you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-5"
            >
              <h3 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <span>Where We Go Harder</span>
              </h3>
              {brutalStrengths.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 * index }}
                  viewport={{ once: true }}
                  className="bg-gray-800/60 rounded-3xl p-6 border border-gray-600/40 hover:border-yellow-400/40 transition-all"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-yellow-300 flex-shrink-0">
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">{item.title}</h4>
                      <p className="text-gray-300 leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-5"
            >
              <h3 className="text-2xl font-bold text-emerald-400 mb-4 flex items-center space-x-3">
                <Shield className="w-6 h-6 text-emerald-400" />
                <span>Where We Keep It Real</span>
              </h3>
              {brutalTruths.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 * index }}
                  viewport={{ once: true }}
                  className="bg-gray-800/40 rounded-3xl p-6 border border-gray-600/30 hover:border-emerald-400/40 transition-all"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">{item.title}</h4>
                      <p className="text-gray-300 leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="bg-gradient-to-r from-yellow-500/20 via-emerald-500/20 to-yellow-500/20 border border-yellow-400/40 rounded-3xl p-10 text-center">
              <p className="text-2xl text-gray-100 font-semibold mb-4">
                We’re not just “ChatGPT with extra buttons.” We’re the multi-agent war room that writes, designs, formats, and monetizes—then tells you the truth about the work required.
              </p>
              <p className="text-lg text-gray-300">
                If you want copycat shortcuts, grab Copy.ai. If you want a strike team that makes your brand unstoppable, you’re home.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Competitive Matrix */}
      <section className="py-24 px-4 bg-gradient-to-r from-gray-900/40 via-black/60 to-gray-900/40 backdrop-blur-sm relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-60 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-gradient-to-br from-yellow-500/15 to-rose-500/15 rounded-full blur-3xl"
            animate={{ rotate: [0, 45, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-36 -left-24 w-[24rem] h-[24rem] bg-gradient-to-tr from-emerald-500/15 to-cyan-500/15 rounded-full blur-3xl"
            animate={{ rotate: [0, -35, 0], scale: [1.1, 0.95, 1.1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center bg-gray-800/70 border border-gray-600/50 rounded-full px-8 py-3">
              <span className="text-sm uppercase tracking-[0.4em] text-gray-400">WAR ROOM REPORT</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mt-6 mb-6 bg-gradient-to-r from-yellow-400 via-white to-yellow-500 bg-clip-text text-transparent">
              Compare the Strike Teams
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
              We put Lekhika in the arena with every “AI writer” people mention. Here’s how the unstoppable multi-agent arsenal stacks up.
            </p>
          </motion.div>

          <div className="relative">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-separate border-spacing-y-6">
                <thead>
                  <tr className="text-sm uppercase tracking-[0.3em] text-gray-400">
                    <th className="text-left py-4 pr-6 pl-4">Capability</th>
                    {competitorColumns.map(column => (
                      <th key={column.key} className="text-center py-4 px-3">
                        {column.highlight ? (
                          <div className="relative overflow-hidden rounded-2xl border border-yellow-300/60 bg-gradient-to-br from-yellow-500/30 via-yellow-400/20 to-yellow-500/30 px-5 py-4 shadow-[0_18px_40px_rgba(250,204,21,0.25)]">
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                            />
                            <p className="text-lg font-bold text-yellow-100">{column.label}</p>
                            <p className="text-xs text-yellow-50/80 tracking-[0.4em]">{column.badge}</p>
                            <p className="text-[11px] uppercase tracking-[0.45em] text-yellow-200/80 mt-2">{column.tagline}</p>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-gray-700/60 bg-gray-800/50 px-5 py-4">
                            <p className="text-lg font-semibold text-gray-200">{column.label}</p>
                            <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400 mt-2">{column.tagline}</p>
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competitorMatrix.map((row, index) => (
                    <motion.tr
                      key={row.feature}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      viewport={{ once: true }}
                      className="align-top"
                    >
                      <td className="pr-6 pl-4">
                        <div className="h-full rounded-3xl border border-gray-700/60 bg-gradient-to-br from-gray-900/70 to-gray-800/60 p-6">
                          <p className="text-xl font-semibold text-white mb-2">{row.feature}</p>
                          <p className="text-sm text-gray-400 leading-relaxed">{row.detail}</p>
                        </div>
                      </td>
                      {competitorColumns.map(column => (
                        <td key={`${row.feature}-${column.key}`} className="px-3">
                          {renderStatusCell(row.status[column.key], column.highlight)}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-emerald-500/20 border border-yellow-400/40 rounded-3xl p-10 grid lg:grid-cols-3 gap-8">
              <div className="text-center lg:text-left">
                <p className="text-sm uppercase tracking-[0.5em] text-yellow-200/80 mb-3">Outcome</p>
                <p className="text-3xl font-bold text-white leading-snug">
                  You walk away with unstoppable conversion ecosystems. They hand you drafts.
                </p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-black text-yellow-200 mb-2">10x</p>
                <p className="text-gray-300 text-sm uppercase tracking-[0.3em]">Faster Time-to-Launch</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-black text-emerald-200 mb-2">97.3%</p>
                <p className="text-gray-300 text-sm uppercase tracking-[0.3em]">Success Rate Sealed</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Stack */}
      <section className="py-24 px-4 bg-gradient-to-r from-black/60 via-gray-900/60 to-black/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25], rotate: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-yellow-500/15 to-orange-500/15 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 0.9, 1.2], opacity: [0.2, 0.5, 0.2], rotate: [0, -40, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/4 left-1/6 w-[26rem] h-[26rem] bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="mb-16 grid gap-10 lg:grid-cols-[1.2fr,0.8fr]"
          >
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-gray-800/70 border border-gray-600/50 rounded-full px-8 py-3">
                <span className="text-sm uppercase tracking-[0.4em] text-gray-400">What You Actually Get</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mt-6 mb-6 bg-gradient-to-r from-yellow-400 via-white to-yellow-500 bg-clip-text text-transparent">
                Your Unstoppable Value Stack
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
                This isn’t a “prompt pack.” It’s the war chest that turns every idea into a revenue engine—built so you can execute again and again without waiting on freelancers or agencies.
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-gradient-to-br from-yellow-500/20 via-yellow-400/10 to-yellow-500/20 border border-yellow-400/40 rounded-3xl p-8 backdrop-blur-sm shadow-[0_22px_55px_rgba(250,204,21,0.18)]"
            >
              <h3 className="text-2xl font-bold text-yellow-200 mb-3 uppercase tracking-[0.35em]">Total Value</h3>
              <p className="text-6xl font-black text-white mb-4">$11,482+</p>
              <p className="text-yellow-100 text-lg">
                Today you get the entire arsenal for a fraction of a single agency retainer. Turn even one book, funnel, or course into profit and you’ve already doubled your investment.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="mt-6 inline-flex items-center space-x-3 rounded-full border border-yellow-300/60 bg-yellow-400/20 px-6 py-3 text-sm font-semibold text-yellow-100 uppercase tracking-[0.35em]"
              >
                <Rocket className="w-4 h-4" />
                <span>Claim the stack</span>
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center space-x-2 rounded-full border border-yellow-300/40 bg-yellow-500/10 px-5 py-2 uppercase tracking-[0.4em] text-xs text-yellow-200">Core Stack</span>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: 'Core Command Center',
                badge: 'Platform',
                description: 'Multi-agent orchestration with GPT-4, Claude, Gemini, and our proprietary QA engines aligned to your voice, niche, and offers.',
                icon: Crown
              },
              {
                title: 'Agent Arsenal',
                badge: 'Personas',
                description: 'Pre-built specialist agents (Ora, Flux, Nova, Vexa, Pulse) plus templates to create your own brand voice assassins.',
                icon: Brain
              },
              {
                title: 'Launch Blueprint Library',
                badge: 'Workflows',
                description: 'High-ticket books, funnel stacks, evergreen courses, PLR empires—each mapped with step-by-step runbooks and checkpoints.',
                icon: Target
              },
              {
                title: 'Ops Enablement Suite',
                badge: 'Systems',
                description: 'Formatting engine (Kindle, PDF, DOCX, slides), compliance guardrails, AI-detector stress testing, version control, and export automations.',
                icon: FileText
              },
              {
                title: 'Revenue Intelligence',
                badge: 'Insights',
                description: 'Performance telemetry showing which campaigns to launch next, conversion benchmarks, and win-playbooks from top operators.',
                icon: BarChart3
              },
              {
                title: 'Operator Support + Guarantee',
                badge: 'Backstop',
                description: 'Live strategy labs, implementation office hours, priority concierge, plus a 30-day “launch or we pay” money-back guarantee.',
                icon: Shield
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-900/70 to-gray-800/70 border border-gray-700/60 rounded-3xl p-8 backdrop-blur-sm shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-yellow-300/80">{item.badge}</p>
                    <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center space-x-2 rounded-full border border-purple-300/40 bg-purple-500/10 px-5 py-2 uppercase tracking-[0.4em] text-xs text-purple-200">Bonus Arsenal</span>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {[
              {
                title: 'Bonus #1 — “Launch Lab” Masterclass Series',
                value: '$1,997 value',
                description: 'Six live intensives where we dissect your offers, build go-to-market plans, and plug Lekhika directly into your funnel. Hosted by the same team that engineered $2.8M+ with the platform.',
                icon: Lightbulb
              },
              {
                title: 'Bonus #2 — Done-For-You Asset Templates',
                value: '$1,497 value',
                description: '24 premium assets (books, sales letters, webinar decks, onboarding sequences, PLR packs) pre-formatted with storytelling, proof, and objection handling. Swap your details and ship.',
                icon: FileText
              },
              {
                title: 'Bonus #3 — Operator Community + Swipe Vault',
                value: '$997 value',
                description: 'Private access to high-performing operators sharing metrics, scripts, funnels, and real-time feedback. Weekly breakdowns of campaigns converting right now.',
                icon: Users
              },
              {
                title: 'Bonus #4 — Agency White-Label License',
                value: '$2,497 value',
                description: 'Deliver client work under your brand with white-label exports, pricing calculators, onboarding funnels, and fulfillment SOPs.',
                icon: Wand2
              }
            ].map((bonus, index) => (
              <motion.div
                key={bonus.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative overflow-hidden bg-gradient-to-br from-gray-900/70 to-gray-800/70 border border-purple-400/40 rounded-3xl p-8 backdrop-blur-sm shadow-[0_18px_45px_rgba(124,58,237,0.25)]"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl border border-purple-400/50 bg-purple-500/10 flex items-center justify-center">
                        <bonus.icon className="w-6 h-6 text-purple-200" />
                      </div>
                      <h3 className="text-2xl font-bold text-white leading-snug">{bonus.title}</h3>
                    </div>
                    <span className="text-purple-200 text-sm font-semibold uppercase tracking-[0.3em]">{bonus.value}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{bonus.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Objection Handling */}
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
              "But Wait... What If..."
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              You’re ready to run unstoppable campaigns, but a few questions are probably screaming in your head. Let’s demolish them.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">🤔 “I’m not tech-savvy enough to run this.”</h3>
                <div className="space-y-3 text-gray-300 text-lg">
                  <p>
                    <span className="text-yellow-300 font-semibold uppercase tracking-[0.3em] text-xs mr-3">Pain Flash:</span>
                    You’re imagining dashboards, prompts, and a PhD in prompt engineering.
                  </p>
                  <p>
                    <span className="text-emerald-300 font-semibold uppercase tracking-[0.3em] text-xs mr-3">Reality:</span>
                    If you can fill out a form and click “generate,” you’re in. Every workflow is buttoned up with presets, guardrails, and undo.
                  </p>
                  <p>
                    <span className="text-white font-semibold uppercase tracking-[0.3em] text-xs mr-3">Outcome:</span>
                    70-year-old authors, first-time founders, and seasoned CMOs all ship bestsellers without touching the backend.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">😰 “What if the content isn’t good enough?”</h3>
                <div className="space-y-3 text-gray-300 text-lg">
                  <p>
                    <span className="text-yellow-300 font-semibold uppercase tracking-[0.3em] text-xs mr-3">Pain Flash:</span>
                    You’ve seen bland AI outputs that sound like a high-school essay.
                  </p>
                  <p>
                    <span className="text-emerald-300 font-semibold uppercase tracking-[0.3em] text-xs mr-3">Reality:</span>
                    Every agent is trained on human-tested frameworks, tone guides, and plagiarism + AI detection stress tests before you export.
                  </p>
                  <p>
                    <span className="text-white font-semibold uppercase tracking-[0.3em] text-xs mr-3">Outcome:</span>
                    97.3% success rate, 40%+ conversion funnels, and readers who swear a human wrote it—or you get every penny back.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">⏰ “What if I don’t have time?”</h3>
                <div className="space-y-3 text-gray-300 text-lg">
                  <p>
                    <span className="text-yellow-300 font-semibold uppercase tracking-[0.3em] text-xs mr-3">Pain Flash:</span>
                    Endless drafts, edits, and meetings already choke your calendar.
                  </p>
                  <p>
                    <span className="text-emerald-300 font-semibold uppercase tracking-[0.3em] text-xs mr-3">Reality:</span>
                    Lekhika composes books, funnels, nurture arcs, and assets simultaneously—hours instead of weeks.
                  </p>
                  <p>
                    <span className="text-white font-semibold uppercase tracking-[0.3em] text-xs mr-3">Outcome:</span>
                    Create a bestseller in 30 minutes, fill a month’s content calendar in two hours, and spend the rest selling or sleeping.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">💰 “What if I can’t afford it?”</h3>
                <div className="space-y-3 text-gray-300 text-lg">
                  <p>
                    <span className="text-yellow-300 font-semibold uppercase tracking-[0.3em] text-xs mr-3">Pain Flash:</span>
                    You’ve burned cash on tools that never moved the revenue needle.
                  </p>
                  <p>
                    <span className="text-emerald-300 font-semibold uppercase tracking-[0.3em] text-xs mr-3">Reality:</span>
                    One book, funnel, or course launch routinely covers the upfront. At 70% off, most operators break even within the first week.
                  </p>
                  <p>
                    <span className="text-white font-semibold uppercase tracking-[0.3em] text-xs mr-3">Outcome:</span>
                    Replace $5K-$15K/month agency retainers with a single upfront investment—and keep every dollar you create.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">🎯 “What if I’m not creative?”</h3>
                <div className="space-y-3 text-gray-300 text-lg">
                  <p>
                    <span className="text-yellow-300 font-semibold uppercase tracking-[0.3em] text-xs mr-3">Pain Flash:</span>
                    You worry you’ll stare at options and still not know what to say.
                  </p>
                  <p>
                    <span className="text-emerald-300 font-semibold uppercase tracking-[0.3em] text-xs mr-3">Reality:</span>
                    Lekhika supplies the strategy, angles, and emotional beats; you add your perspective and stories. The agents learn your cadence and slang as they go.
                  </p>
                  <p>
                    <span className="text-white font-semibold uppercase tracking-[0.3em] text-xs mr-3">Outcome:</span>
                    Scripts, emails, sales pages, and books that sound like you on your best day—even if “writing” isn’t your job.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">🚀 “What if I still fail?”</h3>
                <div className="space-y-3 text-gray-300 text-lg">
                  <p>
                    <span className="text-yellow-300 font-semibold uppercase tracking-[0.3em] text-xs mr-3">Pain Flash:</span>
                    You’ve been burned by lofty promises before.
                  </p>
                  <p>
                    <span className="text-emerald-300 font-semibold uppercase tracking-[0.3em] text-xs mr-3">Reality:</span>
                    97.3% success rate, live operator support, and a 30-day “launch or we pay” guarantee mean you’re covered in every direction.
                  </p>
                  <p>
                    <span className="text-white font-semibold uppercase tracking-[0.3em] text-xs mr-3">Outcome:</span>
                    Either you launch unstoppable assets—or we refund you in full. Risk eliminated. Momentum guaranteed.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 rounded-3xl p-12 border border-yellow-400/50 max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-yellow-400 mb-6">💡 The Real Question Is:</h3>
              <p className="text-2xl text-gray-300 mb-8">
                What if you DON'T get Lekhika? What if you keep struggling with mediocre content while 
                others build empires? <span className="text-yellow-400 font-bold">That's the real risk.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Meet the Multi-AI Hit Squad */}
      <section className="py-24 px-4 bg-gradient-to-r from-purple-900/40 via-black/60 to-purple-900/40 backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35], rotate: [0, 45, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-br from-yellow-500/20 to-pink-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.45, 0.2], rotate: [0, -60, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/4 right-1/5 w-[28rem] h-[28rem] bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-purple-500/20 border border-purple-400/50 rounded-full px-8 py-3 mb-6">
              <span className="text-purple-200 font-semibold tracking-[0.4em] text-xs uppercase">COMMAND ROOM</span>
            </div>
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-300 via-white to-pink-300 bg-clip-text text-transparent">
              Meet the Multi-AI Hit Squad
            </h2>
            <p className="text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              Every project inside Lekhika is executed by a ruthless crew of specialised agents—each with a face, attitude, and mission. They don’t “assist.” They take over your to-do list and hand you unstoppable, bestseller-grade assets on a silver platter.
            </p>
          </motion.div>

          <div className="grid xl:grid-cols-[1.1fr,0.9fr] gap-12">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeAgentProfile.name}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.4 }}
                  className="bg-gradient-to-br from-gray-900/80 via-gray-900/90 to-gray-800/80 border border-yellow-400/30 rounded-3xl p-10 shadow-[0_25px_80px_rgba(0,0,0,0.45)] relative overflow-hidden"
                >
                  <motion.div
                    animate={{ rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"
                  />
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="text-6xl">{activeAgentProfile.emoji}</div>
                        <div>
                          <h3 className="text-4xl font-bold text-white">{activeAgentProfile.name}</h3>
                          <p className="text-lg text-yellow-300 font-semibold uppercase tracking-wider">
                            {activeAgentProfile.codename}
                          </p>
                        </div>
                      </div>
                      <div className="hidden md:flex flex-col items-end text-sm text-gray-400">
                        <span className="uppercase tracking-[0.4em]">Ops Online</span>
                        <span className="text-yellow-300 font-semibold">Ready to deploy</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/60 rounded-2xl p-6">
                      <p className="text-sm text-gray-400 uppercase tracking-[0.3em] mb-2">Primary Mission</p>
                      <p className="text-xl text-gray-100 font-medium">{activeAgentProfile.headline}</p>
                    </div>

                    <p className="text-lg text-gray-300 leading-relaxed">
                      {activeAgentProfile.description}
                    </p>

                    <div>
                      <p className="text-sm text-gray-400 uppercase tracking-[0.3em] mb-3">Signature Weapons</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {activeAgentProfile.weapons.map(weapon => (
                          <div
                            key={weapon}
                            className="flex items-center space-x-3 bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3"
                          >
                            <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                            <span className="text-sm text-gray-200">{weapon}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-500/20 to-pink-500/20 border border-yellow-400/40 rounded-2xl p-6">
                      <p className="text-sm text-yellow-300 uppercase tracking-[0.4em] mb-2">Deliverable</p>
                      <p className="text-lg text-white leading-relaxed">{activeAgentProfile.signature}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-gray-300 text-sm uppercase tracking-[0.4em]">Tap to deploy an agent</p>
              <div className="grid sm:grid-cols-2 gap-6">
                {squadProfiles.map((agent, index) => {
                  const isActive = index === activeAgent
                  return (
                    <motion.button
                      type="button"
                      key={agent.name}
                      onMouseEnter={() => setActiveAgent(index)}
                      onFocus={() => setActiveAgent(index)}
                      onClick={() => setActiveAgent(index)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`text-left rounded-2xl px-5 py-6 border transition-all backdrop-blur-sm ${
                        isActive
                          ? 'border-yellow-400/70 bg-yellow-500/15 shadow-[0_10px_30px_rgba(234,179,8,0.15)]'
                          : 'border-gray-700/50 bg-gray-800/40 hover:border-yellow-400/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-3xl">{agent.emoji}</span>
                        <div>
                          <p className="text-lg font-semibold text-white">{agent.name}</p>
                          <p className="text-xs text-gray-400 uppercase tracking-[0.35em]">{agent.codename}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{agent.headline}</p>
                    </motion.button>
                  )
                })}
              </div>
              <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl p-6 text-sm text-gray-400 leading-relaxed">
                Rename, reskin, or expand the squad inside your workspace—we architect the core personalities so your brand
                can weaponize them for books, launches, PLR libraries, client work, and whatever empire you’re building next.
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
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
              Operators Who Switched To Unstoppable Mode
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              Real campaigns, real numbers, real people who let the war room take over.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30 relative overflow-hidden"
            >
              {/* Background Image */}
              <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'
              }} />
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/95 to-gray-900/95" />
              
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-black font-bold">RK</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Raj Kumar</h4>
                    <p className="text-gray-400">Mumbai • Marketing Agency Owner</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 text-lg mb-4">
                  "I made $50,000 from my first book created with Lekhika. It took me 25 minutes to create 
                  and became a #1 bestseller on Amazon India. My competitors are still wondering how I did it."
                </p>
                <div className="bg-gray-700/50 rounded-2xl p-4">
                  <p className="text-yellow-400 font-bold text-sm">Revenue Generated: $50,000</p>
                  <p className="text-gray-400 text-sm">Time Invested: 25 minutes</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-black font-bold">PS</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Priya Sharma</h4>
                  <p className="text-gray-400">Delhi • Course Creator</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 text-lg mb-4">
                "I created 12 courses in my first month with Lekhika. Each one generates passive income 24/7. 
                I'm making $45,000/month while I sleep. This is insane."
              </p>
              <div className="bg-gray-700/50 rounded-2xl p-4">
                <p className="text-yellow-400 font-bold text-sm">Monthly Income: $45,000</p>
                <p className="text-gray-400 text-sm">Courses Created: 12</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-black font-bold">AP</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Amit Patel</h4>
                  <p className="text-gray-400">Bangalore • Content Agency Owner</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 text-lg mb-4">
                "My agency went from 3 clients to 47 clients in 6 months. I charge premium rates because 
                Lekhika delivers content that converts 3x better than my competitors. My clients think I have a team of 20 writers."
              </p>
              <div className="bg-gray-700/50 rounded-2xl p-4">
                <p className="text-yellow-400 font-bold text-sm">Clients: 47</p>
                <p className="text-gray-400 text-sm">Conversion Rate: 3x better</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-black/50 to-gray-800/30 backdrop-blur-sm relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'
        }} />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-gray-800/80" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-8"
            >
              <span className="text-6xl">🔥</span>
            </motion.div>
            
            <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              This Is The Line Between Drafts And Dominance
            </h2>
            <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
              While everyone else is still “prompt perfecting,” you can be rolling out launch-ready assets that sound like you, sell like crazy, and are formatted to ship. The question isn’t whether AI will write—it's whether it will write for you or your competition.
            </p>
            
            {/* Emotional Elements */}
            <div className="flex justify-center space-x-8 mb-12">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl"
              >
                💰
              </motion.div>
              <motion.div
                animate={{ 
                  y: [0, 10, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="text-4xl"
              >
                🚀
              </motion.div>
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 3, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-4xl"
              >
                ⚡
              </motion.div>
            </div>

            <div className="bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 rounded-3xl p-12 border border-yellow-400/50 max-w-4xl mx-auto mb-12">
              <h3 className="text-3xl font-bold text-yellow-400 mb-6">⚡ LIMITED OPERATOR ACCESS: 70% OFF</h3>
              <div className="flex items-center justify-center space-x-6 text-2xl font-bold mb-8">
                <div className="text-center">
                  <div className="bg-gray-800 rounded-xl px-4 py-3 border-2 border-yellow-400">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-sm text-gray-400 mt-2">HOURS</div>
                </div>
                <div className="text-yellow-400 text-3xl">:</div>
                <div className="text-center">
                  <div className="bg-gray-800 rounded-xl px-4 py-3 border-2 border-yellow-400">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-sm text-gray-400 mt-2">MIN</div>
                </div>
                <div className="text-yellow-400 text-3xl">:</div>
                <div className="text-center">
                  <div className="bg-gray-800 rounded-xl px-4 py-3 border-2 border-yellow-400">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-sm text-gray-400 mt-2">SEC</div>
                </div>
              </div>
              <p className="text-yellow-400 font-bold text-xl mb-8">⚡ PRICE GOES BACK TO $997 TOMORROW—SECURE YOUR COMMAND CENTER NOW ⚡</p>
            </div>

            <motion.button
              whileHover={{
                scale: 1.1,
                boxShadow: "0 25px 50px rgba(255, 215, 0, 0.6)",
                rotateY: 5
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 px-20 py-10 rounded-3xl text-3xl font-bold flex items-center space-x-4 shadow-2xl border-2 border-yellow-400 text-black mx-auto"
            >
              <Rocket className="w-10 h-10 animate-bounce" />
              <span>ARM YOURSELF WITH LEKHIKA – 70% OFF</span>
              <ArrowRight className="w-10 h-10 animate-pulse" />
            </motion.button>

            <p className="text-gray-400 text-lg mt-8">
              ⚡ 30-day money-back guarantee • No questions asked • Launch unstoppable assets today
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Live
