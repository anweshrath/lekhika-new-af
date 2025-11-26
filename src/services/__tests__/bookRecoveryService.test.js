import bookRecoveryService from '../bookRecoveryService.js'

// Mock AI thinking logs data for testing
const mockAITThinkingLogs = [
  {
    timestamp: "04:01:45",
    nodeId: "input-1",
    nodeName: "Story Input - Thriller Novel",
    status: "completed",
    inputReceived: {
      genre: "thriller",
      theme: "Justice, revenge, and the thin line between good and evil",
      setting: "Modern-day New York City",
      story_title: "The Silent Witness",
      chapter_count: "8",
      story_premise: "A detective must solve a series of murders"
    }
  },
  {
    timestamp: "04:01:46",
    nodeId: "node-process-content-writer",
    nodeName: "Content Writer",
    status: "completed",
    processedContent: {
      chapters: [
        {
          chapter: 1,
          content: "Chapter 1: The Beginning\n\nThe city never sleeps, and neither does Detective Soumi...",
          metadata: {
            nodeId: "node-process-content-writer",
            timestamp: "2025-10-08T22:33:30.350Z",
            processingTime: 0
          },
          aiMetadata: {
            model: "OPENA-01-first",
            provider: "openai",
            tokens: 3601,
            cost: 0.00010803000000000001,
            words: 1226
          }
        },
        {
          chapter: 2,
          content: "Chapter 2: The Investigation\n\nDetective Soumi arrived at the crime scene...",
          metadata: {
            nodeId: "node-process-content-writer",
            timestamp: "2025-10-08T22:33:44.106Z",
            processingTime: 0
          },
          aiMetadata: {
            model: "OPENA-01-first",
            provider: "openai",
            tokens: 3601,
            cost: 0.00010803000000000001,
            words: 1018
          }
        }
      ]
    }
  }
]

describe('BookRecoveryService', () => {
  test('should extract book from AI thinking logs', async () => {
    const executionId = 'test-execution-123'
    const recoveredBook = await bookRecoveryService.extractBookFromLogs(executionId, mockAITThinkingLogs)
    
    expect(recoveredBook).toBeDefined()
    expect(recoveredBook.executionId).toBe(executionId)
    expect(recoveredBook.title).toBe('The Silent Witness')
    expect(recoveredBook.genre).toBe('thriller')
    expect(recoveredBook.chapters).toHaveLength(2)
    expect(recoveredBook.metadata.totalChapters).toBe(2)
    expect(recoveredBook.metadata.totalWords).toBeGreaterThan(0)
    expect(recoveredBook.status).toBe('recovered')
  })

  test('should extract input data correctly', () => {
    const inputData = bookRecoveryService.extractInputData(mockAITThinkingLogs)
    
    expect(inputData).toBeDefined()
    expect(inputData.story_title).toBe('The Silent Witness')
    expect(inputData.genre).toBe('thriller')
    expect(inputData.theme).toBe('Justice, revenge, and the thin line between good and evil')
  })

  test('should extract chapters correctly', () => {
    const chapters = bookRecoveryService.extractChapters(mockAITThinkingLogs)
    
    expect(chapters).toHaveLength(2)
    expect(chapters[0].chapterNumber).toBe(1)
    expect(chapters[0].title).toBe('The Beginning')
    expect(chapters[0].content).toContain('The city never sleeps')
    expect(chapters[0].wordCount).toBeGreaterThan(0)
    expect(chapters[1].chapterNumber).toBe(2)
    expect(chapters[1].title).toBe('The Investigation')
  })

  test('should count words correctly', () => {
    const wordCount = bookRecoveryService.countWords('This is a test sentence with seven words.')
    expect(wordCount).toBe(7)
    
    const emptyCount = bookRecoveryService.countWords('')
    expect(emptyCount).toBe(0)
    
    const nullCount = bookRecoveryService.countWords(null)
    expect(nullCount).toBe(0)
  })

  test('should extract chapter number correctly', () => {
    const chapter1 = bookRecoveryService.extractChapterNumber('Chapter 1: The Beginning')
    expect(chapter1).toBe(1)
    
    const chapter2 = bookRecoveryService.extractChapterNumber('Chapter 2: The Investigation')
    expect(chapter2).toBe(2)
    
    const noChapter = bookRecoveryService.extractChapterNumber('Just some text')
    expect(noChapter).toBe(0)
  })

  test('should extract chapter title correctly', () => {
    const title1 = bookRecoveryService.extractChapterTitle('Chapter 1: The Beginning\n\nContent here...')
    expect(title1).toBe('The Beginning')
    
    const title2 = bookRecoveryService.extractChapterTitle('Chapter 2: The Investigation\n\nMore content...')
    expect(title2).toBe('The Investigation')
    
    const noTitle = bookRecoveryService.extractChapterTitle('Just some text without chapter')
    expect(noTitle).toBe('Untitled Chapter')
  })

  test('should export as markdown correctly', async () => {
    const executionId = 'test-execution-123'
    const recoveredBook = await bookRecoveryService.extractBookFromLogs(executionId, mockAITThinkingLogs)
    const markdown = bookRecoveryService.exportAsMarkdown(recoveredBook)
    
    expect(markdown).toContain('# The Silent Witness')
    expect(markdown).toContain('**Genre:** thriller')
    expect(markdown).toContain('## Chapter 1: The Beginning')
    expect(markdown).toContain('## Chapter 2: The Investigation')
    expect(markdown).toContain('The city never sleeps')
    expect(markdown).toContain('Detective Soumi arrived')
  })
})

export default {}
