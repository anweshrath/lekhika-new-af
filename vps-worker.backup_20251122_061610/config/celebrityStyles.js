/**
 * CELEBRITY WRITING STYLES
 * 
 * Add/Edit/Delete celebrities here.
 * Each celebrity has unique writing characteristics that get injected into AI prompts.
 * 
 * Structure:
 * - value: unique identifier (lowercase_underscore)
 * - label: Display name
 * - styleGuide: Detailed writing characteristics (this gets sent to AI)
 */

const CELEBRITY_STYLES = [
  {
    value: 'stephen_king',
    label: 'Stephen King',
    styleGuide: 'Conversational yet literary, slow-burn dread, small-town America setting, flawed relatable characters, psychological horror over gore, present tense for intensity, long sentences building tension, colloquial Maine dialogue, exploration of evil in ordinary people. Each chapter ends on unease. Rich character backstories. Themes: corruption of innocence, community secrets.'
  },
  {
    value: 'malcolm_gladwell',
    label: 'Malcolm Gladwell',
    styleGuide: 'Surprising thesis, counter-intuitive insights, narrative case studies, pop psychology research, 10000-hour rule style frameworks, anecdote-driven explanations, intellectual yet accessible, question everything conventional. Chapter structure: story→research→insight→implications. Each chapter reveals hidden pattern.'
  },
  {
    value: 'jk_rowling',
    label: 'J.K. Rowling',
    styleGuide: 'Rich world-building with rules, hidden magical world parallel to real, ordinary protagonist discovering extraordinary, British humor and warmth, detailed magical systems, boarding school dynamics, good vs evil moral clarity, foreshadowing and mysteries, chapter cliffhangers, character growth through friendship. Whimsical yet serious stakes.'
  },
  {
    value: 'james_clear',
    label: 'James Clear',
    styleGuide: 'Scientific research citations, simple frameworks (1% better daily), clear action steps, real behavior change psychology, no fluff all tactics, systems over goals emphasis, environment design focus, identity-based habits, compound effect examples. Chapter structure: principle→science→framework→action steps. Each chapter one core habit principle.'
  },
  {
    value: 'brene_brown',
    label: 'Brené Brown',
    styleGuide: 'Personal vulnerability mixed with research, shame/courage/worthiness themes, conversational yet authoritative, research-backed storytelling, personal anecdotes revealing struggle, permission to be imperfect, wholehearted living concepts, emotional intelligence depth. Chapter structure: story→research→insight→practice. Authentic, warm, academically grounded.'
  },
  {
    value: 'hemingway',
    label: 'Ernest Hemingway',
    styleGuide: 'Ultra-lean prose, short declarative sentences, minimal adjectives, iceberg theory (90% beneath surface), masculine restraint, subtext over exposition, dialogue drives story, understated emotion, war/masculinity/mortality themes, present action over reflection. Brutally efficient. What NOT said matters most.'
  },
  {
    value: 'jane_austen',
    label: 'Jane Austen',
    styleGuide: 'Social commentary through wit, ironic narrative voice, domestic settings with deep moral questions, strong-willed heroines, class and marriage themes, free indirect discourse, sharp dialogue revealing character, slow-burn romance, epistolary elements. Elegant, precise, satirical yet warm.'
  },
  {
    value: 'agatha_christie',
    label: 'Agatha Christie',
    styleGuide: 'Red herrings and misdirection, locked-room mysteries, ensemble cast of suspects, detective methodical reveal, British manor house settings, psychological insight into human nature, clean prose, twist endings, fair play with clues. Economy of language, maximum suspense.'
  },
  {
    value: 'neil_gaiman',
    label: 'Neil Gaiman',
    styleGuide: 'Mythology blended with contemporary, dark fairy tale atmosphere, unreliable reality, philosophical depth disguised as fantasy, lyrical yet accessible prose, quirky characters, British wit, folk tale structure, blurred boundaries between worlds. Whimsical horror.'
  },
  {
    value: 'maya_angelou',
    label: 'Maya Angelou',
    styleGuide: 'Poetic memoir style, lyrical prose with rhythm, unflinching honesty about trauma, resilience and hope themes, vivid sensory details, Southern voice and dialect, spiritual wisdom, celebration of Black culture, metaphor-rich, oral storytelling tradition. Dignified, powerful, hopeful.'
  },
  {
    value: 'haruki_murakami',
    label: 'Haruki Murakami',
    styleGuide: 'Surreal everyday, lonely protagonists, jazz and Western pop culture references, parallel worlds, mysterious women, cats and wells, minimalist prose, mundane routines contrasted with bizarre events, Tokyo settings, existential themes. Dreamlike, detached, hypnotic.'
  },
  {
    value: 'toni_morrison',
    label: 'Toni Morrison',
    styleGuide: 'Non-linear narrative, African American oral tradition, magical realism, unflinching examination of racism, lyrical dense prose, multiple perspectives, historical trauma, community and identity, Biblical allusions, stream of consciousness. Poetic, challenging, profound.'
  },
  {
    value: 'tim_ferriss',
    label: 'Tim Ferriss',
    styleGuide: 'Actionable frameworks, case studies from high performers, contrarian thinking, step-by-step protocols, personal experiments, minimal effective dose concepts, lifestyle design, efficiency obsession. Chapter structure: problem→framework→implementation→case study. Tactical, no fluff.'
  },
  {
    value: 'seth_godin',
    label: 'Seth Godin',
    styleGuide: 'Short punchy chapters, marketing philosophy, tribal leadership concepts, purple cow thinking, resistance and shipping, riffs on culture and change, blog-post length insights, conversational yet profound. Each chapter: single insight with example. Permission-based, human-centric.'
  },
  {
    value: 'simon_sinek',
    label: 'Simon Sinek',
    styleGuide: 'Start with why philosophy, biological/anthropological examples, infinite game thinking, leadership through service, storytelling with research, golden circle framework, optimism and inspiration, TED talk accessibility. Clear structure, inspiring, purpose-driven.'
  },
  {
    value: 'yuval_noah_harari',
    label: 'Yuval Noah Harari',
    styleGuide: 'Macro-historical perspective, sapiens-level thinking, cognitive revolution concepts, shared myths framework, accessible academic style, provocative questions, evolutionary biology meets history, future speculation grounded in past. Big ideas, clear explanations, paradigm-shifting.'
  },
  {
    value: 'cal_newport',
    label: 'Cal Newport',
    styleGuide: 'Deep work philosophy, evidence-based productivity, case studies from academics and creatives, distraction critique, deliberate practice, digital minimalism, career capital framework. Systematic arguments, research citations, practical protocols. Intellectual, systematic, actionable.'
  },
  {
    value: 'ryan_holiday',
    label: 'Ryan Holiday',
    styleGuide: 'Stoic philosophy applied to modern life, historical anecdotes, obstacle is the way thinking, ego death concepts, perennial wisdom, short digestible chapters, ancient quotes with modern examples. Each chapter: Stoic principle→historical story→modern application. Practical philosophy.'
  },
  {
    value: 'elizabeth_gilbert',
    label: 'Elizabeth Gilbert',
    styleGuide: 'Memoir-style vulnerability, creative living philosophy, conversational intimacy, spiritual seeking without preaching, humor mixed with wisdom, permission to create imperfectly, fear and creativity relationship. Warm, encouraging, self-deprecating, inspiring.'
  },
  {
    value: 'michael_lewis',
    label: 'Michael Lewis',
    styleGuide: 'Character-driven non-fiction, underdog narratives, financial/sports complex topics made accessible, investigative journalism meets storytelling, finding extraordinary in overlooked, behind-the-scenes access, narrative tension in real events. Thrilling non-fiction, human-focused.'
  }
];

/**
 * Get celebrity style guide by value
 * @param {string} celebrityValue - The celebrity identifier (e.g., 'stephen_king')
 * @returns {object|null} - Celebrity object with styleGuide, or null if not found
 */
function getCelebrityStyle(celebrityValue) {
  if (!celebrityValue) return null;
  return CELEBRITY_STYLES.find(c => c.value === celebrityValue) || null;
}

/**
 * Get all celebrity options for dropdowns
 * @returns {Array} - Array of {value, label} objects
 */
function getAllCelebrityOptions() {
  return CELEBRITY_STYLES.map(c => ({ value: c.value, label: c.label }));
}

module.exports = {
  CELEBRITY_STYLES,
  getCelebrityStyle,
  getAllCelebrityOptions
};

