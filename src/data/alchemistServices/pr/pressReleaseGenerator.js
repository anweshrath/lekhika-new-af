/**
 * PRESS RELEASE GENERATOR SERVICE CONFIGURATION
 */

import { Megaphone } from 'lucide-react'
import { getServiceVariables } from '../../alchemistVariables'
import { getServiceFrameworks } from '../../alchemistFrameworks'

export const pressReleaseGenerator = {
  id: 'press-release-generator',
  name: 'Press Release',
  description: 'Generate professional press releases for media coverage',
  icon: Megaphone,
  category: 'pr',
  suite: 'PR & Communications',
  color: 'cyan',
  priority: 1,
  
  getVariables: () => getServiceVariables('press-release-generator'),
  getFrameworks: () => getServiceFrameworks('press-release-generator'),
  
  systemPrompt: `You are a PR professional who writes compelling press releases that get media attention. You understand journalistic style, newsworthy angles, and what editors look for in press releases.`,
  
  getUserPrompt: (variables, selectedFramework, customFramework) => {
    const framework = selectedFramework === 'other' ? customFramework : selectedFramework
    
    return `Write a professional press release for ${variables.company_name} about ${variables.news_event}. 

Framework: ${framework}
Key details: ${variables.key_details}
Contact info: ${variables.contact_info}
Target media: ${variables.target_media || 'General Media'}
Spokesperson: ${variables.spokesperson || 'N/A'}
Embargo date: ${variables.embargo_date || 'N/A'}

Include:
1. Compelling headline
2. Strong lead paragraph (who, what, when, where, why)
3. Quote from company spokesperson
4. Supporting details and background
5. About section
6. Contact information
7. Proper press release format

Make it newsworthy, factual, and written in journalistic style. Focus on the most important information first.`
  },
  
  estimatedTokens: 2000,
  recommendedServices: ['openai', 'claude']
}

export default pressReleaseGenerator
