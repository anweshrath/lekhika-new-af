import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oglmncodldqiafmxpwdw.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbG1uY29kbGRxaWFmbXhwd2R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTY4ODcxMCwiZXhwIjoyMDY3MjY0NzEwfQ.mRKrQnjnW7LXjjDUx-uFi3aWJjnbaZShH4f5RqJl9_Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🚀 Starting Story Architect prompts migration...')
  
  try {
    // Fix user_engines
    console.log('📋 Updating user_engines...')
    const { data: userEngines, error: fetchError } = await supabase
      .from('user_engines')
      .select('id, name, nodes')
      .not('nodes', 'is', null)
    
    if (fetchError) {
      console.error('❌ Error fetching user_engines:', fetchError)
      return
    }
    
    console.log(`📊 Found ${userEngines.length} user_engines to check`)
    
    let updated = 0
    for (const engine of userEngines) {
      const hasStoryOutliner = engine.nodes.some(node => 
        node?.data?.role === 'story_outliner'
      )
      
      if (hasStoryOutliner) {
        const updatedNodes = engine.nodes.map(node => {
          if (node?.data?.role === 'story_outliner') {
            return {
              ...node,
              data: {
                ...node.data,
                aiEnabled: true,
                selectedModels: ['claude-3-5-sonnet-20241022'],
                systemPrompt: 'You are an ELITE STORY ARCHITECT & STRUCTURAL WRITER - the master of narrative design and opening content creation. Your expertise spans plot architecture, character development, and compelling story openings. CRITICAL AUTHORITY: You ARE authorized to write foreword, introduction, and TOC content. ABSOLUTE PROHIBITION: You are STRICTLY FORBIDDEN from writing any actual story chapters or narrative content. Your exclusive functions are structural design and opening content creation.',
                userPrompt: 'ELITE STORY ARCHITECTURE & OPENING CONTENT MISSION\n\nUsing all the data provided to you, create the complete story structure and opening content.\n\nEXECUTE COMPREHENSIVE STORY ARCHITECTURE:\n\n📚 STORY STRUCTURE DESIGN:\n- Plot structure with proper pacing and tension arcs\n- Chapter breakdown with detailed outlines for each chapter\n- Character development arcs and relationship dynamics\n- Setting integration and world-building elements\n- Theme integration and message delivery\n\n📖 OPENING CONTENT CREATION (AUTHORIZED):\n- Foreword: Engaging introduction to the story world and themes\n- Introduction: Hook the reader, establish tone, set expectations\n- Table of Contents: Professional chapter organization\n- Story title suggestions/alternatives if needed\n\n🎯 CONTENT SPECIFICATIONS:\n- Match user\'s preferred tone, accent, and writing style\n- Create compelling openings that draw readers in\n- Establish story atmosphere and narrative voice\n- Set up character introductions and world context\n\n🚫 ABSOLUTE PROHIBITIONS:\n- NO actual story chapters or narrative content\n- NO character dialogue or scene writing\n- NO plot resolution or story completion\n- ONLY structural elements and opening content\n\nOUTPUT your complete story architecture and opening content in structured JSON format for the next workflow node.\n\nSTRUCTURAL AUTHORITY: You ARE authorized to write foreword/intro/TOC - this is your primary function. Use ALL provided data from previous nodes.'
              }
            }
          }
          return node
        })
        
        const { error: updateError } = await supabase
          .from('user_engines')
          .update({ nodes: updatedNodes })
          .eq('id', engine.id)
        
        if (updateError) {
          console.error(`❌ Error updating user_engines ${engine.id}:`, updateError)
        } else {
          console.log(`✅ Updated user_engine: ${engine.name}`)
          updated++
        }
      }
    }
    
    console.log(`✅ Updated ${updated} user_engines`)
    
    // Fix ai_engines
    console.log('📋 Updating ai_engines...')
    const { data: aiEngines, error: aiFetchError } = await supabase
      .from('ai_engines')
      .select('id, name, nodes')
      .not('nodes', 'is', null)
    
    if (aiFetchError) {
      console.error('❌ Error fetching ai_engines:', aiFetchError)
      return
    }
    
    console.log(`📊 Found ${aiEngines.length} ai_engines to check`)
    
    let aiUpdated = 0
    for (const engine of aiEngines) {
      const hasStoryOutliner = engine.nodes.some(node => 
        node?.data?.role === 'story_outliner'
      )
      
      if (hasStoryOutliner) {
        const updatedNodes = engine.nodes.map(node => {
          if (node?.data?.role === 'story_outliner') {
            return {
              ...node,
              data: {
                ...node.data,
                aiEnabled: true,
                selectedModels: ['claude-3-5-sonnet-20241022'],
                systemPrompt: 'You are an ELITE STORY ARCHITECT & STRUCTURAL WRITER - the master of narrative design and opening content creation. Your expertise spans plot architecture, character development, and compelling story openings. CRITICAL AUTHORITY: You ARE authorized to write foreword, introduction, and TOC content. ABSOLUTE PROHIBITION: You are STRICTLY FORBIDDEN from writing any actual story chapters or narrative content. Your exclusive functions are structural design and opening content creation.',
                userPrompt: 'ELITE STORY ARCHITECTURE & OPENING CONTENT MISSION\n\nUsing all the data provided to you, create the complete story structure and opening content.\n\nEXECUTE COMPREHENSIVE STORY ARCHITECTURE:\n\n📚 STORY STRUCTURE DESIGN:\n- Plot structure with proper pacing and tension arcs\n- Chapter breakdown with detailed outlines for each chapter\n- Character development arcs and relationship dynamics\n- Setting integration and world-building elements\n- Theme integration and message delivery\n\n📖 OPENING CONTENT CREATION (AUTHORIZED):\n- Foreword: Engaging introduction to the story world and themes\n- Introduction: Hook the reader, establish tone, set expectations\n- Table of Contents: Professional chapter organization\n- Story title suggestions/alternatives if needed\n\n🎯 CONTENT SPECIFICATIONS:\n- Match user\'s preferred tone, accent, and writing style\n- Create compelling openings that draw readers in\n- Establish story atmosphere and narrative voice\n- Set up character introductions and world context\n\n🚫 ABSOLUTE PROHIBITIONS:\n- NO actual story chapters or narrative content\n- NO character dialogue or scene writing\n- NO plot resolution or story completion\n- ONLY structural elements and opening content\n\nOUTPUT your complete story architecture and opening content in structured JSON format for the next workflow node.\n\nSTRUCTURAL AUTHORITY: You ARE authorized to write foreword/intro/TOC - this is your primary function. Use ALL provided data from previous nodes.'
              }
            }
          }
          return node
        })
        
        const { error: updateError } = await supabase
          .from('ai_engines')
          .update({ nodes: updatedNodes })
          .eq('id', engine.id)
        
        if (updateError) {
          console.error(`❌ Error updating ai_engines ${engine.id}:`, updateError)
        } else {
          console.log(`✅ Updated ai_engine: ${engine.name}`)
          aiUpdated++
        }
      }
    }
    
    console.log(`✅ Updated ${aiUpdated} ai_engines`)
    console.log('🎉 Migration complete!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

runMigration()

