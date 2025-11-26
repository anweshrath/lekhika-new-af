class EmailMarketingService {
  constructor() {
    this.sequenceTemplates = {
      leadMagnet: {
        free: [
          {
            day: 0,
            subject: "Your FREE {bookTitle} is here! 📚",
            template: "welcome-free-book",
            content: "Thank you for downloading your free copy of {bookTitle}! This comprehensive guide will help you {mainBenefit}."
          },
          {
            day: 3,
            subject: "Have you started reading {bookTitle}? 🤔",
            template: "engagement-check",
            content: "I hope you've had a chance to dive into {bookTitle}. Here are the key takeaways from Chapter 1..."
          },
          {
            day: 7,
            subject: "Bonus resources for {bookTitle} readers 🎁",
            template: "bonus-resources",
            content: "As a reader of {bookTitle}, you get exclusive access to these bonus materials..."
          }
        ],
        paid: [
          {
            day: 0,
            subject: "Thank you for your purchase! Your {bookTitle} journey begins now 🚀",
            template: "purchase-confirmation",
            content: "Welcome to the {bookTitle} community! You've made an excellent investment in your {niche} knowledge."
          },
          {
            day: 1,
            subject: "Quick start guide for {bookTitle} 📋",
            template: "quick-start",
            content: "To help you get the most out of {bookTitle}, here's your quick start guide..."
          },
          {
            day: 7,
            subject: "How's your progress with {bookTitle}? 📈",
            template: "progress-check",
            content: "It's been a week since you got {bookTitle}. How are you implementing the strategies?"
          }
        ]
      },
      nurture: [
        {
          day: 14,
          subject: "Advanced tips from {bookTitle} 💡",
          template: "advanced-tips",
          content: "Ready to take your {niche} skills to the next level? Here are some advanced strategies..."
        },
        {
          day: 21,
          subject: "Success story: How {bookTitle} changed everything 🌟",
          template: "success-story",
          content: "I wanted to share this amazing success story from a {bookTitle} reader..."
        },
        {
          day: 30,
          subject: "What's next after {bookTitle}? 🎯",
          template: "whats-next",
          content: "You've mastered the concepts in {bookTitle}. Here's what I recommend for your next step..."
        }
      ],
      sales: [
        {
          day: 35,
          subject: "Exclusive offer for {bookTitle} readers 🔥",
          template: "exclusive-offer",
          content: "As a valued {bookTitle} reader, you get exclusive access to my advanced {niche} course..."
        },
        {
          day: 42,
          subject: "Last chance: Special pricing ends soon ⏰",
          template: "urgency-offer",
          content: "The special pricing for {bookTitle} readers ends in 48 hours..."
        }
      ]
    }
  }

  async createSequences(config) {
    try {
      const { book, strategy, price, sequences } = config
      console.log('Creating email marketing sequences...')
      
      const generatedSequences = {}
      
      // Generate lead magnet sequence
      if (sequences.leadMagnet) {
        generatedSequences.leadMagnet = this.generateLeadMagnetSequence(book, strategy, price)
      }
      
      // Generate nurture sequence
      if (sequences.nurture) {
        generatedSequences.nurture = this.generateNurtureSequence(book)
      }
      
      // Generate sales sequence (only for paid strategy)
      if (sequences.sales && strategy === 'paid') {
        generatedSequences.sales = this.generateSalesSequence(book, price)
      }
      
      // Generate landing page copy
      generatedSequences.landingPage = this.generateLandingPageCopy(book, strategy, price)
      
      // Generate social media posts
      generatedSequences.socialMedia = this.generateSocialMediaPosts(book, strategy)
      
      return {
        sequences: generatedSequences,
        strategy,
        totalEmails: this.countTotalEmails(generatedSequences),
        estimatedRevenue: this.calculateEstimatedRevenue(strategy, price),
        setupInstructions: this.generateSetupInstructions(strategy)
      }
    } catch (error) {
      console.error('Email sequence creation error:', error)
      throw error
    }
  }

  generateLeadMagnetSequence(book, strategy, price) {
    const template = this.sequenceTemplates.leadMagnet[strategy]
    
    return template.map(email => ({
      ...email,
      subject: this.replacePlaceholders(email.subject, book, price),
      content: this.replacePlaceholders(email.content, book, price),
      fullContent: this.generateFullEmailContent(email, book, strategy, price)
    }))
  }

  generateNurtureSequence(book) {
    return this.sequenceTemplates.nurture.map(email => ({
      ...email,
      subject: this.replacePlaceholders(email.subject, book),
      content: this.replacePlaceholders(email.content, book),
      fullContent: this.generateFullEmailContent(email, book, 'nurture')
    }))
  }

  generateSalesSequence(book, price) {
    return this.sequenceTemplates.sales.map(email => ({
      ...email,
      subject: this.replacePlaceholders(email.subject, book, price),
      content: this.replacePlaceholders(email.content, book, price),
      fullContent: this.generateFullEmailContent(email, book, 'sales', price)
    }))
  }

  generateLandingPageCopy(book, strategy, price) {
    const isFree = strategy === 'free'
    
    return {
      headline: isFree 
        ? `Get Your FREE Copy of "${book.title}" - The Ultimate ${book.niche} Guide!`
        : `Transform Your ${book.niche} Skills with "${book.title}" - Only $${price}!`,
      
      subheadline: isFree
        ? `Download this comprehensive ${book.wordCount?.toLocaleString()} word guide and discover the secrets to ${book.niche} success.`
        : `Join thousands who have already transformed their ${book.niche} approach with this proven system.`,
      
      benefits: [
        `Master the fundamentals of ${book.niche}`,
        `Learn proven strategies from industry experts`,
        `Get actionable tips you can implement immediately`,
        `Access exclusive bonus materials`,
        `Join a community of like-minded professionals`
      ],
      
      cta: isFree ? 'Download Your FREE Copy Now!' : `Get Instant Access for $${price}`,
      
      testimonials: [
        {
          text: `"${book.title} completely changed how I approach ${book.niche}. The strategies are practical and easy to implement."`,
          author: "Sarah Johnson, Marketing Manager"
        },
        {
          text: `"I've read many ${book.niche} books, but this one stands out. Clear, actionable, and results-driven."`,
          author: "Mike Chen, Business Owner"
        }
      ],
      
      guarantee: isFree 
        ? "100% Free - No hidden costs, no spam, just valuable content."
        : "30-day money-back guarantee. If you're not completely satisfied, get a full refund."
    }
  }

  generateSocialMediaPosts(book, strategy) {
    const isFree = strategy === 'free'
    
    return {
      twitter: [
        `🚀 Just released: "${book.title}" - your complete guide to ${book.niche} success! ${isFree ? 'FREE download' : 'Get it now'} 📚 #${book.niche} #Success`,
        `💡 Want to master ${book.niche}? "${book.title}" has everything you need to get started. ${isFree ? 'Download free' : 'Available now'} 🎯`,
        `📖 New book alert! "${book.title}" is packed with actionable ${book.niche} strategies. ${isFree ? 'Free for limited time' : 'Get your copy'} ✨`
      ],
      
      linkedin: [
        `I'm excited to share my latest book: "${book.title}" 📚\n\nThis comprehensive guide covers everything you need to know about ${book.niche}, including:\n• Proven strategies\n• Real-world examples\n• Actionable frameworks\n\n${isFree ? 'Free download available' : 'Available now'} - link in comments!`,
        
        `After years in ${book.niche}, I've compiled my best insights into "${book.title}" 🎯\n\nWhether you're just starting or looking to level up, this book will help you:\n✅ Understand core principles\n✅ Implement proven strategies\n✅ Avoid common mistakes\n\n${isFree ? 'Get your free copy' : 'Get it today'}!`
      ],
      
      facebook: [
        `📚 BIG NEWS! My new book "${book.title}" is finally here!\n\nIf you've been struggling with ${book.niche}, this is exactly what you need. I've packed ${book.wordCount?.toLocaleString()} words of pure value into this guide.\n\n${isFree ? '🎁 And the best part? It\'s completely FREE!' : `💰 Special launch price: just $${strategy === 'paid' ? price : 'FREE'}!`}\n\nComment "BOOK" and I'll send you the link! 👇`,
        
        `🎯 Want to transform your approach to ${book.niche}?\n\nMy new book "${book.title}" is getting amazing feedback:\n\n"This book changed everything for me!" - Reader review\n\n${isFree ? 'Download your free copy' : 'Get it now'} and see why everyone's talking about it! 🚀`
      ]
    }
  }

  replacePlaceholders(text, book, price = null) {
    return text
      .replace(/{bookTitle}/g, book.title)
      .replace(/{niche}/g, book.niche)
      .replace(/{price}/g, price ? `$${price}` : '')
      .replace(/{mainBenefit}/g, this.getMainBenefit(book.niche))
  }

  getMainBenefit(niche) {
    const benefits = {
      business: 'achieve your business goals and drive growth',
      health: 'improve your health and wellness',
      technology: 'stay ahead in the tech world',
      education: 'enhance your learning and teaching',
      lifestyle: 'create a more balanced and fulfilling life',
      finance: 'build wealth and financial security',
      marketing: 'grow your brand and reach more customers',
      'self-help': 'unlock your potential and achieve success'
    }
    
    return benefits[niche] || 'achieve your goals'
  }

  generateFullEmailContent(email, book, strategy, price = null) {
    const header = `Hi there!\n\n`
    const footer = `\n\nBest regards,\n[Your Name]\n\nP.S. Have questions? Just reply to this email - I read every message!`
    
    let body = email.content
    
    // Add strategy-specific content
    if (strategy === 'free') {
      body += `\n\nRemember, this is completely free - no strings attached. I just want to help you succeed in ${book.niche}.`
    } else if (strategy === 'paid') {
      body += `\n\nYour investment of $${price} in "${book.title}" is already paying off. Keep implementing what you learn!`
    }
    
    return header + body + footer
  }

  countTotalEmails(sequences) {
    let total = 0
    Object.values(sequences).forEach(sequence => {
      if (Array.isArray(sequence)) {
        total += sequence.length
      }
    })
    return total
  }

  calculateEstimatedRevenue(strategy, price) {
    if (strategy === 'free') {
      return {
        leadGeneration: 'High',
        listBuilding: 'Excellent',
        futureRevenue: 'Significant potential through nurture sequences'
      }
    } else {
      const estimatedSales = 100 // Conservative estimate
      return {
        directRevenue: estimatedSales * price,
        averageOrderValue: price,
        estimatedConversion: '2-5%'
      }
    }
  }

  generateSetupInstructions(strategy) {
    return {
      emailPlatform: [
        'Set up your email marketing platform (Mailchimp, ConvertKit, etc.)',
        'Import the email sequences provided',
        'Customize the sender name and email address',
        'Set up automation triggers based on user actions'
      ],
      
      landingPage: [
        'Create a landing page using the provided copy',
        'Add your book cover image',
        'Set up the download/purchase process',
        'Connect to your email marketing platform'
      ],
      
      socialMedia: [
        'Schedule the provided social media posts',
        'Customize hashtags for your audience',
        'Engage with comments and shares',
        'Track performance and adjust as needed'
      ],
      
      analytics: [
        'Set up Google Analytics tracking',
        'Monitor email open and click rates',
        'Track conversion rates',
        'A/B test subject lines and content'
      ]
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const emailMarketingService = new EmailMarketingService()
