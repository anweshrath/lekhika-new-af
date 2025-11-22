/**
 * VIDEO SCRIPT WRITER SERVICE CONFIGURATION
 */

import { Video } from 'lucide-react'
import { getServiceVariables } from '../../alchemistVariables'
import { getServiceFrameworks } from '../../alchemistFrameworks'

export const videoScriptWriter = {
  id: 'video-script-generator',
  name: 'Video Script Writer',
  description: 'Create engaging video scripts for any platform',
  icon: Video,
  category: 'contentCreation',
  suite: 'Content Creation',
  color: 'purple',
  priority: 2,
  
  getVariables: () => getServiceVariables('video-script-generator'),
  getFrameworks: () => getServiceFrameworks('video-script-generator'),
  
  systemPrompt: `You are a video script writer and director who creates engaging, conversion-focused video content. You understand video storytelling, pacing, and what keeps viewers engaged from start to finish.`,
  
  getUserPrompt: (variables, selectedFramework, customFramework) => {
    const framework = selectedFramework === 'other' ? customFramework : selectedFramework
    
    return `Create a ${variables.duration} ${variables.video_type} video script about "${variables.topic}" for ${variables.audience} on ${variables.platform}. 

Framework: ${framework}
Hook type: ${variables.hook_type}
CTA: ${variables.call_to_action}

Include:
1. Hook (first 3 seconds)
2. Problem/solution setup
3. Main content with clear structure
4. Visual cues and timing
5. Strong call-to-action
6. Pacing recommendations
7. Key messaging points

Make it engaging, clear, and optimized for the ${variables.duration} format. Include specific timing cues and visual suggestions.`
  },
  
  estimatedTokens: 2500,
  recommendedServices: ['openai', 'claude']
}

export default videoScriptWriter
