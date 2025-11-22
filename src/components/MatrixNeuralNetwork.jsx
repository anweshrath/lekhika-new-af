import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  BookOpen, 
  PenTool, 
  Sparkles, 
  Zap, 
  Target, 
  Eye, 
  Heart,
  Crown,
  Star,
  Flame,
  Shield,
  Sword,
  Wand2,
  Lightbulb,
  Rocket,
  Diamond,
  Moon,
  Sun,
  Send,
  CheckCircle,
  ArrowRight,
  FileText,
  Search,
  TrendingUp,
  Palette,
  Users,
  Globe,
  BookMarked,
  Scroll,
  Compass,
  Layers,
  File,
  FileText as TxtIcon,
  FileImage,
  Download
} from 'lucide-react'

const MatrixNeuralNetwork = () => {
  const canvasRef = useRef(null)
  const [agents, setAgents] = useState([])
  const [connections, setConnections] = useState([])
  const [matrixRain, setMatrixRain] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const [orchestrationFlow, setOrchestrationFlow] = useState([])
  const [bookDispatch, setBookDispatch] = useState([])

  // Ebook Generation Agents - Perfectly Centered Layout with Model Images
  const ebookAgents = [
    {
      id: 'alexa-writer',
      name: 'Alexa Writer',
      personality: 'Creative Storyteller',
      specialty: 'Fiction & Fantasy',
      image: '/model_images/20250625_2342_Elegant Indian Beauty_simple_compose_01jym4kg1ee4dvc6htnazyjays (1).png', // Female model
      color: '#FF6B6B',
      description: 'Master of narrative arcs and character development',
      status: 'active',
      aiModels: ['GPT-4o', 'Claude-3.5-Sonnet', 'Gemini-Pro'],
      x: '20%',
      y: '15%'
    },
    {
      id: 'serena-editor',
      name: 'Serena Editor',
      personality: 'Perfectionist',
      specialty: 'Grammar & Style',
      image: '/model_images/ceab305c-39b8-4700-9ffb-28f737e49822.jpg', // Female model
      color: '#4ECDC4',
      description: 'Ensures every word is perfectly crafted',
      status: 'active',
      aiModels: ['GPT-4o', 'Claude-3.5-Sonnet'],
      x: '40%',
      y: '15%'
    },
    {
      id: 'nova-researcher',
      name: 'Nova Researcher',
      personality: 'Knowledge Seeker',
      specialty: 'Fact-Checking',
      image: '/model_images/c9b5ac83-feae-49af-a612-d62b7747f0a5.jpg', // Female model
      color: '#45B7D1',
      description: 'Deep dives into topics for accuracy',
      status: 'active',
      aiModels: ['GPT-4o', 'Gemini-Pro', 'Claude-3.5-Sonnet'],
      x: '60%',
      y: '15%'
    },
    {
      id: 'phoenix-optimizer',
      name: 'Phoenix Optimizer',
      personality: 'Strategic Thinker',
      specialty: 'SEO & Marketing',
      image: '/model_images/gildan-round-neck-t-shirt-mockup-featuring-a-man-practicing-yoga-on-a-rock-m33654.png', // Male model
      color: '#FFA07A',
      description: 'Optimizes content for maximum reach',
      status: 'active',
      aiModels: ['GPT-4o', 'Gemini-Pro'],
      x: '80%',
      y: '15%'
    },
    {
      id: 'sage-structurer',
      name: 'Sage Structurer',
      personality: 'Architect',
      specialty: 'Content Organization',
      image: '/model_images/lekhika-new1.png', // Female model
      color: '#98D8C8',
      description: 'Builds perfect content architecture',
      status: 'active',
      aiModels: ['Claude-3.5-Sonnet', 'GPT-4o', 'Gemini-Pro'],
      x: '30%',
      y: '50%'
    },
    {
      id: 'aurora-inspirer',
      name: 'Aurora Inspirer',
      personality: 'Motivational',
      specialty: 'Engagement',
      image: '/model_images/generated-image.png', // Female model
      color: '#F7DC6F',
      description: 'Creates emotionally compelling content',
      status: 'active',
      aiModels: ['GPT-4o', 'Claude-3.5-Sonnet'],
      x: '50%',
      y: '50%'
    },
    {
      id: 'cosmos-visionary',
      name: 'Cosmos Visionary',
      personality: 'Innovator',
      specialty: 'Trend Analysis',
      image: '/model_images/generated-image (8).png', // Male model
      color: '#BB8FCE',
      description: 'Predicts and adapts to content trends',
      status: 'active',
      aiModels: ['Gemini-Pro', 'GPT-4o'],
      x: '70%',
      y: '50%'
    },
    {
      id: 'zen-harmonizer',
      name: 'Zen Harmonizer',
      personality: 'Balancer',
      specialty: 'Tone & Voice',
      image: '/model_images/openart-image_o_hqdJc9_1731017405076_raw.jpg', // Female model
      color: '#85C1E9',
      description: 'Maintains consistent brand voice',
      status: 'active',
      aiModels: ['Claude-3.5-Sonnet', 'GPT-4o', 'Gemini-Pro'],
      x: '50%',
      y: '80%'
    }
  ]

  useEffect(() => {
    setAgents(ebookAgents)
    generateConnections()
    generateMatrixRain()
    startOrchestrationFlow()
    
    const interval = setInterval(() => {
      generateMatrixRain()
    }, 300) // Further reduced frequency

    return () => clearInterval(interval)
  }, [])

  const generateConnections = () => {
    const newConnections = []
    
    // Polygon Neural Network - Connect agents in a geometric pattern
    // Top row connections (0-3): Alexa → Serena → Nova → Phoenix
    const topRowConnections = [
      { from: 0, to: 1, type: 'polygon', strength: 0.8, label: 'Writer → Editor' },
      { from: 1, to: 2, type: 'polygon', strength: 0.8, label: 'Editor → Researcher' },
      { from: 2, to: 3, type: 'polygon', strength: 0.8, label: 'Researcher → Optimizer' }
    ]
    
    // Middle row connections (4-6): Sage → Aurora → Cosmos
    const middleRowConnections = [
      { from: 4, to: 5, type: 'polygon', strength: 0.8, label: 'Structurer → Inspirer' },
      { from: 5, to: 6, type: 'polygon', strength: 0.8, label: 'Inspirer → Visionary' }
    ]
    
    // Vertical connections: Top row to middle row
    const verticalConnections = [
      { from: 0, to: 4, type: 'polygon', strength: 0.7, label: 'Writer → Structurer' },
      { from: 1, to: 5, type: 'polygon', strength: 0.7, label: 'Editor → Inspirer' },
      { from: 2, to: 6, type: 'polygon', strength: 0.7, label: 'Researcher → Visionary' },
      { from: 3, to: 7, type: 'polygon', strength: 0.7, label: 'Optimizer → Harmonizer' }
    ]
    
    // Bottom connection: Cosmos → Zen (middle to bottom)
    const bottomConnection = [
      { from: 6, to: 7, type: 'polygon', strength: 0.8, label: 'Visionary → Harmonizer' }
    ]
    
    // Diagonal connections for complete polygon
    const diagonalConnections = [
      { from: 3, to: 4, type: 'diagonal', strength: 0.6, label: 'Optimizer → Structurer' },
      { from: 7, to: 0, type: 'cycle', strength: 0.9, label: 'Complete → New Cycle' }
    ]
    
    // Combine all connections
    const allConnections = [
      ...topRowConnections,
      ...middleRowConnections,
      ...verticalConnections,
      ...bottomConnection,
      ...diagonalConnections
    ]
    
    allConnections.forEach((connection, index) => {
      const fromAgent = ebookAgents[connection.from]
      const toAgent = ebookAgents[connection.to]
      
      if (fromAgent && toAgent) {
        // Convert percentage strings to numeric values for SVG calculations
        const x1 = parseFloat(fromAgent.x)
        const y1 = parseFloat(fromAgent.y)
        const x2 = parseFloat(toAgent.x)
        const y2 = parseFloat(toAgent.y)
        
        newConnections.push({
          id: `polygon-${connection.type}-${index}`,
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2,
          strength: connection.strength,
          active: false,
          flowIndex: index,
          connectionType: connection.type,
          label: connection.label
        })
      }
    })
    
    setConnections(newConnections)
  }

  const generateMatrixRain = () => {
    const rain = []
    for (let i = 0; i < 30; i++) { // More particles for full coverage
      rain.push({
        id: `rain-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        x: Math.random() * 1000, // Wider coverage
        y: Math.random() * 600,  // Taller coverage
        speed: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        size: Math.random() * 1.2 + 0.4
      })
    }
    setMatrixRain(rain)
  }

  const startOrchestrationFlow = () => {
    let currentStep = 0
    const totalConnections = 14 // Total smart connections we created
    
    const flowInterval = setInterval(() => {
      // Update orchestration flow
      const newFlow = Array.from({ length: totalConnections }, (_, index) => ({
        id: `flow-step-${index}`,
        step: index,
        active: index === currentStep
      }))
      setOrchestrationFlow(newFlow)

      // Update connections to show active flow with different colors based on type
      setConnections(prev => prev.map(conn => ({
        ...conn,
        active: conn.flowIndex === currentStep
      })))

      // Dispatch book when cycle completes
      if (currentStep === totalConnections - 1) {
        setTimeout(() => {
          dispatchBook()
        }, 1000)
      }

      currentStep = (currentStep + 1) % totalConnections
    }, 1500) // Faster flow for better visualization
    
    // Store interval ID for cleanup if needed
    return flowInterval
  }

  const dispatchBook = () => {
    const newBook = {
      id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: '50%', // Perfect center
      y: '70%', // Lower center
      title: 'Professional Ebook',
      status: 'dispatched'
    }
    
    setBookDispatch(prev => [...prev.slice(-2), newBook]) // Keep only last 3 books
    
    // Remove book after animation
    setTimeout(() => {
      setBookDispatch(prev => prev.filter(book => book.id !== newBook.id))
    }, 5000)
  }

  const handleAgentClick = (agent) => {
    setSelectedAgent(agent)
    setIsAnimating(false)
    
    setTimeout(() => {
      setIsAnimating(true)
    }, 2000)
  }

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-xl flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
      {/* Matrix Rain Background */}
      <div className="absolute inset-0">
        {matrixRain.map((drop) => (
          <motion.div
            key={drop.id}
            className="absolute rounded-full"
            style={{
              left: drop.x,
              top: drop.y,
              width: drop.size,
              height: drop.size,
              background: 'var(--theme-primary)',
              opacity: drop.opacity
            }}
            animate={{
              y: [0, 600], // Match the taller coverage
              opacity: [drop.opacity, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      {/* Smart Neural Network Connections */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((conn) => {
          // Gold connectors for all edges - the profile pics are the nodes
          const getConnectionColor = (type) => {
            return '#FFD700' // Gold for all connections - they are the edges
          }
          
          const connectionColor = getConnectionColor(conn.connectionType)
          
          return (
            <g key={conn.id}>
              {/* Base Connection Line */}
              <line
                x1={conn.x1}
                y1={conn.y1}
                x2={conn.x2}
                y2={conn.y2}
                stroke={connectionColor}
                strokeWidth="1"
                opacity="0.2"
              />
              
              {/* Animated Active Connection Line */}
              <motion.line
                x1={conn.x1}
                y1={conn.y1}
                x2={conn.x2}
                y2={conn.y2}
                stroke={connectionColor}
                strokeWidth={conn.active ? 4 : 2}
                opacity={conn.active ? 0.9 : 0}
                strokeDasharray={conn.active ? "15,5" : "5,15"}
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: conn.active ? 1 : 0,
                  opacity: conn.active ? [0.3, 1, 0.3] : 0,
                  strokeDashoffset: conn.active ? [0, -20] : [0, -10]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            
              {/* Moving Data Particles */}
              {conn.active && (
                <>
                  {/* Primary Data Particle */}
                  <motion.circle
                    r="4"
                    fill={connectionColor}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 1, 1, 0],
                      cx: [conn.x1, conn.x2],
                      cy: [conn.y1, conn.y2]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 0
                    }}
                  />
                  {/* Secondary Data Particle */}
                  <motion.circle
                    r="2.5"
                    fill={connectionColor}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 0.8, 0.8, 0],
                      cx: [conn.x1, conn.x2],
                      cy: [conn.y1, conn.y2]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 0.5
                    }}
                  />
                  {/* Micro Data Particles */}
                  <motion.circle
                    r="1.5"
                    fill={connectionColor}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 0.6, 0.6, 0],
                      cx: [conn.x1, conn.x2],
                      cy: [conn.y1, conn.y2]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 1
                    }}
                  />
                </>
              )}
              
              {/* Smart Flow Arrow */}
              {conn.active && (
                <motion.polygon
                  points={`${conn.x2-12},${conn.y2-6} ${conn.x2},${conn.y2} ${conn.x2-12},${conn.y2+6}`}
                  fill={connectionColor}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    delay: 0.5
                  }}
                />
              )}
              
              {/* Connection Label (for debugging/visualization) */}
              {conn.active && conn.label && (
                <motion.text
                  x={(conn.x1 + conn.x2) / 2}
                  y={(conn.y1 + conn.y2) / 2 - 10}
                  textAnchor="middle"
                  fill={connectionColor}
                  fontSize="10"
                  fontWeight="bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {conn.label}
                </motion.text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Ebook Generation Agents with Model Images */}
      {agents.map((agent, index) => {
        return (
          <motion.div
            key={agent.id}
            className="absolute cursor-pointer group"
            style={{ left: agent.x, top: agent.y, transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.1, 1],
              opacity: 1
            }}
            transition={{ 
              duration: 0.8, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 200
            }}
            whileHover={{ 
              scale: 1.2,
              transition: { duration: 0.2 }
            }}
            onClick={() => handleAgentClick(agent)}
          >
            {/* Agent Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-full blur-lg"
              style={{ background: agent.color }}
              animate={{
                scale: isAnimating ? [1, 1.6, 1] : 1,
                opacity: isAnimating ? [0.4, 0.8, 0.4] : 0.4
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: index * 0.15
              }}
            />
            
            {/* Secondary Glow Ring */}
            <motion.div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ background: agent.color }}
              animate={{
                scale: isAnimating ? [1, 2, 1] : 1,
                opacity: isAnimating ? [0.1, 0.3, 0.1] : 0.1
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.15 + 0.5
              }}
            />
            
            {/* Agent Model Image with Active Movement */}
            <motion.div
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 transition-all duration-300 group-hover:shadow-2xl"
              style={{ 
                borderColor: agent.color,
                boxShadow: `0 0 30px ${agent.color}60`
              }}
              animate={{
                scale: isAnimating ? [1, 1.05, 1] : 1,
                rotate: isAnimating ? [0, 2, -2, 0] : 0,
                y: isAnimating ? [0, -2, 2, 0] : 0
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2
              }}
            >
              <motion.img
                src={agent.image}
                alt={agent.name}
                className="w-full h-full object-cover"
                animate={{
                  scale: isAnimating ? [1, 1.1, 1] : 1,
                  filter: isAnimating ? [
                    'brightness(1)',
                    'brightness(1.2)',
                    'brightness(1)'
                  ] : 'brightness(1)'
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3
                }}
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              {/* Fallback Icon */}
              <div
                className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700"
                style={{ display: 'none' }}
              >
                <FileText className="w-8 h-8" style={{ color: agent.color }} />
              </div>
              
              {/* Active Working Indicator */}
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: agent.color }}
                animate={{
                  scale: isAnimating ? [1, 1.3, 1] : 1,
                  opacity: isAnimating ? [0.8, 1, 0.8] : 0.8
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-white"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Agent Name */}
            <motion.div
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-center whitespace-nowrap"
              style={{ color: 'var(--color-text)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            >
              {agent.name}
            </motion.div>

            {/* AI Models - Smart Positioning to Avoid Glow Overlap */}
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 text-center"
              style={{ 
                // Position above for top and middle rows, below for bottom row
                top: agent.y === '80%' ? '120px' : '-80px'
              }}
              initial={{ opacity: 0, y: agent.y === '80%' ? 10 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.7 }}
            >
              <div className="flex flex-col gap-1 items-center">
                {agent.aiModels.map((model, modelIndex) => (
                  <motion.div
                    key={model}
                    className="text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap"
                    style={{ 
                      background: `${agent.color}15`,
                      color: agent.color,
                      border: `1px solid ${agent.color}30`,
                      backdropFilter: 'blur(10px)'
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: index * 0.1 + 0.7 + modelIndex * 0.1,
                      type: "spring",
                      stiffness: 200
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      background: `${agent.color}25`
                    }}
                  >
                    {model}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Status Indicator */}
            <motion.div
              className="absolute -top-3 -right-3 w-5 h-5 rounded-full border-2"
              style={{ 
                background: agent.status === 'active' ? '#10B981' : '#EF4444',
                borderColor: 'var(--color-surface)'
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
            />
            
            {/* Pulse Ring */}
            <motion.div
              className="absolute -top-3 -right-3 w-5 h-5 rounded-full border-2"
              style={{ 
                borderColor: agent.status === 'active' ? '#10B981' : '#EF4444'
              }}
              animate={{
                scale: [1, 2, 1],
                opacity: [0.8, 0, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            />
            
          </motion.div>
        )
      })}

      {/* Book Dispatch Animation with Format Icons */}
      {bookDispatch.map((book) => (
        <motion.div
          key={book.id}
          className="absolute"
          style={{ left: book.x, top: book.y, transform: 'translate(-50%, -50%)' }}
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0],
            y: [0, -30, -30, -60]
          }}
          transition={{ duration: 6 }}
        >
          <div className="w-12 h-16 bg-gradient-to-b from-blue-500 via-purple-600 to-pink-500 rounded-lg shadow-2xl flex items-center justify-center border-2 border-white/20">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <motion.div
            className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-xs font-bold text-center whitespace-nowrap"
            style={{ color: 'var(--theme-primary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 3, delay: 1 }}
          >
            {book.title}
          </motion.div>
          
          {/* Format Icons */}
          <motion.div
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
            transition={{ duration: 4, delay: 1.5 }}
          >
            {/* TXT */}
            <motion.div
              className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
            >
              <TxtIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </motion.div>
            
            {/* MD */}
            <motion.div
              className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
            >
              <File className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </motion.div>
            
            {/* PDF */}
            <motion.div
              className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
            >
              <FileImage className="w-4 h-4 text-red-600 dark:text-red-300" />
            </motion.div>
            
            {/* EPUB */}
            <motion.div
              className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
            >
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-300" />
            </motion.div>
            
            {/* DOC */}
            <motion.div
              className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
            >
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
            </motion.div>
          </motion.div>
          
          {/* Book Glow */}
          <motion.div
            className="absolute inset-0 rounded-lg blur-md"
            style={{ background: 'linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899)' }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{ duration: 2, delay: 1 }}
          />
        </motion.div>
      ))}

      {/* Agent Details Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAgent(null)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full overflow-hidden border-2"
                  style={{ borderColor: selectedAgent.color }}
                >
                  <img
                    src={selectedAgent.image}
                    alt={selectedAgent.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div
                    className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700"
                    style={{ display: 'none' }}
                  >
                    <FileText className="w-6 h-6" style={{ color: selectedAgent.color }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {selectedAgent.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {selectedAgent.personality}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                    Specialty:
                  </span>
                  <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                    {selectedAgent.specialty}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                    Description:
                  </span>
                  <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                    {selectedAgent.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ background: selectedAgent.status === 'active' ? '#10B981' : '#EF4444' }}
                  />
                  <span className="text-sm capitalize" style={{ color: 'var(--color-text)' }}>
                    {selectedAgent.status}
                  </span>
                </div>
              </div>
              
              <button
                className="mt-4 w-full py-2 px-4 rounded-lg transition-colors duration-200"
                style={{ 
                  background: selectedAgent.color,
                  color: 'white'
                }}
                onClick={() => setSelectedAgent(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Matrix Code Overlay */}
      <div className="absolute top-4 left-4 text-xs font-mono opacity-30" style={{ color: 'var(--theme-primary)' }}>
        <motion.div
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          EBOOK_ORCHESTRATION_ACTIVE
        </motion.div>
        <motion.div
          animate={{ opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
        >
          AGENTS_SYNCHRONIZED
        </motion.div>
      </div>
    </div>
  )
}

export default MatrixNeuralNetwork
