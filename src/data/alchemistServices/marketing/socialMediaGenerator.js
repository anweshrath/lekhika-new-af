/**
 * SOCIAL MEDIA GENERATOR SERVICE CONFIGURATION
 */

import { Users } from 'lucide-react'
import { getServiceVariables } from '../../alchemistVariables'
import { getServiceFrameworks } from '../../alchemistFrameworks'

export const socialMediaGenerator = {
  id: 'social-media-generator',
  name: 'Social Media Posts',
  description: 'Generate engaging posts for all social platforms',
  icon: Users,
  category: 'marketing',
  suite: 'Marketing',
  color: 'pink',
  priority: 2,
  
  getVariables: () => getServiceVariables('social-media-generator'),
  getFrameworks: () => getServiceFrameworks('social-media-generator'),
  
  systemPrompt: `You are a social media expert who creates viral, engaging content for all platforms. You understand platform-specific best practices, trending formats, and what makes content shareable. Your posts are optimized for engagement, reach, and brand building.`,
  
  getUserPrompt: (variables, selectedFramework, customFramework) => {
    const framework = selectedFramework === 'other' ? customFramework : selectedFramework
    
    return `Create ${variables.post_count} engaging social media posts about "${variables.topic}" for ${variables.platform} with a ${variables.tone} tone. 

Framework: ${framework}
Content type: ${variables.content_type}
Hashtag strategy: ${variables.hashtag_strategy}
Engagement goal: ${variables.engagement_goal}

Each post should:
1. Be optimized for the platform's format and audience
2. Include relevant hashtags
3. Have an engaging hook
4. Provide value or entertainment
5. Encourage interaction
6. Be unique and different from the others

Make them authentic, engaging, and shareable. Consider trending formats and best practices for ${variables.platform}.`
  },
  
  estimatedTokens: 2000,
  recommendedServices: ['openai', 'claude', 'gemini']
}

export default socialMediaGenerator
