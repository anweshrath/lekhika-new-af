import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Zap, 
  Users, 
  TrendingUp, 
  Shield, 
  Globe,
  ArrowRight,
  Star,
  CheckCircle,
  Rocket,
  Sparkles
} from 'lucide-react'
import UltraButton from '../components/UltraButton'
import UltraCard from '../components/UltraCard'

const Landing = () => {
  const navigate = useNavigate()
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Generation',
      description: 'Three specialized AI agents work together to research, write, and edit your content with human-like quality.'
    },
    {
      icon: Users,
      title: 'Avatar-Based Targeting',
      description: 'Create detailed customer personas and generate content specifically tailored to your target audience.'
    },
    {
      icon: TrendingUp,
      title: 'Multiple Formats',
      description: 'Generate eBooks, reports, guides, whitepapers, and more in various lengths and styles.'
    },
    {
      icon: Shield,
      title: 'AI Detection Immune',
      description: 'Advanced algorithms ensure your content passes all AI detection tools with flying colors.'
    },
    {
      icon: Globe,
      title: 'Multi-Format Export',
      description: 'Export to PDF, EPUB, DOCX, HTML, and publish directly to major platforms.'
    },
    {
      icon: BookOpen,
      title: 'Professional Quality',
      description: 'Enterprise-grade content that rivals human-written books and reports.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechCorp',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      quote: 'This platform revolutionized our content creation. We went from weeks to hours for high-quality eBooks.'
    },
    {
      name: 'Michael Chen',
      role: 'Business Consultant',
      company: 'Growth Partners',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      quote: 'The AI detection immunity is incredible. Our clients never know the difference from human-written content.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Content Strategist',
      company: 'Digital Agency',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
      quote: 'The avatar targeting feature helps us create content that truly resonates with our audience segments.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">eBook Creator</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black mb-6"
            >
              Create <span className="text-gradient-animated">Professional</span><br />
              eBooks in <span className="text-gradient-animated">Minutes</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-medium mb-10 max-w-3xl mx-auto"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Revolutionary multi-agent AI platform that generates high-quality, AI-detection immune 
              eBooks, reports, and guides tailored to your exact specifications and target audience.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <UltraButton
                onClick={() => navigate('/register')}
                icon={Rocket}
                iconPosition="right"
                size="xl"
                variant="primary"
              >
                Start Creating Now
              </UltraButton>
              
              <motion.div 
                className="flex items-center gap-3 px-6 py-4 rounded-xl"
                style={{
                  background: 'var(--color-surface)',
                  border: '2px solid var(--theme-accent)'
                }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <Star className="w-6 h-6" style={{ color: 'var(--theme-accent)', fill: 'var(--theme-accent)' }} />
                <span className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                  Trusted by 10,000+ creators
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-secondary-200 rounded-full animate-float opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-accent-200 rounded-full animate-float opacity-60" style={{ animationDelay: '4s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our three-agent system ensures every piece of content is researched, written, and edited to perfection.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-fade-in">
            {features.map((feature, index) => (
              <UltraCard
                key={index}
                hover={true}
                glow={index < 3}
              >
                <motion.div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                  style={{
                    background: 'var(--theme-gradient-primary)'
                  }}
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-gradient">
                  {feature.title}
                </h3>
                <p className="text-base font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {feature.description}
                </p>
              </UltraCard>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">10,000+</div>
              <div className="text-gray-600">Books Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">99.8%</div>
              <div className="text-gray-600">AI Detection Pass Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">15min</div>
              <div className="text-gray-600">Average Generation Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">4.9/5</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Creators Worldwide
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Content Creation?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of creators who are already using our platform to generate 
            professional-quality content in minutes, not weeks.
          </p>
          <Link to="/register" className="bg-white text-primary-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center">
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">eBook Creator</span>
              </div>
              <p className="text-gray-400">
                The future of content creation is here. Generate professional eBooks with AI.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 eBook Creator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
