/**
 * AD COPY GENERATOR SERVICE CONFIGURATION
 */

import { Target } from 'lucide-react'
import { getServiceVariables } from '../../alchemistVariables'
import { getServiceFrameworks } from '../../alchemistFrameworks'

export const adCopyGenerator = {
  id: 'ad-copy-generator',
  name: 'Facebook Ad Copy',
  description: 'Create scroll-stopping ad copy that converts',
  icon: Target,
  category: 'marketing',
  suite: 'Marketing',
  color: 'red',
  priority: 3,
  
  getVariables: () => getServiceVariables('ad-copy-generator'),
  getFrameworks: () => getServiceFrameworks('ad-copy-generator'),
  
  systemPrompt: `You are a digital advertising expert who creates high-converting ad copy for social media platforms. You understand platform algorithms, audience psychology, and conversion optimization. Your ads stop the scroll and drive action.`,
  
  getUserPrompt: (variables, selectedFramework, customFramework) => {
    const framework = selectedFramework === 'other' ? customFramework : selectedFramework
    
    return `Create compelling ad copy for ${variables.product_service} targeting ${variables.audience} on ${variables.platform} with the objective of ${variables.campaign_objective}. 

Framework: ${framework}
Budget range: ${variables.budget_range || 'N/A'}
Urgency type: ${variables.urgency_type || 'None'}
Social proof: ${variables.social_proof || 'None'}

Create:
1. Multiple headline variations (5-7 options)
2. Primary text/description variations (3-5 options)
3. Call-to-action suggestions
4. Targeting recommendations
5. Creative suggestions
6. A/B testing recommendations

Focus on stopping the scroll, building interest, and driving the desired action. Make it platform-appropriate and optimized for ${variables.campaign_objective}.`
  },
  
  estimatedTokens: 2500,
  recommendedServices: ['openai', 'claude']
}

export default adCopyGenerator
