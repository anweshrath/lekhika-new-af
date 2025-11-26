/**
 * CASE STUDY WRITER SERVICE CONFIGURATION
 */

import { FileText } from 'lucide-react'
import { getServiceVariables } from '../../alchemistVariables'
import { getServiceFrameworks } from '../../alchemistFrameworks'

export const caseStudyWriter = {
  id: 'case-study-generator',
  name: 'Case Study Writer',
  description: 'Create compelling case studies that build trust',
  icon: FileText,
  category: 'contentCreation',
  suite: 'Content Creation',
  color: 'green',
  priority: 3,
  
  getVariables: () => getServiceVariables('case-study-generator'),
  getFrameworks: () => getServiceFrameworks('case-study-generator'),
  
  systemPrompt: `You are a business writer who creates compelling case studies that demonstrate value and build trust. You understand how to structure success stories that resonate with potential clients.`,
  
  getUserPrompt: (variables, selectedFramework, customFramework) => {
    const framework = selectedFramework === 'other' ? customFramework : selectedFramework
    
    return `Create a compelling case study for ${variables.client_name} in the ${variables.industry} industry. 

Framework: ${framework}
Challenge: ${variables.challenge}
Solution: ${variables.solution}
Results: ${variables.results}
Testimonial: ${variables.testimonial || 'N/A'}
Timeline: ${variables.timeline || 'N/A'}

Include:
1. Executive summary
2. Client background
3. Challenge/problem statement
4. Solution approach
5. Implementation details
6. Quantifiable results
7. Client testimonial
8. Key takeaways

Make it credible, specific, and focused on outcomes. Use data and quotes to support claims.`
  },
  
  estimatedTokens: 2500,
  recommendedServices: ['openai', 'claude']
}

export default caseStudyWriter
