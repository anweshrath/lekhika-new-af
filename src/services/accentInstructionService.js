// ACCENT-SPECIFIC WRITING INSTRUCTIONS FOR AI CONTENT GENERATION
// Ensures all 7-8 accents work properly when chosen by users

class AccentInstructionService {
  constructor() {
    this.accentInstructions = {
      american: {
        name: 'American English',
        instructions: `
AMERICAN ENGLISH WRITING STYLE:
- Use American spelling: color (not colour), organize (not organise), realize (not realise)
- American expressions: "gotten", "awesome", "totally", "guys", "y'all"
- Direct, confident tone: "Let's dive right in", "Here's the deal", "Bottom line"
- Business terminology: "elevator pitch", "touch base", "circle back", "bandwidth"
- Casual contractions: "don't", "won't", "can't", "it's", "we'll"
- American measurements: feet, inches, pounds, Fahrenheit
- Cultural references: "home run", "touchdown", "slam dunk"
        `,
        examples: [
          "Hey folks, let's get started!",
          "This is totally game-changing.",
          "We're gonna dive deep into this topic."
        ]
      },

      british: {
        name: 'British English',
        instructions: `
BRITISH ENGLISH WRITING STYLE:
- Use British spelling: colour, organise, realise, centre, defence
- British expressions: "brilliant", "quite", "rather", "indeed", "spot on"
- Polite, measured tone: "I should like to suggest", "One might consider", "Perhaps"
- Formal courtesy: "Please do", "I beg your pardon", "If you would be so kind"
- British terminology: "queue", "lift", "flat", "brilliant", "cheers"
- Understated confidence: "Rather good", "Quite impressive", "Not too shabby"
- Cultural references: cricket, tea, "Bob's your uncle"
        `,
        examples: [
          "Right then, shall we begin?",
          "This approach is rather brilliant.",
          "One simply must consider this strategy."
        ]
      },

      australian: {
        name: 'Australian English',
        instructions: `
AUSTRALIAN ENGLISH WRITING STYLE:
- Australian spelling: colour, organise, realise (similar to British)
- Australian expressions: "mate", "no worries", "fair dinkum", "she'll be right"
- Relaxed, friendly tone: "G'day", "How ya going?", "Too right!"
- Australian slang: "arvo" (afternoon), "brekkie" (breakfast), "servo" (service station)
- Casual confidence: "No dramas", "Easy as", "Sweet as"
- Direct but friendly: "Let's get stuck into this", "This is bonkers good"
- Cultural references: "like a kangaroo in headlights", "dry as the Outback"
        `,
        examples: [
          "G'day mate, let's get into this!",
          "This strategy is absolutely bonkers good.",
          "No worries, we'll sort this out in no time."
        ]
      },

      canadian: {
        name: 'Canadian English',
        instructions: `
CANADIAN ENGLISH WRITING STYLE:
- Canadian spelling: colour, organise, realise (British-style)
- Canadian expressions: "eh?", "about" (pronounced "aboot"), "sorry"
- Polite, apologetic tone: "Sorry, but...", "If you don't mind", "Pardon me"
- Canadian terminology: "toque", "loonie", "toonie", "double-double"
- Humble confidence: "Not to brag, but...", "I think this might work"
- Friendly formality: "Thanks a bunch", "Much appreciated", "You bet"
- Cultural references: hockey, maple syrup, "beauty, eh?"
        `,
        examples: [
          "Sorry to interrupt, but this is important, eh?",
          "This strategy is a real beauty!",
          "Thanks a bunch for sticking with me here."
        ]
      },

      indian: {
        name: 'Indian English',
        instructions: `
INDIAN ENGLISH WRITING STYLE:
- Indian English expressions: "do the needful", "out of station", "good name?"
- Formal politeness: "kindly", "please do the needful", "most humbly"
- Indian business terms: "revert back", "prepone", "co-brother"
- Cultural context: family values, respect for elders, community focus
- Academic tone with warmth: "As we all know", "It is well established"
- Indian cultural references: festivals, traditions, "unity in diversity"
- Emphasis on relationships: "like family", "building trust", "long-term partnership"
        `,
        examples: [
          "Kindly do the needful to implement this strategy.",
          "This approach will definitely help in building good relationships.",
          "As we all know, success comes from hard work and dedication."
        ]
      },

      hinglish: {
        name: 'Hinglish',
        instructions: `
HINGLISH WRITING STYLE (Hindi + English Mix):
- Mix Hindi words naturally: "Arre yaar", "kya baat hai", "bilkul sahi"
- Hindi expressions in English: "What to do yaar", "Too much tension", "Full paisa vasool"
- Indian slang: "bhai", "dude", "yaar", "boss", "ji haan"
- Bollywood references: "filmi style", "hero wala feeling", "villain types"
- Indian context: "ghar jaisa", "desi style", "videshi approach"
- Emotional expressions: "dil se", "sachchi baat", "ekdam mast"
- Business Hinglish: "full business", "paisa kamana", "success wala feeling"
        `,
        examples: [
          "Arre yaar, this strategy is ekdam mast!",
          "Bhai, full paisa vasool approach hai ye.",
          "Dil se bolta hun, this will work like magic!"
        ]
      },

      neutral: {
        name: 'Neutral International',
        instructions: `
NEUTRAL INTERNATIONAL ENGLISH STYLE:
- Avoid regional spellings or expressions
- Clear, universal terminology that works globally
- Professional but accessible tone
- No cultural references that might not translate
- Standard business English: "implement", "strategy", "approach"
- Universal expressions: "let's explore", "consider this", "moving forward"
- Inclusive language that works for all English speakers
        `,
        examples: [
          "Let's explore this comprehensive approach.",
          "This strategy offers significant benefits.",
          "Moving forward, consider implementing these steps."
        ]
      }
    }
  }

  getAccentInstructions(accent) {
    const accentData = this.accentInstructions[accent] || this.accentInstructions.neutral
    return accentData.instructions
  }

  getAccentExamples(accent) {
    const accentData = this.accentInstructions[accent] || this.accentInstructions.neutral
    return accentData.examples
  }

  buildAccentSpecificPrompt(basePrompt, accent, tone) {
    // Handle both string and object cases for accent
    const accentKey = typeof accent === 'string' ? accent : (accent?.key || accent?.value || 'neutral')
    const accentName = typeof accent === 'string' ? accent : (accent?.name || accent?.label || accentKey)
    
    const accentInstructions = this.getAccentInstructions(accentKey)
    const examples = this.getAccentExamples(accentKey)
    
    return `${basePrompt}

CRITICAL ACCENT REQUIREMENTS:
${accentInstructions}

WRITING EXAMPLES FOR ${accentName.toUpperCase()} STYLE:
${examples.map((example, i) => `${i + 1}. ${example}`).join('\n')}

IMPORTANT: You MUST write in ${accentName} English style throughout the entire content. Every sentence should reflect the ${accentName} accent, expressions, and cultural context. This is NOT optional - the user specifically chose ${accentName} accent and expects authentic ${accentName} English writing style.

Tone: ${tone}
Accent: ${accentName} (MANDATORY - use ${accentName} expressions, spelling, and style throughout)`
  }

  validateAccentUsage(content, accent) {
    const accentData = this.accentInstructions[accent]
    if (!accentData) return { valid: false, reason: 'Unknown accent' }

    // Simple validation - check for accent-specific markers
    const examples = accentData.examples
    const hasAccentMarkers = examples.some(example => {
      const keywords = example.toLowerCase().split(' ')
      return keywords.some(keyword => content.toLowerCase().includes(keyword))
    })

    return {
      valid: hasAccentMarkers,
      reason: hasAccentMarkers ? 'Accent detected' : `No ${accent} markers found in content`
    }
  }
}

export const accentInstructionService = new AccentInstructionService()
