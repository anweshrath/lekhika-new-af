/**
 * LANDING PAGE GENERATOR SERVICE CONFIGURATION
 */

import { Target } from 'lucide-react'
import { getServiceVariables } from '../../alchemistVariables'
import { getServiceFrameworks } from '../../alchemistFrameworks'

export const landingPageGenerator = {
  id: 'landing-page-generator',
  name: 'Landing Page Copy',
  description: 'Write high-converting landing page copy',
  icon: Target,
  category: 'sales',
  suite: 'Sales',
  color: 'indigo',
  priority: 2,
  
  getVariables: () => getServiceVariables('landing-page-generator'),
  getFrameworks: () => getServiceFrameworks('landing-page-generator'),
  
  systemPrompt: `You are a conversion optimization expert who writes landing page copy that converts visitors into leads and customers. You understand psychology, persuasion, and what drives action.`,
  
  getUserPrompt: (variables, selectedFramework, customFramework) => {
    const framework = selectedFramework === 'other' ? customFramework : selectedFramework
    
    return `Create high-converting landing page copy for "${variables.offer}" targeting ${variables.target_audience}. 

Framework: ${framework}
Key benefits: ${variables.value_proposition}
Social proof: ${variables.social_proof || 'N/A'}
Urgency: ${variables.urgency || 'None'}
Form fields: ${variables.form_fields}
Thank you message: ${variables.thank_you_message || 'N/A'}

Include:
1. Compelling headline and subheadlines
2. Value proposition
3. Benefit-focused bullet points
4. Social proof integration
5. Strong call-to-action
6. Risk reversal/guarantee
7. Urgency elements
8. Above-the-fold optimization

Make it persuasive, scannable, and optimized for conversions. Focus on benefits and removing friction.`
  },
  
  estimatedTokens: 3000,
  recommendedServices: ['openai', 'claude']
}

export default landingPageGenerator
