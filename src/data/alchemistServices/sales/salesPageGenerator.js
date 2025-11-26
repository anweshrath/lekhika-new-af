/**
 * SALES PAGE GENERATOR SERVICE CONFIGURATION
 * Modular service for creating high-converting sales pages
 */

import { TrendingUp } from 'lucide-react'
import { getServiceVariables } from '../../alchemistVariables'
import { getServiceFrameworks } from '../../alchemistFrameworks'

export const salesPageGenerator = {
  id: 'sales-copy-generator',
  name: 'Sales Page Copy',
  description: 'Write high-converting sales pages that persuade and sell using proven frameworks',
  icon: TrendingUp,
  category: 'sales',
  suite: 'Sales',
  color: 'yellow',
  priority: 1,
  
  // Get variables and frameworks dynamically
  getVariables: () => getServiceVariables('sales-copy-generator'),
  getFrameworks: () => getServiceFrameworks('sales-copy-generator'),
  
  // Default system prompt
  systemPrompt: `You are a world-class copywriter specializing in high-converting sales pages. You understand psychology, persuasion principles, and conversion optimization. Your sales copy is compelling, credible, and designed to overcome objections while building trust and urgency.`,
  
  // Dynamic user prompt based on framework selection
  getUserPrompt: (variables, selectedFramework, customFramework) => {
    const framework = selectedFramework === 'other' ? customFramework : selectedFramework
    
    return `Create high-converting sales page copy for ${variables.product_name} targeting ${variables.target_market}. The product offers these benefits: ${variables.key_benefits} and is priced at ${variables.price_point}.

Framework: ${framework}
${getFrameworkInstructions(framework)}

Include:
1. Compelling headline and subheadlines
2. Problem/solution framework
3. Benefit-focused feature descriptions
4. Social proof and testimonials (suggestions)
5. Strong call-to-action
6. Risk reversal/guarantee section
7. Urgency elements: ${variables.urgency_element || 'None'}
8. Objection handling

Pain points to address: ${variables.pain_points}
Guarantee type: ${variables.guarantee_type || 'None'}
Testimonials to include: ${variables.testimonials_count || 0}

Make it persuasive, credible, and optimized for conversions. Focus on emotional triggers and logical benefits.`
  },
  
  estimatedTokens: 3500,
  recommendedServices: ['openai', 'claude']
}

// Framework-specific instructions
const getFrameworkInstructions = (framework) => {
  const instructions = {
    'aida': 'Structure: Attention (compelling headline), Interest (benefits), Desire (emotional triggers), Action (strong CTA)',
    'pastor': 'Structure: Problem (identify pain), Amplify (make it worse), Story (transformation), Transformation (show results), Offer (present solution), Response (call to action)',
    'four_p': 'Structure: Picture (vivid imagery), Promise (benefits), Proof (social proof), Push (call to action)',
    'pas': 'Structure: Problem (identify issue), Agitate (amplify pain), Solution (present offer)',
    'bab': 'Structure: Before (current state), After (desired state), Bridge (how to get there)',
    'quest': 'Structure: Qualify (target audience), Understand (their needs), Educate (provide value), Stimulate (create desire), Transition (call to action)',
    'acca': 'Structure: Awareness (grab attention), Comprehension (explain benefits), Conviction (build trust), Action (call to action)',
    'idca': 'Structure: Interest (capture attention), Desire (create want), Conviction (build trust), Action (call to action)',
    'aidca': 'Structure: Attention (compelling headline), Interest (benefits), Desire (emotional triggers), Conviction (social proof), Action (call to action)'
  }
  
  return instructions[framework] || 'Follow the custom framework structure you provided.'
}

export default salesPageGenerator
