/**
 * BLOG POST GENERATOR SERVICE CONFIGURATION
 * Modular service for creating engaging blog posts
 */

import { FileText } from 'lucide-react'
import { getServiceVariables } from '../../alchemistVariables'
import { getServiceFrameworks } from '../../alchemistFrameworks'

export const blogPostGenerator = {
  id: 'blog-post-generator',
  name: 'Blog Post Generator',
  description: 'Create engaging, SEO-optimized blog posts that drive traffic and conversions',
  icon: FileText,
  category: 'contentCreation',
  suite: 'Content Creation',
  color: 'blue',
  priority: 1,
  
  // Get variables and frameworks dynamically
  getVariables: () => getServiceVariables('blog-post-generator'),
  getFrameworks: () => getServiceFrameworks('blog-post-generator'),
  
  // Default system prompt
  systemPrompt: `You are a professional content writer specializing in creating engaging, SEO-optimized blog posts. Your writing style is informative, engaging, and optimized for both readers and search engines. You understand content marketing best practices and create posts that drive engagement and conversions.`,
  
  // Dynamic user prompt based on framework selection
  getUserPrompt: (variables, selectedFramework, customFramework) => {
    const framework = selectedFramework === 'other' ? customFramework : selectedFramework
    
    return `Create a comprehensive blog post about "${variables.topic}" targeting ${variables.target_audience} with a ${variables.tone} tone. The post should be approximately ${variables.word_count} words and follow the ${framework} framework.

Framework-specific requirements:
${getFrameworkInstructions(framework)}

General requirements:
1. Compelling headline and subheadings
2. Engaging introduction that hooks the reader
3. Well-structured body with actionable insights
4. Clear conclusion with call-to-action
5. SEO optimization with relevant keywords: ${variables.keywords || 'N/A'}
6. Proper formatting with bullet points and numbered lists where appropriate

Make it informative, valuable, and shareable while maintaining a ${variables.tone} tone throughout.`
  },
  
  estimatedTokens: 3000,
  recommendedServices: ['openai', 'claude', 'gemini']
}

// Framework-specific instructions
const getFrameworkInstructions = (framework) => {
  const instructions = {
    'inverted_pyramid': 'Lead with the most important information, then provide supporting details in descending order of importance.',
    'storytelling': 'Use narrative structure with a clear beginning, middle, and end. Include personal anecdotes or case studies.',
    'how_to_guide': 'Provide clear, step-by-step instructions with actionable advice and practical examples.',
    'listicle': 'Use numbered or bulleted lists with engaging headings and scannable content.',
    'problem_solution': 'Clearly identify a problem your audience faces and provide comprehensive solutions.',
    'compare_contrast': 'Analyze similarities and differences between topics, helping readers make informed decisions.'
  }
  
  return instructions[framework] || 'Follow the custom framework structure you provided.'
}

export default blogPostGenerator
