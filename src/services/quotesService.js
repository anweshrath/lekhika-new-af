class QuotesService {
  constructor() {
    this.quotesDatabase = {
      business: [
        { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
        { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
        { text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs" },
        { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" }
      ],
      health: [
        { text: "Health is a state of complete harmony of the body, mind and spirit.", author: "B.K.S. Iyengar" },
        { text: "The groundwork for all happiness is good health.", author: "Leigh Hunt" },
        { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
        { text: "An apple a day keeps the doctor away.", author: "Proverb" },
        { text: "The first wealth is health.", author: "Ralph Waldo Emerson" }
      ],
      technology: [
        { text: "Technology is best when it brings people together.", author: "Matt Mullenweg" },
        { text: "The advance of technology is based on making it fit in so that you don't really even notice it.", author: "Bill Gates" },
        { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
        { text: "The real problem is not whether machines think but whether men do.", author: "B.F. Skinner" },
        { text: "We are stuck with technology when what we really want is just stuff that works.", author: "Douglas Adams" }
      ],
      education: [
        { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
        { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
        { text: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
        { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
        { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" }
      ],
      lifestyle: [
        { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
        { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
        { text: "In the end, we will remember not the words of our enemies, but the silence of our friends.", author: "Martin Luther King Jr." },
        { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
        { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" }
      ],
      finance: [
        { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
        { text: "It's not how much money you make, but how much money you keep.", author: "Robert Kiyosaki" },
        { text: "The stock market is filled with individuals who know the price of everything, but the value of nothing.", author: "Warren Buffett" },
        { text: "Risk comes from not knowing what you're doing.", author: "Warren Buffett" },
        { text: "The real measure of your wealth is how much you'd be worth if you lost all your money.", author: "Anonymous" }
      ],
      marketing: [
        { text: "The best marketing doesn't feel like marketing.", author: "Tom Fishburne" },
        { text: "Content is fire, social media is gasoline.", author: "Jay Baer" },
        { text: "Marketing is no longer about the stuff that you make, but about the stories you tell.", author: "Seth Godin" },
        { text: "The aim of marketing is to know and understand the customer so well the product or service fits him and sells itself.", author: "Peter Drucker" },
        { text: "Good marketing makes the company look smart. Great marketing makes the customer feel smart.", author: "Joe Chernov" }
      ],
      'self-help': [
        { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
        { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
        { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" }
      ]
    }
  }

  async getRelevantQuotes(niche, topics, numberOfQuotes = 5) {
    try {
      // Simulate API delay
      await this.delay(1000)
      
      const nicheQuotes = this.quotesDatabase[niche] || this.quotesDatabase['business']
      
      // Shuffle and select quotes
      const shuffled = [...nicheQuotes].sort(() => 0.5 - Math.random())
      const selectedQuotes = shuffled.slice(0, numberOfQuotes)
      
      return {
        quotes: selectedQuotes,
        totalFound: nicheQuotes.length,
        relevanceScore: 95
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
      throw error
    }
  }

  async getQuoteForSection(sectionTitle, niche) {
    try {
      const nicheQuotes = this.quotesDatabase[niche] || this.quotesDatabase['business']
      
      // Simple relevance matching based on keywords
      const keywords = sectionTitle.toLowerCase().split(' ')
      let bestMatch = nicheQuotes[0]
      
      for (const quote of nicheQuotes) {
        const quoteText = quote.text.toLowerCase()
        const matchCount = keywords.filter(keyword => quoteText.includes(keyword)).length
        if (matchCount > 0) {
          bestMatch = quote
          break
        }
      }
      
      return bestMatch
    } catch (error) {
      console.error('Error getting section quote:', error)
      return this.quotesDatabase['business'][0]
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const quotesService = new QuotesService()
