/**
 * PRODUCT DESCRIPTION GENERATOR SERVICE CONFIGURATION
 */

import { Lightbulb } from 'lucide-react'
import { getServiceVariables } from '../../alchemistVariables'
import { getServiceFrameworks } from '../../alchemistFrameworks'

export const productDescriptionGenerator = {
  id: 'product-description-generator',
  name: 'Product Descriptions',
  description: 'Write compelling product descriptions that sell',
  icon: Lightbulb,
  category: 'sales',
  suite: 'Sales',
  color: 'teal',
  priority: 3,
  
  getVariables: () => getServiceVariables('product-description-generator'),
  getFrameworks: () => getServiceFrameworks('product-description-generator'),
  
  systemPrompt: `You are a product marketing specialist who writes compelling product descriptions that convert browsers into buyers. You understand e-commerce best practices, SEO optimization, and persuasive writing techniques.`,
  
  getUserPrompt: (variables, selectedFramework, customFramework) => {
    const framework = selectedFramework === 'other' ? customFramework : selectedFramework
    
    return `Create compelling product descriptions for ${variables.product_name} targeting ${variables.target_customer}. 

Framework: ${framework}
Key features: ${variables.key_features}
Benefits: ${variables.benefits}
Price: ${variables.price || 'N/A'}
Competitor advantage: ${variables.competitor_advantage || 'N/A'}
Warranty info: ${variables.warranty_info || 'N/A'}

Create:
1. Short description (1-2 sentences)
2. Medium description (2-3 paragraphs)
3. Long detailed description
4. SEO-optimized version
5. Social media version
6. Email marketing version

Focus on benefits over features, use emotional triggers, and make it scannable and persuasive. Include relevant keywords naturally.`
  },
  
  estimatedTokens: 2000,
  recommendedServices: ['openai', 'claude']
}

export default productDescriptionGenerator
