/**
 * Narrative Structure Service
 * Ensures story continuity and prevents chapter repetition/confusion
 * Provides chapter-specific instructions based on story progression
 */

class NarrativeStructureService {
  constructor() {
    this.storyStructures = {
      fiction: {
        3: ['setup', 'development', 'resolution'],
        4: ['setup', 'rising_action', 'climax', 'resolution'], 
        5: ['setup', 'rising_action', 'climax', 'falling_action', 'resolution']
      },
      non_fiction: {
        3: ['introduction', 'main_content', 'conclusion'],
        4: ['introduction', 'foundation', 'application', 'conclusion'],
        5: ['introduction', 'foundation', 'development', 'application', 'conclusion']
      }
    }
  }

  /**
   * Extract story elements from previous chapters to maintain continuity
   */
  extractStoryElements(previousChapters, userInput) {
    if (!previousChapters || previousChapters.length === 0) {
      return {
        genre: userInput.genre || 'fiction',
        setting: 'unspecified',
        characters: [],
        tone: userInput.writing_style || 'conversational',
        storyWorld: 'realistic',
        plotPoints: [],
        themes: []
      }
    }

    const firstChapter = previousChapters[0]
    const allContent = previousChapters.map(ch => (ch.content || '')).join(' ')

    // Extract key story elements with safety checks
    const storyElements = {
      genre: userInput.genre || 'fiction',
      setting: this.extractSetting(firstChapter.content || ''),
      characters: this.extractCharacters(allContent, userInput) || [],
      tone: userInput.writing_style || 'conversational',
      storyWorld: this.extractStoryWorld(firstChapter.content || ''),
      plotPoints: this.extractPlotPoints(previousChapters) || [],
      themes: this.extractThemes(allContent) || []
    }

    console.log('📚 Extracted Story Elements:', storyElements)
    return storyElements
  }

  /**
   * Extract setting from first chapter
   */
  extractSetting(content) {
    // Look for location indicators
    const locations = []
    
    // Fantasy settings
    if (content.includes('Navaras') || content.includes('magical') || content.includes('enchant')) {
      locations.push('fantasy_world')
    }
    
    // Real world cities
    const cities = ['Kolkata', 'Bangalore', 'Mumbai', 'Delhi']
    cities.forEach(city => {
      if (content.includes(city)) {
        locations.push(city)
      }
    })

    return locations.length > 0 ? locations[0] : 'unspecified'
  }

  /**
   * Extract main characters from content
   */
  extractCharacters(content, userInput) {
    const characters = []
    
    // From user input
    if (userInput.story_premise) {
      const premise = userInput.story_premise
      if (premise.includes('Anwesh')) characters.push('Anwesh')
      if (premise.includes('Soumi') || premise.includes('Soumita')) characters.push('Soumita')
      if (premise.includes('Mitali')) characters.push('Mitali')
      if (premise.includes('daughter') || premise.includes('Riya')) characters.push('Riya')
    }

    return characters
  }

  /**
   * Extract story world type (fantasy vs realistic)
   */
  extractStoryWorld(content) {
    const fantasyIndicators = ['magic', 'enchant', 'crystal', 'spell', 'mystical', 'Navaras']
    const realisticIndicators = ['app', 'smartphone', 'digital', 'online', 'technology']
    
    let fantasyScore = 0
    let realisticScore = 0
    
    fantasyIndicators.forEach(indicator => {
      if (content.toLowerCase().includes(indicator.toLowerCase())) {
        fantasyScore++
      }
    })
    
    realisticIndicators.forEach(indicator => {
      if (content.toLowerCase().includes(indicator.toLowerCase())) {
        realisticScore++
      }
    })

    return fantasyScore > realisticScore ? 'fantasy' : 'realistic'
  }

  /**
   * Extract plot points from previous chapters
   */
  extractPlotPoints(previousChapters) {
    return previousChapters.map((ch, idx) => {
      const content = ch.content.substring(0, 500) // First 500 chars for plot summary
      return {
        chapter: ch.chapter,
        summary: content.replace(/\n/g, ' ').trim()
      }
    })
  }

  /**
   * Extract themes from content
   */
  extractThemes(content) {
    const themes = []
    
    if (content.includes('love') || content.includes('relationship')) themes.push('romance')
    if (content.includes('family') || content.includes('daughter')) themes.push('family')
    if (content.includes('music') || content.includes('sing')) themes.push('music')
    if (content.includes('divorce') || content.includes('separation')) themes.push('second_chances')
    
    return themes
  }

  /**
   * Get chapter purpose based on story structure
   */
  getChapterPurpose(currentChapter, totalChapters, genre, storyType = 'fiction') {
    const structure = this.storyStructures[storyType] || this.storyStructures.fiction
    const chapterStructure = structure[totalChapters] || structure[3]
    
    const purposeIndex = Math.min(currentChapter - 1, chapterStructure.length - 1)
    return chapterStructure[purposeIndex]
  }

  /**
   * Build detailed chapter instructions
   */
  buildChapterInstructions(currentChapter, totalChapters, storyElements, userInput) {
    const purpose = this.getChapterPurpose(currentChapter, totalChapters, storyElements.genre)
    
    let instructions = `
CHAPTER ${currentChapter} SPECIFIC INSTRUCTIONS:

STORY CONTINUITY REQUIREMENTS:
- MAINTAIN CONSISTENT STORY WORLD: ${storyElements.storyWorld} (${storyElements.storyWorld === 'fantasy' ? 'magical elements, enchantments, fantasy setting' : 'realistic modern setting, technology, real locations'})
- SETTING: ${storyElements.setting} (MUST stay consistent with previous chapters)
- MAIN CHARACTERS: ${(storyElements.characters || []).join(', ') || 'Characters from user story premise'} (continue their story arcs)
- TONE: ${storyElements.tone} (maintain consistent writing style)
- THEMES: ${(storyElements.themes || []).join(', ') || 'Themes from user story premise'} (develop these themes further)

CHAPTER ${currentChapter} PURPOSE: ${purpose.toUpperCase()}
`

    // Add specific instructions based on chapter purpose
    switch (purpose) {
      case 'setup':
        instructions += `
CHAPTER ${currentChapter} MUST ACCOMPLISH:
- Introduce main characters and their current situations
- Establish the story world and setting
- Set up the central conflict or relationship dynamic
- Create engaging opening that hooks the reader
- Lay foundation for the story that will unfold
`
        break
        
      case 'development':
      case 'rising_action':
        instructions += `
CHAPTER ${currentChapter} MUST ACCOMPLISH:
- ADVANCE the story from where Chapter ${currentChapter - 1} ended
- Develop character relationships and conflicts further
- Introduce new challenges or complications
- Build tension and emotional investment
- Move the plot forward significantly
- AVOID repeating scenes or situations from previous chapters
`
        break
        
      case 'climax':
        instructions += `
CHAPTER ${currentChapter} MUST ACCOMPLISH:
- Bring the main conflict to its peak
- Show character growth and decision-making
- Create the most intense/emotional part of the story
- Resolve the central tension or relationship issue
- Provide the turning point for the story
`
        break
        
      case 'resolution':
      case 'conclusion':
        instructions += `
CHAPTER ${currentChapter} - FINAL CHAPTER REQUIREMENTS:
- Create a powerful, emotionally satisfying conclusion
- Resolve ALL major plot threads and character arcs completely
- Show the final outcome of the story's central conflict
- Provide closure to ALL character journeys and relationships
- Deliver the promised happy ending with emotional impact
- Include a memorable final scene or moment
- Tie up ALL loose ends and unanswered questions
- Leave readers feeling fulfilled and satisfied
- Avoid rushed or abrupt endings - give proper closure
- Make this ending memorable and emotionally resonant
- Ensure characters have grown and changed meaningfully
- Provide a sense of completion and satisfaction
- ENSURE this feels like a complete, professional ending worthy of publication
`
        break
        
      default:
        instructions += `
CHAPTER ${currentChapter} MUST ACCOMPLISH:
- Continue the story progression logically from previous chapters
- Develop characters and plot further
- Maintain story momentum and reader engagement
- Add new elements while staying consistent with established world
`
    }

    // Add story-specific instructions based on user input
    if (userInput.story_premise) {
      instructions += `
USER STORY REQUIREMENTS:
- Story Premise: ${userInput.story_premise}
- ENSURE this chapter advances this specific story premise
- Characters mentioned in premise MUST be developed consistently
- Story must progress toward the specified happy ending
`
    }

    return instructions
  }

  /**
   * Generate unique chapter title based on purpose and story elements
   */
  generateChapterTitle(currentChapter, totalChapters, storyElements, purpose) {
    // Extract used titles from previous chapters if available
    const usedTitles = (storyElements.plotPoints || []).map(p => {
      // Extract title from chapter content if available
      const titleMatch = (p.summary || '').match(/Chapter \d+:\s*(.+?)(?:\n|\.|\s{2,})/)
      return titleMatch ? titleMatch[1].trim() : null
    }).filter(Boolean)
    
    const titleSuggestions = {
      setup: ['New Beginnings', 'First Encounters', 'The Journey Starts', 'Opening Doors', 'Setting the Stage'],
      development: ['Growing Closer', 'Deepening Bonds', 'Unfolding Truths', 'Building Bridges', 'Heart to Heart'],
      rising_action: ['Complications Arise', 'Challenges Ahead', 'Testing Times', 'Difficult Choices', 'Crossroads'],
      climax: ['The Moment of Truth', 'Breaking Point', 'All or Nothing', 'The Decision', 'Facing Reality'],
      falling_action: ['After the Storm', 'Finding Peace', 'New Understanding', 'Healing Hearts', 'Moving Forward'],
      resolution: ['Ever After', 'New Horizons', 'Complete Circle', 'Happy Endings', 'Together at Last']
    }
    
    const suggestions = titleSuggestions[purpose] || titleSuggestions.development
    
    // Find a title that hasn't been used
    for (let suggestion of suggestions) {
      if (!usedTitles.includes(suggestion)) {
        return suggestion
      }
    }
    
    // Fallback: create numbered title
    return `Chapter ${currentChapter}: ${purpose.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`
  }

  /**
   * Generate professional Foreword
   */
  // REMOVED: generateForeword() - NO TEMPLATE CONTENT

  /**
   * Generate professional Introduction
   */
  // REMOVED: generateIntroduction() - NO TEMPLATE CONTENT

  /**
   * Generate dynamic Table of Contents
   */
  generateTableOfContents(chapters, userInput) {
    const bookTitle = userInput.book_title || userInput.story_title || 'Generated Book'
    
    let toc = `# ${bookTitle}

## Table of Contents

**Foreword**

**Introduction**

`

    // Add chapters with actual titles from generated content
    chapters.forEach((chapter, index) => {
      const chapterTitle = this.extractChapterTitle(chapter.content) || `Chapter ${chapter.chapter}`
      toc += `**Chapter ${chapter.chapter}: ${chapterTitle}**\n\n`
    })

    toc += `**About the Author**

---
`
    return toc
  }

  /**
   * Extract chapter title from content
   */
  extractChapterTitle(content) {
    // Look for chapter title patterns
    const titleMatch = content.match(/^#\s*Chapter\s*\d+:\s*(.+)$/m) || 
                      content.match(/^##\s*Chapter\s*\d+:\s*(.+)$/m) ||
                      content.match(/^#\s*(.+)$/m)
    
    if (titleMatch) {
      return titleMatch[1].trim()
    }
    
    return null
  }

  /**
   * Generate professional About the Author section
   */
  generateAboutTheAuthor(userInput) {
    const authorName = userInput.author_name || 'The Author'
    const authorBio = userInput.author_bio || ''
    const authorExpertise = userInput.author_expertise || ''
    const topic = userInput.topic || userInput.Your_Topic || 'this field'
    
    let aboutSection = `# About the Author

## ${authorName}

`

    if (authorBio) {
      aboutSection += `${authorBio}

`
    } else {
      aboutSection += `${authorName} is a dedicated professional with extensive experience in ${topic}. Through years of practical application and continuous learning, they have developed the insights and strategies shared in this book.

`
    }

    if (authorExpertise) {
      aboutSection += `**Areas of Expertise:**
${authorExpertise}

`
    }

    aboutSection += `${authorName} is committed to sharing knowledge that makes a real difference in people's lives. This book represents their dedication to providing practical, actionable guidance that readers can immediately apply to achieve their goals.

When not writing, ${authorName} continues to explore new developments in ${topic}, ensuring that their work remains current, relevant, and valuable to readers seeking genuine transformation.

---

*Connect with ${authorName}:*
- Follow for more insights and updates
- Share your success stories and feedback
- Join the community of readers applying these principles

**Thank you for reading "${userInput.book_title || userInput.story_title || 'this book'}". Your success is the ultimate measure of this work's value.**`

    return aboutSection
  }

  /**
   * Build comprehensive chapter context with continuity enforcement
   */
  buildChapterContext(currentChapter, totalChapters, previousChapters, userInput) {
    const storyElements = this.extractStoryElements(previousChapters, userInput)
    const chapterInstructions = this.buildChapterInstructions(currentChapter, totalChapters, storyElements, userInput)
    const purpose = this.getChapterPurpose(currentChapter, totalChapters, storyElements.genre)
    const suggestedTitle = this.generateChapterTitle(currentChapter, totalChapters, storyElements, purpose)
    
    let context = chapterInstructions + `

CHAPTER TITLE REQUIREMENT:
- Use a UNIQUE title for this chapter: "${suggestedTitle}" or create your own unique title
- DO NOT reuse titles from previous chapters
- ENSURE the title reflects this chapter's specific content and purpose
`

    if (previousChapters && previousChapters.length > 0) {
      context += `

PREVIOUS CHAPTERS DETAILED SUMMARY (MAINTAIN CONTINUITY):
${previousChapters.map((ch, idx) => {
  return `
CHAPTER ${ch.chapter} SUMMARY:
- Content: ${ch.content.substring(0, 800).replace(/\n/g, ' ')}...
- Key Elements: ${this.extractKeyElements(ch.content)}
- Plot Points: ${this.extractPlotPoints([ch])[0]?.summary || 'Story development'}
`
}).join('\n')}

CRITICAL CONTINUITY REQUIREMENTS:
- CONTINUE the story from where Chapter ${currentChapter - 1} ended
- MAINTAIN the same story world (${storyElements.storyWorld})
- KEEP the same characters and their established personalities
- ADVANCE the plot - do NOT repeat previous events or scenes
- BUILD UPON what has already been established
- CREATE NEW, UNIQUE content that progresses the story forward

ABSOLUTELY FORBIDDEN:
- DO NOT repeat any scenes, conversations, or events from previous chapters
- DO NOT restart the story or ignore previous chapter events
- DO NOT change the story world type (fantasy vs realistic)
- DO NOT introduce contradictory elements to established story world
`
    }

    return context
  }

  /**
   * Extract key elements from chapter content
   */
  extractKeyElements(content) {
    const elements = []
    
    if (content.includes('magic') || content.includes('enchant')) elements.push('magical_elements')
    if (content.includes('Smule') || content.includes('app')) elements.push('technology')
    if (content.includes('meet') || content.includes('first_time')) elements.push('meeting')
    if (content.includes('family') || content.includes('parents')) elements.push('family_dynamics')
    
    return elements.join(', ')
  }

  /**
   * Validate chapter uniqueness (future enhancement)
   */
  validateChapterUniqueness(newChapter, previousChapters) {
    // TODO: Implement content similarity detection
    // For now, return true - the enhanced prompts should handle uniqueness
    return true
  }
}

export const narrativeStructureService = new NarrativeStructureService()
