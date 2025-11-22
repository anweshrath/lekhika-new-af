import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Mail, 
  Megaphone, 
  Users, 
  TrendingUp,
  Lightbulb,
  Target,
  Zap,
  Search,
  Filter,
  Star,
  Clock,
  Copy,
  Wand2
} from 'lucide-react'

const CopyAITemplates = ({ onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Templates', icon: FileText },
    { id: 'marketing', name: 'Marketing', icon: Megaphone },
    { id: 'sales', name: 'Sales', icon: TrendingUp },
    { id: 'content', name: 'Content', icon: FileText },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'social', name: 'Social Media', icon: Users },
    { id: 'ads', name: 'Advertisements', icon: Target }
  ]

  const templates = [
    // Marketing Templates
    {
      id: 'blog-post',
      name: 'Blog Post Generator',
      description: 'Create engaging blog posts that drive traffic and conversions',
      category: 'content',
      icon: FileText,
      popular: true,
      inputs: ['Topic', 'Target Audience', 'Tone', 'Keywords'],
      example: 'Generate a 1500-word blog post about "AI in Healthcare" for medical professionals'
    },
    {
      id: 'email-sequence',
      name: 'Email Marketing Sequence',
      description: 'Build automated email sequences that nurture leads',
      category: 'email',
      icon: Mail,
      popular: true,
      inputs: ['Product/Service', 'Audience', 'Goal', 'Sequence Length'],
      example: 'Create a 5-email welcome sequence for new SaaS subscribers'
    },
    {
      id: 'sales-copy',
      name: 'Sales Page Copy',
      description: 'Write high-converting sales pages that sell',
      category: 'sales',
      icon: TrendingUp,
      popular: true,
      inputs: ['Product', 'Benefits', 'Target Market', 'Price Point'],
      example: 'Create sales copy for an online course about digital marketing'
    },
    {
      id: 'social-media',
      name: 'Social Media Posts',
      description: 'Generate engaging posts for all social platforms',
      category: 'social',
      icon: Users,
      inputs: ['Platform', 'Topic', 'Tone', 'Call to Action'],
      example: 'Create 10 LinkedIn posts about productivity tips for entrepreneurs'
    },
    {
      id: 'ad-copy',
      name: 'Facebook Ad Copy',
      description: 'Create scroll-stopping ad copy that converts',
      category: 'ads',
      icon: Target,
      inputs: ['Product', 'Audience', 'Objective', 'Budget'],
      example: 'Write Facebook ad copy for a fitness app targeting busy professionals'
    },
    {
      id: 'product-description',
      name: 'Product Descriptions',
      description: 'Write compelling product descriptions that sell',
      category: 'marketing',
      icon: Lightbulb,
      inputs: ['Product Name', 'Features', 'Benefits', 'Target Customer'],
      example: 'Create product description for wireless noise-canceling headphones'
    },
    {
      id: 'video-script',
      name: 'Video Script Writer',
      description: 'Create engaging video scripts for any platform',
      category: 'content',
      icon: FileText,
      inputs: ['Video Type', 'Duration', 'Topic', 'Call to Action'],
      example: 'Write a 2-minute explainer video script for a project management tool'
    },
    {
      id: 'press-release',
      name: 'Press Release',
      description: 'Generate professional press releases for media coverage',
      category: 'marketing',
      icon: Megaphone,
      inputs: ['Company', 'News/Event', 'Key Details', 'Contact Info'],
      example: 'Create press release for startup funding announcement'
    },
    {
      id: 'landing-page',
      name: 'Landing Page Copy',
      description: 'Write high-converting landing page copy',
      category: 'marketing',
      icon: Target,
      popular: true,
      inputs: ['Offer', 'Target Audience', 'Benefits', 'Social Proof'],
      example: 'Create landing page copy for a free marketing masterclass'
    },
    {
      id: 'case-study',
      name: 'Case Study Writer',
      description: 'Create compelling case studies that build trust',
      category: 'content',
      icon: FileText,
      inputs: ['Client', 'Challenge', 'Solution', 'Results'],
      example: 'Write case study about 300% ROI increase for e-commerce client'
    }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
        >
          ✨ AI Writing Templates
        </motion.h2>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Choose from 100+ proven templates to create any content in seconds
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 text-lg"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <category.icon className="w-4 h-4 mr-2" />
              {category.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <motion.div 
        layout
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, shadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              className="card cursor-pointer group relative overflow-hidden"
              onClick={() => onSelectTemplate(template)}
            >
              {/* Popular Badge */}
              {template.popular && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </div>
                </div>
              )}

              {/* Magical Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <template.icon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                  {template.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Inputs */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {template.inputs.slice(0, 3).map((input, i) => (
                      <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {input}
                      </span>
                    ))}
                    {template.inputs.length > 3 && (
                      <span className="text-xs text-gray-500">+{template.inputs.length - 3} more</span>
                    )}
                  </div>
                </div>

                {/* Example */}
                <div className="text-xs text-gray-500 dark:text-gray-400 italic mb-4">
                  Example: {template.example}
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full btn-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Use Template
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or browse different categories
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default CopyAITemplates
