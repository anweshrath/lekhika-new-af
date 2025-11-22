/**
 * EMAIL SEQUENCE GENERATOR SERVICE CONFIGURATION
 * Modular service for creating email marketing sequences
 */

import { Mail } from 'lucide-react'
import { getServiceVariables } from '../../alchemistVariables'
import { getServiceFrameworks } from '../../alchemistFrameworks'

export const emailSequenceGenerator = {
  id: 'email-sequence-generator',
  name: 'Email Marketing Sequence',
  description: 'Build automated email sequences that nurture leads and drive conversions',
  icon: Mail,
  category: 'marketing',
  suite: 'Marketing',
  color: 'orange',
  priority: 1,
  
  // Get variables and frameworks dynamically
  getVariables: () => getServiceVariables('email-sequence-generator'),
  getFrameworks: () => getServiceFrameworks('email-sequence-generator'),
  
  // Default system prompt
  systemPrompt: `You are an expert email marketing strategist with deep knowledge of conversion optimization and email automation. You create compelling email sequences that build relationships, nurture leads, and drive sales. Your emails are personalized, valuable, and designed to guide recipients through the customer journey.`,
  
  // Dynamic user prompt based on framework selection
  getUserPrompt: (variables, selectedFramework, customFramework) => {
    const framework = selectedFramework === 'other' ? customFramework : selectedFramework
    
    return `Create a ${variables.sequence_length}-email marketing sequence for ${variables.product_service} targeting ${variables.audience} with the goal of ${variables.campaign_goal}. 

Framework: ${framework}
${getFrameworkInstructions(framework)}

Email frequency: ${variables.email_frequency}
Primary CTA: ${variables.primary_cta}
Value proposition: ${variables.value_proposition}

Each email should:
1. Have a compelling subject line
2. Include engaging, personalized content
3. Provide value to the recipient
4. Guide them toward the main CTA: ${variables.primary_cta}
5. Be optimized for mobile devices
6. Follow email marketing best practices

Create a cohesive narrative that builds trust and moves recipients through the customer journey. Include specific subject lines, email content, and send timing recommendations.`
  },
  
  estimatedTokens: 4000,
  recommendedServices: ['openai', 'claude']
}

// Framework-specific instructions
const getFrameworkInstructions = (framework) => {
  const instructions = {
    'welcome_series': 'Focus on onboarding new subscribers, introducing your brand, and setting expectations for future emails.',
    'nurture_sequence': 'Provide educational content that builds trust and positions you as an expert before making any sales offers.',
    'product_launch': 'Create excitement and anticipation for a new product or service launch with a structured announcement sequence.',
    're_engagement': 'Win back inactive subscribers with special offers, valuable content, and re-engagement strategies.',
    'sales_sequence': 'Direct sales-focused approach that drives conversions through persuasive copy and compelling offers.'
  }
  
  return instructions[framework] || 'Follow the custom framework structure you provided.'
}

export default emailSequenceGenerator
